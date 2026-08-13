import { store, useStore } from '../state/store.ts';
import type { GameScreen as GameScreenType } from '../game/types.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import LootScreen from './LootScreen.tsx';
import BackpackScreen from './BackpackScreen.tsx';
import ArenaScreen from './ArenaScreen.tsx';
import TraderScreen from './TraderScreen.tsx';
import PassiveResultsPopup from './PassiveResultsPopup.tsx';

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

    function handleTab(id: GameScreenType) {
        store.patch({ screen: id, selectedInventoryItemId: null });
    }

    return (
        <div className="flex h-full flex-col" style={{ background: '#050d07' }}>
            {/* Top status bar */}
            <div
                className="shrink-0 flex items-center justify-between px-4 py-2 pt-safe-top"
                style={{ background: '#060e08', borderBottom: '1px solid #0b1a0d' }}
            >
                <div className="flex items-center gap-3">
                    <div className="text-[0.8rem]" style={{ color: '#4ade80' }}>
                        ⚡ {energy}<span style={{ color: '#2a3a2c' }}>/{maxEnergy}</span>
                    </div>
                    <div className="text-[0.8rem]" style={{ color: '#fb923c' }}>
                        {currency} <span style={{ color: '#4a3020' }}>scrip</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[0.8rem] font-bold text-white">
                        WC <span style={{ color: wc > 0 ? '#7ccf5a' : '#3a4a3c' }}>{wc}</span>
                    </div>
                </div>
            </div>

            {/* Screen content */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
                {screen === 'loot' && <LootScreen />}
                {screen === 'backpack' && <BackpackScreen />}
                {screen === 'arena' && <ArenaScreen />}
                {screen === 'trader' && <TraderScreen />}

                {/* Passive results popup */}
                <PassiveResultsPopup />

                {/* Paused overlay */}
                {paused && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)', zIndex: 60 }}>
                        <div className="text-[1.5rem] font-bold tracking-widest text-primary">PAUSED</div>
                    </div>
                )}
            </div>

            {/* Bottom tab bar */}
            <div
                className="shrink-0 grid pb-safe-bottom"
                style={{
                    gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
                    background: '#060e08',
                    borderTop: '1px solid #0b1a0d',
                }}
            >
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className="py-3 text-[0.7rem] font-bold tracking-widest transition-colors active:opacity-70"
                        style={{
                            color: screen === tab.id ? '#7ccf5a' : '#3a4a3c',
                            borderBottom: screen === tab.id ? '2px solid #7ccf5a' : '2px solid transparent',
                        }}
                        onClick={() => handleTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
