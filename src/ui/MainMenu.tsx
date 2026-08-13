import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import HowToPlay from './HowToPlay.tsx';
import ExplorerBoard from './ExplorerBoard.tsx';
import WorldLoreModal from './WorldLoreModal.tsx';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

export default function MainMenu() {
    const backpack = useStore((s) => s.backpack);
    const currency = useStore((s) => s.currency);
    const wc = computeWeightClass(backpack);
    const [showHtp, setShowHtp] = useState(false);
    const [showExplorer, setShowExplorer] = useState(false);
    const [showLore, setShowLore] = useState(false);

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
                <h1 className="text-[2rem] font-bold tracking-widest text-primary">CLASSIFICATION</h1>
                <div className="text-[1.25rem] font-bold tracking-[0.18em]" style={{ color: '#4ade80' }}>: TERRA</div>
                <p className="mt-2 text-[0.78rem] tracking-widest" style={{ color: '#5a8a5c' }}>
                    MUTATED FAUNA FIELD CODEX
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

            {showLore && (
                <WorldLoreModal onClose={() => setShowLore(false)} />
            )}
        </div>
    );
}
