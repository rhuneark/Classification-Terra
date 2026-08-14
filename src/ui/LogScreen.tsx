import { useStore } from '../state/store.ts';
import { RARITY_COLORS } from '../game/types.ts';

export default function LogScreen() {
    const eventLog = useStore(s => s.eventLog);

    return (
        <div className="flex h-full flex-col" style={{ background: '#0d1a10' }}>
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #1c3820' }}>
                <div className="text-[1rem] font-bold tracking-widest text-primary">FIELD LOG</div>
                <p className="mt-0.5 text-[0.72rem]" style={{ color: '#6a8e6c' }}>
                    {eventLog.length} entries recorded.
                </p>
            </div>

            <div className="scroll-area flex-1 px-3 py-2">
                {eventLog.length === 0 && (
                    <p className="mt-8 text-center text-[0.85rem]" style={{ color: '#4a6a4c' }}>
                        No activity yet. Get out there.
                    </p>
                )}
                {eventLog.map(entry => (
                    <div key={entry.id} className="border-b py-2" style={{ borderColor: '#1a2e1c' }}>
                        <div className="flex items-start gap-2">
                            <span className="shrink-0 text-[0.68rem] font-bold" style={{ color: typeColor(entry.type, entry.rarity) }}>
                                {typeLabel(entry.type, entry.rarity)}
                            </span>
                            <span className="text-[0.82rem] leading-snug" style={{ color: '#c4dcc5' }}>
                                {entry.message}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function typeLabel(type: string, rarity?: string): string {
    if (rarity) return `[${rarity.toUpperCase().slice(0, 3)}]`;
    switch (type) {
        case 'ambush': return '[AMB]';
        case 'battle-win': return '[WIN]';
        case 'battle-loss': return '[LOSS]';
        case 'lore': return '[LOG]';
        case 'trade': return '[TRD]';
        case 'info': return '[---]';
        default: return '[---]';
    }
}

function typeColor(type: string, rarity?: string): string {
    if (rarity) return RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] ?? '#9ca3af';
    switch (type) {
        case 'ambush': return '#f97316';
        case 'battle-win': return '#4ade80';
        case 'battle-loss': return '#ff3333';
        case 'lore': return '#c084fc';
        case 'trade': return '#60a5fa';
        default: return '#4a6a4c';
    }
}
