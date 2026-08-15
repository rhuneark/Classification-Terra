import { useState, useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { updateSave } from '../state/save.ts';
import {
    SURVIVOR_ROLES,
    computeBaseStats,
    raidSuccessChance,
    generateBounties,
    getCurrentGlobalEvent,
    BOUNTY_REFRESH_MS,
    BASE_UPGRADES,
    getNextUpgradeTier,
    getUpgradeTier,
    computeUpgradesBonuses,
    computeBaseWC,
    computeMorale,
    getMoraleLabel,
    getMoraleColor,
    getMoraleEffects,
    computeRivalEffectiveStats,
    addGrudgePoints,
} from '../game/factions.ts';
import type { BaseUpgradeTier } from '../game/factions.ts';
import type { Survivor, RivalFaction, Bounty, BaseUpgradeId } from '../game/types.ts';
import { RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import { rollRandomItem } from '../game/items.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

function fmt(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const UPGRADE_LABELS: Record<BaseUpgradeId, string> = {
    walls: 'WALLS',
    watchtower: 'WATCHTOWER',
    depot: 'DEPOT',
    barracks: 'BARRACKS',
    clinic: 'CLINIC',
};

const UPGRADE_ICONS: Record<BaseUpgradeId, string> = {
    walls: '🛡',
    watchtower: '👁',
    depot: '📦',
    barracks: '🏠',
    clinic: '💊',
};

function MoraleBar({ morale }: { morale: number }) {
    const label = getMoraleLabel(morale);
    const color = getMoraleColor(morale);
    const effects = getMoraleEffects(morale);
    return (
        <div className="rounded p-3" style={{ background: '#0e2010', border: `1px solid ${color}33` }}>
            <div className="flex items-center justify-between mb-1.5">
                <div className="text-[0.7rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>BASE MORALE</div>
                <div className="text-[0.82rem] font-bold" style={{ color }}>{morale}% — {label}</div>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: '#0a1a0c' }}>
                <div className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${morale}%`, background: color }} />
            </div>
            <div className="text-[0.68rem]" style={{ color: '#5a7e5c' }}>
                {morale <= 20 && 'Critical: -20% defense · raids +30% frequent · survivors at risk'}
                {morale > 20 && morale <= 40 && 'Low: -10% defense · raids +15% frequent · survivor risk'}
                {morale > 40 && morale <= 65 && 'Stable: No modifiers active'}
                {morale > 65 && morale <= 85 && 'High: +10% defense bonus active'}
                {morale > 85 && `Excellent: +20% defense · raids ${Math.round((1 - effects.raidFreqMultiplier) * 100)}% less frequent`}
            </div>
        </div>
    );
}

function UpgradeCard({
    upgradeId,
    currentTier,
    nextTier,
    currency,
    onUpgrade,
}: {
    upgradeId: BaseUpgradeId;
    currentTier: BaseUpgradeTier | null;
    nextTier: BaseUpgradeTier | null;
    currency: number;
    onUpgrade: () => void;
}) {
    const canAfford = nextTier !== null && currency >= nextTier.cost;
    const isMaxed = nextTier === null;

    return (
        <div className="rounded p-2.5" style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[0.8rem]">{UPGRADE_ICONS[upgradeId]}</span>
                        <span className="text-[0.78rem] font-bold tracking-widest" style={{ color: '#8acc8c' }}>
                            {UPGRADE_LABELS[upgradeId]}
                        </span>
                        <span className="text-[0.62rem] font-bold rounded px-1"
                            style={{ background: isMaxed ? '#1a4a1a' : '#1a3e1c', color: isMaxed ? '#4ade80' : '#4a6a4c' }}>
                            {isMaxed ? 'MAX' : `T${currentTier?.tier ?? 0}/5`}
                        </span>
                    </div>
                    {currentTier && (
                        <div className="mt-0.5 text-[0.68rem]" style={{ color: '#4a7a4c' }}>{currentTier.label}</div>
                    )}
                    {nextTier && (
                        <div className="mt-0.5 text-[0.68rem]" style={{ color: '#7aaa7c' }}>
                            Next: {nextTier.label} —
                            {nextTier.defBonus > 0 && <span style={{ color: '#60a5fa' }}> +{nextTier.defBonus} DEF</span>}
                            {nextTier.offBonus > 0 && <span style={{ color: '#ffd060' }}> +{nextTier.offBonus} OFF</span>}
                            {nextTier.moraleBonus > 0 && <span style={{ color: '#4ade80' }}> +{nextTier.moraleBonus} morale</span>}
                            {nextTier.scripBonusPerHr > 0 && <span style={{ color: '#fb923c' }}> +{nextTier.scripBonusPerHr}/hr</span>}
                            {nextTier.survivorCapBonus > 0 && <span style={{ color: '#c084fc' }}> +{nextTier.survivorCapBonus} cap</span>}
                        </div>
                    )}
                </div>
                {!isMaxed ? (
                    <button type="button"
                        className="shrink-0 rounded px-2.5 py-1.5 text-[0.72rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{
                            background: canAfford ? '#1a4e1c' : '#0a1a0c',
                            color: canAfford ? '#7ccf5a' : '#3a5a3c',
                            border: `1px solid ${canAfford ? '#3a7e3c' : '#1a3e1c'}`,
                        }}
                        disabled={!canAfford}
                        onClick={onUpgrade}>
                        {nextTier!.cost}¢
                    </button>
                ) : (
                    <span className="shrink-0 text-[0.65rem] font-bold" style={{ color: '#4ade80' }}>✓ MAX</span>
                )}
            </div>
        </div>
    );
}

function SurvivorCard({ survivor, onBanish }: { survivor: Survivor; onBanish: () => void }) {
    const data = SURVIVOR_ROLES[survivor.role];
    const [confirming, setConfirming] = useState(false);
    return (
        <div className="rounded p-2.5 flex items-center justify-between gap-2"
            style={{ background: '#0e2010', border: `1px solid ${confirming ? '#4a1e1e' : '#1a3e1c'}` }}>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[0.9rem] font-bold text-white">{survivor.name}</span>
                    <span className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold"
                        style={{ background: data.color + '22', color: data.color, border: `1px solid ${data.color}44` }}>
                        {data.label}
                    </span>
                </div>
                <div className="mt-0.5 text-[0.75rem]" style={{ color: '#7a9a7c' }}>{data.flavor}</div>
                <div className="mt-0.5 text-[0.72rem] font-bold" style={{ color: data.color }}>{data.bonus}</div>
            </div>
            {confirming ? (
                <div className="shrink-0 flex flex-col gap-1 items-end">
                    <div className="text-[0.65rem] font-bold" style={{ color: '#f87171' }}>CONFIRM?</div>
                    <div className="flex gap-1">
                        <button type="button"
                            className="rounded px-2 py-1 text-[0.7rem] font-bold transition-transform active:scale-95"
                            style={{ background: '#1a0e0e', color: '#f87171', border: '1px solid #3a1e1e' }}
                            onClick={onBanish}>
                            YES
                        </button>
                        <button type="button"
                            className="rounded px-2 py-1 text-[0.7rem] font-bold transition-transform active:scale-95"
                            style={{ background: '#0e2010', color: '#6a9e6c', border: '1px solid #1a3e1c' }}
                            onClick={() => setConfirming(false)}>
                            NO
                        </button>
                    </div>
                </div>
            ) : (
                <button type="button"
                    className="shrink-0 rounded px-2 py-1 text-[0.72rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#1a0e0e', color: '#f87171', border: '1px solid #3a1e1e' }}
                    onClick={() => setConfirming(true)}>
                    BANISH
                </button>
            )}
        </div>
    );
}

function RivalCard({ faction, totalOffense, onRaid }: {
    faction: RivalFaction;
    totalOffense: number;
    onRaid: () => void;
}) {
    const effectiveStats = computeRivalEffectiveStats(faction);
    const raidChance = Math.round(raidSuccessChance(totalOffense, effectiveStats.defense) * 100);
    const grudgeLevel = faction.grudgeLevel ?? 0;

    return (
        <div className="rounded p-2.5" style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-[0.9rem] font-bold text-white">{faction.name}</div>
                    <div className="mt-0.5 text-[0.75rem]" style={{ color: '#7a9a7c' }}>{faction.flavor}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-[0.72rem]">
                        <span style={{ color: '#ffd060' }}>OFF {effectiveStats.offense}</span>
                        <span style={{ color: '#60a5fa' }}>DEF {effectiveStats.defense}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[0.62rem]" style={{ color: '#5a3a3c' }}>GRUDGE</span>
                        <span className="text-[0.8rem] tracking-wide" style={{ letterSpacing: '2px' }}>
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} style={{ color: i < grudgeLevel ? '#f87171' : '#2a3a2c' }}>★</span>
                            ))}
                        </span>
                        {grudgeLevel > 0 && (
                            <span className="text-[0.6rem] rounded px-1" style={{ background: '#2a1010', color: '#f87171' }}>
                                L{grudgeLevel} +{grudgeLevel * 15}% stats
                            </span>
                        )}
                    </div>
                </div>
                <button type="button"
                    className="shrink-0 rounded px-2.5 py-1.5 text-[0.8rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#1a1e0a', color: '#ffd060', border: '1px solid #3a3e1a' }}
                    onClick={onRaid}>
                    RAID<br />
                    <span className="text-[0.62rem] font-normal">{raidChance}% — 2⚡</span>
                </button>
            </div>
        </div>
    );
}

function BountyCard({ bounty, onClaim }: { bounty: Bounty; onClaim: () => void }) {
    const pct = bounty.target > 0 ? Math.min(100, (bounty.progress / bounty.target) * 100) : 0;
    const done = bounty.progress >= bounty.target;
    const itemColor = bounty.rewardItemRarity ? RARITY_COLORS[bounty.rewardItemRarity] : undefined;
    return (
        <div className="rounded p-2.5" style={{ background: bounty.claimed ? '#070e08' : '#0e2010', border: `1px solid ${done && !bounty.claimed ? '#4ade8055' : '#1a3e1c'}`, opacity: bounty.claimed ? 0.5 : 1 }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-[0.85rem] font-bold" style={{ color: bounty.claimed ? '#3a5a3c' : '#bcd4bd' }}>
                        {bounty.description}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[0.75rem] font-bold" style={{ color: '#fb923c' }}>+{bounty.rewardScrip} scrip</span>
                        {bounty.rewardItemRarity && (
                            <span className="text-[0.65rem] font-bold" style={{ color: itemColor }}>+{RARITY_LABELS[bounty.rewardItemRarity]} item</span>
                        )}
                    </div>
                    {!bounty.claimed && (
                        <div className="mt-1.5">
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#142816' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: done ? '#4ade80' : '#2a5e2c' }} />
                            </div>
                            <div className="mt-0.5 text-[0.65rem]" style={{ color: '#4a6a4c' }}>
                                {bounty.progress}/{bounty.target}
                            </div>
                        </div>
                    )}
                </div>
                {done && !bounty.claimed && (
                    <button type="button"
                        className="shrink-0 rounded px-2.5 py-1.5 text-[0.82rem] font-bold transition-transform active:scale-95"
                        style={{ background: '#1a4e1c', color: '#7ccf5a', border: '1px solid #3a7e3c' }}
                        onClick={onClaim}>
                        CLAIM
                    </button>
                )}
                {bounty.claimed && (
                    <span className="shrink-0 text-[0.72rem]" style={{ color: '#3a5a3c' }}>DONE</span>
                )}
            </div>
        </div>
    );
}

export default function FactionScreen() {
    const [tab, setTab] = useState<'base' | 'rivals'>('base');
    const [raidResult, setRaidResult] = useState<{ name: string; won: boolean; scrip: number } | null>(null);
    const [, setTick] = useState(0);

    const survivors = useStore(s => s.survivors);
    const rivalFactions = useStore(s => s.rivalFactions);
    const bounties = useStore(s => s.bounties);
    const bountiesRefreshedAt = useStore(s => s.bountiesRefreshedAt);
    const energy = useStore(s => s.energy);
    const globalEvent = useStore(s => s.globalEvent);
    const baseUpgrades = useStore(s => s.baseUpgrades);
    const baseMorale = useStore(s => s.baseMorale);
    const baseResources = useStore(s => s.baseResources);
    const currency = useStore(s => s.currency);
    const loadout = useStore(s => s.loadout);

    const baseStats = computeBaseStats(survivors);
    const upgradeBonuses = computeUpgradesBonuses(baseUpgrades);
    const survivorCap = 10 + upgradeBonuses.survivorCapBonus;
    const playerWC = computeWeightClass(loadout);
    const baseWC = computeBaseWC(survivors, loadout, currency, baseUpgrades);

    const totalOffense = baseStats.offense + Math.floor(playerWC * 0.4);
    const totalDefense = baseStats.defense + upgradeBonuses.defBonus;

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const now = Date.now();
        if (now - bountiesRefreshedAt > BOUNTY_REFRESH_MS || bounties.length === 0) {
            const fresh = generateBounties(now);
            store.patch({ bounties: fresh, bountiesRefreshedAt: now });
            updateSave({ bounties: fresh, bountiesRefreshedAt: now });
        }
    }, []);

    useEffect(() => {
        const ev = getCurrentGlobalEvent();
        store.patch({ globalEvent: ev });
    }, []);

    function handleBanish(survivor: Survivor) {
        const s = store.get();
        const updated = s.survivors.filter(sv => sv.id !== survivor.id);
        store.patch({ survivors: updated });
        updateSave({ survivors: updated });
        const entry = { id: `banish-${Date.now()}`, type: 'faction' as const, message: `Banished ${survivor.name} (${SURVIVOR_ROLES[survivor.role].label}). They left without a word.`, timestamp: Date.now() };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ eventLog: newLog });
        updateSave({ eventLog: newLog });
        RundotGameAPI.analytics.recordCustomEvent('faction_survivor_banished', { role: survivor.role }).catch(() => {});
    }

    function handleRaid(faction: RivalFaction) {
        const s = store.get();
        if (s.energy < 2) return;

        const pwc = computeWeightClass(s.loadout);
        const bs = computeBaseStats(s.survivors);
        const ub = computeUpgradesBonuses(s.baseUpgrades);
        const off = bs.offense + Math.floor(pwc * 0.4) + ub.offBonus;
        const effectiveDef = computeRivalEffectiveStats(faction).defense;
        const chance = raidSuccessChance(off, effectiveDef);
        const won = Math.random() < chance;
        const scrip = won ? Math.floor(20 + Math.random() * 30 + faction.grudgeLevel * 8) : 0;

        const newEnergy = s.energy - 2;
        const grudgeGain = won ? 30 : 15;
        const updatedFaction = addGrudgePoints({ ...faction, lastRaidedByPlayerAt: Date.now() }, grudgeGain);
        const updatedFactions = s.rivalFactions.map(f => f.id === faction.id ? updatedFaction : f);

        const newCurrency = s.currency + scrip;
        const newTotalRaids = (s.totalRaids ?? 0) + 1;

        store.patch({ energy: newEnergy, currency: newCurrency, rivalFactions: updatedFactions, totalRaids: newTotalRaids });
        updateSave({ energy: newEnergy, currency: newCurrency, rivalFactions: updatedFactions, totalRaids: newTotalRaids });

        const logMsg = won
            ? `Raided ${faction.name}. Success. +${scrip} scrip. Grudge L${updatedFaction.grudgeLevel}.`
            : `Raided ${faction.name}. Turned back. 2 energy lost. Grudge L${updatedFaction.grudgeLevel}.`;
        const entry = { id: `raid-${Date.now()}`, type: 'faction' as const, message: logMsg, timestamp: Date.now() };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ eventLog: newLog });
        updateSave({ eventLog: newLog });

        const updatedBounties = s.bounties.map(b => {
            if (b.type === 'raid' && !b.completed && won) {
                const newProgress = Math.min(b.progress + 1, b.target);
                return { ...b, progress: newProgress, completed: newProgress >= b.target };
            }
            return b;
        });
        store.patch({ bounties: updatedBounties });
        updateSave({ bounties: updatedBounties });

        setRaidResult({ name: faction.name, won, scrip });
        RundotGameAPI.analytics.recordCustomEvent('faction_raid_attempt', {
            factionId: faction.id, won, scrip, grudgeLevel: updatedFaction.grudgeLevel,
        }).catch(() => {});
    }

    function handleUpgrade(upgradeId: BaseUpgradeId) {
        const s = store.get();
        const next = getNextUpgradeTier(s.baseUpgrades, upgradeId);
        if (!next || s.currency < next.cost) return;

        const newUpgrades = { ...s.baseUpgrades, [upgradeId]: next.tier };
        const newCurrency = s.currency - next.cost;
        const newMorale = computeMorale(s.survivors, newUpgrades, 0);
        const now = Date.now();

        store.patch({ baseUpgrades: newUpgrades, currency: newCurrency, baseMorale: newMorale, lastBaseUpgradeAt: now });
        updateSave({ baseUpgrades: newUpgrades, currency: newCurrency, lastBaseUpgradeAt: now });

        const entry = { id: `upgrade-${now}`, type: 'faction' as const, message: `Base upgraded: ${next.label} (${UPGRADE_LABELS[upgradeId]}).`, timestamp: now };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ eventLog: newLog });
        updateSave({ eventLog: newLog });

        RundotGameAPI.analytics.recordCustomEvent('base_upgraded', { upgradeId, tier: next.tier, cost: next.cost }).catch(() => {});
    }

    function handleClaimBounty(bounty: Bounty) {
        const s = store.get();
        const newCurrency = s.currency + bounty.rewardScrip;
        let newInventory = [...s.inventory];

        if (bounty.rewardItemRarity) {
            const item = rollRandomItem(bounty.rewardItemRarity, bounty.rewardItemRarity);
            newInventory = [...newInventory, item];
        }

        const updatedBounties = s.bounties.map(b =>
            b.id === bounty.id ? { ...b, claimed: true } : b
        );

        store.patch({ currency: newCurrency, inventory: newInventory, bounties: updatedBounties });
        updateSave({ currency: newCurrency, inventory: newInventory, bounties: updatedBounties });

        const entry = { id: `bounty-${Date.now()}`, type: 'faction' as const, message: `Bounty claimed: "${bounty.description}". +${bounty.rewardScrip} scrip.`, timestamp: Date.now() };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ eventLog: newLog });
        updateSave({ eventLog: newLog });

        RundotGameAPI.analytics.recordCustomEvent('bounty_claimed', { bountyType: bounty.type, rewardScrip: bounty.rewardScrip }).catch(() => {});
    }

    const bountyTimeLeft = Math.max(0, BOUNTY_REFRESH_MS - (Date.now() - bountiesRefreshedAt));

    return (
        <div className="flex flex-col h-full" style={{ background: '#070e08' }}>
            <div className="shrink-0 px-4 pt-3 pb-0" style={{ borderBottom: '1px solid #142816' }}>
                <div className="text-[1rem] font-bold tracking-widest text-primary mb-2">FACTION</div>
                <div className="flex gap-0">
                    {(['base', 'rivals'] as const).map(t => (
                        <button key={t} type="button"
                            className="flex-1 py-2 text-[0.78rem] font-bold tracking-widest transition-colors"
                            style={{
                                color: tab === t ? '#7ccf5a' : '#4a6a4c',
                                borderBottom: tab === t ? '2px solid #7ccf5a' : '2px solid transparent',
                            }}
                            onClick={() => setTab(t)}>
                            {t === 'base' ? 'BASE' : 'RIVALS'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="scroll-area flex-1 px-3 pt-3 pb-20 space-y-3">
                {tab === 'base' && (
                    <>
                        {globalEvent && (
                            <div className="rounded p-2.5" style={{ background: '#1a1e0a', border: '1px solid #3a3e1a' }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-[0.7rem] font-bold rounded px-1.5 py-0.5"
                                        style={{ background: '#2a2e0a', color: '#ffd060' }}>GLOBAL EVENT</span>
                                    <span className="text-[0.8rem] font-bold text-white">{globalEvent.name}</span>
                                </div>
                                <div className="mt-0.5 text-[0.75rem]" style={{ color: '#9a9a6c' }}>{globalEvent.description}</div>
                                <div className="mt-0.5 text-[0.72rem] font-bold" style={{ color: '#ffd060' }}>{globalEvent.effect}</div>
                            </div>
                        )}

                        <MoraleBar morale={baseMorale} />

                        <div className="rounded p-3" style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-2" style={{ color: '#4a6a4c' }}>SAFE HOUSE STATS</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>DEFENSE</div>
                                    <div className="text-[1rem] font-bold" style={{ color: '#60a5fa' }}>{totalDefense}</div>
                                </div>
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>OFFENSE</div>
                                    <div className="text-[1rem] font-bold" style={{ color: '#ffd060' }}>{totalOffense}</div>
                                </div>
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>BASE WC</div>
                                    <div className="text-[0.9rem] font-bold" style={{ color: '#c084fc' }}>{baseWC}</div>
                                </div>
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>DEPOT INCOME</div>
                                    <div className="text-[0.9rem] font-bold" style={{ color: '#fb923c' }}>
                                        {baseStats.scripPerHour + upgradeBonuses.scripBonusPerHr}/hr
                                    </div>
                                </div>
                            </div>
                            {baseResources > 0 && (
                                <div className="mt-2 pt-2" style={{ borderTop: '1px solid #1a3e1c' }}>
                                    <div className="flex justify-between items-center">
                                        <div className="text-[0.68rem]" style={{ color: '#4a6a4c' }}>BASE RESOURCES</div>
                                        <div className="text-[0.85rem] font-bold" style={{ color: '#a78bfa' }}>{baseResources}</div>
                                    </div>
                                </div>
                            )}
                            {baseStats.findBonus > 0 && (
                                <div className="mt-1 text-[0.72rem]" style={{ color: '#4ade80' }}>Scouts: +{baseStats.findBonus}% item find chance</div>
                            )}
                            {baseStats.researchReduction > 0 && (
                                <div className="text-[0.72rem]" style={{ color: '#a78bfa' }}>Engineers: -{baseStats.researchReduction}% research time</div>
                            )}
                        </div>

                        <div>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#4a6a4c' }}>
                                BASE UPGRADES
                            </div>
                            <div className="space-y-1.5">
                                {(Object.keys(BASE_UPGRADES) as BaseUpgradeId[]).map(upgradeId => (
                                    <UpgradeCard
                                        key={upgradeId}
                                        upgradeId={upgradeId}
                                        currentTier={getUpgradeTier(baseUpgrades, upgradeId)}
                                        nextTier={getNextUpgradeTier(baseUpgrades, upgradeId)}
                                        currency={currency}
                                        onUpgrade={() => handleUpgrade(upgradeId)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#4a6a4c' }}>
                                SURVIVORS ({survivors.length}/{survivorCap})
                            </div>
                            {survivors.length === 0 ? (
                                <div className="rounded p-3 text-center" style={{ background: '#0a1a0c', border: '1px solid #1a3e1c' }}>
                                    <div className="text-[0.85rem]" style={{ color: '#3a5a3c' }}>No survivors recruited yet.</div>
                                    <div className="mt-0.5 text-[0.75rem]" style={{ color: '#2a4a2c' }}>
                                        Explore the Ruins to discover Survivors.
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {survivors.map(s => (
                                        <SurvivorCard key={s.id} survivor={s} onBanish={() => handleBanish(s)} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#4a6a4c' }}>SURVIVOR ROLES</div>
                            <div className="space-y-1">
                                {(Object.entries(SURVIVOR_ROLES) as [string, typeof SURVIVOR_ROLES[keyof typeof SURVIVOR_ROLES]][]).map(([, data]) => (
                                    <div key={data.label} className="flex items-center gap-2 text-[0.72rem]">
                                        <span className="rounded px-1.5 py-0.5 font-bold text-[0.6rem]"
                                            style={{ background: data.color + '22', color: data.color, minWidth: '72px', textAlign: 'center' }}>
                                            {data.label}
                                        </span>
                                        <span style={{ color: '#5a7e5c' }}>{data.bonus}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {tab === 'rivals' && (
                    <>
                        <div>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#4a6a4c' }}>
                                RIVAL FACTIONS
                            </div>
                            {energy < 2 && (
                                <div className="mb-2 text-[0.75rem] text-center" style={{ color: '#f97316' }}>
                                    Need 2 energy to raid.
                                </div>
                            )}
                            <div className="space-y-2">
                                {rivalFactions.map(f => (
                                    <RivalCard
                                        key={f.id}
                                        faction={f}
                                        totalOffense={totalOffense}
                                        onRaid={() => handleRaid(f)}
                                    />
                                ))}
                                {rivalFactions.length === 0 && (
                                    <div className="text-[0.85rem] text-center py-3" style={{ color: '#3a5a3c' }}>
                                        No intel on rival factions yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="text-[0.7rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>BOUNTY BOARD</div>
                                <div className="text-[0.65rem]" style={{ color: '#3a5a3c' }}>Refreshes {fmt(bountyTimeLeft)}</div>
                            </div>
                            <div className="space-y-2">
                                {bounties.map(b => (
                                    <BountyCard key={b.id} bounty={b} onClaim={() => handleClaimBounty(b)} />
                                ))}
                                {bounties.length === 0 && (
                                    <div className="text-[0.85rem] text-center py-3" style={{ color: '#3a5a3c' }}>
                                        No bounties posted.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {raidResult && (
                <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.85)', zIndex: 40 }}>
                    <div className="mx-4 w-full max-w-sm rounded-lg p-5"
                        style={{ background: '#0e2010', border: `1px solid ${raidResult.won ? '#4ade80' : '#f97316'}` }}>
                        <div className="text-[1.1rem] font-bold mb-1"
                            style={{ color: raidResult.won ? '#4ade80' : '#f97316' }}>
                            {raidResult.won ? 'RAID SUCCESSFUL' : 'RAID FAILED'}
                        </div>
                        <div className="text-[0.85rem] mb-1" style={{ color: '#bcd4bd' }}>
                            {raidResult.won
                                ? `${raidResult.name} didn't see you coming. +${raidResult.scrip} scrip.`
                                : `${raidResult.name} held their ground. You lost 2 energy.`}
                        </div>
                        <button type="button"
                            className="mt-3 w-full rounded py-2 text-[0.9rem] font-bold transition-transform active:scale-95"
                            style={{ background: '#1a3e1c', color: '#7ccf5a' }}
                            onClick={() => setRaidResult(null)}>
                            ACKNOWLEDGED
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
