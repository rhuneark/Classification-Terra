import { useStore } from '../state/store.ts';
import LoadingScreen from './LoadingScreen.tsx';
import MainMenu from './MainMenu.tsx';
import GameScreen from './GameScreen.tsx';

export default function App() {
    const phase = useStore((s) => s.phase);
    return (
        <div id="app-frame" className="bg-surface text-white">
            {phase === 'loading' && <LoadingScreen />}
            {phase === 'menu' && <MainMenu />}
            {phase === 'playing' && (
                <div className="absolute inset-0">
                    <GameScreen />
                </div>
            )}
        </div>
    );
}
