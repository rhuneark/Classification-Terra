import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { ALL_LOCATIONS } from '../game/locations.ts';
import { rollLootEvent, eventToLogEntry } from '../game/loot.ts';
import type { LootEvent, Location } from '../game/types.ts';
import { DANGER_COLORS, DANGER_LABELS, RARITY_COLORS, RARITY_LABELS, randomResearchDuration } from '../game/types.ts';
import { updateSave, getSave, markUniqueFound, addEarnedScrip } from '../state/save.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

let _instanceCounter = Date.now();
function newInstanceId() { return String(++_instanceCounter); }

function EnergyBar({ energy, max }: { energy: number; max: number }) {
    const pct = max > 0 ? (energy / max) * 100 : 0;
    const barColor = energy >= max * 0.6 ? '#4ade80' : energy >= max * 0.3 ? '#facc15' : '#f97316';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#142816', maxWidth: '80px' }}>
                <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <span className="text-[0.85rem] font-bold tabular-nums" style={{ color: barColor }}>
                {energy}<span style={{ color: '#4a6a4c' }}>/{max}</span> ⚡
            </span>
        </div>
    );
}

function LocationCard({ location, onTap }: { location: Location; onTap: () => void }) {
    const energy = useStore(s => s.energy);
    const canAfford = energy >= location.energyCost;
    return (
        <button
            type="button"
            className="w-full rounded p-4 text-left transition-transform active:scale-[0.98]"
            style={{ background: '#0e2010', border: `1px solid ${canAfford ? '#243e26' : '#1a2010'}`, opacity: canAfford ? 1 : 0.5 }}
            onClick={onTap}
            disabled={!canAfford}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[1rem] font-bold text-white">{location.name}</div>
                    <div className="mt-0.5 text-[0.82rem] leading-snug" style={{ color: '#bcd4bd' }}>
                        {location.description}
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[0.8rem] font-bold" style={{ color: '#4ade80' }}>{location.energyCost} ⚡</div>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide"
                    style={{ color: DANGER_COLORS[location.danger], background: DANGER_COLORS[location.danger] + '22' }}>
                    {DANGER_LABELS[location.danger]}
                </span>
                <span className="text-[0.72rem]" style={{ color: '#8aaa8c' }}>
                    AMBUSH {Math.round(location.ambushChance * 100)}%
                </span>
                <span className="text-[0.72rem]" style={{ color: '#8aaa8c' }}>
                    {RARITY_LABELS[location.minRarity]}–{RARITY_LABELS[location.maxRarity]}
                </span>
            </div>
        </button>
    );
}

