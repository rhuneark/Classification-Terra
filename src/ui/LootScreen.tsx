import { useState, useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { ALL_LOCATIONS } from '../game/locations.ts';
import { rollLootEvent, eventToLogEntry } from '../game/loot.ts';
import type { LootEvent, Location } from '../game/types.ts';
import { DANGER_COLORS, DANGER_LABELS, RARITY_COLORS, RARITY_LABELS, randomResearchDuration } from '../game/types.ts';
import { updateSave, getSave, markUniqueFound, addEarnedScrip } from '../state/save.ts';
import { PAPERCLIPS } from '../game/items.ts';
import { getDailyChallengeLocation, getTodayStr } from '../game/dailyChallenge.ts';
import { scheduleResearchNotif } from '../game/notifications.ts';
import { playScavenge, playItemFound, playClick } from '../game/audio.ts';
import { FORMAT_LABELS } from '../game/terras.ts';
import { ALL_EXCURSIONS, DIFFICULTY_COLORS, DIFFICULTY_LABELS, startExcursion } from '../game/excursions.ts';
import type { ExcursionDef } from '../game/excursions.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

const _dailyChallenge = getDailyChallengeLocation();

// ── Excursion rotation (module-level, persists across tab switches) ────────
const ROTATION_MS = 5 * 60 * 1000;
let _excursionRotateAt = 0;
let _excursionIndex = 0;

function getActiveExcursion(): ExcursionDef {
    if (Date.now() >= _excursionRotateAt) {
        const next = (_excursionIndex + 1 + Math.floor(Math.random() * (ALL_EXCURSIONS.length - 1))) % ALL_EXCURSIONS.length;
        _excursionIndex = next;
        _excursionRotateAt = Date.now() + ROTATION_MS;
    }
    return ALL_EXCURSIONS[_excursionIndex];
}
// ──────────────────────────────────────────────────────────────────────────

let _instanceCounter = Date.now();
function newInstanceId() { return String(++_instanceCounter); }

function EnergyBar({ energy, max }: { energy: number; max: number }) {
    const pct = max > 0 ? (energy / max) * 100 : 0;
    const barColor = energy >= max * 0.6 ? '#4ade80' : energy >= max * 0.3 ? '#facc15' : '#f97316';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1c3820', maxWidth: '80px' }}>
                <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <span className="text-[0.85rem] font-bold tabular-nums" style={{ color: barColor }}>
                {energy}<span style={{ color: '#5a7e5c' }}>/{max}</span> ⚡
            </span>
        </div>
    );
}

