import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import type { GameScreen as GameScreenType } from '../game/types.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import LootScreen from './LootScreen.tsx';
import BackpackScreen from './BackpackScreen.tsx';
import ArenaScreen from './ArenaScreen.tsx';
import TraderScreen from './TraderScreen.tsx';
import PassiveResultsPopup from './PassiveResultsPopup.tsx';
import MenuOverlay from './MenuOverlay.tsx';

const TABS: { id: GameScreenType; label: string }[] = [
    { id: 'loot', label: 'RUINS' },
    { id: 'backpack', label: 'LOADOUT' },
    { id: 'arena', label: 'ARENA' },
    { id: 'trader', label: 'OUTPOST' },
];

export default function GameScreen() {
    const screen = useStore(s => s.screen);
    const paused = useStore(s => s.paused);
    const energy = useStore(s => s.energy);
    const maxEnergy = useStore(s => s.maxEnergy);
    const currency = useStore(s => s.currency);
    const backpack = useStore(s => s.backpack);
    const wc = computeWeightClass(backpack);
    const [showMenu, setShowMenu] = useState(false);

    const energyPct = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;
    const energyColor = energy >= maxEnergy * 0.6 ? '#4ade80' : energy >= maxEnergy * 0.3 ? '#facc15' : '#f97316';

    function handleTab(id: GameScreenType) {
        store.patch({ screen: id, selectedInventoryItemId: null });
    }

    return (
        <div className="flex h-full flex-col" style={{ background: '#070e08' }}>
            {/* Top status bar */}
            <div className="shrink-0 px-4 pt-2 pb-1.5 pt-safe-top"
                style={{ background: '#0a1a0c', borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between gap-2">
                    {/* Energy */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#142816', width: '48px' }}>
                            <div className="h-full rounded-full" style={{ width: `${energyPct}%`, background: energyColor }} />
                        </div>
                        <span className="text-[0.8rem] font-bold tabular-nums" style={{ color: energyColor }}>
                            {energy}<span style={{ color: '#5a7e5c' }}>/{maxEnergy}</span>
                        </span>
                        <span className="text-[0.75rem]" style={{ color: '#6a9e6c' }}>⚡</span>
                    </div>
                    {/* Scrip */}
                    <div className="flex items-center gap-1">
                        <span className="text-[0.9rem] font-bold tabular-nums" style={{ color: '#fb923c' }}>{currency}</span>
                        <span className="text-[0.75rem]" style={{ color: '#8a7a60' }}>scrip</span>
                    </div>
                    {/* WC */}
                    <div className="flex items-center gap-1">
                        <span className="text-[0.72rem]" style={{ color: '#4a6a4c' }}>WC</span>
                        <span className="text-[0.9rem] font-bold" style={{ color: wc > 0 ? '#7ccf5a' : '#3a4a3c' }}>{wc}</span>
                    </div>
                    {/* Menu button */}
                    <button type="button"
                        className="rounded px-2 py-1 text-[0.72rem] font-bold tracking-wide transition-transform active:scale-95"
                        style={{ background: '#0e2010', color: '#6a8e6c', border: '1px solid #1a3e1c' }}
                        onClick={() => setShowMenu(true)}>
                        MENU
                    </button>
                </div>
            </div>

            {/* Screen content */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
                {screen === 'loot' && <LootScreen />}
                {screen === 'backpack' && <BackpackScreen />}
                {screen === 'arena' && <ArenaScreen />}
                {screen === 'trader' && <TraderScreen />}

                <PassiveResultsPopup />

                {paused && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.78)', zIndex: 60 }}>
                        <div className="text-[1.5rem] font-bold tracking-widest text-primary">PAUSED</div>
                    </div>
                )}

                {showMenu && <MenuOverlay onClose={() => setShowMenu(false)} />}
            </div>

            {/* Bottom tab bar */}
            <div className="shrink-0 grid pb-safe-bottom"
                style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, background: '#0a1a0c', borderTop: '1px solid #142816' }}>
                {TABS.map(tab => (
                    <button key={tab.id} type="button"
                        className="py-3 text-[0.72rem] font-bold tracking-widest transition-colors active:opacity-70"
                        style={{ color: screen === tab.id ? '#7ccf5a' : '#6a9e6c', borderBottom: screen === tab.id ? '2px solid #7ccf5a' : '2px solid transparent' }}
                        onClick={() => handleTab(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
