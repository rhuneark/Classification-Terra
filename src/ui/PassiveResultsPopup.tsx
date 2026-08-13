import { store, useStore } from '../state/store.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

export default function PassiveResultsPopup() {
    const results = useStore((s) => s.passiveResults);
    if (!results) return null;

    function dismiss() {
        store.patch({ passiveResults: null });
        RundotGameAPI.analytics.recordCustomEvent('passive_results_dismissed').catch(() => {});
    }

    const hoursLabel = results.hoursAway < 1
        ? 'less than an hour'
        : results.hoursAway === 1
        ? '1 hour'
        : `${results.hoursAway} hours`;

    return (
        <div className="absolute inset-0 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 50 }}>
            <div
                className="w-full max-w-sm rounded p-6"
                style={{ background: '#0b1a0d', border: '1px solid #1a2e1c' }}
            >
                <h2 className="text-[1.1rem] font-bold tracking-wide text-primary">WHILE YOU WERE GONE</h2>
                <p className="mt-1 text-[0.85rem]" style={{ color: '#6b7a6c' }}>
                    You were away for {hoursLabel}.
                </p>

                <div className="mt-4 space-y-2">
                    {results.energyGained > 0 && (
                        <div className="flex justify-between text-[0.9rem]">
                            <span style={{ color: '#4ade80' }}>Energy restored</span>
                            <span className="font-bold text-white">+{results.energyGained}</span>
                        </div>
                    )}
                    {results.battlesCount > 0 && (
                        <>
                            <div className="flex justify-between text-[0.9rem]">
                                <span style={{ color: '#6b7a6c' }}>Passive battles</span>
                                <span className="font-bold text-white">{results.battlesCount}</span>
                            </div>
                            <div className="flex justify-between text-[0.9rem]">
                                <span style={{ color: '#4ade80' }}>Victories</span>
                                <span className="font-bold text-white">{results.wins}</span>
                            </div>
                            {results.losses > 0 && (
                                <div className="flex justify-between text-[0.9rem]">
                                    <span style={{ color: '#f97316' }}>Defeats</span>
                                    <span className="font-bold text-white">{results.losses}</span>
                                </div>
                            )}
                            {results.currencyGained > 0 && (
                                <div className="flex justify-between text-[0.9rem]">
                                    <span style={{ color: '#fb923c' }}>Scrip earned</span>
                                    <span className="font-bold text-white">+{results.currencyGained}</span>
                                </div>
                            )}
                        </>
                    )}
                    {results.battlesCount === 0 && results.energyGained === 0 && (
                        <p className="text-[0.85rem]" style={{ color: '#6b7a6c' }}>
                            Nothing notable. The ruins waited.
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    className="mt-6 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#050d07' }}
                    onClick={dismiss}
                >
                    CONTINUE
                </button>
            </div>
        </div>
    );
}
