import { useEffect, useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { generateTraderInventory, CONSUMABLES } from '../game/items.ts';
import { RARITY_COLORS, RARITY_LABELS, TRADER_REFRESH_MS } from '../game/types.ts';
import type { Item } from '../game/types.ts';
import { makeLogId } from '../game/loot.ts';
import { updateSave, getSave } from '../state/save.ts';
import { playBuy } from '../game/audio.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

// Always-available staple items
const STAPLE_ITEMS: Item[] = [
    CONSUMABLES.find(c => c.id === 'regen-pot-small')!,
    CONSUMABLES.find(c => c.id === 'magnifier-small')!,
].filter(Boolean);

function ItemCard({
    item,
    canAfford,
    purchased,
    onBuy,
}: {
    item: Item;
    canAfford: boolean;
    purchased: boolean;
    onBuy: () => void;
}) {
    const color = RARITY_COLORS[item.rarity];
    const price = item.buyValue ?? item.sellValue * 2;
    const disabled = !canAfford || purchased;

    return (
        <div className="rounded p-3" style={{
            background: '#0e2010',
            border: `1px solid ${purchased ? '#1a2814' : '#243e26'}`,
            opacity: purchased ? 0.48 : 1,
        }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.95rem] font-bold" style={{ color: purchased ? '#4a6a4c' : color }}>
                        {item.name}
                    </div>
                    <div className="text-[0.68rem] font-bold tracking-wide" style={{ color: (purchased ? '#3a5a3c' : color) + 'bb' }}>
                        {RARITY_LABELS[item.rarity]}{item.type === 'consumable' ? ' · CONSUMABLE' : ''}
                    </div>
                    <div className="mt-0.5 text-[0.87rem] leading-snug" style={{ color: '#bcd4bd' }}>
                        {item.description}
                    </div>
                    {item.energyRestore != null && (
                        <div className="mt-0.5 text-[0.8rem] font-bold" style={{ color: '#4ade80' }}>+{item.energyRestore} energy</div>
                    )}
                    {item.researchBoostMs != null && (
                        <div className="mt-0.5 text-[0.8rem] font-bold" style={{ color: '#60a5fa' }}>
                            -{Math.round(item.researchBoostMs / 60_000)}min research
                        </div>
                    )}
                    {item.energyBoostDuration != null && (
                        <div className="mt-0.5 text-[0.8rem] font-bold" style={{ color: '#fb923c' }}>
                            1 energy/min for {item.energyBoostDuration / 60_000}min
                        </div>
                    )}
                    {item.power > 0 && (
                        <div className="mt-0.5 text-[0.8rem]" style={{ color: '#7aaa7c' }}>PWR {item.power}</div>
                    )}
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[1rem] font-bold" style={{ color: purchased ? '#4a5a4a' : '#fb923c' }}>{price}</div>
                    <div className="text-[0.65rem]" style={{ color: '#6a8e6c' }}>SCRIP</div>
                    <button
                        type="button"
                        className="mt-1 rounded px-3 py-1 text-[0.82rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{
                            background: purchased ? '#0e1a0e' : canAfford ? '#7ccf5a' : '#1a2e1c',
                            color: purchased ? '#3a5a3a' : canAfford ? '#070e08' : '#4a6a4c',
                            border: purchased ? '1px solid #1e2e1e' : 'none',
                            cursor: disabled ? 'default' : 'pointer',
                        }}
                        onClick={onBuy}
                        disabled={disabled}
                    >
                        {purchased ? 'SOLD' : 'BUY'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function InventorySellCard({ item, onSell }: { item: Item; onSell: () => void }) {
    const color = RARITY_COLORS[item.rarity];
    return (
        <div className="flex items-center justify-between rounded p-3 gap-3"
            style={{ background: '#0e2010', border: '1px solid #243e26' }}>
            <div className="min-w-0 flex-1">
                <div className="truncate text-[0.9rem] font-bold" style={{ color }}>{item.name}</div>
                <div className="mt-0.5 text-[0.82rem] leading-snug" style={{ color: '#bcd4bd' }}>
                    {item.description}
                </div>
                <div className="mt-0.5 text-[0.68rem]" style={{ color: '#7aaa7c' }}>
                    {RARITY_LABELS[item.rarity]} · PWR {item.power}
                </div>
            </div>
            <button
                type="button"
                className="shrink-0 rounded px-3 py-2 text-[0.88rem] font-bold transition-transform active:scale-95"
                style={{ background: '#1f3e22', color: '#fb923c', border: '1px solid #2a5e2c' }}
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
    const traderLastRefresh = useStore(s => s.traderLastRefresh);
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [countdown, setCountdown] = useState('');
    const [purchasedIndices, setPurchasedIndices] = useState<Set<number>>(new Set());

    // Reset purchased indices when the inventory refreshes
    useEffect(() => {
        setPurchasedIndices(new Set());
    }, [traderLastRefresh]);

    useEffect(() => {
        function checkAndRefresh() {
            const s = store.get();
            const elapsed = Date.now() - s.traderLastRefresh;
            if (elapsed >= TRADER_REFRESH_MS || s.traderInventory.length === 0) {
                const now = Date.now();
                store.patch({ traderInventory: generateTraderInventory(), traderLastRefresh: now });
                return now;
            }
            return s.traderLastRefresh;
        }

        function updateCountdown(lastRefresh: number) {
            const remaining = Math.max(0, TRADER_REFRESH_MS - (Date.now() - lastRefresh));
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
        }

        let lastRefresh = checkAndRefresh();
        updateCountdown(lastRefresh);

        const interval = setInterval(() => {
            lastRefresh = checkAndRefresh();
            updateCountdown(lastRefresh);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    function handleBuyStaple(item: Item) {
        const price = item.buyValue ?? item.sellValue * 2;
        const s = store.get();
        if (s.currency < price) return;
        playBuy();
        const newCurrency = s.currency - price;
        const newInventory = [...s.inventory, { ...item, buyValue: undefined }];
        const logEntry = { id: makeLogId(), type: 'trade' as const, message: `[OUTPOST] Bought: ${item.name} for ${price} scrip.`, rarity: item.rarity, timestamp: Date.now() };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        store.patch({ currency: newCurrency, inventory: newInventory, eventLog: newLog });
        updateSave({ currency: newCurrency, inventory: newInventory, eventLog: newLog });
        RundotGameAPI.analytics.recordCustomEvent('trader_item_purchased', { itemId: item.id, price, rarity: item.rarity }).catch(() => {});
    }

    function handleBuyFlex(item: Item, flexIndex: number) {
        const price = item.buyValue ?? item.sellValue * 2;
        const s = store.get();
        if (s.currency < price) return;
        playBuy();
        const newCurrency = s.currency - price;
        const newInventory = [...s.inventory, { ...item, buyValue: undefined }];
        const logEntry = { id: makeLogId(), type: 'trade' as const, message: `[OUTPOST] Bought: ${item.name} for ${price} scrip.`, rarity: item.rarity, timestamp: Date.now() };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        store.patch({ currency: newCurrency, inventory: newInventory, eventLog: newLog });
        updateSave({ currency: newCurrency, inventory: newInventory, eventLog: newLog });
        setPurchasedIndices(prev => new Set([...prev, flexIndex]));
        RundotGameAPI.analytics.recordCustomEvent('trader_item_purchased', { itemId: item.id, price, rarity: item.rarity }).catch(() => {});
    }

    function handleSell(item: Item) {
        const s = store.get();
        const newCurrency = s.currency + item.sellValue;
        const newInventory = s.inventory.filter(i => i !== item);
        const logEntry = { id: makeLogId(), type: 'trade' as const, message: `[OUTPOST] Sold: ${item.name} for ${item.sellValue} scrip.`, rarity: item.rarity, timestamp: Date.now() };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        store.patch({ currency: newCurrency, inventory: newInventory, eventLog: newLog });
        const save = getSave();
        updateSave({ currency: newCurrency, inventory: newInventory, eventLog: newLog, totalBattles: save.totalBattles });
        RundotGameAPI.analytics.recordCustomEvent('trader_item_sold', { itemId: item.id, sellValue: item.sellValue, rarity: item.rarity }).catch(() => {});
    }

    return (
        <div className="flex h-full flex-col" style={{ background: '#070e08' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">OUTPOST</div>
                    <div className="flex items-center gap-3">
                        <div className="text-[1rem] font-bold" style={{ color: '#fb923c' }}>
                            {currency} <span className="text-[0.78rem] font-normal" style={{ color: '#7aaa7c' }}>SCRIP</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[0.75rem]" style={{ color: '#7aaa7c' }}>"No refunds. No exceptions."</p>
                    <p className="text-[0.75rem]" style={{ color: '#5a7e5c' }}>Restocks in {countdown}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex" style={{ borderBottom: '1px solid #142816' }}>
                {(['buy', 'sell'] as const).map(tab => (
                    <button key={tab} type="button"
                        className="flex-1 py-2.5 text-[0.82rem] font-bold tracking-widest transition-colors"
                        style={{
                            color: activeTab === tab ? '#7ccf5a' : '#6a9e6c',
                            borderBottom: activeTab === tab ? '2px solid #7ccf5a' : '2px solid transparent',
                        }}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'buy' ? 'FOR SALE' : `SELL GEAR (${inventory.length})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="scroll-area flex-1 p-3 space-y-3">
                {activeTab === 'buy' && (
                    <>
                        {/* Always-available staples */}
                        <div>
                            <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#5a7e5c' }}>
                                ALWAYS IN STOCK
                            </div>
                            <div className="space-y-2">
                                {STAPLE_ITEMS.map(item => (
                                    <ItemCard
                                        key={item.id}
                                        item={item}
                                        canAfford={currency >= (item.buyValue ?? item.sellValue * 2)}
                                        purchased={false}
                                        onBuy={() => handleBuyStaple(item)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Rotating flex stock */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <div className="text-[0.68rem] font-bold tracking-widest" style={{ color: '#5a7e5c' }}>
                                    ROTATING STOCK
                                </div>
                                <div className="text-[0.68rem]" style={{ color: '#4a6a4c' }}>restocks {countdown}</div>
                            </div>
                            <div className="space-y-2">
                                {traderInventory.length === 0
                                    ? <p className="text-[0.9rem]" style={{ color: '#4a6a4c' }}>Out of stock. Check back soon.</p>
                                    : traderInventory.map((item, i) => (
                                        <ItemCard
                                            key={item.id + i}
                                            item={item}
                                            canAfford={currency >= (item.buyValue ?? item.sellValue * 2)}
                                            purchased={purchasedIndices.has(i)}
                                            onBuy={() => handleBuyFlex(item, i)}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    </>
                )}
                {activeTab === 'sell' && (
                    inventory.length === 0
                        ? <p className="text-[0.9rem]" style={{ color: '#4a6a4c' }}>Nothing to sell. Scavenge first.</p>
                        : inventory.map((item, i) => (
                            <InventorySellCard key={item.id + i} item={item} onSell={() => handleSell(item)} />
                        ))
                )}
            </div>
        </div>
    );
}
