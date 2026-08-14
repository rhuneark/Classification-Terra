import { useState } from 'react';
import { useStore } from '../state/store.ts';
import { TERRA_VARIANTS, FORMAT_LABELS, getSnippetsForTerra } from '../game/terras.ts';
import type { TerraVariant, LoreSnippet } from '../game/terras.ts';

const THREAT_COLORS: Record<string, string> = {
    low: '#4ade80',
    medium: '#22ddee',
    high: '#f97316',
    extreme: '#ffd060',
};

function SnippetCard({ snippet }: { snippet: LoreSnippet }) {
    const [expanded, setExpanded] = useState(false);
    const borderColor = {
        journal: '#8aaa8c55',
        research: '#60a5fa55',
        radio: '#fb923c55',
        cryptic: '#c084fc55',
    }[snippet.format];
    const labelColor = {
        journal: '#8aaa8c',
        research: '#60a5fa',
        radio: '#fb923c',
        cryptic: '#c084fc',
    }[snippet.format];

    return (
        <button
            type="button"
            className="w-full rounded p-3 text-left transition-transform active:scale-[0.99]"
            style={{ background: '#0a1810', border: `1px solid ${borderColor}` }}
            onClick={() => setExpanded(e => !e)}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-[0.65rem] font-bold tracking-widest" style={{ color: labelColor }}>
                    {FORMAT_LABELS[snippet.format]}
                </span>
                <span className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>
                    {expanded ? '▲' : '▼'}
                </span>
            </div>
            {snippet.source && (
                <div className="mt-0.5 text-[0.7rem] italic" style={{ color: '#5a7a5c' }}>
                    {snippet.source}
                </div>
            )}
            <p className={`mt-1.5 text-[0.82rem] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
                style={{ color: '#c4dcc5' }}>
                {snippet.text}
            </p>
        </button>
    );
}

function TerraEntry({ terra, collectedIds }: { terra: TerraVariant; collectedIds: string[] }) {
    const [open, setOpen] = useState(false);
    const discovered = terra.snippets.some(s => collectedIds.includes(s.id));
    const snippets = getSnippetsForTerra(terra.id, collectedIds);
    const threatColor = THREAT_COLORS[terra.threat];

    if (!discovered) {
        return (
            <div className="rounded p-4" style={{ background: '#0a1408', border: '1px solid #1a2a1c' }}>
                <div className="flex items-center gap-2">
                    <span className="text-[0.72rem] font-bold tracking-widest" style={{ color: '#2a4a2c' }}>
                        UNKNOWN SPECIMEN
                    </span>
                </div>
                <div className="mt-1 text-[0.78rem]" style={{ color: '#2a4a2c' }}>
                    Encounter terras in the ruins to unlock this entry.
                </div>
            </div>
        );
    }

    return (
        <div className="rounded overflow-hidden" style={{ border: '1px solid #2c4a2e' }}>
            <button
                type="button"
                className="w-full p-4 text-left transition-opacity active:opacity-70"
                style={{ background: '#0f2012' }}
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[1.05rem] font-bold tracking-wide text-white">
                                {terra.name}
                            </span>
                            <span className="rounded px-1.5 py-0.5 text-[0.58rem] font-bold tracking-widest"
                                style={{ background: threatColor + '22', color: threatColor }}>
                                {terra.threat.toUpperCase()}
                            </span>
                        </div>
                        <div className="mt-0.5 text-[0.68rem] font-bold tracking-wide" style={{ color: '#4a7a4c' }}>
                            {terra.classification}
                        </div>
                        <div className="mt-0.5 text-[0.7rem] italic" style={{ color: '#5a7a5c' }}>
                            {terra.formerlyKnownAs}
                        </div>
                    </div>
                    <div className="shrink-0 text-right">
                        <div className="text-[0.68rem]" style={{ color: '#4a6a4c' }}>{snippets.length} / {terra.snippets.length} logs</div>
                        <div className="mt-1 text-[0.75rem]" style={{ color: '#4a6a4c' }}>{open ? '▲' : '▼'}</div>
                    </div>
                </div>

                {!open && (
                    <p className="mt-2 text-[0.78rem] leading-snug line-clamp-2" style={{ color: '#8aaa8c' }}>
                        {terra.description}
                    </p>
                )}
            </button>

            {open && (
                <div className="px-4 pb-4 pt-2 space-y-3" style={{ background: '#0a1810', borderTop: '1px solid #1a3e1c' }}>
                    <div>
                        <div className="text-[0.68rem] font-bold tracking-widest mb-1" style={{ color: '#4a6a4c' }}>DESCRIPTION</div>
                        <p className="text-[0.82rem] leading-relaxed" style={{ color: '#bcd4bd' }}>{terra.description}</p>
                    </div>
                    <div>
                        <div className="text-[0.68rem] font-bold tracking-widest mb-1" style={{ color: '#4a6a4c' }}>FIELD SIGNS</div>
                        <p className="text-[0.82rem] italic leading-relaxed" style={{ color: '#8aaa8c' }}>{terra.signs}</p>
                    </div>
                    {snippets.length > 0 && (
                        <div>
                            <div className="text-[0.68rem] font-bold tracking-widest mb-2" style={{ color: '#4a6a4c' }}>
                                COLLECTED LOGS ({snippets.length})
                            </div>
                            <div className="space-y-2">
                                {snippets.map(s => <SnippetCard key={s.id} snippet={s} />)}
                            </div>
                        </div>
                    )}
                    {snippets.length < terra.snippets.length && (
                        <p className="text-[0.72rem]" style={{ color: '#2a4a2c' }}>
                            {terra.snippets.length - snippets.length} log{terra.snippets.length - snippets.length > 1 ? 's' : ''} not yet found.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CodexScreen() {
    const collectedLoreIds = useStore(s => s.collectedLoreIds);
    const discoveredCount = TERRA_VARIANTS.filter(t =>
        t.snippets.some(s => collectedLoreIds.includes(s.id))
    ).length;

    return (
        <div className="flex h-full flex-col" style={{ background: '#0d1a10' }}>
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1c3820' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[1rem] font-bold tracking-widest text-primary">FIELD CODEX</div>
                        <div className="text-[0.68rem] tracking-widest" style={{ color: '#4a7a4c' }}>
                            MUTATED FAUNA CLASSIFICATION
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[0.85rem] font-bold" style={{ color: '#7ccf5a' }}>
                            {discoveredCount} / {TERRA_VARIANTS.length}
                        </div>
                        <div className="text-[0.65rem]" style={{ color: '#4a6a4c' }}>ENTRIES FOUND</div>
                    </div>
                </div>
                <p className="mt-1 text-[0.72rem]" style={{ color: '#5a7a5c' }}>
                    Encounter terras and find documents to unlock entries.
                </p>
            </div>

            <div className="scroll-area flex-1 p-3 space-y-2">
                {TERRA_VARIANTS.map(terra => (
                    <TerraEntry key={terra.id} terra={terra} collectedIds={collectedLoreIds} />
                ))}
            </div>
        </div>
    );
}
