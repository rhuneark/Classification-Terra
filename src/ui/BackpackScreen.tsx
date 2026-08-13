import { store, useStore } from '../state/store.ts';
import { computeWeightClass, getActiveComboLabels } from '../game/weightClass.ts';
import { BACKPACK_SLOTS, RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import type { Item } from '../game/types.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

function ItemCard({
    item,
    onClick,
    selected,
    compact = false,
}: {
    item: Item;
    onClick: () => void;
    selected?: boolean;
    compact?: boolean;
}) {
    const color = RARITY_COLORS[item.rarity];
    return (
        <button
            type="button"
            className="w-full rounded text-left transition-transform active:scale-[0.98]"
            style={{
                background: selected ? color + '22' : '#0b1a0d',
                border: `1px solid ${selected ? color + '88' : '#1a2e1c'}`,
                padding: compact ? '8px 10px' : '10px 12px',
            }}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.95rem] font-bold" style={{ color }}>
                        {item.name}
                    </div>
                    {!compact && (
                        <div className="mt-0.5 text-[0.75rem] leading-snug" style={{ color: '#6b7a6c' }}>
                            {item.description}
                        </div>
                    )}
                    <div className="mt-0.5 flex flex-wrap gap-1">
                        <span className="text-[0.65rem] font-bold" style={{ color: color + '99' }}>
                            {RARITY_LABELS[item.rarity]}
                        </span>
                        {item.special.map(s => (
                            <span key={s} className="rounded px-1 text-[0.65rem]" style={{ background: '#1a2e1c', color: '#4ade80' }}>
                                {s.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[1rem] font-bold text-white">
                        {item.type === 'consumable' ? '—' : item.power}
                    </div>
                    <div className="text-[0.65rem]" style={{ color: '#4a5a4c' }}>PWR</div>
                </div>
            </div>
        </button>
    );
}

function BackpackSlot({ item, slotIndex }: { item: Item | null; slotIndex: number }) {
    function handleTap() {
        if (!item) return;
        const s = store.get();
        const newBackpack = [...s.backpack] as (Item | null)[];
        newBackpack[slotIndex] = null;
        store.patch({
            backpack: newBackpack,
            inventory: [...s.inventory, item],
        });
        RundotGameAPI.analytics.recordCustomEvent('backpack_item_unequipped', { itemId: item.id }).catch(() => {});
    }

    return (
        <button
            type="button"
            className="flex flex-col items-center justify-center rounded transition-transform active:scale-95"
            style={{
                background: item ? '#0b1a0d' : '#050d07',
                border: `1px solid ${item ? RARITY_COLORS[item.rarity] + '55' : '#1a2e1c'}`,
                minHeight: '60px',
                padding: '6px',
            }}
            onClick={handleTap}
            disabled={!item}
        >
            {item ? (
                <>
                    <div
                        className="truncate w-full text-center text-[0.7rem] font-bold leading-tight"
                        style={{ color: RARITY_COLORS[item.rarity] }}
                    >
                        {item.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className="mt-0.5 text-[0.85rem] font-bold text-white">{item.power}</div>
                </>
            ) : (
                <div className="text-[0.65rem]" style={{ color: '#2a3a2c' }}>EMPTY</div>
            )}
        </button>
    );
}

function ConsumablePanel({ item, onUse, onDiscard }: { item: Item; onUse: () => void; onDiscard: () => void }) {
    return (
        <div className="rounded p-3" style={{ background: '#0b1a0d', border: '1px solid #1a2e1c' }}>
            <div className="text-[0.85rem] font-bold text-white">{item.name}</div>
            <div className="mt-0.5 text-[0.75rem]" style={{ color: '#6b7a6c' }}>{item.description}</div>
            {item.energyRestore && (
                <div className="mt-1 text-[0.8rem]" style={{ color: '#4ade80' }}>+{item.energyRestore} ⚡ energy</div>
            )}
            {item.luckBonus && (
                <div className="mt-1 text-[0.8rem]" style={{ color: '#fb923c' }}>Next run: reduced ambush chance</div>
            )}
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    className="flex-1 rounded py-1.5 text-[0.85rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#050d07' }}
                    onClick={onUse}
                >
                    USE
                </button>
                <button
                    type="button"
                    className="rounded px-3 py-1.5 text-[0.85rem] transition-transform active:scale-95"
                    style={{ background: '#1a2e1c', color: '#6b7a6c' }}
                    onClick={onDiscard}
                >
                    DISCARD
                </button>
            </div>
        </div>
    );
}

export default function BackpackScreen() {
    const backpack = useStore(s => s.backpack);
    const inventory = useStore(s => s.inventory);
    const selectedId = useStore(s => s.selectedInventoryItemId);

    const wc = computeWeightClass(backpack);
    const combos = getActiveComboLabels(backpack);
    const equippedCount = backpack.filter(Boolean).length;
    const regularInventory = inventory.filter(i => i.type !== 'consumable');
    const consumables = inventory.filter(i => i.type === 'consumable');

    function handleInventoryTap(item: Item) {
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
        store.patch({
            backpack: newBackpack,
            inventory: s.inventory.filter(i => i !== item),
            selectedInventoryItemId: null,
        });
        RundotGameAPI.analytics.recordCustomEvent('backpack_item_equipped', { itemId: item.id, rarity: item.rarity }).catch(() => {});
    }

    function handleConsumableUse(item: Item) {
        const s = store.get();
        let updates: Parameters<typeof store.patch>[0] = {
            inventory: s.inventory.filter(i => i !== item),
            selectedInventoryItemId: null,
        };
        if (item.energyRestore) {
            updates = { ...updates, energy: Math.min(s.energy + item.energyRestore, s.maxEnergy) };
            RundotGameAPI.analytics.recordCustomEvent('consumable_used', { itemId: item.id, type: 'energy' }).catch(() => {});
        }
        if (item.luckBonus) {
            updates = { ...updates, luckBonusActive: true };
            RundotGameAPI.analytics.recordCustomEvent('consumable_used', { itemId: item.id, type: 'luck' }).catch(() => {});
        }
        store.patch(updates);
    }

    function handleConsumableDiscard(item: Item) {
        const s = store.get();
        store.patch({
            inventory: s.inventory.filter(i => i !== item),
            selectedInventoryItemId: null,
        });
    }

    const selectedConsumable = selectedId
        ? consumables.find(i => i.id === selectedId)
        : undefined;

    return (
        <div className="flex h-full flex-col" style={{ background: '#050d07' }}>
            {/* Header: weight class */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #0b1a0d' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">LOADOUT</div>
                    <div className="text-right">
                        <div className="text-[1.3rem] font-bold text-white">WC {wc}</div>
                        <div className="text-[0.7rem]" style={{ color: '#4a5a4c' }}>
                            {equippedCount}/{BACKPACK_SLOTS} SLOTS
                        </div>
                    </div>
                </div>
                {combos.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {combos.map(c => (
                            <span key={c} className="rounded px-2 py-0.5 text-[0.7rem] font-bold" style={{ background: '#0b2a0d', color: '#4ade80' }}>
                                {c}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="scroll-area flex-1 px-3 pt-3 pb-2 space-y-4">
                {/* Backpack grid */}
                <div>
                    <div className="mb-1.5 text-[0.7rem] font-bold tracking-widest" style={{ color: '#3a4a3c' }}>EQUIPPED</div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {Array.from({ length: BACKPACK_SLOTS }, (_, i) => (
                            <BackpackSlot key={i} item={backpack[i] ?? null} slotIndex={i} />
                        ))}
                    </div>
                    <p className="mt-1 text-[0.7rem]" style={{ color: '#2a3a2c' }}>
                        Tap equipped item to unequip
                    </p>
                </div>

                {/* Consumable in use */}
                {selectedConsumable && (
                    <ConsumablePanel
                        item={selectedConsumable}
                        onUse={() => handleConsumableUse(selectedConsumable)}
                        onDiscard={() => handleConsumableDiscard(selectedConsumable)}
                    />
                )}

                {/* Consumables */}
                {consumables.length > 0 && (
                    <div>
                        <div className="mb-1.5 text-[0.7rem] font-bold tracking-widest" style={{ color: '#3a4a3c' }}>CONSUMABLES</div>
                        <div className="space-y-1.5">
                            {consumables.map(item => (
                                <ItemCard
                                    key={item.id + item.name}
                                    item={item}
                                    onClick={() => handleInventoryTap(item)}
                                    selected={selectedId === item.id}
                                    compact
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Regular inventory */}
                <div>
                    <div className="mb-1.5 text-[0.7rem] font-bold tracking-widest" style={{ color: '#3a4a3c' }}>
                        LOOSE INVENTORY ({regularInventory.length})
                    </div>
                    {regularInventory.length === 0 ? (
                        <p className="text-[0.85rem]" style={{ color: '#2a3a2c' }}>Nothing loose. Scavenge for gear.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {regularInventory.map(item => (
                                <ItemCard
                                    key={item.id + item.name}
                                    item={item}
                                    onClick={() => handleInventoryTap(item)}
                                    selected={selectedId === item.id}
                                />
                            ))}
                        </div>
                    )}
                    {equippedCount >= BACKPACK_SLOTS && regularInventory.length > 0 && (
                        <p className="mt-1 text-[0.75rem]" style={{ color: '#f97316' }}>
                            Backpack full. Unequip something first.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
