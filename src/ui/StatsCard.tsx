import { useStore } from '../state/store.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import { getSave } from '../state/save.ts';
import { PAPERCLIPS } from '../game/items.ts';

interface Props { onClose: () => void; }

export default function StatsCard({ onClose }: Props) {
    const loadout = useStore(s => s.loadout);
    const foundUniqueIds = useStore(s => s.foundUniqueIds);
    const currency = useStore(s => s.currency);
    const wc = computeWeightClass(loadout);
    const save = getSave();

    const equippedCount = Object.values(loadout).filter(Boolean).length;
    const winRate = save.totalBattles > 0 ? Math.round((save.wins / save.totalBattles) * 100) : 0;
    const paperclipsFound = foundUniqueIds.filter(id => PAPERCLIPS.some(p => p.id === id)).length;

    const rows: Array<{ label: string; value: string; color?: string }> = [
        { label: 'Weight Class', value: `${wc}`, color: '#4ade80' },
        { label: 'Slots Equipped', value: `${equippedCount}/8` },
        { label: 'Current Scrip', value: `${currency}`, color: '#fb923c' },
        { label: 'Total Scrip Earned', value: `${(save.totalScrip ?? 0) + currency}`, color: '#fb923c' },
        { label: 'Battles Fought', value: `${save.totalBattles}` },
        { label: 'Victories', value: `${save.wins} (${winRate}%)`, color: save.wins > 0 ? '#4ade80' : undefined },
        { label: 'Defeats', value: `${save.totalBattles - save.wins}` },
        { label: 'Locations Scavenged', value: `${save.totalScavenges ?? 0}` },
        { label: 'Ambushes Survived', value: `${save.totalAmbushes ?? 0}` },
        { label: 'Paperclips Found', value: `${paperclipsFound}/10`, color: paperclipsFound > 0 ? '#f43f5e' : undefined },
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.88)', zIndex: 80 }}>
            <div className="w-full max-w-sm rounded p-5" style={{ background: '#0e2010', border: '1px solid #243e26' }}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[1.1rem] font-bold tracking-widest text-primary">FIELD REPORT</h2>
                    <button
                        type="button"
                        className="rounded px-3 py-1 text-[0.85rem] font-bold transition-transform active:scale-95"
                        style={{ background: '#1a2e1c', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                        onClick={onClose}
                    >
                        CLOSE
                    </button>
                </div>

                <div className="divide-y" style={{ borderColor: '#1a3e1c' }}>
                    {rows.map(row => (
                        <div key={row.label} className="flex justify-between py-2 text-[0.88rem]">
                            <span style={{ color: '#8aaa8c' }}>{row.label}</span>
                            <span className="font-bold" style={{ color: row.color ?? '#c8e0ca' }}>
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>

                {paperclipsFound > 0 && (
                    <div className="mt-3 rounded p-2 text-center text-[0.78rem]" style={{ background: '#160820', border: '1px solid #f43f5e33' }}>
                        <span style={{ color: '#f43f5e' }}>
                            {paperclipsFound === 10
                                ? 'You found all 10 paperclips. Legendary.'
                                : `You found ${paperclipsFound} paperclip${paperclipsFound > 1 ? 's' : ''}. Remarkable.`}
                        </span>
                    </div>
                )}

                {save.totalBattles === 0 && (
                    <p className="mt-3 text-[0.78rem] text-center" style={{ color: '#3a5a3c' }}>
                        No battles yet. The arena awaits.
                    </p>
                )}
            </div>
        </div>
    );
}
