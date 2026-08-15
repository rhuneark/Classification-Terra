import { useState, useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { getActiveComboLabels, getLoadoutStats } from '../game/weightClass.ts';
import { RARITY_COLORS, RARITY_LABELS, SLOT_LABELS, SLOT_ACCEPT, SLOT_COLORS, QUALITY_LABELS } from '../game/types.ts';
import type { Item, ResearchQueueItem, Loadout, EquipSlot, TrophiedItem } from '../game/types.ts';
import { updateSave } from '../state/save.ts';
import { primeEnergyRegenTimer } from '../game/energyRegen.ts';
import StatsCard from './StatsCard.tsx';
import WorkbenchTab from './WorkbenchTab.tsx';
import { CRAFT_RECIPES } from '../game/crafting.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

type LoadoutKey = keyof Loadout;

const SLOT_ORDER: LoadoutKey[] = ['head', 'torso', 'legs', 'feet', 'hand1', 'hand2', 'protection', 'consumableSlot'];

const SLOT_KEY_TO_EQUIP: Record<LoadoutKey, EquipSlot> = {
    head: 'head', torso: 'torso', legs: 'legs', feet: 'feet',
    hand1: 'hand', hand2: 'hand', protection: 'protection', consumableSlot: 'pack',
};

const CRAFT_INGREDIENT_IDS = new Set(CRAFT_RECIPES.flatMap(r => r.ingredients.map(i => i.itemId)));

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
    const isCraftIngredient = CRAFT_INGREDIENT_IDS.has(item.id);
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
                        {isCraftIngredient && (
                            <span className="text-[0.62rem] rounded px-1" style={{ color: '#a78bfa', background: '#a78bfa18' }}>⚙</span>
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
    const safeHouse = useStore(s => s.safeHouse);
    const inventoryCapacity = useStore(s => s.inventoryCapacity);
    const selectedId = useStore(s => s.selectedInventoryItemId);
    const [showStats, setShowStats] = useState(false);
    const [loadoutTab, setLoadoutTab] = useState<'lab' | 'gear' | 'bench'>('gear');
    const [bagMsg, setBagMsg] = useState<string | null>(null);

    const stats = getLoadoutStats(loadout);
    const wc = stats.wc;
    const combos = getActiveComboLabels(loadout);
    const equippedCount = Object.values(loadout).filter(Boolean).length;
    const gearInventory = inventory.filter(i => i.type !== 'consumable' && i.type !== 'lore' && i.type !== 'pack' && i.type !== 'nostalgic');
    const nostalgicInventory = inventory.filter(i => i.type === 'nostalgic');
    const consumables = inventory.filter(i => i.type === 'consumable');
    const packItems = inventory.filter(i => i.type === 'pack');

    // Bag capacity counts gear + pack (not consumables)
    const bagGearCount = gearInventory.length + packItems.length;
    const bagFull = bagGearCount >= inventoryCapacity;

    function showMsg(msg: string) {
        setBagMsg(msg);
        setTimeout(() => setBagMsg(null), 2500);
    }

    function handleStore(item: Item) {
        const s = store.get();
        const newInventory = s.inventory.filter(i => i !== item);
        const newSafeHouse = [...s.safeHouse, item];
        store.patch({ inventory: newInventory, safeHouse: newSafeHouse });
        updateSave({ inventory: newInventory, safeHouse: newSafeHouse });
        RundotGameAPI.analytics.recordCustomEvent('safehouse_item_stored', { itemId: item.id, rarity: item.rarity }).catch(() => {});
    }

    function handleRetrieve(item: Item) {
        const s = store.get();
        const currentGearCount = s.inventory.filter(i => i.type !== 'consumable' && i.type !== 'lore').length;
        if (currentGearCount >= s.inventoryCapacity) {
            showMsg('Bag full. Store or equip something first.');
            return;
        }
        const newSafeHouse = s.safeHouse.filter(i => i !== item);
        const newInventory = [...s.inventory, item];
        store.patch({ safeHouse: newSafeHouse, inventory: newInventory });
        updateSave({ safeHouse: newSafeHouse, inventory: newInventory });
        RundotGameAPI.analytics.recordCustomEvent('safehouse_item_retrieved', { itemId: item.id, rarity: item.rarity }).catch(() => {});
    }

    function handleEquipFromSafeHouse(item: Item) {
        if (!item.equipSlot) { handleRetrieve(item); return; }
        const s = store.get();
        const acceptingSlots = SLOT_ORDER.filter(slot => SLOT_ACCEPT[slot].includes(item.equipSlot as EquipSlot));
        if (acceptingSlots.length === 0) { handleRetrieve(item); return; }
        const emptySlot = acceptingSlots.find(slot => s.loadout[slot] === null);
        const targetSlot = emptySlot ?? acceptingSlots[0];
        const displaced = s.loadout[targetSlot];
        const newLoadout = { ...s.loadout, [targetSlot]: item };
        const newSafeHouse = s.safeHouse.filter(i => i !== item);
        // If bag has space put displaced there, otherwise store it in safe house
        const currentGearCount = s.inventory.filter(i => i.type !== 'consumable' && i.type !== 'lore').length;
        let newInventory = [...s.inventory];
        let finalSafeHouse = newSafeHouse;
        if (displaced) {
            if (currentGearCount < s.inventoryCapacity) {
                newInventory = [...newInventory, displaced];
            } else {
                finalSafeHouse = [...finalSafeHouse, displaced];
            }
        }
        const newPackItem = newLoadout.consumableSlot;
        const newMaxEnergy = 20 + (newPackItem?.packMaxEnergy ?? 0);
        store.patch({ loadout: newLoadout, inventory: newInventory, safeHouse: finalSafeHouse, selectedInventoryItemId: null, maxEnergy: newMaxEnergy });
        updateSave({ loadout: newLoadout, inventory: newInventory, safeHouse: finalSafeHouse });
        RundotGameAPI.analytics.recordCustomEvent('safehouse_item_equipped', { itemId: item.id, slot: targetSlot, rarity: item.rarity }).catch(() => {});
    }

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

    function handleDonate(item: Item) {
        const s = store.get();
        const donateValue = item.sellValue;
        const newInventory = s.inventory.filter(i => i !== item);
        const newBaseResources = s.baseResources + donateValue;
        const entry = { id: `donate-${Date.now()}`, type: 'faction' as const, message: `Donated ${item.name} to the base. +${donateValue} base resources.`, timestamp: Date.now() };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ inventory: newInventory, baseResources: newBaseResources, eventLog: newLog });
        updateSave({ inventory: newInventory, baseResources: newBaseResources, eventLog: newLog });
        RundotGameAPI.analytics.recordCustomEvent('base_item_donated', { itemId: item.id, value: donateValue }).catch(() => {});
    }

    function handleTrophy(item: Item) {
        if (!item.nostalgicBaseId || !item.qualityTier) return;
        const s = store.get();
        const newTrophied: TrophiedItem = { itemId: item.id, baseItemId: item.nostalgicBaseId, quality: item.qualityTier, trophiedAt: Date.now(), name: item.name };
        const newInventory = s.inventory.filter(i => i !== item);
        const newTrophiedItems = [...s.trophiedItems, newTrophied];
        const entry = { id: `trophy-${Date.now()}`, type: 'trophy' as const, message: `Trophied ${item.name} (${QUALITY_LABELS[item.qualityTier]}).`, timestamp: Date.now() };
        const newLog = [entry, ...s.eventLog].slice(0, 50);
        store.patch({ inventory: newInventory, trophiedItems: newTrophiedItems, eventLog: newLog });
        updateSave({ inventory: newInventory, trophiedItems: newTrophiedItems, eventLog: newLog });
        if (item.qualityTier === 'perfect') {
            RundotGameAPI.leaderboard.submitScore({
                score: Math.floor((Date.now() - 1700000000000) / 1000),
                duration: 1,
                mode: `trophy-perfect-${item.nostalgicBaseId}`,
                metadata: { baseItemId: item.nostalgicBaseId },
            }).catch(() => {});
        }
        RundotGameAPI.analytics.recordCustomEvent('nostalgic_trophied', { baseItemId: item.nostalgicBaseId, quality: item.qualityTier }).catch(() => {});
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

                    {/* DUFFLE BAG — gear + pack items with STORE button */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="text-[0.68rem] font-bold tracking-widests" style={{ color: bagFull ? '#f97316' : '#4a6a4c' }}>
                                DUFFLE BAG
                            </div>
                            <div className="text-[0.65rem] font-bold" style={{ color: bagFull ? '#f97316' : '#3a5a3c' }}>
                                {bagGearCount}/{inventoryCapacity}{bagFull ? ' · FULL' : ''}
                            </div>
                        </div>
                        {bagMsg && (
                            <div className="mb-1.5 rounded px-2 py-1 text-[0.78rem] text-center" style={{ background: '#1a2010', color: '#f97316', border: '1px solid #3a2010' }}>
                                {bagMsg}
                            </div>
                        )}
                        {packItems.length > 0 && (
                            <div className="mb-2 space-y-1.5">
                                {packItems.map(item => (
                                    <div key={item.id + item.name + 'pack'}>
                                        <ItemCard item={item} onClick={() => handleInventoryTap(item)} selected={selectedId === item.id} compact />
                                        <button type="button"
                                            className="mt-0.5 w-full rounded py-1 text-[0.72rem] font-bold tracking-wide transition-transform active:scale-95"
                                            style={{ background: '#0a1a2e', color: '#60a5fa', border: '1px solid #1a3a5e' }}
                                            onClick={() => handleStore(item)}>
                                            STORE →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {gearInventory.length === 0 && packItems.length === 0 && nostalgicInventory.length === 0 ? (
                            <p className="text-[0.88rem]" style={{ color: '#3a5a3c' }}>Bag empty. Researched items arrive here when ready.</p>
                        ) : (
                            <div className="space-y-2">
                                {gearInventory.map(item => (
                                    <div key={item.id + item.name + 'bag'}>
                                        <ItemCard item={item} onClick={() => handleInventoryTap(item)} selected={selectedId === item.id} />
                                        <div className="mt-0.5 flex gap-1">
                                            <button type="button"
                                                className="flex-1 rounded py-1 text-[0.72rem] font-bold tracking-wide transition-transform active:scale-95"
                                                style={{ background: '#0a1a2e', color: '#60a5fa', border: '1px solid #1a3a5e' }}
                                                onClick={() => handleStore(item)}>
                                                STORE →
                                            </button>
                                            <button type="button"
                                                className="rounded px-2 py-1 text-[0.72rem] font-bold tracking-wide transition-transform active:scale-95"
                                                style={{ background: '#0a1810', color: '#8aaa6c', border: '1px solid #2a4e2c' }}
                                                onClick={() => handleDonate(item)}>
                                                DONATE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {nostalgicInventory.length > 0 && (
                            <div className="mt-3">
                                <div className="text-[0.68rem] font-bold tracking-widest mb-1.5" style={{ color: '#8a4a6c' }}>
                                    RELICS · {nostalgicInventory.length} found
                                </div>
                                <div className="space-y-2">
                                    {nostalgicInventory.map(item => (
                                        <div key={item.id + 'relic'}>
                                            <div className="rounded p-2.5" style={{ background: '#120a10', border: '1px solid #FF69B433' }}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-[0.9rem] font-bold" style={{ color: '#FF69B4' }}>{item.name}</div>
                                                        <div className="mt-0.5 text-[0.75rem] leading-snug" style={{ color: '#8a6a8a' }}>{item.description}</div>
                                                        <div className="mt-0.5 flex gap-1.5 flex-wrap">
                                                            <span className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold"
                                                                style={{ background: '#FF69B422', color: '#FF69B4', border: '1px solid #FF69B444' }}>
                                                                {item.qualityTier ? QUALITY_LABELS[item.qualityTier] : 'RELIC'}
                                                            </span>
                                                            <span className="text-[0.65rem]" style={{ color: '#6a4a6c' }}>Sell value: {item.sellValue}s</span>
                                                            {item.qualityTier === 'perfect' && (
                                                                <span className="text-[0.65rem] font-bold" style={{ color: '#ffd060' }}>★ WORLD FIRST ELIGIBLE</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="button"
                                                className="mt-0.5 w-full rounded py-1 text-[0.72rem] font-bold tracking-wide transition-transform active:scale-95"
                                                style={{ background: '#1a0a14', color: '#FF69B4', border: '1px solid #FF69B444' }}
                                                onClick={() => handleTrophy(item)}>
                                                TROPHY
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-1 text-[0.65rem]" style={{ color: '#5a3a5c' }}>Trophy relics to preserve them in the Relic Room. They can also be sold at the Outpost.</p>
                            </div>
                        )}
                    </div>

                    {/* SAFE HOUSE — protected unlimited storage */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="text-[0.68rem] font-bold tracking-widests" style={{ color: '#6a9e6c' }}>
                                SAFE HOUSE
                            </div>
                            <div className="text-[0.65rem]" style={{ color: '#3a5a3c' }}>
                                {safeHouse.length > 0 ? `${safeHouse.length} stored · protected` : '∞ · protected'}
                            </div>
                        </div>
                        {safeHouse.length === 0 ? (
                            <p className="text-[0.78rem] rounded p-2" style={{ color: '#3a5a3c', background: '#080f09', border: '1px solid #142816' }}>
                                Items stored here are safe from sell and raids. Tap STORE → on any bag item.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {safeHouse.map(item => {
                                    const color = RARITY_COLORS[item.rarity];
                                    const isCraftIngredient = CRAFT_INGREDIENT_IDS.has(item.id);
                                    return (
                                        <div key={item.id + item.name + 'sh'} className="rounded p-[10px_12px]"
                                            style={{ background: '#080e0a', border: `1px solid ${color}33` }}>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-[0.95rem] font-bold" style={{ color }}>{item.name}</div>
                                                    <div className="mt-0.5 text-[0.8rem] leading-snug" style={{ color: '#9ab09c' }}>{item.description}</div>
                                                    <div className="mt-0.5 flex flex-wrap gap-1">
                                                        <span className="text-[0.65rem] font-bold" style={{ color: color + 'aa' }}>{RARITY_LABELS[item.rarity]}</span>
                                                        {item.equipSlot && item.type !== 'consumable' && (
                                                            <span className="text-[0.62rem] font-bold rounded px-1" style={{ color: SLOT_COLORS[item.equipSlot], background: SLOT_COLORS[item.equipSlot] + '18' }}>
                                                                {item.type === 'pack' ? 'PACK' : item.equipSlot.toUpperCase().replace('-', ' ')}
                                                            </span>
                                                        )}
                                                        {isCraftIngredient && (
                                                            <span className="text-[0.62rem] rounded px-1" style={{ color: '#a78bfa', background: '#a78bfa18' }}>⚙</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right space-y-0.5">
                                                    {item.damage > 0 && <div className="text-[0.7rem] font-bold" style={{ color: '#ffd060' }}>ATK {item.damage}</div>}
                                                    {item.defense > 0 && <div className="text-[0.7rem] font-bold" style={{ color: '#60a5fa' }}>DEF {item.defense}</div>}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {item.equipSlot && (
                                                    <button type="button"
                                                        className="flex-1 rounded py-1 text-[0.72rem] font-bold transition-transform active:scale-95"
                                                        style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                                                        onClick={() => handleEquipFromSafeHouse(item)}>
                                                        EQUIP
                                                    </button>
                                                )}
                                                <button type="button"
                                                    className="flex-1 rounded py-1 text-[0.72rem] font-bold transition-transform active:scale-95"
                                                    style={{
                                                        background: bagFull ? '#0e1a0e' : '#0a1a2e',
                                                        color: bagFull ? '#4a6a4c' : '#60a5fa',
                                                        border: bagFull ? '1px solid #1a2a1e' : '1px solid #1a3a5e',
                                                    }}
                                                    onClick={() => handleRetrieve(item)}>
                                                    {bagFull ? 'BAG FULL' : '← RETRIEVE'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showStats && <StatsCard onClose={() => setShowStats(false)} />}
        </div>
    );
}
