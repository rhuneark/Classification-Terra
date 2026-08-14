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
} from '../game/factions.ts';
import type { Survivor, RivalFaction, Bounty } from '../game/types.ts';
import { RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import { rollRandomItem } from '../game/items.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

function fmt(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function SurvivorCard({ survivor, onBanish }: { survivor: Survivor; onBanish: () => void }) {
    const data = SURVIVOR_ROLES[survivor.role];
    return (
        <div className="rounded p-2.5 flex items-center justify-between gap-2"
            style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
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
            <button type="button"
                className="shrink-0 rounded px-2 py-1 text-[0.72rem] font-bold transition-transform active:scale-95"
                style={{ background: '#1a0e0e', color: '#f87171', border: '1px solid #3a1e1e' }}
                onClick={onBanish}>
                BANISH
            </button>
        </div>
    );
}

function RivalCard({ faction, playerOffense, onRaid }: {
    faction: RivalFaction;
    playerOffense: number;
    onRaid: () => void;
}) {
    const raidChance = Math.round(raidSuccessChance(playerOffense, faction.defense) * 100);
    const grudgePct = faction.grudge;
    const grudgeBars = Math.round(grudgePct / 20);
    return (
        <div className="rounded p-2.5" style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-[0.9rem] font-bold text-white">{faction.name}</div>
                    <div className="mt-0.5 text-[0.75rem]" style={{ color: '#7a9a7c' }}>{faction.flavor}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-[0.72rem]">
                        <span style={{ color: '#ffd060' }}>OFF {faction.offense}</span>
                        <span style={{ color: '#60a5fa' }}>DEF {faction.defense}</span>
                        <span style={{ color: '#f87171' }}>
                            GRUDGE {Array.from({ length: 5 }, (_, i) => i < grudgeBars ? '█' : '░').join('')}
                        </span>
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

    const baseStats = computeBaseStats(survivors);

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30_000);
        return () => clearInterval(interval);
    }, []);

    // Refresh bounties if expired
    useEffect(() => {
        const now = Date.now();
        if (now - bountiesRefreshedAt > BOUNTY_REFRESH_MS || bounties.length === 0) {
            const fresh = generateBounties(now);
            store.patch({ bounties: fresh, bountiesRefreshedAt: now });
            updateSave({ bounties: fresh, bountiesRefreshedAt: now });
        }
    }, []);

    // Refresh global event
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

        const chance = raidSuccessChance(baseStats.offense, faction.defense);
        const won = Math.random() < chance;
        const scrip = won ? Math.floor(20 + Math.random() * 30) : 0;

        const newEnergy = s.energy - 2;
        const newGrudge = Math.min(100, faction.grudge + (won ? 15 : 5));

        const updatedFactions = s.rivalFactions.map(f =>
            f.id === faction.id
                ? { ...f, grudge: newGrudge, lastRaidedByPlayerAt: Date.now() }
                : f
        );

        const newCurrency = s.currency + scrip;
        const newTotalRaids = (s.totalRaids ?? 0) + 1;

        store.patch({ energy: newEnergy, currency: newCurrency, rivalFactions: updatedFactions, totalRaids: newTotalRaids });
        updateSave({ energy: newEnergy, currency: newCurrency, rivalFactions: updatedFactions, totalRaids: newTotalRaids });

        const logMsg = won
            ? `Raided ${faction.name}. Success. +${scrip} scrip seized.`
            : `Raided ${faction.name}. Turned back. Wasted 2 energy.`;
        const entry = { id: `raid-${Date.now()}`, type: 'faction' as const, message: logMsg, timestamp: Date.now() };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ eventLog: newLog });
        updateSave({ eventLog: newLog });

        // Update bounties: raid type
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
        RundotGameAPI.analytics.recordCustomEvent('faction_raid_attempt', { factionId: faction.id, won, scrip }).catch(() => {});
    }

    function handleClaimBounty(bounty: Bounty) {
        const s = store.get();
        let newCurrency = s.currency + bounty.rewardScrip;
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
            {/* Header */}
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
                        {/* Global Event */}
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

                        {/* Base stats */}
                        <div className="rounded p-3" style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-2" style={{ color: '#4a6a4c' }}>SAFE HOUSE STATS</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>DEFENSE</div>
                                    <div className="text-[1rem] font-bold" style={{ color: '#60a5fa' }}>{baseStats.defense}</div>
                                </div>
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>OFFENSE</div>
                                    <div className="text-[1rem] font-bold" style={{ color: '#ffd060' }}>{baseStats.offense}</div>
                                </div>
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>PASSIVE INCOME</div>
                                    <div className="text-[0.9rem] font-bold" style={{ color: '#fb923c' }}>{baseStats.scripPerHour}/hr</div>
                                </div>
                                <div>
                                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>STABILITY</div>
                                    <div className="text-[0.9rem] font-bold" style={{ color: baseStats.stability >= 85 ? '#4ade80' : baseStats.stability >= 50 ? '#facc15' : '#f97316' }}>
                                        {baseStats.stability}%
                                    </div>
                                </div>
                            </div>
                            {baseStats.upkeep > 0 && (
                                <div className="mt-2 text-[0.72rem]" style={{ color: '#5a7e5c' }}>
                                    Upkeep: {baseStats.upkeep} scrip/session
                                    {baseStats.stability >= 85 ? ' (balanced — 50% off)' : ''}
                                </div>
                            )}
                            {baseStats.findBonus > 0 && (
                                <div className="text-[0.72rem]" style={{ color: '#4ade80' }}>Scouts: +{baseStats.findBonus}% item find chance</div>
                            )}
                            {baseStats.researchReduction > 0 && (
                                <div className="text-[0.72rem]" style={{ color: '#a78bfa' }}>Engineers: -{baseStats.researchReduction}% research time</div>
                            )}
                        </div>

                        {/* Survivor list */}
                        <div>
                            <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#4a6a4c' }}>
                                SURVIVORS ({survivors.length}/10)
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

                        {/* Role guide */}
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
                        {/* Rival factions */}
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
                                        playerOffense={baseStats.offense}
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

                        {/* Bounty board */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="text-[0.7rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>BOUNTY BOARD</div>
                                <div className="text-[0.65rem]" style={{ color: '#3a5a3c' }}>
                                    Refreshes {fmt(bountyTimeLeft)}
                                </div>
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

            {/* Raid result modal */}
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
