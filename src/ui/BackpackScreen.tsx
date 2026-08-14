import { useState, useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { getActiveComboLabels, getLoadoutStats } from '../game/weightClass.ts';
import { RARITY_COLORS, RARITY_LABELS, SLOT_LABELS, SLOT_ACCEPT, SLOT_COLORS } from '../game/types.ts';
import type { Item, ResearchQueueItem, Loadout, EquipSlot } from '../game/types.ts';
import { updateSave } from '../state/save.ts';
import { primeEnergyRegenTimer } from '../game/energyRegen.ts';
import StatsCard from './StatsCard.tsx';
import WorkbenchTab from './WorkbenchTab.tsx';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

type LoadoutKey = keyof Loadout;

const SLOT_ORDER: LoadoutKey[] = ['head', 'torso', 'legs', 'feet', 'hand1', 'hand2', 'protection', 'consumableSlot'];

const SLOT_KEY_TO_EQUIP: Record<LoadoutKey, EquipSlot> = {
    head: 'head', torso: 'torso', legs: 'legs', feet: 'feet',
    hand1: 'hand', hand2: 'hand', protection: 'protection', consumableSlot: 'pack',
};

function fmt(ms: number): string {
    if (ms <= 0) return 'READY';
    const totalSec = Math.ceil(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

function ResearchQueueSection() {
    const queue = useStore(s => s.researchQueue);
    const inventory = useStore(s => s.inventory);
    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
            const s = store.get();
            const now = Date.now();
            const completed: Item[] = [];
            const remaining = s.researchQueue.filter(qi => {
                if (now >= qi.startedAt + qi.durationMs) {
                    completed.push(qi.item);
                    return false;
                }
                return true;
            });
            if (completed.length > 0) {
                const newInventory = [...s.inventory, ...completed];
                store.patch({ researchQueue: remaining, inventory: newInventory });
                updateSave({ researchQueue: remaining, inventory: newInventory });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const magnifiers = inventory.filter(i => i.type === 'consumable' && (i.researchBoostMs ?? 0) > 0);
    const hasMagnifier = magnifiers.length > 0;

    function applyMagnifier(qi: ResearchQueueItem) {
        const s = store.get();
        const glass = s.inventory.find(i => i.type === 'consumable' && (i.researchBoostMs ?? 0) > 0);
        if (!glass) return;
        const boost = glass.researchBoostMs ?? 0;
        const newQueue = s.researchQueue.map(q => {
            if (q.instanceId !== qi.instanceId) return q;
            return { ...q, durationMs: Math.max(0, q.durationMs - boost) };
        });
        const newInventory = s.inventory.filter(i => i !== glass);
        store.patch({ researchQueue: newQueue, inventory: newInventory });
        updateSave({ researchQueue: newQueue, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('magnifier_used', { boost, itemId: qi.item.id }).catch(() => {});
    }

    const now = Date.now();

    return (
        <div className="scroll-area flex-1 px-3 pt-3 pb-20 space-y-3">
            {queue.length === 0 ? (
                <p className="text-[0.88rem] mt-4 text-center" style={{ color: '#3a5a3c' }}>
                    Nothing in the lab. Scavenge items to begin research.
                </p>
            ) : (
                <div className="space-y-1.5">
                    {queue.map(qi => {
                        const elapsed = now - qi.startedAt;
                        const pct = Math.min(100, (elapsed / qi.durationMs) * 100);
                        const remaining = Math.max(0, qi.durationMs - elapsed);
                        const done = remaining === 0;
                        const color = RARITY_COLORS[qi.item.rarity];

                        return (
                            <div key={qi.instanceId} className="rounded p-2.5" style={{ background: '#0e2010', border: `1px solid ${done ? '#1a5e1c' : '#1a3e1c'}` }}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[0.9rem] font-bold" style={{ color }}>{qi.item.name}</div>
                                        <div className="text-[0.65rem]" style={{ color: color + 'aa' }}>{RARITY_LABELS[qi.item.rarity]}</div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-[0.78rem] font-bold tabular-nums" style={{ color: done ? '#4ade80' : '#8aaa8c' }}>
                                            {fmt(remaining)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: '#142816' }}>
                                    <div className="h-full rounded-full transition-[width] duration-500"
                                        style={{ width: `${pct}%`, background: done ? '#4ade80' : '#2a5e2c' }} />
                                </div>
                                {hasMagnifier && !done && (
                                    <button type="button"
                                        className="mt-2 w-full rounded px-3 py-1.5 text-[0.82rem] font-bold tracking-wide transition-transform active:scale-95"
                                        style={{ background: '#0a1a2a', color: '#60c5ff', border: '2px solid #3a8acc', boxShadow: '0 0 8px #3a8acc55' }}
                                        onClick={() => applyMagnifier(qi)}>
                                        USE GLASS — {magnifiers[0].name.replace('Magnifying Glass ', '')} (-{fmt(magnifiers[0].researchBoostMs ?? 0)})
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function LoadoutSlotCard({ slotKey, item, onTap }: { slotKey: LoadoutKey; item: Item | null; onTap: () => void }) {
    const equipSlot = SLOT_KEY_TO_EQUIP[slotKey];
    const slotColor = SLOT_COLORS[equipSlot];
    const itemColor = item ? RARITY_COLORS[item.rarity] : undefined;

    return (
        <button type="button"
            className="flex flex-col rounded transition-transform active:scale-95 text-left"
            style={{
                background: item ? '#0e2010' : '#070e08',
                border: `1px solid ${item ? (itemColor + '55') : (slotColor + '33')}`,
                minHeight: '72px',
                padding: '7px 8px',
            }}
            onClick={onTap}>
            <div className="text-[0.6rem] font-bold tracking-widest mb-1" style={{ color: slotColor + 'aa' }}>
                {SLOT_LABELS[slotKey]}
            </div>
            {item ? (
                <>
                    <div className="truncate w-full text-[0.72rem] font-bold leading-tight" style={{ color: itemColor }}>
                        {item.name}
                    </div>
                    <div className="mt-auto pt-1 flex gap-1.5 flex-wrap">
                        {item.damage > 0 && (
                            <span className="text-[0.6rem] font-bold" style={{ color: '#ffd060' }}>ATK {item.damage}</span>
                        )}
                        {item.defense > 0 && (
                            <span className="text-[0.6rem] font-bold" style={{ color: '#60a5fa' }}>DEF {item.defense}</span>
                        )}
                        {item.packMaxEnergy && (
                            <span className="text-[0.6rem] font-bold" style={{ color: '#34d399' }}>+{item.packMaxEnergy}⚡MAX</span>
                        )}
                        {item.packAmbushReduction && (
                            <span className="text-[0.6rem] font-bold" style={{ color: '#34d399' }}>-{Math.round(item.packAmbushReduction*100)}%AMB</span>
                        )}
                        {item.damage === 0 && item.defense === 0 && !item.packMaxEnergy && !item.packAmbushReduction && item.power > 0 && (
                            <span className="text-[0.6rem]" style={{ color: '#6a8e6c' }}>PWR {item.power}</span>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center">
                    <span className="text-[0.62rem]" style={{ color: slotColor + '44' }}>EMPTY</span>
                </div>
            )}
        </button>
    );
}

function ItemCard({ item, onClick, selected, compact = false }: { item: Item; onClick: () => void; selected?: boolean; compact?: boolean }) {
    const color = RARITY_COLORS[item.rarity];
    return (
        <button type="button"
            className="w-full rounded text-left transition-transform active:scale-[0.98]"
            style={{ background: selected ? color + '18' : '#0e2010', border: `1px solid ${selected ? color + '88' : '#243e26'}`, padding: compact ? '8px 10px' : '10px 12px' }}
            onClick={onClick}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.95rem] font-bold" style={{ color }}>{item.name}</div>
                    {!compact && (
                        <div className="mt-0.5 text-[0.8rem] leading-snug" style={{ color: '#bcd4bd' }}>{item.description}</div>
                    )}
                    <div className="mt-0.5 flex flex-wrap gap-1">
                        <span className="text-[0.65rem] font-bold" style={{ color: color + 'aa' }}>{RARITY_LABELS[item.rarity]}</span>
                        {item.equipSlot && item.type !== 'consumable' && (
                            <span className="text-[0.62rem] font-bold rounded px-1" style={{ color: SLOT_COLORS[item.equipSlot], background: SLOT_COLORS[item.equipSlot] + '18' }}>
                                {item.type === 'pack' ? 'PACK' : item.equipSlot.toUpperCase().replace('-', ' ')}
                            </span>
                        )}
                        {item.special.map(s => (
                            <span key={s} className="rounded px-1 text-[0.65rem]" style={{ background: '#1a3e1c', color: '#5ade70' }}>
                                {s.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                    {item.damage > 0 && (
                        <div className="text-[0.7rem] font-bold tabular-nums" style={{ color: '#ffd060' }}>ATK {item.damage}</div>
                    )}
                    {item.defense > 0 && (
                        <div className="text-[0.7rem] font-bold tabular-nums" style={{ color: '#60a5fa' }}>DEF {item.defense}</div>
                    )}
                    {item.packMaxEnergy && (
                        <div className="text-[0.7rem] font-bold tabular-nums" style={{ color: '#34d399' }}>+{item.packMaxEnergy}⚡</div>
                    )}
                    {item.packAmbushReduction && (
                        <div className="text-[0.7rem] font-bold tabular-nums" style={{ color: '#34d399' }}>-{Math.round(item.packAmbushReduction*100)}%</div>
                    )}
                    {item.damage === 0 && item.defense === 0 && !item.packMaxEnergy && !item.packAmbushReduction && (
                        <div className="text-[0.7rem]" style={{ color: '#4a6a4c' }}>—</div>
                    )}
                </div>
            </div>
        </button>
    );
}

function ConsumablePanel({ item, onUse, onDiscard }: {
    item: Item; onUse: () => void; onDiscard: () => void;
}) {
    const isMagnifier = !!item.researchBoostMs;
    return (
        <div className="rounded p-3" style={{ background: '#0e2010', border: '1px solid #243e26' }}>
            <div className="text-[0.9rem] font-bold text-white">{item.name}</div>
            <div className="mt-0.5 text-[0.8rem]" style={{ color: '#bcd4bd' }}>{item.description}</div>
            {item.energyRestore && <div className="mt-1 text-[0.8rem]" style={{ color: '#4ade80' }}>+{item.energyRestore} ⚡ energy</div>}
            {item.luckBonus && <div className="mt-1 text-[0.8rem]" style={{ color: '#fb923c' }}>Next run: reduced ambush chance</div>}
            {item.researchBoostMs && <div className="mt-1 text-[0.8rem]" style={{ color: '#60a5fa' }}>Speeds up research by {fmt(item.researchBoostMs)}</div>}
            {item.energyBoostDuration && <div className="mt-1 text-[0.8rem]" style={{ color: '#4ade80' }}>Energy regen: 1/min for {fmt(item.energyBoostDuration)}</div>}
            {isMagnifier ? (
                <div className="mt-2 flex gap-2 flex-wrap">
                    <div className="flex-1 rounded py-1.5 px-2 text-[0.8rem]" style={{ background: '#0a1a2a', color: '#60a5fa', border: '1px solid #1a4a6a' }}>
                        Tap USE GLASS on a Research Lab item
                    </div>
                    <button type="button" className="rounded px-3 py-1.5 text-[0.85rem] transition-transform active:scale-95"
                        style={{ background: '#1a2e1c', color: '#8aaa8c' }} onClick={onDiscard}>DISCARD</button>
                </div>
            ) : (
                <div className="mt-2 flex gap-2">
                    <button type="button" className="flex-1 rounded py-1.5 text-[0.88rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{ background: '#7ccf5a', color: '#070e08' }} onClick={onUse}>USE</button>
                    <button type="button" className="rounded px-3 py-1.5 text-[0.85rem] transition-transform active:scale-95"
                        style={{ background: '#1a2e1c', color: '#8aaa8c' }} onClick={onDiscard}>DISCARD</button>
                </div>
            )}
        </div>
    );
}

export default function BackpackScreen() {
    const loadout = useStore(s => s.loadout);
    const inventory = useStore(s => s.inventory);
    const selectedId = useStore(s => s.selectedInventoryItemId);
    const [showStats, setShowStats] = useState(false);
    const [loadoutTab, setLoadoutTab] = useState<'lab' | 'gear' | 'bench'>('gear');

    const stats = getLoadoutStats(loadout);
    const wc = stats.wc;
    const combos = getActiveComboLabels(loadout);
    const equippedCount = Object.values(loadout).filter(Boolean).length;
    const gearInventory = inventory.filter(i => i.type !== 'consumable' && i.type !== 'lore' && i.type !== 'pack');
    const consumables = inventory.filter(i => i.type === 'consumable');
    const packItems = inventory.filter(i => i.type === 'pack');

    // Compute maxEnergy bonus from equipped pack item
    const equippedPack = loadout.consumableSlot;
    const maxEnergyBonus = equippedPack?.packMaxEnergy ?? 0;

    function handleSlotTap(slotKey: LoadoutKey) {
        const item = loadout[slotKey];
        if (!item) return;
        const newLoadout = { ...loadout, [slotKey]: null };
        const newInventory = [...inventory, item];
        // Recalculate maxEnergy after unequipping pack
        const newPackItem = newLoadout.consumableSlot;
        const newMaxEnergy = 20 + (newPackItem?.packMaxEnergy ?? 0);
        store.patch({ loadout: newLoadout, inventory: newInventory, maxEnergy: newMaxEnergy });
        updateSave({ loadout: newLoadout, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('loadout_item_unequipped', { itemId: item.id, slot: slotKey }).catch(() => {});
    }

    function handleInventoryTap(item: Item) {
        if (item.type === 'consumable') {
            store.patch({ selectedInventoryItemId: selectedId === item.id ? null : item.id });
            return;
        }
        if (!item.equipSlot) {
            store.patch({ selectedInventoryItemId: selectedId === item.id ? null : item.id });
            return;
        }

        const s = store.get();
        const acceptingSlots = SLOT_ORDER.filter(slot =>
            SLOT_ACCEPT[slot].includes(item.equipSlot as EquipSlot)
        );
        if (acceptingSlots.length === 0) {
            store.patch({ selectedInventoryItemId: item.id });
            return;
        }

        // Prefer lowest-indexed empty slot, then fall back to first slot
        const emptySlot = acceptingSlots.find(slot => s.loadout[slot] === null);
        const targetSlot = emptySlot ?? acceptingSlots[0];

        const displaced = s.loadout[targetSlot];
        const newLoadout = { ...s.loadout, [targetSlot]: item };
        let newInventory = s.inventory.filter(i => i !== item);
        if (displaced) newInventory = [...newInventory, displaced];

        // Recalculate maxEnergy if pack slot changed
        const newPackItem = newLoadout.consumableSlot;
        const newMaxEnergy = 20 + (newPackItem?.packMaxEnergy ?? 0);

        store.patch({ loadout: newLoadout, inventory: newInventory, selectedInventoryItemId: null, maxEnergy: newMaxEnergy });
        updateSave({ loadout: newLoadout, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('loadout_item_equipped', { itemId: item.id, slot: targetSlot, rarity: item.rarity }).catch(() => {});

        // Bounty: loadout progress
        const bSt = store.get();
        const updatedBountiesL = bSt.bounties.map(b => {
            if (b.type === 'loadout' && !b.completed) {
                const cnt = Object.values(newLoadout).filter(Boolean).length;
                const newProgress = Math.min(cnt, b.target);
                return { ...b, progress: newProgress, completed: newProgress >= b.target };
            }
            return b;
        });
        if (updatedBountiesL.some((b, i) => b.progress !== bSt.bounties[i]?.progress)) {
            store.patch({ bounties: updatedBountiesL });
            updateSave({ bounties: updatedBountiesL });
        }
    }

    function handleConsumableUse(item: Item) {
        const s = store.get();
        const newInventory = s.inventory.filter(i => i !== item);
        let updates: Partial<typeof s> = { inventory: newInventory, selectedInventoryItemId: null };
        if (item.energyRestore) {
            updates.energy = Math.min(s.energy + item.energyRestore, s.maxEnergy);
            RundotGameAPI.analytics.recordCustomEvent('consumable_used', { itemId: item.id, type: 'energy' }).catch(() => {});
        }
        if (item.luckBonus) {
            updates.luckBonusActive = true;
            RundotGameAPI.analytics.recordCustomEvent('consumable_used', { itemId: item.id, type: 'luck' }).catch(() => {});
        }
        if (item.energyBoostDuration) {
            const boostUntil = Date.now() + item.energyBoostDuration;
            updates.energyBoostUntil = boostUntil;
            updateSave({ energyBoostUntil: boostUntil });
            primeEnergyRegenTimer();
            RundotGameAPI.analytics.recordCustomEvent('consumable_used', { itemId: item.id, type: 'energy_boost' }).catch(() => {});
        }
        store.patch(updates);
        updateSave({ inventory: newInventory, energy: updates.energy ?? s.energy });
    }

    function handleConsumableDiscard(item: Item) {
        const newInventory = store.get().inventory.filter(i => i !== item);
        store.patch({ inventory: newInventory, selectedInventoryItemId: null });
        updateSave({ inventory: newInventory });
    }

    const selectedConsumable = selectedId ? consumables.find(i => i.id === selectedId) : undefined;

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#070e08' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-0" style={{ borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">LOADOUT</div>
                    <div className="flex items-center gap-3">
                        <button type="button"
                            className="rounded px-2.5 py-1 text-[0.75rem] font-bold tracking-wide transition-transform active:scale-95"
                            style={{ background: '#0e2010', color: '#8aaa8c', border: '1px solid #1a3e1c' }}
                            onClick={() => setShowStats(true)}>
                            STATS
                        </button>
                        <div className="text-right">
                            <div className="text-[1.1rem] font-bold text-white">WC {wc}</div>
                            <div className="flex gap-2 justify-end">
                                <span className="text-[0.65rem] font-bold" style={{ color: '#ffd060' }}>ATK {stats.attack}</span>
                                <span className="text-[0.65rem] font-bold" style={{ color: '#60a5fa' }}>DEF {stats.defense}</span>
                                {maxEnergyBonus > 0 && (
                                    <span className="text-[0.65rem] font-bold" style={{ color: '#34d399' }}>+{maxEnergyBonus}⚡</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {combos.length > 0 && loadoutTab === 'gear' && (
                    <div className="flex flex-wrap gap-1">
                        {combos.map(c => (
                            <span key={c} className="rounded px-2 py-0.5 text-[0.72rem] font-bold" style={{ background: '#0b2e0d', color: '#4ade80' }}>
                                {c}
                            </span>
                        ))}
                    </div>
                )}
                {/* 3-tab bar */}
                <div className="flex gap-0 mt-1">
                    {(['lab', 'gear', 'bench'] as const).map(t => (
                        <button key={t} type="button"
                            className="flex-1 py-2 text-[0.75rem] font-bold tracking-widest transition-colors"
                            style={{
                                color: loadoutTab === t ? '#7ccf5a' : '#4a6a4c',
                                borderBottom: loadoutTab === t ? '2px solid #7ccf5a' : '2px solid transparent',
                            }}
                            onClick={() => setLoadoutTab(t)}>
                            {t === 'lab' ? 'LAB' : t === 'gear' ? 'GEAR' : 'BENCH'}
                        </button>
                    ))}
                </div>
            </div>

            {loadoutTab === 'lab' && <ResearchQueueSection />}

            {loadoutTab === 'bench' && <WorkbenchTab />}

            {loadoutTab === 'gear' && (
                <div className="scroll-area flex-1 px-3 pt-3 pb-20 space-y-4">
                    {/* Named equipment slots */}
                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <div className="text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>EQUIPPED</div>
                            <div className="text-[0.65rem]" style={{ color: '#3a5a3c' }}>{equippedCount}/8 SLOTS</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {SLOT_ORDER.map(slotKey => (
                                <LoadoutSlotCard
                                    key={slotKey}
                                    slotKey={slotKey}
                                    item={loadout[slotKey]}
                                    onTap={() => handleSlotTap(slotKey)}
                                />
                            ))}
                        </div>
                        <p className="mt-1 text-[0.7rem]" style={{ color: '#3a5a3c' }}>Tap a filled slot to unequip. Tap items to auto-equip.</p>
                    </div>

                    {selectedConsumable && (
                        <ConsumablePanel
                            item={selectedConsumable}
                            onUse={() => handleConsumableUse(selectedConsumable)}
                            onDiscard={() => handleConsumableDiscard(selectedConsumable)}
                        />
                    )}

                    {consumables.length > 0 && (
                        <div>
                            <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>CONSUMABLES</div>
                            <div className="space-y-1.5">
                                {consumables.map(item => (
                                    <ItemCard key={item.id + item.name} item={item} onClick={() => handleInventoryTap(item)} selected={selectedId === item.id} compact />
                                ))}
                            </div>
                        </div>
                    )}

                    {packItems.length > 0 && (
                        <div>
                            <div className="mb-1.5 text-[0.68rem] font-bold tracking-widests" style={{ color: '#4a6a4c' }}>
                                PACK ITEMS <span className="text-[0.6rem] font-normal" style={{ color: '#2e4a30' }}>— TAP TO EQUIP PACK SLOT</span>
                            </div>
                            <div className="space-y-1.5">
                                {packItems.map(item => (
                                    <ItemCard key={item.id + item.name} item={item} onClick={() => handleInventoryTap(item)} selected={selectedId === item.id} compact />
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="mb-1.5 text-[0.68rem] font-bold tracking-widests" style={{ color: '#4a6a4c' }}>
                            SAFE HOUSE ({gearInventory.length})
                        </div>
                        {gearInventory.length === 0 ? (
                            <p className="text-[0.88rem]" style={{ color: '#3a5a3c' }}>Nothing here. Researched items appear when ready.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {gearInventory.map(item => (
                                    <ItemCard key={item.id + item.name} item={item} onClick={() => handleInventoryTap(item)} selected={selectedId === item.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showStats && <StatsCard onClose={() => setShowStats(false)} />}
        </div>
    );
}
