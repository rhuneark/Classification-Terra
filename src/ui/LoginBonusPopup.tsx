import { store, useStore } from '../state/store.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

export default function LoginBonusPopup() {
    const bonus = useStore(s => s.loginBonus);
    if (!bonus) return null;

    function handleClaim() {
        store.patch({ loginBonus: null });
        RundotGameAPI.analytics.recordCustomEvent('daily_bonus_claimed', {
            scrip: bonus!.scrip,
            streak: bonus!.streak,
        }).catch(() => {});
    }

    const streakLabel = bonus.streak >= 7 ? 'MAX STREAK' : `DAY ${bonus.streak}`;

    return (
        <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 90 }}>
            <div className="w-full max-w-sm rounded p-5" style={{ background: '#0e2010', border: '1px solid #3a6e3c' }}>
                <div className="text-center">
                    <div className="text-[0.72rem] font-bold tracking-widest mb-2" style={{ color: '#4a8e4c' }}>
                        DAILY RETURN BONUS
                    </div>
                    <div className="text-[2rem] font-bold" style={{ color: '#fb923c' }}>
                        +{bonus.scrip}
                    </div>
                    <div className="text-[1rem]" style={{ color: '#8a7a60' }}>scrip</div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                        {Array.from({ length: 7 }, (_, i) => (
                            <div
                                key={i}
                                className="flex h-6 w-6 items-center justify-center rounded text-[0.6rem] font-bold"
                                style={{
                                    background: i < bonus.streak ? '#1a4e1c' : '#0a1a0c',
                                    border: `1px solid ${i < bonus.streak ? '#4ade80' : '#1a2816'}`,
                                    color: i < bonus.streak ? '#4ade80' : '#2a4a2c',
                                }}
                            >
                                {i < bonus.streak ? '✓' : i + 1}
                            </div>
                        ))}
                    </div>
                    <div className="mt-1 text-[0.72rem] font-bold tracking-wide" style={{ color: '#6a9e6c' }}>
                        {streakLabel} — {bonus.streak >= 7 ? 'Streak maxed' : `${7 - bonus.streak} more for max bonus`}
                    </div>

                    {bonus.streak >= 7 && (
                        <div className="mt-2 text-[0.78rem]" style={{ color: '#bcd4bd' }}>
                            Streak maxed. Keep coming back to hold it.
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#070e08' }}
                    onClick={handleClaim}
                >
                    CLAIM
                </button>
            </div>
        </div>
    );
}
