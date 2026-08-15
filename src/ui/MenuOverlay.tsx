import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { updateSave } from '../state/save.ts';
import HowToPlay from './HowToPlay.tsx';
import ExplorerBoard from './ExplorerBoard.tsx';
import LogScreen from './LogScreen.tsx';
import TrophyScreen from './TrophyScreen.tsx';

interface Props { onClose: () => void; }

export default function MenuOverlay({ onClose }: Props) {
    const muteMusic = useStore(s => s.muteMusic);
    const muteSfx = useStore(s => s.muteSfx);
    const [showHtp, setShowHtp] = useState(false);
    const [showExplorer, setShowExplorer] = useState(false);
    const [showLog, setShowLog] = useState(false);
    const [showTrophy, setShowTrophy] = useState(false);

    function toggleMusic() {
        const next = !muteMusic;
        store.patch({ muteMusic: next });
        updateSave({ muteMusic: next });
    }

    function toggleSfx() {
        const next = !muteSfx;
        store.patch({ muteSfx: next });
        updateSave({ muteSfx: next });
    }

    function returnToTitle() {
        store.patch({ phase: 'menu', screen: 'loot' });
        onClose();
    }

    if (showHtp) return <HowToPlay onClose={() => setShowHtp(false)} />;
    if (showExplorer) return <ExplorerBoard onClose={() => setShowExplorer(false)} />;
    if (showTrophy) return <TrophyScreen onClose={() => setShowTrophy(false)} />;
    if (showLog) return (
        <div className="absolute inset-0 flex flex-col" style={{ background: '#070e08', zIndex: 80 }}>
            <div className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #1a3e1c' }}>
                <button type="button"
                    className="rounded px-3 py-1.5 text-[0.88rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                    onClick={() => setShowLog(false)}>
                    ← BACK
                </button>
                <h2 className="text-[1.1rem] font-bold tracking-widest text-primary">EVENT LOG</h2>
            </div>
            <div className="flex-1 overflow-hidden">
                <LogScreen />
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)', zIndex: 80 }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #1a3e1c' }}>
                <h2 className="text-[1.1rem] font-bold tracking-widest text-primary">MENU</h2>
                <button
                    type="button"
                    className="rounded px-3 py-1.5 text-[0.88rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                    onClick={onClose}
                >
                    RESUME
                </button>
            </div>

            <div className="flex flex-col gap-2 p-4">
                <MenuBtn label="HOW TO PLAY" onClick={() => setShowHtp(true)} />
                <MenuBtn label="EXPLORER BOARD" sublabel="The 10 Paperclips" onClick={() => setShowExplorer(true)} />
                <MenuBtn label="RELIC ROOM" sublabel="Nostalgic trophies" onClick={() => setShowTrophy(true)} />
                <MenuBtn label="EVENT LOG" sublabel="Recent activity" onClick={() => setShowLog(true)} />

                {/* Toggle rows */}
                <div
                    className="flex items-center justify-between rounded px-4 py-3"
                    style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}
                >
                    <span className="text-[0.95rem] font-bold" style={{ color: '#c8e0ca' }}>MUSIC</span>
                    <button
                        type="button"
                        className="rounded px-4 py-1.5 text-[0.85rem] font-bold transition-transform active:scale-95"
                        style={{
                            background: muteMusic ? '#1a0000' : '#0b2e0d',
                            color: muteMusic ? '#f97316' : '#4ade80',
                            border: `1px solid ${muteMusic ? '#4a0a0a' : '#1a5e1c'}`,
                        }}
                        onClick={toggleMusic}
                    >
                        {muteMusic ? 'MUTED' : 'ON'}
                    </button>
                </div>

                <div
                    className="flex items-center justify-between rounded px-4 py-3"
                    style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}
                >
                    <span className="text-[0.95rem] font-bold" style={{ color: '#c8e0ca' }}>SOUND FX</span>
                    <button
                        type="button"
                        className="rounded px-4 py-1.5 text-[0.85rem] font-bold transition-transform active:scale-95"
                        style={{
                            background: muteSfx ? '#1a0000' : '#0b2e0d',
                            color: muteSfx ? '#f97316' : '#4ade80',
                            border: `1px solid ${muteSfx ? '#4a0a0a' : '#1a5e1c'}`,
                        }}
                        onClick={toggleSfx}
                    >
                        {muteSfx ? 'MUTED' : 'ON'}
                    </button>
                </div>

                <div className="mt-2">
                    <button
                        type="button"
                        className="w-full rounded py-3 text-[0.95rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{ background: '#1a0000', color: '#f97316', border: '1px solid #4a0a0a' }}
                        onClick={returnToTitle}
                    >
                        RETURN TO TITLE
                    </button>
                </div>
            </div>
        </div>
    );
}

function MenuBtn({ label, sublabel, onClick }: { label: string; sublabel?: string; onClick: () => void }) {
    return (
        <button
            type="button"
            className="flex w-full items-center justify-between rounded px-4 py-3 transition-transform active:scale-98"
            style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}
            onClick={onClick}
        >
            <div>
                <div className="text-left text-[0.95rem] font-bold" style={{ color: '#c8e0ca' }}>{label}</div>
                {sublabel && <div className="text-left text-[0.72rem]" style={{ color: '#6aaa6c' }}>{sublabel}</div>}
            </div>
            <span style={{ color: '#3a5e3c' }}>›</span>
        </button>
    );
}
