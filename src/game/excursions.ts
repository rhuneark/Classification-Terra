import type { Item, Rarity } from './types.ts';
import { rollRandomItem } from './items.ts';

// ── Types ──────────────────────────────────────────────────────────────────

export type ExcursionOptionType = 'continue' | 'fight' | 'luck';

export interface ExcursionOptionOutcome {
    text: string;
    scrip?: number;
    itemRarity?: Rarity;
    snippetId?: string;
    terraId?: string;
    nextStage?: number;   // override next stage index (default: current + 1)
    ends?: boolean;       // true = end excursion after showing this text
    energyCost?: number;  // additional energy drained
}

export interface ExcursionOption {
    label: string;
    type: ExcursionOptionType;
    wcRequired?: number;      // fight: success if playerWC >= this
    luckChance?: number;      // luck: success chance 0-1
    energyCost?: number;      // upfront cost before resolution
    success: ExcursionOptionOutcome;
    failure?: ExcursionOptionOutcome;
}

export interface ExcursionStage {
    title: string;
    narrative: string;
    canLeave: boolean;
    options: ExcursionOption[];
}

export interface ExcursionDef {
    id: string;
    name: string;
    location: string;
    description: string;
    energyCost: number;
    stages: ExcursionStage[];
}

// ── Reward helper ──────────────────────────────────────────────────────────

export function rollExcursionItem(rarity: Rarity): Item {
    return rollRandomItem(rarity, rarity);
}

// ── Excursion definitions ──────────────────────────────────────────────────

