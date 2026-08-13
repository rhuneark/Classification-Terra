import React from 'react';
import { createRoot } from 'react-dom/client';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';
import App from './ui/App.tsx';
import { store } from './state/store.ts';
import { loadSave, updateSave, flushSave } from './state/save.ts';
import { initSdk, registerLifecycles, sdkReady } from './sdk/runSdk.ts';
import { warmAssets } from './assets/preload.ts';
import { NPC_OPPONENTS, getRandomNPCOpponent } from './game/opponents.ts';
import { computeWeightClass } from './game/weightClass.ts';
import type { PassiveResults } from './game/types.ts';
import { MAX_ENERGY, ENERGY_REGEN_MINUTES } from './game/types.ts';
import './styles/app.css';

async function boot() {
    // 1. SDK first.
    await initSdk();

    // 2. Load save and calculate time-away effects.
    const save = await loadSave();
    const now = Date.now();
    const minutesAway = save.lastOnline > 0 ? Math.floor((now - save.lastOnline) / 60000) : 0;
    const energyGained = Math.min(Math.floor(minutesAway / ENERGY_REGEN_MINUTES), MAX_ENERGY - save.energy);
    const passiveBattleCount = Math.min(Math.floor(minutesAway / 120), 5);

    let passiveWins = 0;
    let passiveCurrency = 0;
    if (passiveBattleCount > 0) {
        const playerWC = computeWeightClass(save.backpack);
        for (let i = 0; i < passiveBattleCount; i++) {
            const opp = getRandomNPCOpponent();
            const winProb = (playerWC + 1) / (playerWC + opp.weightClass + 2);
            if (Math.random() < winProb) {
                passiveWins++;
                passiveCurrency += Math.max(5, Math.floor(5 + opp.weightClass / 8));
            }
        }
    }

    const newEnergy = Math.min(save.energy + energyGained, MAX_ENERGY);
    const newCurrency = save.currency + passiveCurrency;

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

    // Apply passive gains to save
    updateSave({
        energy: newEnergy,
        currency: newCurrency,
        totalBattles: save.totalBattles + passiveBattleCount,
        wins: save.wins + passiveWins,
        lastOnline: now,
    });

    store.patch({
        energy: newEnergy,
        maxEnergy: MAX_ENERGY,
        currency: newCurrency,
        inventory: save.inventory,
        backpack: save.backpack,
        eventLog: save.eventLog,
        arenaOpponents: NPC_OPPONENTS,
        passiveResults,
    });

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
                backpack: s.backpack,
                eventLog: s.eventLog,
                lastOnline: Date.now(),
            });
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
