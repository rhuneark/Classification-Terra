interface Props { onClose: () => void; }

const sections: Array<{ title: string; body: string[] }> = [
    {
        title: 'THE LOOP',
        body: [
            'Enter a Ruin. Costs 1-4 energy. Find items. Come back.',
            'Items go to the Research Lab. Wait for them to finish.',
            'Researched gear moves to your bag. Equip it. Raise your Weight Class.',
            'Passive battles earn scrip while you rest. Repeat.',
        ],
    },
    {
        title: 'ENERGY & SCAVENGING',
        body: [
            'Max 20 energy. Low danger = 1 energy. Extreme danger = 4 energy.',
            'Regenerates 1 per 5 minutes while offline.',
            'Equip a pack item to increase max energy (up to +8).',
            'Regen Pots restore energy instantly. Energy Drinks double regen rate for 30 min.',
            'Luck bonus (Scout Map) reduces ambush chance for your next run.',
        ],
    },
    {
        title: 'SCRIP & ECONOMY',
        body: [
            'Scrip is the world\'s currency. Earn it from passive battles, raids, and selling.',
            'Scrap any item from your bag for 1 scrip (instantly).',
            'Sell gear at the Outpost for full sell value.',
            'Depot upgrades in your base earn passive scrip per hour.',
            'Bounties pay bonus scrip for completing specific goals.',
        ],
    },
    {
        title: 'RESEARCH LAB & DUFFLE BAG',
        body: [
            'Every item found must be researched before it\'s usable.',
            'Research times: Common 1-3 min · Uncommon 3-8 min · Rare 5-15 min · Epic+ 20-30 min.',
            'Use a Magnifying Glass on any queued item to cut its time in half.',
            'Consumables and Relics skip the queue and go straight to your bag.',
            'Bag holds 10 gear slots. Research queue holds 6. Store extras in the Safe House.',
            'STORE moves gear to the Safe House (protected, unlimited). DONATE sends it to base resources.',
        ],
    },
    {
        title: 'WEIGHT CLASS & LOADOUT',
        body: [
            'Your Weight Class (WC) is the sum of all equipped gear power values.',
            'COMBO: 3+ BIO items equipped = +15% WC.',
            'COMBO: 2+ HAZMAT items equipped = flat +20 WC.',
            'Higher WC wins more passive battles and earns more scrip.',
            'Max 8 slots: Head, Torso, Legs, Feet, Hand x2, Protection, Pack.',
            'Tap an equipped slot to unequip. Tap a bag item to auto-equip.',
        ],
    },
    {
        title: 'THE RUINS',
        body: [
            'Four zones, four danger tiers: Low, Medium, High, and Extreme.',
            'Higher danger = better gear, higher rarity, bigger ambush risk.',
            'Ambushes can cost you a bag item or energy. Terra lore may accompany them.',
            'Daily Challenge: complete the starred zone for +25 scrip bonus.',
            'Survivor encounters are rare in high+ zones. A living person wants to join.',
        ],
    },
    {
        title: 'PASSIVE BATTLES',
        body: [
            'Your loadout fights automatically while you\'re offline.',
            'Win: earn scrip. Occasionally earn a bonus item. Never lose gear.',
            'Lose: small consolation scrip. Still no gear lost.',
            'WC difference determines win chance. A stronger loadout wins more.',
            'Base morale and upgrade bonuses also affect your defense in passive battles.',
        ],
    },
    {
        title: 'THE OUTPOST',
        body: [
            'Buy consumables, gear, and tools with scrip.',
            'Permanent stock includes Magnifying Glasses, Regen Pots, and Energy Drinks.',
            'Six rotating slots refresh every 2 minutes with random gear and consumables.',
            'Sell tab: sell anything from your bag at its listed sell value.',
            'Bounty Board: accept bounties for scrip rewards. Complete objectives to claim.',
        ],
    },
    {
        title: 'WORKBENCH & CRAFTING',
        body: [
            'Certain items are crafting ingredients (marked with a ⚙ badge in your bag).',
            'Open the BENCH tab in LOADOUT to see available recipes.',
            'Meet all ingredient requirements to unlock the CRAFT button.',
            'Crafted items go directly to your bag (no research queue).',
            'Recipes produce higher-rarity gear than you can find outright.',
        ],
    },
    {
        title: 'FACTION BASE',
        body: [
            'Your base has its own Weight Class: player WC contribution + survivors + economy + upgrades.',
            'Five upgrades, 5 tiers each: Walls (DEF), Watchtower (OFF), Depot (income), Barracks (survivor cap), Clinic (morale).',
            'Buy upgrades with scrip in the FACTION tab → BASE tab.',
            'Depot earns passive scrip even while offline. Higher tiers = more per hour.',
            'Donate items from your bag for base resources (separate pool, not scrip).',
            'Base morale reflects base health. High morale = defense bonus. Low morale = penalties and raid vulnerability.',
        ],
    },
    {
        title: 'SURVIVORS & ROLES',
        body: [
            'Survivors join your base from rare encounters in medium+ ruins.',
            'Each survivor has a role: SCOUT (offense), SENTINEL (defense), MEDIC (morale), FORAGER (depot), ENGINEER (upgrade cost).',
            'Barracks tier determines your survivor cap (base 10, up to +10).',
            'Morale below 40: survivors may leave on their own if you\'re away too long.',
            'Banish a survivor from the FACTION tab if their role conflicts with your strategy.',
        ],
    },
    {
        title: 'RIVAL FACTIONS & GRUDGE',
        body: [
            'Three rival factions can raid you and be raided by you.',
            'Raid uses your base offense (survivors + loadout + watchtower) vs. rival defense.',
            'Win a raid: earn scrip, gain grudge points. Lose: still gain some grudge.',
            'Grudge level (0-5): builds up through raids. Each level adds +15% to that rival\'s stats.',
            'Higher grudge = better loot from raids. Level 5 win: chance to recruit a survivor.',
            'Grudge decays 1 full level per 48 hours of inactivity.',
            'Rivals also raid you. High grudge rivals raid more often.',
            'Defense against incoming raids uses your base WC + morale effects.',
        ],
    },
    {
        title: 'EXCURSIONS',
        body: [
            'Special missions available from the RUINS tab.',
            'Higher difficulty = longer duration, higher energy cost, bigger rewards.',
            'One excursion runs at a time. Collect your results when the timer finishes.',
            'Excursion rewards include gear, scrip, survivor encounters, and rare materials.',
            'Rotation refreshes every 5 minutes in the Ruins tab.',
        ],
    },
    {
        title: 'FIELD CODEX',
        body: [
            'Ten Terra species roam the post-collapse world.',
            'Encounter Terras in the ruins or find their documents to unlock Codex entries.',
            'Each entry includes classification, threat level, description, and lore logs.',
            'Ambushes sometimes reveal Terra intelligence attached to the event.',
            'Track how many species you\'ve documented in the CODEX tab: X / Y species.',
        ],
    },
    {
        title: 'PAPERCLIPS & EXPLORER BOARD',
        body: [
            '10 unique Paperclips exist in the world. Each belongs to exactly one player.',
            'They only drop at Extreme danger zones. Odds range from 1-in-10,000 to 1-in-50,000.',
            'Finding one submits your name as World First on the Explorer Board.',
            'Explorer Board (in MENU) shows all 10, who found them, and your personal count.',
            '"X / 10 globally discovered" tracks how many have been claimed across all players.',
            'Rumor: an 11th paperclip exists. Its records were removed.',
        ],
    },
    {
        title: 'RELIC ROOM',
        body: [
            'Nostalgic Relics are rare drops from Medium+ ruins. Flamingo pink. Hard to find.',
            'Five quality tiers: Broken, Worn, Used, Good, Perfect. Same pink color throughout.',
            'Trophy relics from your bag (LOADOUT → GEAR tab → RELICS section → TROPHY button).',
            'Trophied relics appear in MENU → RELIC ROOM with X/30 tracked.',
            'Four relic Sets exist. Trophy all members of a set to unlock its bonus.',
            'Perfect relics are World First eligible: first to trophy one gets their name in the global feed.',
            'Relics can also be sold at the Outpost. Perfect quality sells for 2.5x base value.',
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
