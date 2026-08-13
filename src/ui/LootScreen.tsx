import { store, useStore } from '../state/store.ts';
import { ALL_LOCATIONS } from '../game/locations.ts';
import { rollLootEvent, eventToLogEntry } from '../game/loot.ts';
import type { LootEvent, Location } from '../game/types.ts';
import { DANGER_COLORS, DANGER_LABELS, RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

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

function DangerBadge({ danger }: { danger: Location['danger'] }) {
    return (
        <span
            className="rounded px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide"
            style={{ color: DANGER_COLORS[danger], background: DANGER_COLORS[danger] + '22' }}
        >
            {DANGER_LABELS[danger]}
        </span>
    );
}

function LocationCard({ location, onTap }: { location: Location; onTap: () => void }) {
    const energy = useStore(s => s.energy);
    const canAfford = energy >= location.energyCost;

    return (
        <button
            type="button"
            className="w-full rounded p-4 text-left transition-transform active:scale-[0.98]"
            style={{
                background: '#0e2010',
                border: `1px solid ${canAfford ? '#243e26' : '#1a2010'}`,
                opacity: canAfford ? 1 : 0.5,
            }}
            onClick={onTap}
            disabled={!canAfford}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[1rem] font-bold text-white">{location.name}</div>
                    <div className="mt-0.5 text-[0.82rem] leading-snug" style={{ color: '#a0c0a2' }}>
                        {location.description}
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[0.8rem] font-bold" style={{ color: '#4ade80' }}>
                        {location.energyCost} ⚡
                    </div>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <DangerBadge danger={location.danger} />
                <span className="text-[0.72rem]" style={{ color: '#6a8e6c' }}>
                    AMBUSH {Math.round(location.ambushChance * 100)}%
                </span>
                <span className="text-[0.72rem]" style={{ color: '#6a8e6c' }}>
                    {RARITY_LABELS[location.minRarity]}–{RARITY_LABELS[location.maxRarity]}
                </span>
            </div>
        </button>
    );
}

function LootEventModal({ event, onDismiss }: { event: LootEvent; onDismiss: () => void }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 40 }}>
            <div className="w-full max-w-sm rounded p-6" style={{ background: '#0e2010', border: '1px solid #243e26' }}>
                {event.type === 'loot' && event.foundItem ? (
                    <>
                        <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#4ade80' }}>
                            ITEM FOUND — {event.locationName}
                        </div>
                        <div className="mt-3">
                            <div className="text-[1.2rem] font-bold" style={{ color: RARITY_COLORS[event.foundItem.rarity] }}>
                                {event.foundItem.name}
                            </div>
                            <div className="text-[0.75rem] font-bold tracking-wide" style={{ color: RARITY_COLORS[event.foundItem.rarity] + 'aa' }}>
                                {RARITY_LABELS[event.foundItem.rarity]}
                            </div>
                            <div className="mt-1 text-[0.88rem]" style={{ color: '#a0c0a2' }}>
                                {event.foundItem.description}
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-[0.85rem]">
                                {event.foundItem.power > 0 && (
                                    <span className="font-bold text-white">PWR {event.foundItem.power}</span>
                                )}
                                {event.foundItem.special.length > 0 && (
                                    <span style={{ color: '#6a8e6c' }}>
                                        {event.foundItem.special.map(s => s.toUpperCase()).join(' · ')}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 text-[0.82rem] italic" style={{ color: '#6a8e6c' }}>
                            {event.flavorText}
                        </div>
                        <button
                            type="button"
                            className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                            style={{ background: '#7ccf5a', color: '#070e08' }}
                            onClick={onDismiss}
                        >
                            TAKE IT
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#f97316' }}>
                            AMBUSH — {event.locationName}
                        </div>
                        <div className="mt-3 text-[0.92rem] leading-relaxed" style={{ color: '#a0c0a2' }}>
                            {event.flavorText}
                        </div>
                        {event.lostItem && (
                            <div className="mt-3 rounded p-3" style={{ background: '#1a0a00', border: '1px solid #4a1500' }}>
                                <div className="text-[0.72rem] font-bold tracking-wide" style={{ color: '#f97316' }}>LOST</div>
                                <div className="mt-0.5 text-[1rem] font-bold text-white">{event.lostItem.name}</div>
                                <div className="text-[0.75rem]" style={{ color: '#a07060' }}>{event.lostItem.description}</div>
                            </div>
                        )}
                        {event.energyLost != null && (
                            <div className="mt-3 rounded p-3" style={{ background: '#1a0a00', border: '1px solid #4a1500' }}>
                                <div className="text-[0.72rem] font-bold tracking-wide" style={{ color: '#f97316' }}>LOST</div>
                                <div className="mt-0.5 text-[1rem] font-bold text-white">{event.energyLost} ⚡ energy</div>
                            </div>
                        )}
                        <button
                            type="button"
                            className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                            style={{ background: '#1f3822', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                            onClick={onDismiss}
                        >
                            CONTINUE
                        </button>
                    </>
                )}
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
        store.patch({ energy: s.energy - location.energyCost, activeLootEvent: event, luckBonusActive: false });
        RundotGameAPI.analytics.recordCustomEvent('loot_location_visited', { location: location.id, eventType: event.type }).catch(() => {});
    }

    function handleEventDismiss() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event) return;
        const logEntry = eventToLogEntry(event);
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        if (event.type === 'loot' && event.foundItem) {
            store.patch({ inventory: [...s.inventory, event.foundItem], eventLog: newLog, activeLootEvent: null });
            RundotGameAPI.analytics.recordCustomEvent('loot_item_found', { itemId: event.foundItem.id, rarity: event.foundItem.rarity }).catch(() => {});
        } else if (event.type === 'ambush') {
            let newInventory = s.inventory;
            let newEnergy = s.energy;
            if (event.lostItem) newInventory = s.inventory.filter(i => i.id !== event.lostItem!.id);
            if (event.energyLost) newEnergy = Math.max(0, s.energy - event.energyLost);
            store.patch({ inventory: newInventory, energy: newEnergy, eventLog: newLog, activeLootEvent: null });
            RundotGameAPI.analytics.recordCustomEvent('loot_ambush_triggered', { locationName: event.locationName, hadItemLoss: !!event.lostItem }).catch(() => {});
        }
    }

    const recentLog = eventLog.slice(0, 8);

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#070e08' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">RUINS</div>
                    <EnergyBar energy={energy} max={maxEnergy} />
                </div>
                <p className="mt-0.5 text-[0.72rem]" style={{ color: '#6a8e6c' }}>
                    Tap a location to scavenge.{luckBonusActive && <span style={{ color: '#fb923c' }}> LUCK ACTIVE.</span>}
                </p>
            </div>

            {/* Location list */}
            <div className="scroll-area flex-1 space-y-2 p-3 pb-0">
                {ALL_LOCATIONS.map(loc => (
                    <LocationCard key={loc.id} location={loc} onTap={() => handleLocationTap(loc)} />
                ))}
            </div>

            {/* Log */}
            {recentLog.length > 0 && (
                <div className="shrink-0 px-3 pt-2 pb-1" style={{ borderTop: '1px solid #142816', maxHeight: '30%', overflowY: 'auto' }}>
                    <div className="mb-1 text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>RECENT LOG</div>
                    {recentLog.map(entry => (
                        <div key={entry.id} className="py-0.5 text-[0.8rem] leading-snug" style={{ color: '#8aaa8c' }}>
                            {entry.rarity ? (
                                <span style={{ color: RARITY_COLORS[entry.rarity] }}>[{entry.rarity.toUpperCase()}] </span>
                            ) : entry.type === 'ambush' ? (
                                <span style={{ color: '#f97316' }}>[AMBUSH] </span>
                            ) : entry.type === 'battle-win' ? (
                                <span style={{ color: '#4ade80' }}>[WIN] </span>
                            ) : entry.type === 'battle-loss' ? (
                                <span style={{ color: '#f43f5e' }}>[LOSS] </span>
                            ) : entry.type === 'trade' ? (
                                <span style={{ color: '#fb923c' }}>[TRADE] </span>
                            ) : null}
                            {entry.message}
                        </div>
                    ))}
                </div>
            )}

            {activeLootEvent && (
                <LootEventModal event={activeLootEvent} onDismiss={handleEventDismiss} />
            )}
        </div>
    );
}
