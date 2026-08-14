import { useState, useEffect } from 'react';
import { useStore } from '../state/store.ts';
import { PAPERCLIPS, CLASSIFIED_PAPERCLIP } from '../game/items.ts';
import { RARITY_COLORS } from '../game/types.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

interface Props { onClose: () => void; }

export default function ExplorerBoard({ onClose }: Props) {
    const foundUniqueIds = useStore(s => s.foundUniqueIds);
    const foundCount = foundUniqueIds.filter(id => id !== CLASSIFIED_PAPERCLIP.id).length;
    const hasClassified = foundUniqueIds.includes(CLASSIFIED_PAPERCLIP.id);

    const [firstFinders, setFirstFinders] = useState<Record<string, string | null>>({});
    const [findersLoaded, setFindersLoaded] = useState(false);

    useEffect(() => {
        let alive = true;
        async function fetchFinders() {
            const map: Record<string, string | null> = {};
            const allModes = [
                ...PAPERCLIPS.map((_, idx) => ({ id: PAPERCLIPS[idx].id, mode: `paperclip-${10 - idx}` })),
                { id: CLASSIFIED_PAPERCLIP.id, mode: 'paperclip-11' },
            ];
            await Promise.allSettled(
                allModes.map(async ({ id, mode }) => {
                    try {
                        const res = await RundotGameAPI.leaderboard.getPagedScores({ mode, limit: 1 });
                        map[id] = res.entries[0]?.username ?? null;
                    } catch {
                        map[id] = null;
                    }
                })
            );
            if (alive) { setFirstFinders(map); setFindersLoaded(true); }
        }
        fetchFinders();
        return () => { alive = false; };
    }, []);

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.95)', zIndex: 80 }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #2a4e2c' }}>
                <div>
                    <h2 className="text-[1.1rem] font-bold tracking-widest text-primary">EXPLORER BOARD</h2>
                    <p className="text-[0.78rem]" style={{ color: '#8acc8c' }}>
                        The 10 Paperclips — {foundCount}/10 found
                    </p>
                </div>
                <button type="button"
                    className="rounded px-3 py-1.5 text-[0.88rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                    onClick={onClose}>
                    CLOSE
                </button>
            </div>

            <div className="scroll-area flex-1 px-4 py-3">
                <p className="mb-3 text-[0.85rem] leading-snug" style={{ color: '#9ab89c' }}>
                    Said to buy you anything left in the world. 10 exist. Their locations are unknown.
                    Most have never been found.
                </p>

                <div className="space-y-2">
                    {PAPERCLIPS.map((pc, idx) => {
                        const isFound = foundUniqueIds.includes(pc.id);
                        const number = 10 - idx;
                        const rateLabel = pc.uniqueDropRate
                            ? `1 in ${(1 / pc.uniqueDropRate).toLocaleString()}`
                            : '—';
                        const finderName = firstFinders[pc.id];

                        return (
                            <div key={pc.id} className="rounded p-3"
                                style={{
                                    background: isFound ? '#160820' : '#0c1e0e',
                                    border: `1px solid ${isFound ? RARITY_COLORS.unique + '66' : '#2a4e2c'}`,
                                }}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 flex items-center justify-center rounded text-[0.75rem] font-bold"
                                        style={{
                                            width: '30px', height: '30px',
                                            background: isFound ? RARITY_COLORS.unique + '22' : '#0e2010',
                                            color: isFound ? RARITY_COLORS.unique : '#4a6a4c',
                                            border: `1px solid ${isFound ? RARITY_COLORS.unique + '55' : '#2a4e2c'}`,
                                        }}>
                                        #{number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[0.95rem] font-bold"
                                            style={{ color: isFound ? RARITY_COLORS.unique : '#4a7a4c' }}>
                                            {isFound ? pc.name : '???'}
                                        </div>
                                        <div className="mt-0.5 text-[0.8rem] leading-snug"
                                            style={{ color: isFound ? '#bcd4bd' : '#3a5a3c' }}>
                                            {isFound ? pc.description : 'Location unknown. Status: not found.'}
                                        </div>
                                        <div className="mt-1 flex gap-3 flex-wrap">
                                            {isFound && (
                                                <span className="text-[0.72rem] font-bold" style={{ color: '#4ade80' }}>DISCOVERED</span>
                                            )}
                                            <span className="text-[0.72rem]" style={{ color: '#6a9e6c' }}>
                                                Drop rate: {rateLabel}
                                            </span>
                                        </div>
                                        <div className="mt-1.5 pl-2" style={{ borderLeft: `2px solid ${isFound ? RARITY_COLORS.unique + '44' : '#2a4e2c'}` }}>
                                            {!findersLoaded ? (
                                                <span className="text-[0.72rem]" style={{ color: '#4a6a4c' }}>...</span>
                                            ) : finderName ? (
                                                <span className="text-[0.74rem]" style={{ color: '#8acc8c' }}>
                                                    World first: <span className="font-bold" style={{ color: '#b0e0b2' }}>{finderName}</span>
                                                </span>
                                            ) : (
                                                <span className="text-[0.72rem]" style={{ color: '#4a6a4c' }}>Not yet claimed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* #11 — only visible once claimed by someone, or if this player found it */}
                    {(hasClassified || (findersLoaded && !!firstFinders[CLASSIFIED_PAPERCLIP.id])) && <div className="rounded p-3"
                        style={{
                            background: hasClassified ? '#160820' : '#0c1e0e',
                            border: `1px solid ${hasClassified ? RARITY_COLORS.unique + '66' : '#2a3e2c'}`,
                        }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center rounded text-[0.7rem] font-bold"
                                style={{
                                    width: '30px', height: '30px',
                                    background: hasClassified ? RARITY_COLORS.unique + '22' : '#0e2010',
                                    color: hasClassified ? RARITY_COLORS.unique : '#4a6a4c',
                                    border: `1px solid ${hasClassified ? RARITY_COLORS.unique + '55' : '#2a4e2c'}`,
                                }}>
                                #11?
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[0.95rem] font-bold"
                                    style={{ color: hasClassified ? RARITY_COLORS.unique : '#4a7a4c' }}>
                                    {hasClassified ? CLASSIFIED_PAPERCLIP.name : '???'}
                                </div>
                                <div className="mt-0.5 text-[0.8rem] leading-snug"
                                    style={{ color: hasClassified ? '#bcd4bd' : '#3a5a3c' }}>
                                    {hasClassified
                                        ? CLASSIFIED_PAPERCLIP.description
                                        : 'Origin unknown. Not listed in official records.'}
                                </div>
                                <div className="mt-1 flex gap-3 flex-wrap">
                                    {hasClassified && (
                                        <span className="text-[0.72rem] font-bold" style={{ color: '#4ade80' }}>DISCOVERED</span>
                                    )}
                                    <span className="text-[0.72rem]" style={{ color: '#6a9e6c' }}>
                                        Drop rate: classified
                                    </span>
                                </div>
                                <div className="mt-1.5 pl-2" style={{ borderLeft: `2px solid ${hasClassified ? RARITY_COLORS.unique + '44' : '#2a4e2c'}` }}>
                                    {!findersLoaded ? (
                                        <span className="text-[0.72rem]" style={{ color: '#4a6a4c' }}>...</span>
                                    ) : firstFinders[CLASSIFIED_PAPERCLIP.id] ? (
                                        <span className="text-[0.74rem]" style={{ color: '#8acc8c' }}>
                                            World first: <span className="font-bold" style={{ color: '#b0e0b2' }}>{firstFinders[CLASSIFIED_PAPERCLIP.id]}</span>
                                        </span>
                                    ) : (
                                        <span className="text-[0.72rem]" style={{ color: '#4a6a4c' }}>Not yet claimed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>

                {foundCount === 0 && !hasClassified && (
                    <div className="mt-4 rounded p-3 text-center" style={{ background: '#0c1e0e', border: '1px solid #2a4e2c' }}>
                        <p className="text-[0.88rem]" style={{ color: '#6a9e6c' }}>
                            None found yet. Keep scavenging extreme locations.
                        </p>
                    </div>
                )}

                {foundCount === 10 && (
                    <div className="mt-4 rounded p-3 text-center" style={{ background: '#1a0820', border: `1px solid ${RARITY_COLORS.unique}44` }}>
                        <p className="text-[0.9rem] font-bold" style={{ color: RARITY_COLORS.unique }}>
                            All 10 found. {hasClassified ? 'And the other one.' : 'Something else is out there.'}
                        </p>
                    </div>
                )}

                <div style={{ height: '16px' }} />
            </div>
        </div>
    );
}