export const ALL_EXCURSIONS: ExcursionDef[] = [

    // ── 1. Something's Still Moving ───────────────────────────────────────
    {
        id: 'exc-overpass',
        name: "Something's Still Moving",
        location: 'Collapsed Overpass',
        description: 'A sound in the bridge wreckage. Could be the structure settling. Could be something that found the structure first.',
        energyCost: 2,
        stages: [
            {
                title: 'Movement in the Wreckage',
                narrative: "The overpass groaned. You told yourself it was load stress. Then it moved again, deliberately, and you stopped telling yourself things.",
                canLeave: true,
                options: [
                    {
                        label: 'Investigate',
                        type: 'continue',
                        success: { text: 'You moved toward the sound. Stupid, probably. The bridge held your weight.' },
                    },
                    {
                        label: 'Back out',
                        type: 'continue',
                        success: { text: "You walked out the way you came. Can't argue with a feeling.", ends: true },
                    },
                ],
            },
            {
                title: 'A Nest',
                narrative: "Crawler nest. Compact construction — debris and packaging material woven into something almost architectural. Empty, but warm. The occupants are recent.",
                canLeave: true,
                options: [
                    {
                        label: 'Raid it',
                        type: 'continue',
                        success: { text: 'You swept it clean. They stored better than expected.', scrip: 8 },
                    },
                    {
                        label: 'Leave it',
                        type: 'continue',
                        success: { text: 'You backed away from the nest. Sometimes the restraint is the move.', ends: true },
                    },
                ],
            },
            {
                title: 'The Occupants',
                narrative: "They came back. Six of them. The lead Crawler stopped three meters out and clicked at you twice — a measured frequency, rising tone. An assessment.",
                canLeave: true,
                options: [
                    {
                        label: 'Fight them (WC 35+)',
                        type: 'fight',
                        wcRequired: 35,
                        success: { text: 'You cleared the nest. The clicking stopped.', snippetId: 'crawler-cryptic-01', terraId: 'crawler' },
                        failure: { text: 'Too coordinated. You took a hit and pulled back. The clicking followed you to the exit.', energyCost: 1, ends: true },
                    },
                    {
                        label: 'Retreat',
                        type: 'continue',
                        success: { text: "Not your nest. You made the practical call.", ends: true },
                    },
                ],
            },
            {
                title: 'Under the Nest',
                narrative: "Under where the nest was: a sealed container. Pre-infection construction, still intact. Whatever's inside has been there longer than the Crawlers.",
                canLeave: false,
                options: [
                    {
                        label: 'Take it',
                        type: 'continue',
                        success: { text: 'Sealed contents, intact. The Crawlers were guarding this specifically. Good news, or bad news, depending on what\'s inside.', scrip: 15, itemRarity: 'rare', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 2. Samples Required ───────────────────────────────────────────────
    {
        id: 'exc-samples',
        name: 'Samples Required',
        location: 'Quarantine Sector 7',
        description: 'QS7 has the freshest contamination data in the region. Getting it out intact is the part nobody documented.',
        energyCost: 3,
        stages: [
            {
                title: 'Entry Point',
                narrative: "QS7 entry corridor. Standard biohazard markers — yellow, now faded to beige. Someone added new ones in red marker. Still vivid. The red ones point inward.",
                canLeave: true,
                options: [
                    {
                        label: 'Enter',
                        type: 'continue',
                        success: { text: 'You crossed the threshold. The air was thicker than it should have been.' },
                    },
                    {
                        label: 'Walk away',
                        type: 'continue',
                        success: { text: 'The red markers were enough. Some instruction you follow.', ends: true },
                    },
                ],
            },
            {
                title: 'First Specimen',
                narrative: "A Hollow, dormant in the corridor. Shedding — the membrane on the floor is still translucent. Research-grade, if there's still anyone doing research.",
                canLeave: true,
                options: [
                    {
                        label: 'Take the sample',
                        type: 'continue',
                        success: { text: "Sealed and pocketed. The Hollow didn't stir. It might have been waiting.", scrip: 10, snippetId: 'hollow-research-01', terraId: 'hollow' },
                    },
                    {
                        label: "Leave it, leave QS7",
                        type: 'continue',
                        success: { text: "You left the Hollow and the sector both. Safer that way.", ends: true },
                    },
                ],
            },
            {
                title: 'Blocked Route',
                narrative: "Two Lurkers own the next corridor. Not hunting — this is their range. Passing through requires their permission or yours.",
                canLeave: true,
                options: [
                    {
                        label: 'Push through (WC 55+)',
                        type: 'fight',
                        wcRequired: 55,
                        success: { text: 'You made it through. The Lurkers disagreed but not loudly.', snippetId: 'lurker-cryptic-01', terraId: 'lurker' },
                        failure: { text: 'They pushed back harder than your weight class justified. You fell back toward the entry.', energyCost: 2, ends: true },
                    },
                    {
                        label: 'Detour (costs 1 energy)',
                        type: 'continue',
                        energyCost: 1,
                        success: { text: 'Longer way around. Quiet.' },
                    },
                ],
            },
            {
                title: 'The Source',
                narrative: "An IV drip on a broken stand, still active, dripping something that used to be clear. The contamination origin. A proper sample from this is the real thing — not shed membrane, not traces.",
                canLeave: true,
                options: [
                    {
                        label: 'Careful approach',
                        type: 'continue',
                        success: { text: 'Slow and methodical. You got most of what you came for. Something moved in the room while you worked. You chose not to look.', scrip: 5, itemRarity: 'uncommon', nextStage: 4 },
                    },
                    {
                        label: 'Full extraction (WC 75+, high risk)',
                        type: 'fight',
                        wcRequired: 75,
                        success: { text: 'Full contamination sample, sealed. The cleanest collection from an active QS site. Probably.', scrip: 10, itemRarity: 'epic', snippetId: 'hollow-journal-01', terraId: 'hollow', nextStage: 5 },
                        failure: { text: 'You reached too far. The sample broke. You pulled back with contaminated gloves and nothing to show for it.', energyCost: 2, ends: true },
                    },
                ],
            },
            {
                title: 'Partial Sample',
                narrative: "Partial contamination sample. Not ideal. Still more than anyone else has come back with from QS7.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract',
                        type: 'continue',
                        success: { text: 'You filed out the way you came in. The red markers made more sense on the way back.', scrip: 15, itemRarity: 'rare', ends: true },
                    },
                ],
            },
            {
                title: 'Primary Sample',
                narrative: "Full primary contamination sample, sealed and labeled. The drip continued behind you. You put three corridors between yourself and it before stopping to breathe.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract',
                        type: 'continue',
                        success: { text: 'First successful primary QS7 sample extraction. The red markers stayed behind.', scrip: 25, itemRarity: 'epic', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 3. Find the Apex ──────────────────────────────────────────────────
    {
        id: 'exc-apex',
        name: 'Find the Apex',
        location: 'Sublevel Research Complex',
        description: 'Intel only. The Apex has been sighted in the Sublevel. Observation from a safe distance. What constitutes safe is still being determined.',
        energyCost: 4,
        stages: [
            {
                title: 'Descent',
                narrative: "Sublevel 3. Power's out on this section — emergency lighting only, one working in four. You found a functioning one immediately. You immediately wished you hadn't.",
                canLeave: true,
                options: [
                    {
                        label: 'Continue descent',
                        type: 'continue',
                        success: { text: 'Deeper in. The emergency lights spaced themselves further apart.' },
                    },
                    {
                        label: 'Surface',
                        type: 'continue',
                        success: { text: 'You surfaced before you saw anything. Clean exit.', ends: true },
                    },
                ],
            },
            {
                title: 'Fresh Tracks',
                narrative: "Something large moved here recently. Not recently enough that you should turn back. Recently enough that you logged every exit within twenty meters.",
                canLeave: true,
                options: [
                    {
                        label: 'Follow the tracks',
                        type: 'continue',
                        success: { text: 'Systematic approach. The tracks led down further.' },
                    },
                    {
                        label: 'Retreat',
                        type: 'continue',
                        success: { text: 'Some things are better not confirmed. This one probably was. That distinction is still yours to make.', ends: true },
                    },
                ],
            },
            {
                title: 'Sightline',
                narrative: "You see it. The Apex. It sees you. Neither of you moves. It's larger than the reports suggested. The reports suggested large.",
                canLeave: true,
                options: [
                    {
                        label: 'Observe and withdraw (safe)',
                        type: 'continue',
                        success: { text: 'You backed out, slow and steady. Field intel logged. Not comprehensive, but yours.', scrip: 5, snippetId: 'apex-cryptic-01', terraId: 'apex', ends: true },
                    },
                    {
                        label: "Hold still — let it decide",
                        type: 'continue',
                        success: { text: "You didn't move. It didn't move. Time passed in a way that felt structural." },
                    },
                    {
                        label: 'Engage (WC 100+, extreme risk)',
                        type: 'fight',
                        wcRequired: 100,
                        success: { text: 'You engaged. Against expectation and best judgment, you came out with data.', scrip: 20, itemRarity: 'rare', snippetId: 'apex-research-01', terraId: 'apex', nextStage: 5 },
                        failure: { text: 'It hit you once. You counted yourself lucky it was once.', energyCost: 3, snippetId: 'apex-cryptic-01', terraId: 'apex', ends: true },
                    },
                ],
            },
            {
                title: 'The Assessment',
                narrative: "It circles you. Slow. Methodical. This is what the incomplete field logs described — not aggression, not avoidance. Evaluation. You're being filed under something.",
                canLeave: true,
                options: [
                    {
                        label: 'Break and run',
                        type: 'continue',
                        success: { text: 'You moved. It let you. You won\'t think too hard about why.', scrip: 8, snippetId: 'apex-radio-01', terraId: 'apex', ends: true },
                    },
                    {
                        label: "Don't break eye contact",
                        type: 'continue',
                        success: { text: 'You held. It held. The circle completed.' },
                    },
                ],
            },
            {
                title: 'Filed',
                narrative: "It stopped. Held position. Then turned and walked away from you, deliberately, without looking back. You waited twenty minutes before moving. You're not sure it helped.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract',
                        type: 'continue',
                        success: { text: "Whatever just happened, you have the observation data. You won't put a name to it.", scrip: 15, itemRarity: 'rare', snippetId: 'apex-journal-01', terraId: 'apex', ends: true },
                    },
                ],
            },
            {
                title: 'Combat Data',
                narrative: "Biomechanical response patterns noted. You have more than anyone else has collected from an Apex encounter. The cost is worth noting.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract',
                        type: 'continue',
                        success: { text: 'First confirmed Apex combat record. The researchers would want this. The researchers are gone.', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 4. The Ward ───────────────────────────────────────────────────────
    {
        id: 'exc-ward',
        name: 'The Ward',
        location: 'Mercy General Hospital',
        description: "Pre-war intake forms still on the desks. The records aren't complete. Going in might tell you why.",
        energyCost: 3,
        stages: [
            {
                title: 'Intake',
                narrative: "Pre-war intake form on a clipboard, half completed. Patient name: redacted. Condition: redacted. Prognosis section: none. Someone crossed out the word 'prognosis' and wrote nothing in its place.",
                canLeave: true,
                options: [
                    {
                        label: 'Go deeper',
                        type: 'continue',
                        success: { text: 'You went in. The intake desk was still staffed, in a sense.' },
                    },
                    {
                        label: 'Leave',
                        type: 'continue',
                        success: { text: 'The form told you enough.', ends: true },
                    },
                ],
            },
            {
                title: 'Pharmacy Storage',
                narrative: "Locked. You have a method for locked things. Inside: dated but functional supplies. You could take what's here and go, or go further.",
                canLeave: true,
                options: [
                    {
                        label: 'Take supplies and leave',
                        type: 'continue',
                        success: { text: 'Practical. Clean. You were out before the smell fully registered.', scrip: 10, itemRarity: 'common', ends: true },
                    },
                    {
                        label: 'Go further',
                        type: 'continue',
                        success: { text: 'You pocketed what was useful and went deeper.', scrip: 5, itemRarity: 'common' },
                    },
                ],
            },
            {
                title: 'The Orderlies',
                narrative: "Two Turned, former orderlies. The scrubs are still intact. They walk the corridor in a circuit — a route they ran for years before the infection, and apparently after. Your next corridor is on their circuit.",
                canLeave: true,
                options: [
                    {
                        label: 'Engage them (WC 50+)',
                        type: 'fight',
                        wcRequired: 50,
                        success: { text: 'Both cleared. The circuit stops with them.', scrip: 5, snippetId: 'turned-cryptic-01', terraId: 'turned' },
                        failure: { text: 'They hit harder than they look. You came through — not clean — and pushed past anyway.', snippetId: 'turned-cryptic-01', terraId: 'turned' },
                    },
                    {
                        label: 'Wait for a gap in the circuit',
                        type: 'continue',
                        success: { text: 'Thirty-minute wait for a gap. Patient. You had that option here.' },
                    },
                ],
            },
            {
                title: 'ICU Ward',
                narrative: "ICU ward, locked from the inside. The lock is manual — someone with working hands set it. You're not sure which side they set it from.",
                canLeave: false,
                options: [
                    {
                        label: 'Open it',
                        type: 'continue',
                        success: { text: "The lock gave. Whoever set it isn't on the other side." },
                    },
                ],
            },
            {
                title: 'Forty-Seven Days',
                narrative: "Empty beds. Notes on the wall in multiple handwritings. Forty-seven days of observations. The entries get shorter as they progress. The last one, Day 47: 'They respond to names.'",
                canLeave: false,
                options: [
                    {
                        label: 'Document everything',
                        type: 'continue',
                        success: { text: 'You copied what you could. Some of it is usable. Most of it will stay with you.', scrip: 20, itemRarity: 'rare', snippetId: 'turned-journal-01', terraId: 'turned', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 5. Signal Lost ────────────────────────────────────────────────────
    {
        id: 'exc-signal',
        name: 'Signal Lost',
        location: 'Cross-sector',
        description: "A signal on 2.3 MHz. Intermittent. Either a pre-war beacon on residual power, or something learned to press a button. Both possibilities are fine.",
        energyCost: 3,
        stages: [
            {
                title: 'Static',
                narrative: "Signal on your scanner. 2.3 MHz, intermittent. The source is moving — or the signal is bouncing, which means the source isn't moving but is enclosed. Both interpretations have things wrong with them.",
                canLeave: true,
                options: [
                    {
                        label: 'Track it',
                        type: 'continue',
                        success: { text: 'You followed the signal. It was getting stronger.' },
                    },
                    {
                        label: 'Ignore it',
                        type: 'continue',
                        success: { text: "You noted the frequency and kept walking. Some signals aren't for you.", ends: true },
                    },
                ],
            },
            {
                title: 'Getting Warmer',
                narrative: "Signal's stronger. Also, you're three blocks from known Turned activity. Could be coincidence. The signal broadcasts to anyone.",
                canLeave: true,
                options: [
                    {
                        label: 'Continue tracking',
                        type: 'continue',
                        success: { text: 'You moved carefully. The signal broadcasting to anyone now meant you.' },
                    },
                    {
                        label: 'Abort',
                        type: 'continue',
                        success: { text: 'The Turned proximity was enough. Some frequencies you let go.', ends: true },
                    },
                ],
            },
            {
                title: 'Sector Boundary',
                narrative: "The signal leads into Quarantine Sector 7. Of course it does. You're at the boundary. Going further costs more than the walk.",
                canLeave: true,
                options: [
                    {
                        label: 'Follow it in (costs 1 energy)',
                        type: 'continue',
                        energyCost: 1,
                        success: { text: 'You paid the cost. Into QS7. The signal was clear now.' },
                    },
                    {
                        label: 'Mark the frequency and leave',
                        type: 'continue',
                        success: { text: 'Logged. Somebody else\'s problem, or yours another day.', scrip: 5, ends: true },
                    },
                ],
            },
            {
                title: 'Source Located',
                narrative: "A radio. Pre-war construction, battery-powered somehow, broadcasting on a loop. Taped to the side: a note on index card. 'Don't turn this off.' No signature.",
                canLeave: true,
                options: [
                    {
                        label: 'Turn it off',
                        type: 'continue',
                        success: { text: 'You turned it off. Something in the sector stopped moving.' },
                    },
                    {
                        label: "Take what's nearby and leave",
                        type: 'continue',
                        success: { text: "You didn't touch the radio. Took what was near it. The note said don't turn it off. You didn't.", scrip: 8, itemRarity: 'uncommon', ends: true },
                    },
                ],
            },
            {
                title: 'Aftermath',
                narrative: "Silence now. Not comfortable silence — the other kind. Something that was moving through the sector stopped when the radio did. Whether it stopped because of the broadcast, or just stopped, is not confirmed.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract',
                        type: 'luck',
                        luckChance: 0.5,
                        success: { text: 'You extracted cleanly. The sector stayed quiet. A rare outcome.', scrip: 15, itemRarity: 'rare', snippetId: 'hollow-cryptic-01', terraId: 'hollow', ends: true },
                        failure: { text: 'Something noticed you leaving. You ran the last corridor. You made it. Not cleanly.', energyCost: 1, itemRarity: 'common', ends: true },
                    },
                ],
            },
        ],
    },
];

export function getExcursionById(id: string): ExcursionDef | undefined {
    return ALL_EXCURSIONS.find(e => e.id === id);
}
