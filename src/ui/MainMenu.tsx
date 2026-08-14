import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import HowToPlay from './HowToPlay.tsx';
import ExplorerBoard from './ExplorerBoard.tsx';
import WorldLoreModal from './WorldLoreModal.tsx';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';
import { exportMusicWav } from '../game/audio.ts';

export default function MainMenu() {
    const loadout = useStore((s) => s.loadout);
    const currency = useStore((s) => s.currency);
    const wc = computeWeightClass(loadout);
    const [showHtp, setShowHtp] = useState(false);
    const [showExplorer, setShowExplorer] = useState(false);
    const [showLore, setShowLore] = useState(false);
    const [titleTaps, setTitleTaps] = useState(0);
    const [showPromo, setShowPromo] = useState(false);
    const [promoStatus, setPromoStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');

    function handleTitleTap() {
        const next = titleTaps + 1;
        setTitleTaps(next);
        if (next >= 5) { setShowPromo(true); setTitleTaps(0); }
    }

    async function handlePromoGen() {
        setPromoStatus('generating');
        try {
            await exportMusicWav(3);
            setPromoStatus('done');
        } catch {
            setPromoStatus('error');
        }
    }

    function handlePlay() {
        store.patch({ phase: 'playing', screen: 'loot' });
        RundotGameAPI.analytics.recordCustomEvent('menu_play_pressed').catch(() => {});
    }

    if (showHtp) return (
        <div className="relative h-full" style={{ background: '#0b1a0d' }}>
            <HowToPlay onClose={() => setShowHtp(false)} />
        </div>
    );

    if (showExplorer) return (
        <div className="relative h-full" style={{ background: '#0b1a0d' }}>
            <ExplorerBoard onClose={() => setShowExplorer(false)} />
        </div>
    );

    return (
        <div className="relative flex h-full flex-col items-center justify-center gap-6 px-8" style={{ background: '#0b1a0d' }}>
            <div className="text-center">
                <h1 className="text-[2rem] font-bold tracking-widest text-primary" onClick={handleTitleTap}>CLASSIFICATION:</h1>
                <div className="text-[1.25rem] font-bold tracking-[0.18em]" style={{ color: '#4ade80' }}>TERRA</div>
                <p className="mt-2 text-[0.78rem] tracking-widest leading-relaxed" style={{ color: '#5a8a5c' }}>
                    SURVIVE THE RUINS.<br />CLASSIFY WHAT THE INFECTION MADE.
                </p>
            </div>

            {wc > 0 && (
                <div className="rounded px-6 py-3 text-center text-[0.85rem] tracking-wide"
                    style={{ background: '#102010', border: '1px solid #1e3820' }}>
                    <div style={{ color: '#4ade80' }}>CURRENT LOADOUT</div>
                    <div className="mt-1 text-xl font-bold text-white">WC {wc}</div>
                    <div className="mt-1" style={{ color: '#8aaa8c' }}>{currency} scrip</div>
                </div>
            )}

            <div className="w-full max-w-xs space-y-3">
                <button type="button"
                    className="w-full rounded px-8 py-4 text-[1.2rem] font-bold tracking-widest transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#070e08' }}
                    onClick={handlePlay}>
                    ENTER THE RUINS
                </button>

                <button type="button"
                    className="w-full rounded px-6 py-3 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#102010', color: '#bcd4bd', border: '1px solid #2c4a2e' }}
                    onClick={() => {
                        setShowLore(true);
                        RundotGameAPI.analytics.recordCustomEvent('menu_lore_opened').catch(() => {});
                    }}>
                    THE TERRAS
                    <span className="ml-2 text-[0.7rem]" style={{ color: '#4a7a4c' }}>World &amp; Lore</span>
                </button>

                <button type="button"
                    className="w-full rounded px-6 py-3 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#102010', color: '#bcd4bd', border: '1px solid #2c4a2e' }}
                    onClick={() => setShowHtp(true)}>
                    HOW TO PLAY
                </button>

                <button type="button"
                    className="w-full rounded px-6 py-3 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#102010', color: '#bcd4bd', border: '1px solid #2c4a2e' }}
                    onClick={() => setShowExplorer(true)}>
                    EXPLORER BOARD
                    <span className="ml-2 text-[0.72rem]" style={{ color: '#5aaa5c' }}>The 10 Paperclips</span>
                </button>
            </div>

            {showPromo && (
                <div className="w-full max-w-xs rounded p-3 text-center" style={{ background: '#0a1a10', border: '1px solid #22ddee44' }}>
                    <div className="text-[0.7rem] font-bold tracking-widest mb-2" style={{ color: '#22ddee' }}>PROMO AUDIO GENERATOR</div>
                    {promoStatus === 'idle' && (
                        <button type="button" className="w-full rounded py-2 text-[0.85rem] font-bold tracking-wide"
                            style={{ background: '#112a2e', color: '#22ddee', border: '1px solid #22ddee55' }}
                            onClick={handlePromoGen}>
                            GENERATE 90s TRACK
                        </button>
                    )}
                    {promoStatus === 'generating' && (
                        <p className="text-[0.82rem]" style={{ color: '#8aaa8c' }}>Rendering... takes a few seconds</p>
                    )}
                    {promoStatus === 'done' && (
                        <p className="text-[0.75rem]" style={{ color: '#4ade80' }}>Download started — check your downloads folder</p>
                    )}
                    {promoStatus === 'error' && (
                        <p className="text-[0.8rem]" style={{ color: '#f97316' }}>Generation failed — try again</p>
                    )}
                </div>
            )}

            {showLore && (
                <WorldLoreModal onClose={() => setShowLore(false)} />
            )}
        </div>
    );
}
