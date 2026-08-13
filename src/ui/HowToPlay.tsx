interface Props { onClose: () => void; }

const sections: Array<{ title: string; body: string[] }> = [
    {
        title: 'THE LOOP',
        body: [
            'Enter a Ruin to scavenge. Each run costs 1-4 energy.',
            'Items you find go to your Research Lab. Wait for them to finish.',
            'Researched items move to your Safe House. Equip them to raise your Weight Class.',
            'Passive battles earn scrip while you wait. Repeat.',
        ],
    },
    {
        title: 'ENERGY',
        body: [
            'You have 20 max. Ruins cost 1 (low danger) to 4 (extreme danger).',
            'Regenerates 1 every 5 minutes while offline.',
            'Regen Potions restore energy instantly. Buy them at the Outpost.',
        ],
    },
    {
        title: 'SCRIP',
        body: [
            'The world\'s currency. Earned from passive battles and selling items.',
            'Spend it at the Outpost on consumables, gear, and tools.',
            'Scrap any item from your backpack instantly for 1 scrip.',
        ],
    },
    {
        title: 'WEIGHT CLASS (WC)',
        body: [
            'Your WC = the sum of all equipped gear\'s power values.',
            'COMBO: Equip 3+ BIO items for +15% WC.',
            'COMBO: Equip 2+ HAZMAT items for +20 WC flat.',
            'Higher WC means better passive battle results and more scrip earned.',
        ],
    },
    {
        title: 'RESEARCH LAB',
        body: [
            'Every item found in the ruins must be researched before you can equip it.',
            'Common: 1-3 min.  Uncommon: 3-8 min.  Rare: 5-15 min.  Epic+: 20-30 min.',
            'Magnifying Glasses cut research time in half.',
            'Consumables (pots, drinks) skip the queue and go straight to your backpack.',
            'Safe House holds 6 items. Research queue holds 6. Scrap extras to make room.',
        ],
    },
    {
        title: 'PASSIVE BATTLES',
        body: [
            'While offline, your loadout automatically fights opponents.',
            'Win: earn scrip. Occasionally earn a bonus item.',
            'Lose: earn a small consolation scrip. You never lose gear from passive battles.',
            'Battle outcomes depend on WC. A stronger loadout wins more often.',
        ],
    },
    {
        title: 'THE RUINS',
        body: [
            'Four locations, four danger tiers: Low, Medium, High, and Extreme.',
            'Higher danger = better gear, higher rarity, and higher ambush risk.',
            'An ambush can cost you an inventory item or energy.',
            'Daily Scavenge Challenge: complete the day\'s run for +25 scrip.',
        ],
    },
    {
        title: 'THE OUTPOST',
        body: [
            'Buy consumables and gear here using scrip.',
            'Permanent stock: Magnifying Glasses (cut research time) and Regen Pots.',
            'Six rotating slots refresh every 2 minutes with random gear and consumables.',
            'Purchased rotating slots gray out until the next refresh.',
        ],
    },
    {
        title: 'THE CODEX',
        body: [
            'The Terras are 10 mutated creature variants found across the ruins.',
            'Codex entries start blank. Unlock them by encountering Terras or finding their documents.',
            'Lore documents drop as items in ruins and appear under FIELD DOCUMENTS in your Loadout.',
            'Ambush encounters sometimes reveal Terra lore attached to the event.',
            'Rarer Terras reveal lore less often. Extreme-tier lore only drops in extreme zones.',
        ],
    },
    {
        title: 'THE PAPERCLIPS',
        body: [
            '10 unique paperclips exist in the world. Each is one-of-a-kind.',
            'They only drop in the most dangerous locations at extremely low odds.',
            'The rarest is 1 in 50,000. The most common: 1 in 10,000.',
            'The Explorer Board tracks who finds each one first. Nobody has found one yet.',
        ],
    },
    {
        title: 'RARITY',
        body: [
            'COMMON (grey) → UNCOMMON (green) → RARE (blue)',
            'EPIC (purple) → LEGENDARY (orange) → ONE-OF-A-KIND (red)',
            'Higher rarity = higher power. Legendary and above can have special bonuses.',
        ],
    },
];

export default function HowToPlay({ onClose }: Props) {
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

                <div style={{ height: '16px' }} />
            </div>
        </div>
    );
}
