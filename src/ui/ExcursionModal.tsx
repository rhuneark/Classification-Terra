import { useState, useRef, useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { getSave, updateSave, addEarnedScrip } from '../state/save.ts';
import type { Item, Rarity } from '../game/types.ts';
import { RARITY_COLORS, randomResearchDuration } from '../game/types.ts';
import type { ExcursionDef, ExcursionOption, ExcursionOptionOutcome } from '../game/excursions.ts';
import { rollExcursionItem } from '../game/excursions.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

let _iid = Date.now() + 9000;
function newId() { return String(++_iid); }

interface LogEntry { text: string; type: 'narrative' | 'result' | 'reward' | 'stage' }

interface ExcursionRun {
    accScrip: number;
    accItems: Item[];
    accSnippetIds: string[];
    accTerraIds: string[];
    storyLog: LogEntry[];
}

interface Props {
    excursion: ExcursionDef;
    onClose: (run: ExcursionRun) => void;
}


export default function ExcursionModal({ excursion, onClose }: Props) {
    const backpack = useStore(s => s.backpack);
    const energy = useStore(s => s.energy);
    const playerWC = computeWeightClass(backpack);

    const [stageIndex, setStageIndex] = useState(0);
    const [run, setRun] = useState<ExcursionRun>({
        accScrip: 0, accItems: [], accSnippetIds: [], accTerraIds: [], storyLog: [],
    });
    const [phase, setPhase] = useState<'stage' | 'result'>('stage');
    const [resultText, setResultText] = useState('');
    const [resultSuccess, setResultSuccess] = useState(true);
    const [pendingNext, setPendingNext] = useState<number | null>(null);
    const [pendingEnds, setPendingEnds] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);

    const totalStages = excursion.stages.length;
    const stage = excursion.stages[stageIndex] ?? excursion.stages[totalStages - 1];

    // Scroll log to bottom whenever storyLog updates
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [run.storyLog.length, phase]);

    function applyOutcome(outcome: ExcursionOptionOutcome, _success: boolean): ExcursionRun {
        const newRun = { ...run, storyLog: [...run.storyLog] };
        if (outcome.scrip) {
            newRun.accScrip += outcome.scrip;
            newRun.storyLog.push({ text: `+${outcome.scrip} scrip`, type: 'reward' });
        }
        if (outcome.itemRarity) {
            const item = rollExcursionItem(outcome.itemRarity as Rarity);
            newRun.accItems = [...newRun.accItems, item];
            newRun.storyLog.push({ text: `Item secured: `, type: 'reward', ...{ item } } as LogEntry & { item: Item });
            // We store the item object reference inline so we can render it
            newRun.storyLog[newRun.storyLog.length - 1] = { text: `${item.name}`, type: 'reward' };
            // Keep item reference for rendering — attach as extra field:
            (newRun.storyLog[newRun.storyLog.length - 1] as LogEntry & { itemRarity: Rarity; itemName: string }).itemRarity = item.rarity;
            (newRun.storyLog[newRun.storyLog.length - 1] as LogEntry & { itemRarity: Rarity; itemName: string }).itemName = item.name;
        }
        if (outcome.terraId && !newRun.accTerraIds.includes(outcome.terraId)) {
            newRun.accTerraIds = [...newRun.accTerraIds, outcome.terraId];
        }
        if (outcome.snippetId && !newRun.accSnippetIds.includes(outcome.snippetId)) {
            newRun.accSnippetIds = [...newRun.accSnippetIds, outcome.snippetId];
            newRun.storyLog.push({ text: 'Codex entry unlocked', type: 'reward' });
        }
        if (outcome.energyCost && outcome.energyCost > 0) {
            const s = store.get();
            const newEnergy = Math.max(0, s.energy - outcome.energyCost);
            store.patch({ energy: newEnergy });
            updateSave({ energy: newEnergy });
            newRun.storyLog.push({ text: `-${outcome.energyCost} energy`, type: 'reward' });
        }
        return newRun;
    }

    function handleOption(option: ExcursionOption) {
        // Deduct upfront energy cost
        if (option.energyCost && option.energyCost > 0) {
            const s = store.get();
            const newEnergy = Math.max(0, s.energy - option.energyCost);
            store.patch({ energy: newEnergy });
            updateSave({ energy: newEnergy });
        }

        let success = true;
        let outcome: ExcursionOptionOutcome;

        if (option.type === 'fight') {
            success = playerWC >= (option.wcRequired ?? 0);
        } else if (option.type === 'luck') {
            success = Math.random() < (option.luckChance ?? 0.5);
        }

        outcome = success ? option.success : (option.failure ?? option.success);

        const newRun = applyOutcome(outcome, success);
        newRun.storyLog.push({ text: outcome.text, type: 'result' });
        setRun(newRun);
        setResultText(outcome.text);
        setResultSuccess(success);
        setPendingNext(outcome.nextStage ?? stageIndex + 1);
        setPendingEnds(!!outcome.ends);
        setPhase('result');

        RundotGameAPI.analytics.recordCustomEvent('excursion_option_chosen', {
            excursionId: excursion.id,
            stageIndex,
            optionLabel: option.label,
            success,
        }).catch(() => {});
    }

    function handleAdvance() {
        if (pendingEnds) {
            finishExcursion(run);
            return;
        }
        const next = pendingNext ?? stageIndex + 1;
        if (next >= totalStages) {
            finishExcursion(run);
            return;
        }
        const nextStage = excursion.stages[next];
        run.storyLog.push({ text: `— ${nextStage.title} —`, type: 'stage' });
        setStageIndex(next);
        setPhase('stage');
    }

    function handleClaimAndLeave() {
        finishExcursion(run);
    }

    function finishExcursion(finalRun: ExcursionRun) {
        const s = store.get();
        // Distribute scrip
        const newCurrency = s.currency + finalRun.accScrip;
        addEarnedScrip(finalRun.accScrip);

        // Distribute items → research queue
        let newQueue = [...s.researchQueue];
        for (const item of finalRun.accItems) {
            newQueue.push({
                instanceId: newId(),
                item,
                startedAt: Date.now(),
                durationMs: randomResearchDuration(item.rarity),
            });
        }

        // Lore + terra
        let newDiscovered = [...s.discoveredTerraIds];
        let newCollected = [...s.collectedLoreIds];
        for (const id of finalRun.accTerraIds) {
            if (!newDiscovered.includes(id)) newDiscovered.push(id);
        }
        for (const id of finalRun.accSnippetIds) {
            if (!newCollected.includes(id)) newCollected.push(id);
        }

        store.patch({
            currency: newCurrency,
            researchQueue: newQueue,
            discoveredTerraIds: newDiscovered,
            collectedLoreIds: newCollected,
        });
        const save = getSave();
        updateSave({
            currency: newCurrency,
            researchQueue: newQueue,
            discoveredTerraIds: newDiscovered,
            collectedLoreIds: newCollected,
            totalExcursions: (save.totalExcursions ?? 0) + 1,
        });

        RundotGameAPI.analytics.recordCustomEvent('excursion_completed', {
            excursionId: excursion.id,
            stagesReached: stageIndex,
            scrip: finalRun.accScrip,
            items: finalRun.accItems.length,
        }).catch(() => {});

        onClose(finalRun);
    }

    const progressPct = Math.round(((stageIndex + 1) / totalStages) * 100);

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.97)', zIndex: 50 }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-4 pb-2" style={{ borderBottom: '1px solid #1c3820' }}>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <div className="text-[0.65rem] font-bold tracking-widest" style={{ color: '#4a8a6c' }}>
                            FIELD OPERATION — {excursion.location.toUpperCase()}
                        </div>
                        <div className="text-[1.05rem] font-bold text-white">{excursion.name}</div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-[0.7rem]" style={{ color: '#6a8e6c' }}>
                            STAGE {stageIndex + 1}/{totalStages}
                        </div>
                        <div className="mt-0.5 h-1.5 w-16 rounded-full overflow-hidden" style={{ background: '#1c3820' }}>
                            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${progressPct}%`, background: '#4ade80' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Story log */}
            <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ minHeight: 0 }}>
                {run.storyLog.map((entry, i) => {
                    if (entry.type === 'stage') {
                        return (
                            <div key={i} className="text-center text-[0.65rem] font-bold tracking-widest py-1" style={{ color: '#3a5a3c', borderTop: '1px solid #1c3820', borderBottom: '1px solid #1c3820', marginTop: '4px' }}>
                                {entry.text}
                            </div>
                        );
                    }
                    if (entry.type === 'reward') {
                        const e = entry as LogEntry & { itemRarity?: Rarity; itemName?: string };
                        return (
                            <div key={i} className="text-[0.78rem] font-bold pl-2" style={{ color: e.itemRarity ? RARITY_COLORS[e.itemRarity] : '#4ade80', borderLeft: '2px solid currentColor' }}>
                                {e.itemName ? `Secured: ${e.itemName}` : entry.text}
                            </div>
                        );
                    }
                    if (entry.type === 'result') {
                        return (
                            <div key={i} className="text-[0.85rem] leading-snug italic" style={{ color: '#c4dcc5' }}>
                                {entry.text}
                            </div>
                        );
                    }
                    return (
                        <div key={i} className="text-[0.78rem]" style={{ color: '#6a8e6c' }}>
                            {entry.text}
                        </div>
                    );
                })}
            </div>

            {/* Accumulated rewards summary */}
            {(run.accScrip > 0 || run.accItems.length > 0) && (
                <div className="shrink-0 mx-4 mb-2 rounded p-2.5" style={{ background: '#0a1810', border: '1px solid #1c3820' }}>
                    <div className="text-[0.62rem] font-bold tracking-widest mb-1" style={{ color: '#3a6a4c' }}>
                        ACCUMULATED REWARDS
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {run.accScrip > 0 && (
                            <span className="text-[0.78rem] font-bold" style={{ color: '#8a7a60' }}>{run.accScrip} scrip</span>
                        )}
                        {run.accItems.map((item, i) => (
                            <span key={i} className="text-[0.78rem] font-bold" style={{ color: RARITY_COLORS[item.rarity] }}>
                                {item.name}
                            </span>
                        ))}
                        {run.accSnippetIds.length > 0 && (
                            <span className="text-[0.78rem]" style={{ color: '#7a5aac' }}>{run.accSnippetIds.length} codex {run.accSnippetIds.length === 1 ? 'entry' : 'entries'}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Stage display or result */}
            <div className="shrink-0 px-4 pb-4">
                {phase === 'stage' && (
                    <div>
                        <div className="mb-1.5 text-[0.72rem] font-bold tracking-widest" style={{ color: '#5a8a6c' }}>
                            {stage.title.toUpperCase()}
                        </div>
                        <div className="mb-3 text-[0.88rem] leading-relaxed" style={{ color: '#c4dcc5' }}>
                            {stage.narrative}
                        </div>
                        <div className="space-y-2">
                            {stage.options.map((opt, i) => {
                                const isFight = opt.type === 'fight';
                                const isLuck = opt.type === 'luck';
                                const canFight = !isFight || playerWC >= (opt.wcRequired ?? 0);
                                const hasEnoughEnergy = !opt.energyCost || energy >= opt.energyCost;
                                const disabled = !hasEnoughEnergy;
                                return (
                                    <button key={i}
                                        type="button"
                                        className="w-full rounded py-2.5 px-3 text-left text-[0.88rem] transition-transform active:scale-[0.98]"
                                        style={{
                                            background: canFight ? '#112018' : '#180810',
                                            border: `1px solid ${canFight ? '#2c4a2e' : '#4a1500'}`,
                                            color: disabled ? '#4a3a3c' : canFight ? '#c4dcc5' : '#f97316',
                                            opacity: disabled ? 0.5 : 1,
                                        }}
                                        onClick={() => !disabled && handleOption(opt)}
                                        disabled={disabled}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span>{opt.label}</span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {opt.energyCost && (
                                                    <span className="text-[0.65rem]" style={{ color: '#f97316' }}>{opt.energyCost} ⚡</span>
                                                )}
                                                {isFight && !canFight && (
                                                    <span className="text-[0.65rem]" style={{ color: '#f97316' }}>WC {opt.wcRequired}+ needed</span>
                                                )}
                                                {isFight && canFight && (
                                                    <span className="text-[0.65rem]" style={{ color: '#4ade80' }}>WC {playerWC} vs {opt.wcRequired}</span>
                                                )}
                                                {isLuck && (
                                                    <span className="text-[0.65rem]" style={{ color: '#facc15' }}>50/50</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {stage.canLeave && (
                            <button type="button"
                                className="mt-2 w-full rounded py-2 text-[0.8rem] transition-transform active:scale-[0.98]"
                                style={{ background: 'transparent', border: '1px solid #1c3820', color: '#4a6a4c' }}
                                onClick={handleClaimAndLeave}
                            >
                                {run.accScrip > 0 || run.accItems.length > 0
                                    ? `CLAIM & LEAVE (+${run.accScrip} scrip${run.accItems.length > 0 ? `, ${run.accItems.length} item${run.accItems.length > 1 ? 's' : ''}` : ''})`
                                    : 'LEAVE EMPTY-HANDED'}
                            </button>
                        )}
                    </div>
                )}

                {phase === 'result' && (
                    <div>
                        <div className="mb-3 rounded p-3" style={{ background: resultSuccess ? '#0a1c0a' : '#1a0a0a', border: `1px solid ${resultSuccess ? '#2a5e2c' : '#4a1500'}` }}>
                            <div className="text-[0.68rem] font-bold tracking-widest mb-1" style={{ color: resultSuccess ? '#4ade80' : '#f97316' }}>
                                {resultSuccess ? 'OUTCOME' : 'SETBACK'}
                            </div>
                            <p className="text-[0.88rem] leading-snug" style={{ color: '#c4dcc5' }}>{resultText}</p>
                        </div>
                        {pendingEnds ? (
                            <button type="button"
                                className="w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                                style={{ background: '#7ccf5a', color: '#070e08' }}
                                onClick={handleAdvance}
                            >
                                EXTRACT
                            </button>
                        ) : (
                            <button type="button"
                                className="w-full rounded py-3 text-[0.95rem] font-bold tracking-wide transition-transform active:scale-95"
                                style={{ background: '#112018', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                                onClick={handleAdvance}
                            >
                                CONTINUE →
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
