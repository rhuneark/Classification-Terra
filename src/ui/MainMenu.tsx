import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import HowToPlay from './HowToPlay.tsx';
import ExplorerBoard from './ExplorerBoard.tsx';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

export default function MainMenu() {
    const backpack = useStore((s) => s.backpack);
    const currency = useStore((s) => s.currency);
    const wc = computeWeightClass(backpack);
    const [showHtp, setShowHtp] = useState(false);
    const [showExplorer, setShowExplorer] = useState(false);

    function handlePlay() {
        store.patch({ phase: 'playing', screen: 'loot' });
        RundotGameAPI.analytics.recordCustomEvent('menu_play_pressed').catch(() => {});
    }

    if (showHtp) return (
        <div className="relative h-full" style={{ background: '#050d07' }}>
            <HowToPlay onClose={() => setShowHtp(false)} />
        </div>
    );

    if (showExplorer) return (
        <div className="relative h-full" style={{ background: '#050d07' }}>
            <ExplorerBoard onClose={() => setShowExplorer(false)} />
        </div>
    );

    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 px-8" style={{ background: '#050d07' }}>
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-widest text-primary">SPORE RUN</h1>
                <p className="mt-2 text-[0.85rem] tracking-widest" style={{ color: '#6b7a6c' }}>
                    POST-APOC LOOT AUTO-BATTLER
                </p>
            </div>

            {wc > 0 && (
                <div className="rounded px-6 py-3 text-center text-[0.85rem] tracking-wide"
                    style={{ background: '#0b1a0d', border: '1px solid #1a2e1c' }}>
                    <div style={{ color: '#4ade80' }}>CURRENT LOADOUT</div>
                    <div className="mt-1 text-xl font-bold text-white">WC {wc}</div>
                    <div className="mt-1" style={{ color: '#8aaa8c' }}>{currency} scrip</div>
                </div>
            )}

            <div className="w-full max-w-xs space-y-3">
                <button type="button"
                    className="w-full rounded px-8 py-4 text-[1.2rem] font-bold tracking-widest transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#050d07' }}
                    onClick={handlePlay}>
                    ENTER THE RUINS
                </button>

                <button type="button"
                    className="w-full rounded px-6 py-3 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#bcd4bd', border: '1px solid #243e26' }}
                    onClick={() => setShowHtp(true)}>
                    HOW TO PLAY
                </button>

                <button type="button"
                    className="w-full rounded px-6 py-3 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#bcd4bd', border: '1px solid #243e26' }}
                    onClick={() => setShowExplorer(true)}>
                    EXPLORER BOARD
                    <span className="ml-2 text-[0.72rem]" style={{ color: '#5aaa5c' }}>The 10 Paperclips</span>
                </button>
            </div>

            <p className="text-center text-[0.75rem] leading-relaxed" style={{ color: '#3a4a3c' }}>
                The infection is ongoing.<br />
                So are you.
            </p>
        </div>
    );
}