function LootEventModal({ event, onTake, onScrap, onDismiss }: {
    event: LootEvent;
    onTake: () => void;
    onScrap: () => void;
    onDismiss: () => void;
}) {
    const [confirmScrap, setConfirmScrap] = useState(false);

    if (event.type === 'loot' && event.foundItem) {
        const item = event.foundItem;
        const isUnique = item.rarity === 'unique';

        return (
            <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 40 }}>
                <div className="w-full max-w-sm rounded p-5" style={{ background: '#0e2010', border: '1px solid #243e26', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#4ade80' }}>
                        ITEM FOUND — {event.locationName}
                    </div>

                    <div className="mt-3 rounded p-3" style={{ background: '#070e08', border: `1px solid ${RARITY_COLORS[item.rarity]}44` }}>
                        <div className="text-[1.15rem] font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>
                            {item.name}
                        </div>
                        <div className="text-[0.7rem] font-bold tracking-wide" style={{ color: RARITY_COLORS[item.rarity] + 'aa' }}>
                            {RARITY_LABELS[item.rarity]}
                        </div>
                        <div className="mt-1 text-[0.86rem] leading-snug" style={{ color: '#bcd4bd' }}>
                            {item.description}
                        </div>
                        {item.power > 0 && (
                            <div className="mt-1.5 text-[0.85rem] font-bold text-white">PWR {item.power}</div>
                        )}
                        {item.special.length > 0 && (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                                {item.special.map(s => (
                                    <span key={s} className="rounded px-1 text-[0.65rem]" style={{ background: '#1a3e1c', color: '#5ade70' }}>
                                        {s.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {isUnique && (
                        <div className="mt-2 rounded p-2 text-center text-[0.8rem]" style={{ background: '#160820', border: `1px solid ${RARITY_COLORS.unique}44` }}>
                            <span style={{ color: RARITY_COLORS.unique }}>ONE-OF-A-KIND</span>
                            <span style={{ color: '#c8e0ca' }}> — Only one in the world.</span>
                        </div>
                    )}

                    <div className="mt-2 text-[0.82rem] italic" style={{ color: '#6a8e6c' }}>{event.flavorText}</div>

                    {/* Secondary items */}
                    {event.secondaryItems.length > 0 && (
                        <div className="mt-3 rounded p-2.5" style={{ background: '#070e08', border: '1px solid #1a3e1c' }}>
                            <div className="mb-1.5 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>ALSO FOUND — QUEUED FOR RESEARCH</div>
                            {event.secondaryItems.map((si, i) => (
                                <div key={i} className="flex items-center justify-between py-0.5">
                                    <span className="text-[0.82rem]" style={{ color: RARITY_COLORS[si.rarity] }}>
                                        {si.name}
                                    </span>
                                    <span className="text-[0.7rem]" style={{ color: '#4a6a4c' }}>
                                        {RARITY_LABELS[si.rarity]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {confirmScrap && isUnique ? (
                        <div className="mt-4 rounded p-3" style={{ background: '#160820', border: `1px solid ${RARITY_COLORS.unique}66` }}>
                            <p className="text-[0.85rem] text-center" style={{ color: RARITY_COLORS.unique }}>
                                Scrap the {item.name} for 1 scrip?
                                <br /><span style={{ color: '#8aaa8c' }}>This cannot be undone.</span>
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button type="button" className="flex-1 rounded py-2 text-[0.85rem] font-bold transition-transform active:scale-95"
                                    style={{ background: '#f43f5e22', color: '#f43f5e', border: '1px solid #f43f5e66' }}
                                    onClick={onScrap}>
                                    SCRAP IT
                                </button>
                                <button type="button" className="flex-1 rounded py-2 text-[0.85rem] font-bold transition-transform active:scale-95"
                                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                                    onClick={() => setConfirmScrap(false)}>
                                    KEEP
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex gap-2">
                            <button type="button" className="flex-1 rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                                style={{ background: '#7ccf5a', color: '#070e08' }}
                                onClick={onTake}>
                                TAKE IT
                            </button>
                            <button type="button" className="rounded px-4 py-3 text-[0.82rem] transition-transform active:scale-95"
                                style={{ background: '#1a2010', color: '#6a8e6c', border: '1px solid #1a3e1c' }}
                                onClick={isUnique ? () => setConfirmScrap(true) : onScrap}>
                                SCRAP +1
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Ambush modal
    return (
        <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 40 }}>
            <div className="w-full max-w-sm rounded p-5" style={{ background: '#0e2010', border: '1px solid #243e26' }}>
                <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#f97316' }}>
                    AMBUSH — {event.locationName}
                </div>
                <div className="mt-3 text-[0.92rem] leading-relaxed" style={{ color: '#bcd4bd' }}>
                    {event.flavorText}
                </div>
                {event.lostItem && (
                    <div className="mt-3 rounded p-3" style={{ background: '#1a0a00', border: '1px solid #4a1500' }}>
                        <div className="text-[0.72rem] font-bold" style={{ color: '#f97316' }}>LOST</div>
                        <div className="mt-0.5 text-[1rem] font-bold text-white">{event.lostItem.name}</div>
                        <div className="text-[0.75rem]" style={{ color: '#a07060' }}>{event.lostItem.description}</div>
                    </div>
                )}
                {event.energyLost != null && (
                    <div className="mt-3 rounded p-3" style={{ background: '#1a0a00', border: '1px solid #4a1500' }}>
                        <div className="text-[0.72rem] font-bold" style={{ color: '#f97316' }}>LOST</div>
                        <div className="mt-0.5 text-[1rem] font-bold text-white">{event.energyLost} ⚡ energy</div>
                    </div>
                )}
                <button type="button" className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#1f3822', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                    onClick={onDismiss}>
                    CONTINUE
                </button>
            </div>
        </div>
    );
}

export default function LootScreen() {
    const energy = useStore(s => s.energy);
    const maxEnergy = useStore(s => s.maxEnergy);
    const eventLog = useStore(s => s.eventLog);
    const activeLootEvent = useStore(s => s.activeLootEvent);
    const luckBonusActive = useStore(s => s.luckBonusActive);

    function handleLocationTap(location: Location) {
        const s = store.get();
        if (s.energy < location.energyCost) return;
        const event = rollLootEvent(location, s.inventory, s.energy, s.luckBonusActive);
        const newEnergy = s.energy - location.energyCost;
        store.patch({ energy: newEnergy, activeLootEvent: event, luckBonusActive: false });
        const save = getSave();
        updateSave({ energy: newEnergy, totalScavenges: (save.totalScavenges ?? 0) + 1 });
        RundotGameAPI.analytics.recordCustomEvent('loot_location_visited', { location: location.id, eventType: event.type }).catch(() => {});
    }

    function handleTake() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event || event.type !== 'loot' || !event.foundItem) return;

        const item = event.foundItem;
        // Mark unique as found
        if (item.rarity === 'unique') {
            markUniqueFound(item.id);
            store.patch({ foundUniqueIds: [...s.foundUniqueIds.filter(id => id !== item.id), item.id] });
        }

        // Queue secondary items
        let newQueue = s.researchQueue;
        if (event.secondaryItems.length > 0) {
            const secondaryQueueItems = event.secondaryItems.map(si => ({
                instanceId: newInstanceId(),
                item: si,
                startedAt: Date.now(),
                durationMs: randomResearchDuration(si.rarity),
            }));
            newQueue = [...s.researchQueue, ...secondaryQueueItems];
        }

        // Consumables go directly to inventory, others to research queue
        let newInventory = s.inventory;
        let finalQueue = newQueue;
        if (item.type === 'consumable') {
            newInventory = [...s.inventory, item];
        } else {
            finalQueue = [...newQueue, {
                instanceId: newInstanceId(),
                item,
                startedAt: Date.now(),
                durationMs: randomResearchDuration(item.rarity),
            }];
        }

        const logEntry = eventToLogEntry(event);
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        store.patch({ inventory: newInventory, researchQueue: finalQueue, eventLog: newLog, activeLootEvent: null });
        updateSave({ inventory: newInventory, researchQueue: finalQueue, eventLog: newLog });
        RundotGameAPI.analytics.recordCustomEvent('loot_item_found', { itemId: item.id, rarity: item.rarity, isUnique: item.rarity === 'unique' }).catch(() => {});
    }

    function handleScrap() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event || event.type !== 'loot' || !event.foundItem) return;

        // Queue secondary items still
        let newQueue = s.researchQueue;
        if (event.secondaryItems.length > 0) {
            const secondaryQueueItems = event.secondaryItems.map(si => ({
                instanceId: newInstanceId(),
                item: si,
                startedAt: Date.now(),
                durationMs: randomResearchDuration(si.rarity),
            }));
            newQueue = [...s.researchQueue, ...secondaryQueueItems];
        }

        const newCurrency = s.currency + 1;
        const logEntry = eventToLogEntry(event);
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        store.patch({ currency: newCurrency, researchQueue: newQueue, eventLog: newLog, activeLootEvent: null });
        addEarnedScrip(1);
        updateSave({ currency: newCurrency, researchQueue: newQueue, eventLog: newLog });
        RundotGameAPI.analytics.recordCustomEvent('loot_item_scrapped', { itemId: event.foundItem.id, rarity: event.foundItem.rarity }).catch(() => {});
    }

    function handleAmbushDismiss() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event || event.type !== 'ambush') return;
        const logEntry = eventToLogEntry(event);
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        let newInventory = s.inventory;
        let newEnergy = s.energy;
        if (event.lostItem) newInventory = s.inventory.filter(i => i !== event.lostItem);
        if (event.energyLost) newEnergy = Math.max(0, s.energy - event.energyLost);
        store.patch({ inventory: newInventory, energy: newEnergy, eventLog: newLog, activeLootEvent: null });
        const save = getSave();
        updateSave({ inventory: newInventory, energy: newEnergy, eventLog: newLog, totalAmbushes: (save.totalAmbushes ?? 0) + 1 });
        RundotGameAPI.analytics.recordCustomEvent('loot_ambush_triggered', { locationName: event.locationName }).catch(() => {});
    }

    const recentLog = eventLog.slice(0, 8);

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#070e08' }}>
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">RUINS</div>
                    <EnergyBar energy={energy} max={maxEnergy} />
                </div>
                <p className="mt-0.5 text-[0.72rem]" style={{ color: '#6a8e6c' }}>
                    Tap a location to scavenge.
                    {luckBonusActive && <span style={{ color: '#fb923c' }}> LUCK ACTIVE.</span>}
                </p>
            </div>

            <div className="scroll-area flex-1 space-y-2 p-3 pb-2">
                {ALL_LOCATIONS.map(loc => (
                    <LocationCard key={loc.id} location={loc} onTap={() => handleLocationTap(loc)} />
                ))}
            </div>

            {recentLog.length > 0 && (
                <div className="shrink-0 px-3 pt-2 pb-1" style={{ borderTop: '1px solid #142816' }}>
                    <div className="mb-1 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>RECENT LOG</div>
                    {recentLog.map(entry => (
                        <div key={entry.id} className="py-0.5 text-[0.78rem] leading-snug" style={{ color: '#8aaa8c' }}>
                            {entry.rarity ? (
                                <span style={{ color: RARITY_COLORS[entry.rarity] }}>[{entry.rarity.toUpperCase().slice(0,3)}] </span>
                            ) : entry.type === 'ambush' ? <span style={{ color: '#f97316' }}>[AMB] </span>
                            : entry.type === 'battle-win' ? <span style={{ color: '#4ade80' }}>[WIN] </span>
                            : entry.type === 'battle-loss' ? <span style={{ color: '#f43f5e' }}>[LOSS] </span>
                            : null}
                            {entry.message.length > 80 ? entry.message.slice(0, 80) + '…' : entry.message}
                        </div>
                    ))}
                </div>
            )}

            {activeLootEvent && (
                <LootEventModal
                    event={activeLootEvent}
                    onTake={handleTake}
                    onScrap={handleScrap}
                    onDismiss={handleAmbushDismiss}
                />
            )}
        </div>
    );
}
