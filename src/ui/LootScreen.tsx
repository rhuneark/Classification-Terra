import { store, useStore } from '../state/store.ts';
import { ALL_LOCATIONS } from '../game/locations.ts';
import { rollLootEvent, eventToLogEntry } from '../game/loot.ts';
import type { LootEvent, Location } from '../game/types.ts';
import { DANGER_COLORS, DANGER_LABELS, RARITY_COLORS, RARITY_LABELS } from '../game/types.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

// Lifecycle analytics registered once at module scope
RundotGameAPI.lifecycles.onPause(() => {});  // handled in main.tsx
RundotGameAPI.lifecycles.onResume(() => {}); // handled in main.tsx

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
                background: '#0b1a0d',
                border: `1px solid ${canAfford ? '#1a2e1c' : '#111'}`,
                opacity: canAfford ? 1 : 0.5,
            }}
            onClick={onTap}
            disabled={!canAfford}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[1rem] font-bold text-white">{location.name}</div>
                    <div className="mt-0.5 text-[0.8rem] leading-snug" style={{ color: '#6b7a6c' }}>
                        {location.description}
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[0.75rem]" style={{ color: '#4ade80' }}>
                        {location.energyCost} ⚡
                    </div>
                </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <DangerBadge danger={location.danger} />
                <span className="text-[0.7rem]" style={{ color: '#4a5a4c' }}>
                    AMBUSH {Math.round(location.ambushChance * 100)}%
                </span>
                <span className="text-[0.7rem]" style={{ color: '#4a5a4c' }}>
                    {RARITY_LABELS[location.minRarity]}–{RARITY_LABELS[location.maxRarity]}
                </span>
            </div>
        </button>
    );
}

function LootEventModal({ event, onDismiss }: { event: LootEvent; onDismiss: () => void }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 40 }}>
            <div
                className="w-full max-w-sm rounded p-6"
                style={{ background: '#0b1a0d', border: '1px solid #1a2e1c' }}
            >
                {event.type === 'loot' && event.foundItem ? (
                    <>
                        <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#4ade80' }}>
                            ITEM FOUND
                        </div>
                        <div className="mt-3">
                            <div
                                className="text-[1.15rem] font-bold"
                                style={{ color: RARITY_COLORS[event.foundItem.rarity] }}
                            >
                                {event.foundItem.name}
                            </div>
                            <div className="text-[0.75rem] font-bold tracking-wide" style={{ color: RARITY_COLORS[event.foundItem.rarity] + '99' }}>
                                {RARITY_LABELS[event.foundItem.rarity]}
                            </div>
                            <div className="mt-1 text-[0.85rem]" style={{ color: '#6b7a6c' }}>
                                {event.foundItem.description}
                            </div>
                            <div className="mt-2 text-[0.85rem] font-bold text-white">
                                PWR {event.foundItem.power}
                                {event.foundItem.special.length > 0 && (
                                    <span className="ml-2 text-[0.75rem] font-normal" style={{ color: '#4a5a4c' }}>
                                        {event.foundItem.special.map(s => s.toUpperCase()).join(' ')}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 text-[0.8rem] italic" style={{ color: '#4a5a4c' }}>
                            {event.flavorText}
                        </div>
                        <button
                            type="button"
                            className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                            style={{ background: '#7ccf5a', color: '#050d07' }}
                            onClick={onDismiss}
                        >
                            TAKE IT
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#f97316' }}>
                            AMBUSH
                        </div>
                        <div className="mt-3 text-[0.9rem] leading-relaxed" style={{ color: '#6b7a6c' }}>
                            {event.flavorText}
                        </div>
                        {event.lostItem && (
                            <div className="mt-3 rounded p-3" style={{ background: '#160a00', border: '1px solid #3a1500' }}>
                                <div className="text-[0.75rem]" style={{ color: '#f97316' }}>LOST</div>
                                <div className="text-[1rem] font-bold text-white">{event.lostItem.name}</div>
                            </div>
                        )}
                        {event.energyLost != null && (
                            <div className="mt-3 rounded p-3" style={{ background: '#160a00', border: '1px solid #3a1500' }}>
                                <div className="text-[0.75rem]" style={{ color: '#f97316' }}>LOST</div>
                                <div className="text-[1rem] font-bold text-white">{event.energyLost} ⚡ energy</div>
                            </div>
                        )}
                        <button
                            type="button"
                            className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                            style={{ background: '#1a2e1c', color: '#7ccf5a', border: '1px solid #2a4e2c' }}
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

        store.patch({
            energy: s.energy - location.energyCost,
            activeLootEvent: event,
            luckBonusActive: false,
        });

        RundotGameAPI.analytics.recordCustomEvent('loot_location_visited', {
            location: location.id,
            eventType: event.type,
        }).catch(() => {});
    }

    function handleEventDismiss() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event) return;

        const logEntry = eventToLogEntry(event);
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);

        if (event.type === 'loot' && event.foundItem) {
            store.patch({
                inventory: [...s.inventory, event.foundItem],
                eventLog: newLog,
                activeLootEvent: null,
            });
            RundotGameAPI.analytics.recordCustomEvent('loot_item_found', {
                itemId: event.foundItem.id,
                rarity: event.foundItem.rarity,
            }).catch(() => {});
        } else if (event.type === 'ambush') {
            let newInventory = s.inventory;
            let newEnergy = s.energy;
            if (event.lostItem) {
                newInventory = s.inventory.filter(i => i.id !== event.lostItem!.id);
            }
            if (event.energyLost) {
                newEnergy = Math.max(0, s.energy - event.energyLost);
            }
            store.patch({
                inventory: newInventory,
                energy: newEnergy,
                eventLog: newLog,
                activeLootEvent: null,
            });
            RundotGameAPI.analytics.recordCustomEvent('loot_ambush_triggered', {
                locationName: event.locationName,
                hadItemLoss: !!event.lostItem,
            }).catch(() => {});
        }
    }

    const recentLog = eventLog.slice(0, 8);
    const energyPips = Array.from({ length: maxEnergy }, (_, i) => i < energy);

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#050d07' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #0b1a0d' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">RUINS</div>
                    <div className="flex items-center gap-1">
                        {energyPips.map((filled, i) => (
                            <span
                                key={i}
                                className="energy-pip"
                                style={{ background: filled ? '#4ade80' : '#1a2e1c' }}
                            />
                        ))}
                        <span className="ml-1 text-[0.8rem]" style={{ color: '#6b7a6c' }}>
                            {energy}/{maxEnergy} ⚡
                        </span>
                    </div>
                </div>
                <p className="text-[0.75rem]" style={{ color: '#4a5a4c' }}>
                    Tap a location to scavenge. Ambush risk is real.
                    {luckBonusActive && <span style={{ color: '#fb923c' }}> LUCK ACTIVE</span>}
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
                <div
                    className="shrink-0 px-3 pt-2 pb-1"
                    style={{ borderTop: '1px solid #0b1a0d', maxHeight: '30%', overflowY: 'auto' }}
                >
                    <div className="mb-1 text-[0.7rem] font-bold tracking-widest" style={{ color: '#3a4a3c' }}>
                        RECENT LOG
                    </div>
                    {recentLog.map(entry => (
                        <div key={entry.id} className="py-0.5 text-[0.78rem] leading-snug" style={{ color: '#6b7a6c' }}>
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
