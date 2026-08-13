import { useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { generateTraderInventory } from '../game/items.ts';
import { RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import type { Item } from '../game/types.ts';
import { makeLogId } from '../game/loot.ts';
import { updateSave, getSave } from '../state/save.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

function ForSaleCard({ item, canAfford, onBuy }: { item: Item; canAfford: boolean; onBuy: () => void }) {
    const color = RARITY_COLORS[item.rarity];
    return (
        <div
            className="rounded p-3"
            style={{ background: '#0b1a0d', border: `1px solid #1a2e1c`, opacity: canAfford ? 1 : 0.5 }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.95rem] font-bold" style={{ color }}>
                        {item.name}
                    </div>
                    <div className="text-[0.65rem] font-bold tracking-wide" style={{ color: color + '99' }}>
                        {RARITY_LABELS[item.rarity]}
                        {item.type === 'consumable' && ' · CONSUMABLE'}
                    </div>
                    <div className="mt-0.5 text-[0.78rem] leading-snug" style={{ color: '#6b7a6c' }}>
                        {item.description}
                    </div>
                    {item.energyRestore && (
                        <div className="mt-0.5 text-[0.75rem]" style={{ color: '#4ade80' }}>+{item.energyRestore} ⚡</div>
                    )}
                    {item.luckBonus && (
                        <div className="mt-0.5 text-[0.75rem]" style={{ color: '#fb923c' }}>Next run luck bonus</div>
                    )}
                    {item.power > 0 && (
                        <div className="mt-0.5 text-[0.78rem]" style={{ color: '#4a5a4c' }}>PWR {item.power}</div>
                    )}
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[0.9rem] font-bold" style={{ color: '#fb923c' }}>
                        {item.buyValue ?? item.sellValue * 2}
                    </div>
                    <div className="text-[0.65rem]" style={{ color: '#4a5a4c' }}>SCRIP</div>
                    <button
                        type="button"
                        className="mt-1 rounded px-3 py-1 text-[0.8rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{
                            background: canAfford ? '#7ccf5a' : '#1a2e1c',
                            color: canAfford ? '#050d07' : '#4a5a4c',
                        }}
                        onClick={onBuy}
                        disabled={!canAfford}
                    >
                        BUY
                    </button>
                </div>
            </div>
        </div>
    );
}

function InventorySellCard({ item, onSell }: { item: Item; onSell: () => void }) {
    const color = RARITY_COLORS[item.rarity];
    return (
        <div
            className="flex items-center justify-between rounded p-2.5 gap-2"
            style={{ background: '#0b1a0d', border: '1px solid #1a2e1c' }}
        >
            <div className="min-w-0 flex-1">
                <div className="truncate text-[0.9rem] font-bold" style={{ color }}>{item.name}</div>
                <div className="text-[0.65rem]" style={{ color: '#4a5a4c' }}>
                    {RARITY_LABELS[item.rarity]} · PWR {item.power}
                </div>
            </div>
            <button
                type="button"
                className="shrink-0 rounded px-3 py-1.5 text-[0.8rem] font-bold transition-transform active:scale-95"
                style={{ background: '#1a2e1c', color: '#fb923c', border: '1px solid #2a3e1c' }}
                onClick={onSell}
            >
                +{item.sellValue}
            </button>
        </div>
    );
}

