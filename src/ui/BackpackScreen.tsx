import { useState, useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { computeWeightClass, getActiveComboLabels } from '../game/weightClass.ts';
import { BACKPACK_SLOTS, RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import type { Item, ResearchQueueItem } from '../game/types.ts';
import { updateSave } from '../state/save.ts';
import StatsCard from './StatsCard.tsx';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

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
            // Process completed items
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
            const newDuration = Math.max(0, q.durationMs - boost);
            return { ...q, durationMs: newDuration };
        });
        const newInventory = s.inventory.filter(i => i !== glass);
        store.patch({ researchQueue: newQueue, inventory: newInventory });
        updateSave({ researchQueue: newQueue, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('magnifier_used', { boost, itemId: qi.item.id }).catch(() => {});
    }

    if (queue.length === 0) return null;

    const now = Date.now();

    return (
        <div>
            <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>
                RESEARCH LAB ({queue.length})
            </div>
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
        </div>
    );
}

function BackpackSlot({ item, slotIndex }: { item: Item | null; slotIndex: number }) {
    function handleTap() {
        if (!item) return;
        const s = store.get();
        const newBackpack = [...s.backpack] as (Item | null)[];
        newBackpack[slotIndex] = null;
        const newInventory = [...s.inventory, item];
        store.patch({ backpack: newBackpack, inventory: newInventory });
        updateSave({ backpack: newBackpack, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('backpack_item_unequipped', { itemId: item.id }).catch(() => {});
    }

    return (
        <button type="button"
            className="flex flex-col items-center justify-center rounded transition-transform active:scale-95"
            style={{ background: item ? '#0e2010' : '#070e08', border: `1px solid ${item ? RARITY_COLORS[item.rarity] + '55' : '#1a2e1c'}`, minHeight: '62px', padding: '6px' }}
            onClick={handleTap} disabled={!item}>
            {item ? (
                <>
                    <div className="truncate w-full text-center text-[0.68rem] font-bold leading-tight" style={{ color: RARITY_COLORS[item.rarity] }}>
                        {item.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className="mt-0.5 text-[0.9rem] font-bold text-white">{item.power}</div>
                </>
            ) : (
                <div className="text-[0.65rem]" style={{ color: '#2a3e2c' }}>EMPTY</div>
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
                        {item.special.map(s => (
                            <span key={s} className="rounded px-1 text-[0.65rem]" style={{ background: '#1a3e1c', color: '#5ade70' }}>
                                {s.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[1rem] font-bold text-white">{(item.type === 'consumable' || item.type === 'lore') ? '—' : item.power}</div>
                    <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>PWR</div>
                </div>
            </div>
        </button>
    );
}

function ConsumablePanel({ item, onUse, onDiscard }: { item: Item; onUse: () => void; onDiscard: () => void }) {
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
                <div className="mt-2 flex gap-2">
                    <div className="flex-1 rounded py-1.5 px-2 text-[0.8rem]" style={{ background: '#0a1a2a', color: '#60a5fa', border: '1px solid #1a4a6a' }}>
                        Tap USE GLASS on a Research Lab item below
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
    const backpack = useStore(s => s.backpack);
    const inventory = useStore(s => s.inventory);
    const selectedId = useStore(s => s.selectedInventoryItemId);
    const [showStats, setShowStats] = useState(false);

    const wc = computeWeightClass(backpack);
    const combos = getActiveComboLabels(backpack);
    const equippedCount = backpack.filter(Boolean).length;
    const regularInventory = inventory.filter(i => i.type !== 'consumable' && i.type !== 'lore');
    const consumables = inventory.filter(i => i.type === 'consumable');
    const loreItems = inventory.filter(i => i.type === 'lore');

    function handleInventoryTap(item: Item) {
        if (item.type === 'lore') {
            store.patch({ selectedInventoryItemId: selectedId === item.id ? null : item.id });
            return;
        }
        if (item.type === 'consumable') {
            store.patch({ selectedInventoryItemId: selectedId === item.id ? null : item.id });
            return;
        }
        const s = store.get();
        const emptySlot = s.backpack.findIndex(slot => slot === null);
        if (emptySlot === -1) {
            store.patch({ selectedInventoryItemId: item.id });
            return;
        }
        const newBackpack = [...s.backpack] as (Item | null)[];
        newBackpack[emptySlot] = item;
        const newInventory = s.inventory.filter(i => i !== item);
        store.patch({ backpack: newBackpack, inventory: newInventory, selectedInventoryItemId: null });
        updateSave({ backpack: newBackpack, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('backpack_item_equipped', { itemId: item.id, rarity: item.rarity }).catch(() => {});
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
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">LOADOUT</div>
                    <div className="flex items-center gap-3">
                        <button type="button"
                            className="rounded px-2.5 py-1 text-[0.75rem] font-bold tracking-wide transition-transform active:scale-95"
                            style={{ background: '#0e2010', color: '#8aaa8c', border: '1px solid #1a3e1c' }}
                            onClick={() => setShowStats(true)}>
                            STATS
                        </button>
                        <div className="text-right">
                            <div className="text-[1.3rem] font-bold text-white">WC {wc}</div>
                            <div className="text-[0.7rem]" style={{ color: '#6a8e6c' }}>{equippedCount}/{BACKPACK_SLOTS} SLOTS</div>
                        </div>
                    </div>
                </div>
                {combos.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {combos.map(c => (
                            <span key={c} className="rounded px-2 py-0.5 text-[0.72rem] font-bold" style={{ background: '#0b2e0d', color: '#4ade80' }}>
                                {c}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="scroll-area flex-1 px-3 pt-3 pb-2 space-y-4">
                <ResearchQueueSection />

                <div>
                    <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>EQUIPPED</div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {Array.from({ length: BACKPACK_SLOTS }, (_, i) => (
                            <BackpackSlot key={i} item={backpack[i] ?? null} slotIndex={i} />
                        ))}
                    </div>
                    <p className="mt-1 text-[0.7rem]" style={{ color: '#3a5a3c' }}>Tap equipped item to unequip</p>
                </div>

                {selectedConsumable && (
                    <ConsumablePanel item={selectedConsumable}
                        onUse={() => handleConsumableUse(selectedConsumable)}
                        onDiscard={() => handleConsumableDiscard(selectedConsumable)} />
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

                <div>
                    <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>
                        SAFE HOUSE ({regularInventory.length})
                    </div>
                    {regularInventory.length === 0 ? (
                        <p className="text-[0.88rem]" style={{ color: '#3a5a3c' }}>Nothing here. Researched items appear when ready.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {regularInventory.map(item => (
                                <ItemCard key={item.id + item.name} item={item} onClick={() => handleInventoryTap(item)} selected={selectedId === item.id} />
                            ))}
                        </div>
                    )}
                    {equippedCount >= BACKPACK_SLOTS && regularInventory.length > 0 && (
                        <p className="mt-1 text-[0.78rem]" style={{ color: '#f97316' }}>
                            Backpack full. Unequip something first.
                        </p>
                    )}
                </div>

                {loreItems.length > 0 && (
                    <div>
                        <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>
                            FIELD DOCUMENTS ({loreItems.length})
                        </div>
                        <div className="space-y-1.5">
                            {loreItems.map(item => {
                                const isSelected = selectedId === item.id;
                                return (
                                    <div key={item.id + item.name}>
                                        <button
                                            type="button"
                                            className="w-full rounded text-left transition-transform active:scale-[0.98]"
                                            style={{ background: isSelected ? '#180b28' : '#0e1820', border: `1px solid ${isSelected ? '#c084fc88' : '#2a1e42'}`, padding: '10px 12px' }}
                                            onClick={() => handleInventoryTap(item)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-[0.95rem] font-bold" style={{ color: '#c084fc' }}>{item.name}</div>
                                                    <div className="mt-0.5 text-[0.8rem] leading-snug" style={{ color: '#9a8abc' }}>{item.description}</div>
                                                </div>
                                                <div className="shrink-0 text-[0.62rem] font-bold tracking-wide" style={{ color: '#6a5a8a' }}>
                                                    DOCUMENT
                                                </div>
                                            </div>
                                        </button>
                                        {isSelected && (
                                            <div className="mt-1 flex gap-2 px-1">
                                                <div className="flex-1 rounded px-2 py-1 text-[0.75rem]" style={{ background: '#0e1020', color: '#8a7aac', border: '1px solid #2a1e42' }}>
                                                    Read in the CODEX tab.
                                                </div>
                                                <button
                                                    type="button"
                                                    className="rounded px-3 py-1 text-[0.75rem] transition-transform active:scale-95"
                                                    style={{ background: '#1a0e1c', color: '#7a6a9a', border: '1px solid #2a1e3c' }}
                                                    onClick={() => {
                                                        const newInventory = store.get().inventory.filter(i => i !== item);
                                                        store.patch({ inventory: newInventory, selectedInventoryItemId: null });
                                                        updateSave({ inventory: newInventory });
                                                    }}
                                                >
                                                    DISCARD
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {showStats && <StatsCard onClose={() => setShowStats(false)} />}
        </div>
    );
}