function LocationCard({ location, onTap, isChallenge, challengeDone }: {
    location: Location; onTap: () => void;
    isChallenge: boolean; challengeDone: boolean;
}) {
    const energy = useStore(s => s.energy);
    const canAfford = energy >= location.energyCost;
    return (
        <button
            type="button"
            className="w-full rounded p-4 text-left transition-transform active:scale-[0.98]"
            style={{
                background: isChallenge && !challengeDone ? '#1a2810' : '#112018',
                border: `1px solid ${isChallenge && !challengeDone ? '#fb923c66' : canAfford ? '#2c4a2e' : '#1a2810'}`,
                opacity: canAfford ? 1 : 0.5,
            }}
            onClick={onTap}
            disabled={!canAfford}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="truncate text-[1rem] font-bold text-white">{location.name}</div>
                        {isChallenge && !challengeDone && (
                            <span className="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide"
                                style={{ background: '#2a1400', color: '#fb923c', border: '1px solid #fb923c55' }}>
                                DAILY +25
                            </span>
                        )}
                        {isChallenge && challengeDone && (
                            <span className="shrink-0 text-[0.6rem] font-bold" style={{ color: '#4a6a4c' }}>DONE TODAY</span>
                        )}
                    </div>
                    <div className="mt-0.5 text-[0.82rem] leading-snug" style={{ color: '#c4dcc5' }}>
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

function ExcursionCard({ exc, onTap }: { exc: ExcursionDef; onTap: () => void }) {
    const energy = useStore(s => s.energy);
    const canAfford = energy >= exc.energyCost;
    const diffColor = DIFFICULTY_COLORS[exc.difficulty];
    return (
        <button
            type="button"
            className="w-full rounded p-3.5 text-left transition-transform active:scale-[0.98]"
            style={{
                background: '#0e1c18',
                border: `1px solid ${canAfford ? diffColor + '44' : '#1a2810'}`,
                opacity: canAfford ? 1 : 0.5,
            }}
            onClick={onTap}
            disabled={!canAfford}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[0.6rem] font-bold tracking-widest rounded px-1 py-0.5"
                            style={{ color: diffColor, background: diffColor + '18', border: `1px solid ${diffColor}33` }}>
                            {DIFFICULTY_LABELS[exc.difficulty]}
                        </span>
                        <span className="text-[0.6rem]" style={{ color: '#4a6a4c' }}>{exc.stages.length} STAGES</span>
                    </div>
                    <div className="text-[0.95rem] font-bold text-white leading-tight">{exc.name}</div>
                    <div className="mt-0.5 text-[0.8rem] leading-snug" style={{ color: '#a0c0a2' }}>
                        {exc.description}
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <div className="text-[0.82rem] font-bold" style={{ color: canAfford ? '#4ade80' : '#3a5a3c' }}>{exc.energyCost} ⚡</div>
                </div>
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
        const isLoreItem = item.type === 'lore';

        return (
            <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.90)', zIndex: 40 }}>
                <div className="w-full max-w-sm rounded p-5" style={{ background: '#112018', border: '1px solid #2c4a2e', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#4ade80' }}>
                        {isLoreItem ? 'DOCUMENT FOUND' : 'ITEM FOUND'} — {event.locationName}
                    </div>

                    <div className="mt-3 rounded p-3" style={{ background: '#0a1810', border: `1px solid ${RARITY_COLORS[item.rarity]}44` }}>
                        <div className="text-[1.15rem] font-bold" style={{ color: isLoreItem ? '#c084fc' : RARITY_COLORS[item.rarity] }}>
                            {item.name}
                        </div>
                        <div className="text-[0.7rem] font-bold tracking-wide" style={{ color: isLoreItem ? '#c084fc88' : RARITY_COLORS[item.rarity] + 'aa' }}>
                            {isLoreItem ? 'FIELD DOCUMENT' : RARITY_LABELS[item.rarity]}
                        </div>
                        <div className="mt-1 text-[0.86rem] leading-snug" style={{ color: '#c4dcc5' }}>
                            {item.description}
                        </div>
                        {!isLoreItem && item.power > 0 && (
                            <div className="mt-1.5 text-[0.85rem] font-bold text-white">PWR {item.power}</div>
                        )}
                        {!isLoreItem && item.special.length > 0 && (
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

                    {isLoreItem && (
                        <div className="mt-2 rounded p-2 text-[0.78rem]" style={{ background: '#180b28', border: '1px solid #c084fc33' }}>
                            <span style={{ color: '#c084fc' }}>Codex entry unlocked.</span>
                            <span style={{ color: '#8a7aac' }}> Find it in the CODEX tab.</span>
                        </div>
                    )}

                    <div className="mt-2 text-[0.82rem] italic" style={{ color: '#6a8e6c' }}>{event.flavorText}</div>

                    {/* Lore document co-drop */}
                    {event.loreItem && (
                        <div className="mt-2 rounded p-2.5" style={{ background: '#180b28', border: '1px solid #c084fc33' }}>
                            <div className="text-[0.62rem] font-bold tracking-widest mb-1" style={{ color: '#c084fc' }}>
                                FIELD DOCUMENT FOUND
                            </div>
                            <div className="text-[0.88rem] font-bold" style={{ color: '#c084fc' }}>
                                {event.loreItem.name}
                            </div>
                            <div className="mt-0.5 text-[0.74rem]" style={{ color: '#8a7aac' }}>
                                {event.loreItem.description}
                            </div>
                            <div className="mt-1 text-[0.65rem]" style={{ color: '#6a5a8c' }}>
                                Codex entry unlocked automatically.
                            </div>
                        </div>
                    )}

                    {/* Secondary items */}
                    {event.secondaryItems.length > 0 && (
                        <div className="mt-3 rounded p-2.5" style={{ background: '#0a1810', border: '1px solid #1a3e1c' }}>
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
                                {isLoreItem ? 'GOT IT' : 'TAKE IT'}
                            </button>
                            {!isLoreItem && (
                                <button type="button" className="rounded px-4 py-3 text-[0.82rem] transition-transform active:scale-95"
                                    style={{ background: '#1a2010', color: '#6a8e6c', border: '1px solid #1a3e1c' }}
                                    onClick={isUnique ? () => setConfirmScrap(true) : onScrap}>
                                    SCRAP +1
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Ambush modal
    const snippetFormatLabel = event.terraSnippetFormat ? FORMAT_LABELS[event.terraSnippetFormat] : null;

    return (
        <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.90)', zIndex: 40 }}>
            <div className="w-full max-w-sm rounded p-5" style={{ background: '#1a0e0a', border: '1px solid #3a1e12' }}>
                <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#f97316' }}>
                    AMBUSH — {event.locationName}
                </div>
                <div className="mt-3 text-[0.92rem] leading-relaxed" style={{ color: '#c4dcc5' }}>
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

                {event.terraSnippetText && (
                    <div className="mt-3 rounded p-3" style={{ background: '#0a1010', border: '1px solid #2a4a3c' }}>
                        {snippetFormatLabel && (
                            <div className="text-[0.62rem] font-bold tracking-widest mb-1.5" style={{ color: '#4a8a6c' }}>
                                FIELD INTELLIGENCE — {snippetFormatLabel}
                            </div>
                        )}
                        <p className="text-[0.82rem] leading-relaxed italic" style={{ color: '#8aaa9c' }}>
                            {event.terraSnippetText}
                        </p>
                        <div className="mt-1.5 text-[0.65rem]" style={{ color: '#3a6a4c' }}>
                            Codex entry unlocked.
                        </div>
                    </div>
                )}

                <button type="button" className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#1f2e1a', color: '#7ccf5a', border: '1px solid #2a4e2c' }}
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
    const activeLootEvent = useStore(s => s.activeLootEvent);
    const luckBonusActive = useStore(s => s.luckBonusActive);
    const today = getTodayStr();
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        const iv = setInterval(() => forceUpdate(n => n + 1), 10_000);
        return () => clearInterval(iv);
    }, []);
    const challengeDone = getSave().lastDailyChallengeDay === today;
    function handleLocationTap(location: Location) {
        const s = store.get();
        if (s.energy < location.energyCost) return;
        playScavenge();
        const event = rollLootEvent(location, s.inventory, s.energy, s.luckBonusActive, s.collectedLoreIds);
        const newEnergy = s.energy - location.energyCost;

        const todayStr = getTodayStr();
        const save = getSave();
        let challengeBonus = 0;
        if (location.id === _dailyChallenge.id && save.lastDailyChallengeDay !== todayStr) {
            challengeBonus = 25;
            updateSave({ lastDailyChallengeDay: todayStr });
            RundotGameAPI.analytics.recordCustomEvent('daily_challenge_completed', { locationId: location.id }).catch(() => {});
        }
        const newCurrency = s.currency + challengeBonus;

        store.patch({ energy: newEnergy, currency: newCurrency, activeLootEvent: event, luckBonusActive: false });
        updateSave({ energy: newEnergy, currency: newCurrency, totalScavenges: (save.totalScavenges ?? 0) + 1 });
        RundotGameAPI.analytics.recordCustomEvent('loot_location_visited', { location: location.id, eventType: event.type }).catch(() => {});
    }

    function handleTake() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event || event.type !== 'loot' || !event.foundItem) return;

        const item = event.foundItem;
        const isLoreItem = item.type === 'lore';

        if (item.rarity === 'unique') {
            markUniqueFound(item.id);
            store.patch({ foundUniqueIds: [...s.foundUniqueIds.filter(id => id !== item.id), item.id] });
            const pcIdx = PAPERCLIPS.findIndex(p => p.id === item.id);
            if (pcIdx !== -1) {
                const pcNumber = 10 - pcIdx;
                RundotGameAPI.leaderboard.submitScore({
                    score: Math.floor((Date.now() - 1700000000000) / 1000),
                    duration: 1,
                    mode: `paperclip-${pcNumber}`,
                    metadata: { paperclipNumber: pcNumber },
                }).catch(() => {});
            }
        }

        let newDiscoveredTerraIds = s.discoveredTerraIds;
        let newCollectedLoreIds = s.collectedLoreIds;
        if (isLoreItem && item.loreTerraId && item.loreSnippetId) {
            if (!newDiscoveredTerraIds.includes(item.loreTerraId)) {
                newDiscoveredTerraIds = [...newDiscoveredTerraIds, item.loreTerraId];
            }
            if (!newCollectedLoreIds.includes(item.loreSnippetId)) {
                newCollectedLoreIds = [...newCollectedLoreIds, item.loreSnippetId];
            }
            RundotGameAPI.analytics.recordCustomEvent('lore_document_collected', {
                terraId: item.loreTerraId,
                snippetId: item.loreSnippetId,
            }).catch(() => {});
        }

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

        let newInventory = s.inventory;
        let finalQueue = newQueue;
        if (item.type === 'consumable') {
            newInventory = [...s.inventory, item];
        } else if (item.type !== 'lore') {
            finalQueue = [...newQueue, {
                instanceId: newInstanceId(),
                item,
                startedAt: Date.now(),
                durationMs: randomResearchDuration(item.rarity),
            }];
        }

        const newInventoryWithLore = newInventory;
        if (event.loreItem && event.loreItem.loreTerraId && event.loreItem.loreSnippetId) {
            const li = event.loreItem;
            if (!newDiscoveredTerraIds.includes(li.loreTerraId!)) {
                newDiscoveredTerraIds = [...newDiscoveredTerraIds, li.loreTerraId!];
            }
            if (!newCollectedLoreIds.includes(li.loreSnippetId!)) {
                newCollectedLoreIds = [...newCollectedLoreIds, li.loreSnippetId!];
            }
        }

        const logEntry = eventToLogEntry(event);
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);
        store.patch({
            inventory: newInventoryWithLore,
            researchQueue: finalQueue,
            eventLog: newLog,
            activeLootEvent: null,
            discoveredTerraIds: newDiscoveredTerraIds,
            collectedLoreIds: newCollectedLoreIds,
        });
        updateSave({
            inventory: newInventoryWithLore,
            researchQueue: finalQueue,
            eventLog: newLog,
            discoveredTerraIds: newDiscoveredTerraIds,
            collectedLoreIds: newCollectedLoreIds,
        });
        playItemFound(item.rarity);
        scheduleResearchNotif(finalQueue);
        RundotGameAPI.analytics.recordCustomEvent('loot_item_found', { itemId: item.id, rarity: item.rarity, isUnique: item.rarity === 'unique' }).catch(() => {});
    }

    function handleScrap() {
        const s = store.get();
        const event = s.activeLootEvent;
        if (!event || event.type !== 'loot' || !event.foundItem) return;

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

        let newDiscoveredTerraIds = s.discoveredTerraIds;
        let newCollectedLoreIds = s.collectedLoreIds;
        if (event.terraId && !newDiscoveredTerraIds.includes(event.terraId)) {
            newDiscoveredTerraIds = [...newDiscoveredTerraIds, event.terraId];
        }
        if (event.terraSnippetId && !newCollectedLoreIds.includes(event.terraSnippetId)) {
            newCollectedLoreIds = [...newCollectedLoreIds, event.terraSnippetId];
        }

        store.patch({
            inventory: newInventory,
            energy: newEnergy,
            eventLog: newLog,
            activeLootEvent: null,
            discoveredTerraIds: newDiscoveredTerraIds,
            collectedLoreIds: newCollectedLoreIds,
        });
        const save = getSave();
        updateSave({
            inventory: newInventory,
            energy: newEnergy,
            eventLog: newLog,
            totalAmbushes: (save.totalAmbushes ?? 0) + 1,
            discoveredTerraIds: newDiscoveredTerraIds,
            collectedLoreIds: newCollectedLoreIds,
        });
        RundotGameAPI.analytics.recordCustomEvent('loot_ambush_triggered', { locationName: event.locationName }).catch(() => {});
    }

    function handleExcursionTap(exc: ExcursionDef) {
        const s = store.get();
        if (s.energy < exc.energyCost) return;
        playClick();
        const newEnergy = s.energy - exc.energyCost;
        const run = startExcursion(exc);
        store.patch({ energy: newEnergy, activeExcursion: run });
        updateSave({ energy: newEnergy });
        RundotGameAPI.analytics.recordCustomEvent('excursion_started', { excursionId: exc.id }).catch(() => {});
    }

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#0d1a10' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1c3820' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widests text-primary">RUINS</div>
                    <EnergyBar energy={energy} max={maxEnergy} />
                </div>
                {luckBonusActive && (
                    <p className="mt-0.5 text-[0.72rem]" style={{ color: '#fb923c' }}>LUCK ACTIVE.</p>
                )}
            </div>

            <div className="scroll-area flex-1 space-y-2 p-3 pb-4">
                {/* Scavenge locations */}
                <div className="mb-1 text-[0.62rem] font-bold tracking-widest" style={{ color: '#3a5a3c' }}>LOCATIONS</div>
                {ALL_LOCATIONS.map(loc => (
                    <LocationCard
                        key={loc.id}
                        location={loc}
                        onTap={() => handleLocationTap(loc)}
                        isChallenge={loc.id === _dailyChallenge.id}
                        challengeDone={challengeDone}
                    />
                ))}

                {/* Excursions section — single rotating mission */}
                {(() => {
                    const exc = getActiveExcursion();
                    const msLeft = Math.max(0, _excursionRotateAt - Date.now());
                    const totalSecs = Math.ceil(msLeft / 1000);
                    const mins = Math.floor(totalSecs / 60);
                    const secs = totalSecs % 60;
                    const countdown = `${mins}:${String(secs).padStart(2, '0')}`;
                    return (
                        <div className="pt-2">
                            <div className="mb-2 px-1 flex items-center justify-between">
                                <div className="text-[0.62rem] font-bold tracking-widest" style={{ color: '#3a5a3c' }}>
                                    FIELD OPERATION
                                </div>
                                <div className="text-[0.6rem]" style={{ color: '#2e4a30' }}>
                                    NEXT BRIEFING {countdown}
                                </div>
                            </div>
                            <ExcursionCard exc={exc} onTap={() => handleExcursionTap(exc)} />
                        </div>
                    );
                })()}
            </div>

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
