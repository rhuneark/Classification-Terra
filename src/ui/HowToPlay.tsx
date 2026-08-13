interface Props { onClose: () => void; }

export default function HowToPlay({ onClose }: Props) {
    const sections: Array<{ title: string; body: string[] }> = [
        {
            title: 'THE LOOP',
            body: [
                'Scavenge ruins to find gear.',
                'Found items go to your Research Lab. Wait for the timer.',
                'Researched items move to your Safe House. Equip them.',
                'Fight arena opponents to earn scrip. Repeat.',
            ],
        },
        {
            title: 'ENERGY',
            body: [
                'Max 20 energy. Each location costs 1-3.',
                'Regens 1 per 5 minutes offline.',
                'Buy Regen Pots at the Outpost. Energy Drink speeds regen for 30 min.',
            ],
        },
        {
            title: 'WEIGHT CLASS',
            body: [
                'Your WC = sum of all equipped item power.',
                'COMBO: 3+ BIO items = +15% WC.',
                'COMBO: 2+ HAZMAT items = +20 WC flat.',
                'Higher WC = better arena odds.',
            ],
        },
        {
            title: 'RESEARCH',
            body: [
                'Every item you find needs time before it\'s ready.',
                'Common: 1-3 min. Rare: 5-15 min. Legendary: 20-30 min.',
                'Magnifying Glasses cut research time.',
                'Consumables (pots, drinks) skip the queue.',
            ],
        },
        {
            title: 'ARENA',
            body: [
                'Pick an opponent. WC determines win odds.',
                'Win: earn scrip. Sometimes get an item.',
                'Lose: small consolation scrip. Risk losing gear.',
                'Passive battles happen while you\'re offline.',
            ],
        },
        {
            title: 'THE PAPERCLIPS',
            body: [
                '10 exist. All one-of-a-kind.',
                'Said to buy you anything left in the world.',
                'Drop only from the most dangerous locations.',
                'The rarest is 1 in 50,000. The most common: 1 in 10,000.',
                'Nobody has found one yet.',
            ],
        },
        {
            title: 'RARITY',
            body: [
                'COMMON (grey) → UNCOMMON (green) → RARE (blue)',
                'EPIC (purple) → LEGENDARY (orange) → ONE-OF-A-KIND (red)',
                'Higher rarity = higher power = better odds in arena.',
            ],
        },
    ];

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)', zIndex: 80 }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #1a3e1c' }}>
                <h2 className="text-[1.1rem] font-bold tracking-widest text-primary">HOW TO PLAY</h2>
                <button
                    type="button"
                    className="rounded px-3 py-1.5 text-[0.88rem] font-bold transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2a5e2c' }}
                    onClick={onClose}
                >
                    CLOSE
                </button>
            </div>

            <div className="scroll-area flex-1 px-4 py-3 space-y-4">
                {sections.map(s => (
                    <div key={s.title}>
                        <div className="mb-1.5 text-[0.75rem] font-bold tracking-widest" style={{ color: '#5aaa5c' }}>
                            {s.title}
                        </div>
                        <div className="space-y-1">
                            {s.body.map((line, i) => (
                                <div key={i} className="flex gap-2 text-[0.9rem] leading-snug">
                                    <span style={{ color: '#2a5e2c', flexShrink: 0 }}>›</span>
                                    <span style={{ color: '#c8e0ca' }}>{line}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="rounded p-3 text-[0.85rem]" style={{ background: '#0e2010', border: '1px solid #1a3e1c' }}>
                    <span style={{ color: '#7ccf5a' }}>TIP: </span>
                    <span style={{ color: '#a0c0a4' }}>
                        Instant scrap any item for 1 scrip. Useful when your Safe House is full and you need space.
                    </span>
                </div>

                <div style={{ height: '16px' }} />
            </div>
        </div>
    );
}
