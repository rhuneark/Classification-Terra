import { store, useStore } from '../state/store.ts';
import {
    getExcursionById,
    resolveOption,
    rollExcursionRewardItem,
    DIFFICULTY_COLORS,
    DIFFICULTY_LABELS,
} from '../game/excursions.ts';
import type { ExcursionOption } from '../game/excursions.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import { updateSave, addEarnedScrip, getSave } from '../state/save.ts';
import { randomResearchDuration } from '../game/types.ts';
import type { LogEntry } from '../game/types.ts';
import { playBattleWin, playBattleLoss, playClick } from '../game/audio.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

let _instanceCounter = Date.now();
function newId() { return String(++_instanceCounter); }

export default function ExcursionModal() {
    const activeExcursion = useStore(s => s.activeExcursion);
    const loadout = useStore(s => s.loadout);
    const energy = useStore(s => s.energy);

    if (!activeExcursion) return null;

    const def = getExcursionById(activeExcursion.excursionId);
    if (!def) return null;

    const playerWC = computeWeightClass(loadout);
    const isEnded = activeExcursion.status === 'ended';
    const currentStage = isEnded ? null : def.stages[activeExcursion.currentStageIndex];

    // Check if we ran out of stages without explicitly ending
    const ranOutOfStages = !isEnded && !currentStage;
    const showResult = isEnded || ranOutOfStages;

    function handleOption(option: ExcursionOption) {
        if (!activeExcursion) return;
        playClick();
        const energyToDeduct = option.energyCost ?? 0;
        if (energyToDeduct > 0) {
            const newEnergy = Math.max(0, energy - energyToDeduct);
            store.patch({ energy: newEnergy });
            updateSave({ energy: newEnergy });
        }
        const newRun = resolveOption(activeExcursion, option, playerWC);
        store.patch({ activeExcursion: newRun });
        RundotGameAPI.analytics.recordCustomEvent('excursion_option_chosen', {
            excursionId: def?.id,
            stageIndex: activeExcursion.currentStageIndex,
            optionLabel: option.label,
        }).catch(() => {});
    }

    function handleAbort() {
        if (!activeExcursion) return;
        playClick();
        store.patch({
            activeExcursion: { ...activeExcursion, status: 'ended', endedText: 'Aborted mission. Got out without incident.' },
        });
    }

    function handleClaim() {
        if (!activeExcursion) return;
        const s = store.get();
        const save = getSave();

        let newCurrency = s.currency + activeExcursion.totalScrip;
        let newResearchQueue = s.researchQueue;
        let newDiscoveredTerraIds = s.discoveredTerraIds;
        let newCollectedLoreIds = s.collectedLoreIds;
        let newEnergy = s.energy - activeExcursion.pendingEnergyCost;
        if (newEnergy < 0) newEnergy = 0;

        // Apply lore unlocks
        for (const lu of activeExcursion.loreUnlocks) {
            if (!newDiscoveredTerraIds.includes(lu.terraId)) {
                newDiscoveredTerraIds = [...newDiscoveredTerraIds, lu.terraId];
            }
            if (!newCollectedLoreIds.includes(lu.snippetId)) {
                newCollectedLoreIds = [...newCollectedLoreIds, lu.snippetId];
            }
        }

        // Roll reward item
        if (activeExcursion.pendingItemRarity) {
            const item = rollExcursionRewardItem(activeExcursion.pendingItemRarity as Parameters<typeof rollExcursionRewardItem>[0]);
            newResearchQueue = [...newResearchQueue, {
                instanceId: newId(),
                item,
                startedAt: Date.now(),
                durationMs: randomResearchDuration(item.rarity),
            }];
        }

        // Log the excursion completion
        const logEntry: LogEntry = {
            id: newId(),
            type: 'excursion',
            message: `[EXCURSION] ${def!.name} complete.${activeExcursion.totalScrip > 0 ? ` +${activeExcursion.totalScrip} scrip recovered.` : ''}`,
            timestamp: Date.now(),
        };
        const newEventLog = [logEntry, ...s.eventLog].slice(0, 50);

        // Mark excursion as completed (one-time)
        const newCompletedIds = s.completedExcursionIds.includes(def!.id)
            ? s.completedExcursionIds
            : [...s.completedExcursionIds, def!.id];

        addEarnedScrip(activeExcursion.totalScrip);
        store.patch({
            currency: newCurrency,
            energy: newEnergy,
            researchQueue: newResearchQueue,
            discoveredTerraIds: newDiscoveredTerraIds,
            collectedLoreIds: newCollectedLoreIds,
            activeExcursion: null,
            eventLog: newEventLog,
            completedExcursionIds: newCompletedIds,
        });
        updateSave({
            currency: newCurrency,
            energy: newEnergy,
            researchQueue: newResearchQueue,
            discoveredTerraIds: newDiscoveredTerraIds,
            collectedLoreIds: newCollectedLoreIds,
            totalScavenges: (save.totalScavenges ?? 0),
            eventLog: newEventLog,
            completedExcursionIds: newCompletedIds,
            totalExcursions: (save.totalExcursions ?? 0) + 1,
        });

        if (activeExcursion.totalScrip > 0) playBattleWin();
        else playBattleLoss();

        RundotGameAPI.analytics.recordCustomEvent('excursion_completed', {
            excursionId: def?.id,
            scrip: activeExcursion.totalScrip,
            stagesCompleted: activeExcursion.currentStageIndex,
        }).catch(() => {});
    }

    const diffColor = DIFFICULTY_COLORS[def.difficulty];
    const stageCount = def.stages.length;
    const stageNum = Math.min(activeExcursion.currentStageIndex + 1, stageCount);
    const progressPct = (stageNum / stageCount) * 100;

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 50 }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #1c3820', background: '#091410' }}>
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[0.68rem] font-bold tracking-widest" style={{ color: diffColor }}>
                            EXCURSION — {DIFFICULTY_LABELS[def.difficulty]}
                        </div>
                        <div className="text-[1.05rem] font-bold text-white leading-tight">{def.name}</div>
                        <div className="text-[0.72rem]" style={{ color: '#6a8e6c' }}>{def.subtitle}</div>
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>STAGE</div>
                        <div className="text-[1.1rem] font-bold tabular-nums" style={{ color: '#bcd4bd' }}>{stageNum}/{stageCount}</div>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: '#1c3820' }}>
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${progressPct}%`, background: diffColor }} />
                </div>
            </div>

            {/* Content */}
            <div className="scroll-area flex-1 px-4 py-4 space-y-4">
                {!showResult && currentStage && (
                    <>
                        {/* Stage title + narrative */}
                        <div>
                            <div className="text-[0.72rem] font-bold tracking-widest mb-1" style={{ color: '#4a8a6c' }}>
                                {currentStage.title.toUpperCase()}
                            </div>
                            <p className="text-[0.92rem] leading-relaxed italic" style={{ color: '#bcd4bd' }}>
                                {currentStage.narrative}
                            </p>
                        </div>

                        {/* Last outcome text (if we just came from a previous stage) */}
                        {activeExcursion.log.length > 0 && (
                            <div className="rounded px-3 py-2" style={{ background: '#0a1a10', border: '1px solid #1a3e1c' }}>
                                <p className="text-[0.8rem]" style={{ color: '#8aaa8c' }}>
                                    {activeExcursion.log[activeExcursion.log.length - 1]}
                                </p>
                            </div>
                        )}

                        {/* Choices */}
                        <div className="space-y-2">
                            {currentStage.options.map((option, i) => {
                                const isFight = option.type === 'fight';
                                const canFight = !isFight || playerWC >= (option.wcRequired ?? 0);
                                const energyCost = option.energyCost ?? 0;
                                const canAffordEnergy = energy >= energyCost;
                                const disabled = !canAffordEnergy;
                                return (
                                    <button key={i} type="button"
                                        className="w-full rounded p-3 text-left transition-transform active:scale-[0.98]"
                                        style={{
                                            background: disabled ? '#0a1010' : '#112018',
                                            border: `1px solid ${isFight && !canFight ? '#4a2a00' : '#2c4a2e'}`,
                                            opacity: disabled ? 0.5 : 1,
                                        }}
                                        onClick={() => handleOption(option)}
                                        disabled={disabled}
                                    >
                                        <div className="text-[0.92rem] font-bold text-white">{option.label}</div>
                                        <div className="mt-0.5 flex flex-wrap gap-2">
                                            {isFight && (
                                                <span className="text-[0.68rem] font-bold" style={{ color: canFight ? '#facc15' : '#882222' }}>
                                                    WC {option.wcRequired}+ {canFight ? '✓' : '✗'}
                                                </span>
                                            )}
                                            {option.type === 'luck' && (
                                                <span className="text-[0.68rem]" style={{ color: '#60a5fa' }}>
                                                    {Math.round((option.luckChance ?? 0.5) * 100)}% success
                                                </span>
                                            )}
                                            {energyCost > 0 && (
                                                <span className="text-[0.68rem]" style={{ color: canAffordEnergy ? '#f97316' : '#882222' }}>
                                                    -{energyCost} ⚡
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {showResult && (
                    <>
                        <div className="rounded p-4" style={{ background: '#0a1a10', border: '1px solid #2c4a2e' }}>
                            <div className="text-[0.68rem] font-bold tracking-widest mb-2" style={{ color: activeExcursion.totalScrip > def.baseReward ? '#4ade80' : '#4a6a4c' }}>
                                {activeExcursion.totalScrip > 0 ? 'MISSION COMPLETE' : 'MISSION ENDED'}
                            </div>
                            <p className="text-[0.9rem] leading-relaxed italic" style={{ color: '#bcd4bd' }}>
                                {activeExcursion.endedText ?? activeExcursion.log[activeExcursion.log.length - 1] ?? 'Excursion concluded.'}
                            </p>
                        </div>

                        {/* Rewards */}
                        <div className="rounded p-3 space-y-2" style={{ background: '#112018', border: '1px solid #1a3e1c' }}>
                            <div className="text-[0.68rem] font-bold tracking-widest" style={{ color: '#4a6a4c' }}>OUTCOME</div>
                            <div className="flex items-center justify-between">
                                <span className="text-[0.85rem]" style={{ color: '#8aaa8c' }}>Scrip recovered</span>
                                <span className="text-[0.95rem] font-bold" style={{ color: activeExcursion.totalScrip > 0 ? '#fb923c' : '#4a4a4a' }}>
                                    {activeExcursion.totalScrip > 0 ? `+${activeExcursion.totalScrip}` : '0'}
                                </span>
                            </div>
                            {activeExcursion.pendingItemRarity && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.85rem]" style={{ color: '#8aaa8c' }}>Item recovered</span>
                                    <span className="text-[0.82rem] font-bold" style={{ color: '#60a5fa' }}>→ RESEARCH QUEUE</span>
                                </div>
                            )}
                            {activeExcursion.loreUnlocks.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.85rem]" style={{ color: '#8aaa8c' }}>Codex entries</span>
                                    <span className="text-[0.82rem] font-bold" style={{ color: '#c084fc' }}>+{activeExcursion.loreUnlocks.length} UNLOCKED</span>
                                </div>
                            )}
                            {activeExcursion.pendingEnergyCost > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.85rem]" style={{ color: '#8aaa8c' }}>Energy lost</span>
                                    <span className="text-[0.82rem] font-bold" style={{ color: '#f97316' }}>-{activeExcursion.pendingEnergyCost} ⚡</span>
                                </div>
                            )}
                        </div>

                        {activeExcursion.log.length > 1 && (
                            <div className="space-y-1">
                                <div className="text-[0.65rem] font-bold tracking-widest" style={{ color: '#3a5a3c' }}>FIELD LOG</div>
                                {activeExcursion.log.map((line, i) => (
                                    <p key={i} className="text-[0.76rem] leading-snug" style={{ color: '#6a8e6c' }}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 pb-4 pt-3" style={{ borderTop: '1px solid #1c3820' }}>
                {showResult ? (
                    <button type="button"
                        className="w-full rounded py-3.5 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{ background: '#7ccf5a', color: '#070e08' }}
                        onClick={handleClaim}>
                        {activeExcursion.totalScrip > 0 ? `CLAIM +${activeExcursion.totalScrip} SCRIP` : 'CONTINUE'}
                    </button>
                ) : currentStage?.canLeave ? (
                    <button type="button"
                        className="w-full rounded py-2.5 text-[0.85rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{ background: 'transparent', color: '#4a6a4c', border: '1px solid #243e26' }}
                        onClick={handleAbort}>
                        ABORT MISSION
                    </button>
                ) : null}
            </div>
        </div>
    );
}
