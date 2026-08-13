import { useStore } from '../state/store.ts';
import { PAPERCLIPS } from '../game/items.ts';
import { RARITY_COLORS } from '../game/types.ts';

interface Props { onClose: () => void; }

export default function ExplorerBoard({ onClose }: Props) {
    const foundUniqueIds = useStore(s => s.foundUniqueIds);
    const foundCount = foundUniqueIds.length;

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)', zIndex: 80 }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #1a3e1c' }}>
                <div>
                    <h2 className="text-[1.1rem] font-bold tracking-widest text-primary">EXPLORER BOARD</h2>
                    <p className="text-[0.75rem]" style={{ color: '#6aaa6c' }}>
                        The 10 Paperclips &mdash; {foundCount}/10 found
                    </p>
                </div>
                <button
                    type="button"
                    className="rounded px-3 py-1.5 text-[0.88rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                    onClick={onClose}
                >
                    CLOSE
                </button>
            </div>

            <div className="scroll-area flex-1 px-4 py-3">
                <p className="mb-3 text-[0.82rem] leading-snug" style={{ color: '#8aaa8c' }}>
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

                        return (
                            <div
                                key={pc.id}
                                className="rounded p-3"
                                style={{
                                    background: isFound ? '#160820' : '#0a1a0c',
                                    border: `1px solid ${isFound ? RARITY_COLORS.unique + '66' : '#1a3e1c'}`,
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="flex-shrink-0 flex items-center justify-center rounded text-[0.75rem] font-bold"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            background: isFound ? RARITY_COLORS.unique + '22' : '#0e2010',
                                            color: isFound ? RARITY_COLORS.unique : '#3a5a3c',
                                            border: `1px solid ${isFound ? RARITY_COLORS.unique + '55' : '#1a3e1c'}`,
                                        }}
                                    >
                                        #{number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-[0.95rem] font-bold"
                                            style={{ color: isFound ? RARITY_COLORS.unique : '#2a4a2c' }}
                                        >
                                            {isFound ? pc.name : '???'}
                                        </div>
                                        <div
                                            className="mt-0.5 text-[0.78rem] leading-snug"
                                            style={{ color: isFound ? '#bcd4bd' : '#2a3a2c' }}
                                        >
                                            {isFound ? pc.description : 'Location unknown. Status: not found.'}
                                        </div>
                                        <div className="mt-1 flex gap-3">
                                            {isFound && (
                                                <span className="text-[0.7rem] font-bold" style={{ color: '#4ade80' }}>
                                                    DISCOVERED
                                                </span>
                                            )}
                                            <span className="text-[0.7rem]" style={{ color: '#4a6a4c' }}>
                                                Drop rate: {rateLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {foundCount === 0 && (
                    <div className="mt-4 rounded p-3 text-center" style={{ background: '#0e1a10', border: '1px solid #1a2e1c' }}>
                        <p className="text-[0.85rem]" style={{ color: '#4a6a4c' }}>
                            None found yet. Keep scavenging extreme locations.
                        </p>
                    </div>
                )}

                {foundCount === 10 && (
                    <div className="mt-4 rounded p-3 text-center" style={{ background: '#1a0820', border: `1px solid ${RARITY_COLORS.unique}44` }}>
                        <p className="text-[0.9rem] font-bold" style={{ color: RARITY_COLORS.unique }}>
                            All 10 found. Remarkable.
                        </p>
                    </div>
                )}

                <div style={{ height: '16px' }} />
            </div>
        </div>
    );
}
