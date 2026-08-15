import { useState, useEffect } from 'react';
import { useStore } from '../state/store.ts';
import { NOSTALGIC_BASES, NOSTALGIC_SETS, getNostalgicSetById } from '../game/nostalgic.ts';
import type { NostalgicBase } from '../game/nostalgic.ts';
import { QUALITY_LABELS } from '../game/types.ts';
import type { TrophiedItem } from '../game/types.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

const RELIC_COLOR = '#FF69B4';
const TOTAL_BASES = NOSTALGIC_BASES.length; // 30

interface WorldFirst { baseId: string; name: string; username: string; quality: string }

function formatDate(ts: number): string {
    const d = new Date(ts);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(2)}`;
}

function QualityBadge({ quality }: { quality: string }) {
    return (
        <span className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold"
            style={{ background: RELIC_COLOR + '22', color: RELIC_COLOR, border: `1px solid ${RELIC_COLOR}44` }}>
            {QUALITY_LABELS[quality as keyof typeof QUALITY_LABELS] ?? quality.toUpperCase()}
        </span>
    );
}

function SetCard({ setId, trophiedItems }: { setId: string; trophiedItems: TrophiedItem[] }) {
    const set = getNostalgicSetById(setId);
    if (!set) return null;
    const trophiedBaseIds = new Set(trophiedItems.map(t => t.baseItemId));
    const completedCount = set.members.filter(m => trophiedBaseIds.has(m)).length;
    const isComplete = completedCount === set.members.length;

    return (
        <div className="rounded p-3" style={{
            background: isComplete ? '#1a0a14' : '#0e100e',
            border: `1px solid ${isComplete ? RELIC_COLOR + '44' : '#2a2a2a'}`,
        }}>
            <div className="flex items-center justify-between mb-1.5">
                <div className="text-[0.75rem] font-bold tracking-widest" style={{ color: isComplete ? RELIC_COLOR : '#6a5a6c' }}>
                    {set.name}
                </div>
                <div className="text-[0.68rem] font-bold" style={{ color: isComplete ? '#4ade80' : '#4a6a4c' }}>
                    {completedCount}/{set.members.length}
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-1.5">
                {set.members.map(memberId => {
                    const base = NOSTALGIC_BASES.find(b => b.id === memberId);
                    const trophy = trophiedItems.find(t => t.baseItemId === memberId);
                    return (
                        <div key={memberId}
                            className="rounded px-2 py-0.5 text-[0.65rem]"
                            style={{
                                background: trophy ? RELIC_COLOR + '18' : '#141414',
                                color: trophy ? RELIC_COLOR : '#3a3a3a',
                                border: `1px solid ${trophy ? RELIC_COLOR + '44' : '#2a2a2a'}`,
                            }}>
                            {base?.name.replace(/^"/, '').replace(/"$/, '') ?? memberId}
                            {trophy && <span style={{ color: '#4ade8088' }}> ✓</span>}
                        </div>
                    );
                })}
            </div>
            {isComplete && (
                <div className="text-[0.72rem] font-bold" style={{ color: RELIC_COLOR + 'cc' }}>
                    SET COMPLETE — {set.bonusDescription}
                </div>
            )}
            {!isComplete && (
                <div className="text-[0.68rem]" style={{ color: '#5a4a5c' }}>{set.bonusDescription}</div>
            )}
        </div>
    );
}

function TrophiedItemCard({ trophy, base }: { trophy: TrophiedItem; base: NostalgicBase | undefined }) {
    return (
        <div className="rounded p-2.5" style={{ background: '#120a10', border: `1px solid ${RELIC_COLOR}33` }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-[0.88rem] font-bold" style={{ color: RELIC_COLOR }}>
                        {base?.name ?? trophy.baseItemId}
                    </div>
                    {base?.description && (
                        <div className="mt-0.5 text-[0.72rem] leading-snug" style={{ color: '#8a6a8c' }}>
                            {base.description}
                        </div>
                    )}
                    {base?.realFact && (
                        <div className="mt-0.5 text-[0.68rem] italic" style={{ color: '#5a4a5c' }}>
                            {base.realFact}
                        </div>
                    )}
                </div>
                <div className="shrink-0 text-right">
                    <QualityBadge quality={trophy.quality} />
                    <div className="mt-1 text-[0.62rem]" style={{ color: '#5a4a5c' }}>
                        {formatDate(trophy.trophiedAt)}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface Props { onClose: () => void; }

export default function TrophyScreen({ onClose }: Props) {
    const trophiedItems = useStore(s => s.trophiedItems);
    const [worldFirsts, setWorldFirsts] = useState<WorldFirst[]>([]);
    const [feedLoaded, setFeedLoaded] = useState(false);

    const trophiedBaseIds = new Set(trophiedItems.map(t => t.baseItemId));
    const collectedCount = trophiedBaseIds.size;

    // Load world-first perfect trophies from leaderboard
    useEffect(() => {
        let alive = true;
        async function fetchWorldFirsts() {
            const results: WorldFirst[] = [];
            await Promise.allSettled(
                NOSTALGIC_BASES.map(async base => {
                    try {
                        const res = await RundotGameAPI.leaderboard.getPagedScores({
                            mode: `trophy-perfect-${base.id}`,
                            limit: 1,
                        });
                        if (res.entries[0]) {
                            results.push({ baseId: base.id, name: base.name, username: res.entries[0].username, quality: 'perfect' });
                        }
                    } catch {
                        // ignore
                    }
                })
            );
            if (alive) { setWorldFirsts(results); setFeedLoaded(true); }
        }
        fetchWorldFirsts();
        return () => { alive = false; };
    }, []);

    const setsWithTrophies = NOSTALGIC_SETS.filter(s =>
        s.members.some(m => trophiedBaseIds.has(m))
    );
    const soloTrophies = trophiedItems.filter(t => {
        const base = NOSTALGIC_BASES.find(b => b.id === t.baseItemId);
        return !base?.setId;
    });

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.97)', zIndex: 80 }}>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3"
                style={{ borderBottom: `1px solid ${RELIC_COLOR}33` }}>
                <div>
                    <h2 className="text-[1.1rem] font-bold tracking-widest" style={{ color: RELIC_COLOR }}>RELIC ROOM</h2>
                    <p className="text-[0.75rem]" style={{ color: '#6a4a6c' }}>
                        {collectedCount} / {TOTAL_BASES} relics trophied
                    </p>
                </div>
                <button type="button"
                    className="rounded px-3 py-1.5 text-[0.88rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#1a0a14', color: RELIC_COLOR, border: `1px solid ${RELIC_COLOR}44` }}
                    onClick={onClose}>
                    CLOSE
                </button>
            </div>

            <div className="scroll-area flex-1 px-4 py-3 space-y-4 pb-20">
                {/* Progress bar */}
                <div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a0a14' }}>
                        <div className="h-full rounded-full transition-[width] duration-500"
                            style={{ width: `${(collectedCount / TOTAL_BASES) * 100}%`, background: RELIC_COLOR }} />
                    </div>
                    <p className="mt-1 text-[0.7rem]" style={{ color: '#5a3a5c' }}>
                        Nostalgic relics are rare drops from medium+ danger zones.
                        Trophy them to preserve them in this room.
                    </p>
                </div>

                {/* World first feed */}
                {(worldFirsts.length > 0 || feedLoaded) && (
                    <div>
                        <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#5a3a5c' }}>
                            WORLD FIRSTS — PERFECT RELICS
                        </div>
                        {!feedLoaded && (
                            <div className="text-[0.75rem]" style={{ color: '#3a2a3c' }}>Loading...</div>
                        )}
                        {feedLoaded && worldFirsts.length === 0 && (
                            <div className="rounded p-3 text-center" style={{ background: '#0a080c', border: `1px solid ${RELIC_COLOR}22` }}>
                                <p className="text-[0.78rem]" style={{ color: '#4a3a4c' }}>
                                    No perfect relics trophied globally yet.
                                </p>
                            </div>
                        )}
                        {worldFirsts.length > 0 && (
                            <div className="space-y-1.5">
                                {worldFirsts.map(wf => (
                                    <div key={wf.baseId} className="rounded px-3 py-2 flex items-center gap-2"
                                        style={{ background: '#120a10', border: `1px solid ${RELIC_COLOR}22` }}>
                                        <span className="text-[0.7rem]" style={{ color: RELIC_COLOR }}>★</span>
                                        <span className="text-[0.75rem] flex-1" style={{ color: '#8a6a8a' }}>
                                            <span className="font-bold" style={{ color: '#b0a0b2' }}>{wf.username}</span>
                                            {' trophied '}
                                            <span style={{ color: RELIC_COLOR }}>{wf.name}</span>
                                            {' (Perfect)'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sets */}
                {NOSTALGIC_SETS.length > 0 && (
                    <div>
                        <div className="text-[0.7rem] font-bold tracking-widest mb-1.5" style={{ color: '#5a3a5c' }}>
                            RELIC SETS
                        </div>
                        <div className="space-y-2">
                            {NOSTALGIC_SETS.map(set => (
                                <SetCard key={set.id} setId={set.id} trophiedItems={trophiedItems} />
                            ))}
                        </div>
                    </div>
                )}

                {/* My trophied items */}
                {trophiedItems.length > 0 ? (
                    <>
                        {setsWithTrophies.map(set => {
                            const setTrophies = trophiedItems.filter(t => {
                                const base = NOSTALGIC_BASES.find(b => b.id === t.baseItemId);
                                return base?.setId === set.id;
                            });
                            if (setTrophies.length === 0) return null;
                            return (
                                <div key={set.id}>
                                    <div className="text-[0.68rem] font-bold tracking-widests mb-1" style={{ color: RELIC_COLOR + '88' }}>
                                        {set.name}
                                    </div>
                                    <div className="space-y-1.5">
                                        {setTrophies.map(t => (
                                            <TrophiedItemCard
                                                key={t.itemId}
                                                trophy={t}
                                                base={NOSTALGIC_BASES.find(b => b.id === t.baseItemId)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {soloTrophies.length > 0 && (
                            <div>
                                <div className="text-[0.68rem] font-bold tracking-widests mb-1" style={{ color: RELIC_COLOR + '88' }}>
                                    SOLO RELICS
                                </div>
                                <div className="space-y-1.5">
                                    {soloTrophies.map(t => (
                                        <TrophiedItemCard
                                            key={t.itemId}
                                            trophy={t}
                                            base={NOSTALGIC_BASES.find(b => b.id === t.baseItemId)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="rounded p-4 text-center" style={{ background: '#0a080c', border: `1px solid ${RELIC_COLOR}22` }}>
                        <p className="text-[0.9rem] font-bold" style={{ color: '#4a3a4c' }}>No relics trophied yet.</p>
                        <p className="mt-1 text-[0.75rem]" style={{ color: '#3a2a3c' }}>
                            Find nostalgic items in the ruins and trophy them from your bag.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
