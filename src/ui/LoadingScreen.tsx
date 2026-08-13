import { useStore } from '../state/store.ts';

export default function LoadingScreen() {
    const progress = useStore((s) => s.loadProgress);
    const pct = Math.round(progress * 100);
    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 px-10" style={{ background: '#050d07' }}>
            <h1 className="text-3xl font-bold tracking-widest text-primary">SPORE RUN</h1>
            <p className="text-[0.85rem] tracking-widest" style={{ color: '#6b7a6c' }}>POST-APOC LOOT AUTO-BATTLER</p>
            <div
                className="h-2 w-full max-w-xs overflow-hidden rounded-full"
                style={{ background: '#0b1a0d' }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="h-full rounded-full transition-[width] duration-200 ease-out"
                    style={{ width: `${pct}%`, background: '#7ccf5a' }}
                />
            </div>
            <p className="text-[0.8rem]" style={{ color: '#4a5a4c' }}>Assessing damage... {pct}%</p>
        </div>
    );
}
