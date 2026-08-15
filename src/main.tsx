import React from 'react';
import { createRoot } from 'react-dom/client';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';
import App from './ui/App.tsx';
import { store } from './state/store.ts';
import { loadSave, updateSave, flushSave } from './state/save.ts';
import { initSdk, registerLifecycles, sdkReady } from './sdk/runSdk.ts';
import { warmAssets } from './assets/preload.ts';
import { getRandomNPCOpponent } from './game/opponents.ts';
import { computeWeightClass } from './game/weightClass.ts';
import type { PassiveResults } from './game/types.ts';
import { MAX_ENERGY, ENERGY_REGEN_MINUTES } from './game/types.ts';
import { initRivalFactions, passiveScripGained, passiveEnergyFromMedics, generateBounties, BOUNTY_REFRESH_MS, applyGrudgeDecay, computeMorale, getMoraleEffects, passiveDepotScripGained } from './game/factions.ts';
import { scheduleResearchNotif, scheduleEnergyNotif } from './game/notifications.ts';
import './styles/app.css';

async function boot() {
    // 1. SDK first.
    await initSdk();

    // 2. Load save and calculate time-away effects.
    const save = await loadSave();
    const now = Date.now();
    const msAway = save.lastOnline > 0 ? now - save.lastOnline : 0;
    const minutesAway = Math.floor(msAway / 60_000);

    // Energy regen: boost active if energyBoostUntil > lastOnline
    const boostEnd = save.energyBoostUntil ?? 0;
    let energyGained = 0;
    if (minutesAway > 0) {
        const boostMs = Math.max(0, boostEnd - (save.lastOnline || now));
        const boostMinutes = Math.min(Math.floor(boostMs / 60_000), minutesAway);
        const normalMinutes = minutesAway - boostMinutes;
        // boost: 1 energy per minute, normal: 1 per ENERGY_REGEN_MINUTES
        const boostedEnergy = boostMinutes;
        const normalEnergy = Math.floor(normalMinutes / ENERGY_REGEN_MINUTES);
        energyGained = Math.min(boostedEnergy + normalEnergy, MAX_ENERGY - save.energy);
    }

    const passiveBattleCount = Math.min(Math.floor(minutesAway / 120), 5);
    let passiveWins = 0;
    let passiveCurrency = 0;
    if (passiveBattleCount > 0) {
        const playerWC = computeWeightClass(save.loadout);
        for (let i = 0; i < passiveBattleCount; i++) {
            const opp = getRandomNPCOpponent();
            const winProb = (playerWC + 1) / (playerWC + opp.weightClass + 2);
            if (Math.random() < winProb) {
                passiveWins++;
                passiveCurrency += Math.max(5, Math.floor(5 + opp.weightClass / 8));
            }
        }
    }

    // Process research queue: move completed items to inventory
    const queueNow = now;
    const completedItems: typeof save.inventory = [];
    const remainingQueue = (save.researchQueue ?? []).filter(qi => {
        if (queueNow >= qi.startedAt + qi.durationMs) {
            completedItems.push(qi.item);
            return false;
        }
        return true;
    });
    const newInventory = [...save.inventory, ...completedItems];
    const newEnergy = Math.min(save.energy + energyGained, MAX_ENERGY);

    // Daily login bonus
    const todayStr = new Date().toISOString().slice(0, 10);
    let loginBonus: { scrip: number; streak: number } | null = null;
    let loginBonusScrip = 0;
    if (save.lastLoginDay !== todayStr) {
        const yesterday = new Date(now - 86_400_000).toISOString().slice(0, 10);
        const streak = save.lastLoginDay === yesterday ? (save.loginStreak ?? 0) + 1 : 1;
        const bonusScrip = Math.min(15 + (streak - 1) * 5, 60);
        loginBonus = { scrip: bonusScrip, streak };
        loginBonusScrip = bonusScrip;
        updateSave({ lastLoginDay: todayStr, loginStreak: streak });
    }

    // Passive income from faction survivors and base upgrades
    const savedSurvivors = save.survivors ?? [];
    const savedBaseUpgrades = save.baseUpgrades ?? { walls: 0, watchtower: 0, depot: 0, barracks: 0, clinic: 0 };
    const passiveFactionScrip = passiveScripGained(savedSurvivors, msAway);
    const passiveMedicEnergy = passiveEnergyFromMedics(savedSurvivors, msAway);
    const passiveDepotScrip = passiveDepotScripGained(savedBaseUpgrades, msAway);

    // Compute morale and apply survivor leave on low morale + extended absence
    const baseMorale = computeMorale(savedSurvivors, savedBaseUpgrades, msAway);
    const moraleEffects = getMoraleEffects(baseMorale);
    let activeSurvivors = savedSurvivors;
    if (moraleEffects.survivorLeaveChance > 0 && msAway > 24 * 3_600_000 && savedSurvivors.length > 0) {
        activeSurvivors = savedSurvivors.filter(() => Math.random() > moraleEffects.survivorLeaveChance);
    }

    // Initialize rival factions if none saved; apply grudge decay
    const rawRivals = (save.rivalFactions ?? []).length > 0
        ? save.rivalFactions
        : initRivalFactions();
    const savedRivals = rawRivals.map(f => applyGrudgeDecay(f, now));

    // Initialize or refresh bounties
    const bountiesRefreshedAt = save.bountiesRefreshedAt ?? 0;
    const savedBounties = (save.bounties ?? []);
    let activeBounties = savedBounties;
    let activeBountiesRefreshedAt = bountiesRefreshedAt;
    if (savedBounties.length === 0 || now - bountiesRefreshedAt > BOUNTY_REFRESH_MS) {
        activeBounties = generateBounties(now);
        activeBountiesRefreshedAt = now;
    }

    // Survivor upkeep: 2 scrip/survivor per session login
    const upkeepCost = activeSurvivors.length * 2;
    const newCurrency = Math.max(0, save.currency + passiveCurrency + loginBonusScrip + passiveFactionScrip + passiveDepotScrip - upkeepCost);
    const newEnergyWithMedic = Math.min(newEnergy + passiveMedicEnergy, MAX_ENERGY);

    let passiveResults: PassiveResults | null = null;
    if (minutesAway >= ENERGY_REGEN_MINUTES && save.lastOnline > 0) {
        passiveResults = {
            battlesCount: passiveBattleCount,
            wins: passiveWins,
            losses: passiveBattleCount - passiveWins,
            currencyGained: passiveCurrency,
            energyGained,
            hoursAway: Math.floor(minutesAway / 60),
        };
    }

    updateSave({
        energy: newEnergyWithMedic,
        currency: newCurrency,
        inventory: newInventory,
        researchQueue: remainingQueue,
        totalBattles: save.totalBattles + passiveBattleCount,
        wins: save.wins + passiveWins,
        survivors: activeSurvivors,
        rivalFactions: savedRivals,
        bounties: activeBounties,
        bountiesRefreshedAt: activeBountiesRefreshedAt,
        lastOnline: now,
    });

    store.patch({
        energy: newEnergyWithMedic,
        maxEnergy: MAX_ENERGY,
        currency: newCurrency,
        inventory: newInventory,
        safeHouse: save.safeHouse ?? [],
        inventoryCapacity: save.inventoryCapacity ?? 20,
        loadout: save.loadout,
        researchQueue: remainingQueue,
        foundUniqueIds: save.foundUniqueIds ?? [],
        discoveredTerraIds: save.discoveredTerraIds ?? [],
        collectedLoreIds: save.collectedLoreIds ?? [],
        completedExcursionIds: save.completedExcursionIds ?? [],
        muteMusic: save.muteMusic ?? false,
        muteSfx: save.muteSfx ?? false,
        energyBoostUntil: save.energyBoostUntil ?? 0,
        eventLog: save.eventLog,
        passiveResults,
        loginBonus,
        survivors: activeSurvivors,
        rivalFactions: savedRivals,
        bounties: activeBounties,
        bountiesRefreshedAt: activeBountiesRefreshedAt,
        totalCrafts: save.totalCrafts ?? 0,
        totalRaids: save.totalRaids ?? 0,
        baseUpgrades: savedBaseUpgrades,
        baseMorale,
        baseResources: save.baseResources ?? 0,
        lastBaseUpgradeAt: save.lastBaseUpgradeAt ?? 0,
        trophiedItems: save.trophiedItems ?? [],
    });

    // Schedule notifications for existing queued research and energy regen
    scheduleResearchNotif(remainingQueue);
    scheduleEnergyNotif(newEnergy);

    // 3. Mount React.
    createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

    // 4. Lift boot cover.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const cover = document.getElementById('boot-cover');
            if (!cover) return;
            cover.classList.add('hidden');
            setTimeout(() => cover.remove(), 400);
        });
    });

    // 5. Warm assets.
    await warmAssets((p) => store.patch({ loadProgress: p }));

    // 6. Loading done.
    store.patch({ phase: 'menu' });

    // 7. Lifecycle hooks.
    registerLifecycles({
        onPause: () => {
            store.patch({ paused: true });
            RundotGameAPI.analytics.recordCustomEvent('game_paused').catch(() => {});
        },
        onResume: () => {
            store.patch({ paused: false });
            RundotGameAPI.analytics.recordCustomEvent('game_resumed').catch(() => {});
        },
        onSleep: () => {
            const s = store.get();
            updateSave({
                energy: s.energy,
                currency: s.currency,
                inventory: s.inventory,
                safeHouse: s.safeHouse,
                inventoryCapacity: s.inventoryCapacity,
                loadout: s.loadout,
                researchQueue: s.researchQueue,
                eventLog: s.eventLog,
                energyBoostUntil: s.energyBoostUntil,
                foundUniqueIds: s.foundUniqueIds,
                completedExcursionIds: s.completedExcursionIds,
                survivors: s.survivors,
                rivalFactions: s.rivalFactions,
                bounties: s.bounties,
                bountiesRefreshedAt: s.bountiesRefreshedAt,
                totalCrafts: s.totalCrafts,
                totalRaids: s.totalRaids,
                baseUpgrades: s.baseUpgrades,
                baseResources: s.baseResources,
                lastBaseUpgradeAt: s.lastBaseUpgradeAt,
                trophiedItems: s.trophiedItems,
                lastOnline: Date.now(),
            });
            scheduleEnergyNotif(s.energy);
            scheduleResearchNotif(s.researchQueue);
            RundotGameAPI.analytics.recordCustomEvent('game_sleep').catch(() => {});
        },
        onQuit: () => {
            flushSave();
            RundotGameAPI.analytics.recordCustomEvent('game_quit').catch(() => {});
        },
    });

    // 8. Boot analytics.
    if (sdkReady()) {
        try {
            RundotGameAPI.analytics.recordCustomEvent('game_loaded').catch(() => {});
            RundotGameAPI.analytics.trackFunnelStep(1, 'game_loaded', 'boot', 1).catch(() => {});
        } catch (err) {
            console.warn('[Main] boot analytics failed', err);
        }
    }
}

if (document.readyState === 'complete') boot();
else window.addEventListener('load', boot);