export default function TraderScreen() {
    const currency = useStore(s => s.currency);
    const inventory = useStore(s => s.inventory);
    const traderInventory = useStore(s => s.traderInventory);

    useEffect(() => {
        if (store.get().traderInventory.length === 0) {
            store.patch({ traderInventory: generateTraderInventory() });
        }
    }, []);

    function handleBuy(item: Item) {
        const price = item.buyValue ?? item.sellValue * 2;
        const s = store.get();
        if (s.currency < price) return;

        const newCurrency = s.currency - price;
        const newInventory = [...s.inventory, { ...item, buyValue: undefined }];
        const newTrader = s.traderInventory.filter(i => i !== item);

        const logEntry = {
            id: makeLogId(),
            type: 'trade' as const,
            message: `[OUTPOST] Bought: ${item.name} for ${price} scrip.`,
            rarity: item.rarity,
            timestamp: Date.now(),
        };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);

        store.patch({
            currency: newCurrency,
            inventory: newInventory,
            traderInventory: newTrader,
            eventLog: newLog,
        });
        updateSave({ currency: newCurrency, inventory: newInventory, eventLog: newLog });

        RundotGameAPI.analytics.recordCustomEvent('trader_item_purchased', {
            itemId: item.id,
            price,
            rarity: item.rarity,
        }).catch(() => {});
    }

    function handleSell(item: Item) {
        const s = store.get();
        const newCurrency = s.currency + item.sellValue;
        const newInventory = s.inventory.filter(i => i !== item);

        const logEntry = {
            id: makeLogId(),
            type: 'trade' as const,
            message: `[OUTPOST] Sold: ${item.name} for ${item.sellValue} scrip.`,
            rarity: item.rarity,
            timestamp: Date.now(),
        };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);

        store.patch({ currency: newCurrency, inventory: newInventory, eventLog: newLog });

        const save = getSave();
        updateSave({ currency: newCurrency, inventory: newInventory, eventLog: newLog, totalBattles: save.totalBattles });

        RundotGameAPI.analytics.recordCustomEvent('trader_item_sold', {
            itemId: item.id,
            sellValue: item.sellValue,
            rarity: item.rarity,
        }).catch(() => {});
    }

    function handleRefresh() {
        store.patch({ traderInventory: generateTraderInventory() });
        RundotGameAPI.analytics.recordCustomEvent('trader_inventory_refreshed').catch(() => {});
    }

    const sellableInventory = inventory.filter(i => i.type !== 'consumable');

    return (
        <div className="flex h-full flex-col" style={{ background: '#050d07' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #0b1a0d' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">OUTPOST</div>
                    <div className="flex items-center gap-3">
                        <div className="text-[1rem] font-bold" style={{ color: '#fb923c' }}>
                            {currency} SCRIP
                        </div>
                    </div>
                </div>
                <p className="text-[0.75rem]" style={{ color: '#4a5a4c' }}>
                    "No refunds. No exceptions. No surviving to complain."
                </p>
            </div>

            <div className="scroll-area flex-1 px-3 pt-3 pb-2 space-y-4">
                {/* For sale */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-[0.7rem] font-bold tracking-widest" style={{ color: '#3a4a3c' }}>FOR SALE</div>
                        <button
                            type="button"
                            className="rounded px-2 py-0.5 text-[0.7rem] transition-transform active:scale-95"
                            style={{ background: '#1a2e1c', color: '#6b7a6c' }}
                            onClick={handleRefresh}
                        >
                            REFRESH STOCK
                        </button>
                    </div>
                    {traderInventory.length === 0 ? (
                        <p className="text-[0.85rem]" style={{ color: '#2a3a2c' }}>Out of stock.</p>
                    ) : (
                        <div className="space-y-2">
                            {traderInventory.map((item, i) => (
                                <ForSaleCard
                                    key={item.id + i}
                                    item={item}
                                    canAfford={currency >= (item.buyValue ?? item.sellValue * 2)}
                                    onBuy={() => handleBuy(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sell */}
                <div>
                    <div className="mb-1.5 text-[0.7rem] font-bold tracking-widest" style={{ color: '#3a4a3c' }}>
                        YOUR INVENTORY (sell price)
                    </div>
                    {sellableInventory.length === 0 ? (
                        <p className="text-[0.85rem]" style={{ color: '#2a3a2c' }}>Nothing to sell. Go scavenge.</p>
                    ) : (
                        <div className="space-y-1.5">
                            {sellableInventory.map((item, i) => (
                                <InventorySellCard key={item.id + i} item={item} onSell={() => handleSell(item)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
