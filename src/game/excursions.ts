import type { Item, Rarity, ExcursionRun, ExcursionLoreUnlock } from './types.ts';
import { rollRandomItem } from './items.ts';

// ── Types ──────────────────────────────────────────────────────────────────

export type ExcursionOptionType = 'continue' | 'fight' | 'luck';
export type ExcursionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

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
    subtitle: string;
    location: string;
    description: string;
    difficulty: ExcursionDifficulty;
    energyCost: number;
    baseReward: number;
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
        subtitle: 'Overpass salvage run',
        location: 'Collapsed Overpass',
        description: 'A sound in the bridge wreckage. Could be the structure settling. Could be something that found the structure first.',
        difficulty: 'easy',
        energyCost: 2,
        baseReward: 10,
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
        subtitle: 'QS7 contamination extraction',
        location: 'Quarantine Sector 7',
        description: 'QS7 has the freshest contamination data in the region. Getting it out intact is the part nobody documented.',
        difficulty: 'hard',
        energyCost: 3,
        baseReward: 5,
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
        subtitle: 'Extreme fauna intelligence',
        location: 'Sublevel Research Complex',
        description: 'Intel only. The Apex has been sighted in the Sublevel. Observation from a safe distance. What constitutes safe is still being determined.',
        difficulty: 'extreme',
        energyCost: 4,
        baseReward: 20,
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
        subtitle: 'Hospital intelligence run',
        location: 'Mercy General Hospital',
        description: "Pre-war intake forms still on the desks. The records aren't complete. Going in might tell you why.",
        difficulty: 'medium',
        energyCost: 3,
        baseReward: 5,
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
        subtitle: 'Cross-sector intelligence',
        location: 'Cross-sector',
        description: "A signal on 2.3 MHz. Intermittent. Either a pre-war beacon on residual power, or something learned to press a button. Both possibilities are fine.",
        difficulty: 'medium',
        energyCost: 3,
        baseReward: 5,
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

    // ── 6. The Nest Survey ────────────────────────────────────────────────
    {
        id: 'exc-nest-survey',
        name: 'The Nest Survey',
        subtitle: 'Overpass population count',
        location: 'Collapsed Overpass',
        description: "Someone marked a survey grid on the overpass months ago. Nobody came back to fill it in. The grid is still there.",
        difficulty: 'easy',
        energyCost: 2,
        baseReward: 8,
        stages: [
            {
                title: 'Grid Reference A',
                narrative: "First marker. Yellow spray paint, partially obscured by something sticky. The grid point itself is clean. Too clean. Something maintains this area.",
                canLeave: true,
                options: [
                    {
                        label: 'Log the point',
                        type: 'continue',
                        success: { text: 'Grid reference A documented. One Crawler nest, dormant. You noted the clicking frequency: low, slow, content.' },
                    },
                    {
                        label: 'Leave the survey',
                        type: 'continue',
                        success: { text: "The grid can stay unfinished. Most things can.", ends: true },
                    },
                ],
            },
            {
                title: 'Grid Reference B',
                narrative: "Second point. Active nest this time — two Crawlers inside, aware of you. Not alarmed. Categorizing, maybe.",
                canLeave: true,
                options: [
                    {
                        label: 'Observe from distance',
                        type: 'continue',
                        success: { text: 'You watched from twelve meters. They watched back. Eventually lost interest. Their disinterest felt deliberate.', snippetId: 'crawler-research-01', terraId: 'crawler' },
                    },
                    {
                        label: 'Approach nest (WC 30+)',
                        type: 'fight',
                        wcRequired: 30,
                        success: { text: 'Close observation, logged. The clicking stopped while you were near. Resumed when you stepped back.', scrip: 5, snippetId: 'crawler-journal-01', terraId: 'crawler' },
                        failure: { text: 'Too close. One lunged. You backed out fast.', energyCost: 1, ends: true },
                    },
                ],
            },
            {
                title: 'Grid Reference C',
                narrative: "Third point. The grid marker is missing. In its place: a Crawler sitting perfectly still, directly where the marker should be. It has not moved in some time.",
                canLeave: true,
                options: [
                    {
                        label: 'Document the behavior',
                        type: 'continue',
                        success: { text: "Stationary Crawler at expected grid point. Coincidence cannot be confirmed or ruled out. You wrote that down exactly." },
                    },
                    {
                        label: 'Retreat',
                        type: 'continue',
                        success: { text: "You marked 'survey incomplete' and left. Incomplete is a valid data point.", scrip: 6, ends: true },
                    },
                ],
            },
            {
                title: 'Grid Reference D',
                narrative: "Last point. You find the original surveyor's notes, tucked under a beam. Three pages. The final entry reads: 'They know where the markers are.'",
                canLeave: false,
                options: [
                    {
                        label: 'Take the notes',
                        type: 'continue',
                        success: { text: "You took the notes. The Crawler at grid reference C was still there when you passed back through. Still hadn't moved.", scrip: 15, itemRarity: 'uncommon', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 7. Forty Hours ───────────────────────────────────────────────────
    {
        id: 'exc-forty-hours',
        name: 'Forty Hours',
        subtitle: 'Hospital sector reconstruction',
        location: 'Mercy General Hospital',
        description: "Someone survived forty hours in Mercy General and kept a log. Finding out where they stopped writing is useful information.",
        difficulty: 'medium',
        energyCost: 3,
        baseReward: 10,
        stages: [
            {
                title: 'Hour Zero',
                narrative: "The survivor started in the lobby. Their notes are detailed, methodical, professionally calm. They documented everything. The tone shifts around hour three.",
                canLeave: true,
                options: [
                    {
                        label: 'Follow the route',
                        type: 'continue',
                        success: { text: "You retraced the path. The lobby still has the chairs arranged the way the log described." },
                    },
                    {
                        label: 'Leave',
                        type: 'continue',
                        success: { text: "Some records are better admired from outside.", ends: true },
                    },
                ],
            },
            {
                title: 'Hour Twelve',
                narrative: "Stairwell B, third floor. The log mentions a Shade here. 'Has not approached. Watching from the far end. I have named it Gary. This is not helpful.'",
                canLeave: true,
                options: [
                    {
                        label: 'Check stairwell B',
                        type: 'continue',
                        success: { text: "No Shade currently. No sign of Gary. You felt watched anyway.", snippetId: 'shade-cryptic-01', terraId: 'shade' },
                    },
                    {
                        label: 'Skip that floor',
                        type: 'continue',
                        success: { text: "You routed around stairwell B. The log didn't say what happened to Gary.", scrip: 3 },
                    },
                ],
            },
            {
                title: 'Hour Twenty-Four',
                narrative: "East wing supply closet. The log says they barricaded here and slept in shifts. There's still a barricade. Still pushed to the same side it was when they left.",
                canLeave: true,
                options: [
                    {
                        label: 'Search the closet',
                        type: 'continue',
                        success: { text: "They left more than notes. Supplies, partially used. Someone came back later and left them undisturbed.", scrip: 10, itemRarity: 'uncommon' },
                    },
                    {
                        label: 'Continue to the end',
                        type: 'continue',
                        success: { text: "You moved past the closet. The barricade watched you go." },
                    },
                ],
            },
            {
                title: 'Hour Thirty-Six',
                narrative: "Rooftop access. 'Turned on the roof. Three of them. Believe they were maintenance staff. They still walk the maintenance circuit.' The log gets shorter here.",
                canLeave: true,
                options: [
                    {
                        label: 'Go to the roof (WC 50+)',
                        type: 'fight',
                        wcRequired: 50,
                        success: { text: "Three Turned. Still on circuit. You ended the route.", scrip: 8, snippetId: 'turned-research-01', terraId: 'turned' },
                        failure: { text: "The circuit held. You pulled back.", energyCost: 1 },
                    },
                    {
                        label: 'Skip the roof',
                        type: 'continue',
                        success: { text: "Maintenance can wait. Maintenance often does." },
                    },
                ],
            },
            {
                title: 'Hour Forty',
                narrative: "The final entry: 'If you find this — I made it out. I just didn't make it back.' The note below it, different handwriting: 'Found this. Confirmed. — R.'",
                canLeave: false,
                options: [
                    {
                        label: 'Take both notes',
                        type: 'continue',
                        success: { text: "You documented the exchange. Two unknowns. One confirmed outcome. The rest is inference.", scrip: 20, itemRarity: 'rare', snippetId: 'turned-journal-01', terraId: 'turned', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 8. Deep Current ──────────────────────────────────────────────────
    {
        id: 'exc-deep-current',
        name: 'Deep Current',
        subtitle: 'QS7 drainage system recovery',
        location: 'Quarantine Sector 7',
        description: "The QS7 drainage system still flows. Something moves with it. Whether the movement is current or choice is the question.",
        difficulty: 'hard',
        energyCost: 3,
        baseReward: 15,
        stages: [
            {
                title: 'Entry Grate',
                narrative: "Drainage access. The grate has been moved recently, not forced — lifted and replaced. Something with coordinated hands did this. The drainage system drops two meters and continues.",
                canLeave: true,
                options: [
                    {
                        label: 'Drop in',
                        type: 'continue',
                        success: { text: "You dropped in. The current was present, slow, and the wrong color." },
                    },
                    {
                        label: 'Pass on this one',
                        type: 'continue',
                        success: { text: "Gratuitous. You moved on.", ends: true },
                    },
                ],
            },
            {
                title: 'Junction Hollow',
                narrative: "A Hollow in the junction chamber. Motionless, suspended partially in the current. Feeding — but the drainage has no nutrients. It's processing the contamination directly.",
                canLeave: true,
                options: [
                    {
                        label: 'Observe from upstream',
                        type: 'continue',
                        success: { text: "You watched for four minutes. The Hollow processed. The current processed.", snippetId: 'hollow-research-01', terraId: 'hollow' },
                    },
                    {
                        label: 'Bypass through side tunnel (costs 1 energy)',
                        type: 'continue',
                        energyCost: 1,
                        success: { text: "Side tunnel was tight. You made it. The Hollow was still in the junction when you cleared the other end." },
                    },
                ],
            },
            {
                title: 'The Sediment',
                narrative: "The drainage sediment is layered — contamination deposits over months. Whatever has been moving through here regularly has compressed it into readable strata.",
                canLeave: true,
                options: [
                    {
                        label: 'Take a sample',
                        type: 'continue',
                        success: { text: "Sealed sediment sample. Dated by compression. The middle layer is the most interesting and you can't say exactly why.", scrip: 8, itemRarity: 'uncommon' },
                    },
                    {
                        label: 'Move deeper',
                        type: 'continue',
                        success: { text: "You skipped the sample. The sediment kept its secrets." },
                    },
                ],
            },
            {
                title: 'The Warped',
                narrative: "The drainage terminates in a processing basin. A Warped occupies one corner. It has arranged debris along the basin wall in a sequence that almost makes sense.",
                canLeave: true,
                options: [
                    {
                        label: 'Study the arrangement',
                        type: 'continue',
                        success: { text: "You documented the sequence. Forty-three distinct symbols. The Warped did not acknowledge your presence, which was worse.", snippetId: 'warped-research-01', terraId: 'warped' },
                    },
                    {
                        label: 'Engage it (WC 70+)',
                        type: 'fight',
                        wcRequired: 70,
                        success: { text: "You engaged. The Warped resisted without appearing to decide to resist. You came out ahead.", scrip: 12, snippetId: 'warped-cryptic-01', terraId: 'warped' },
                        failure: { text: "It moved wrong. Every joint slightly wrong. You pulled back.", energyCost: 2, ends: true },
                    },
                    {
                        label: 'Exit through the drain overflow',
                        type: 'continue',
                        success: { text: "You found the overflow exit. The Warped didn't follow. It went back to its arrangement.", scrip: 5, ends: true },
                    },
                ],
            },
            {
                title: 'Below the Basin',
                narrative: "Below the basin: a maintenance crawlspace. Something was stored here before the drainage system activated. Pre-infection. Still sealed.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract the cache',
                        type: 'luck',
                        luckChance: 0.65,
                        success: { text: "Seal intact. Contents viable. You do not know what was down here before, and the contents don't clarify it.", scrip: 20, itemRarity: 'epic', ends: true },
                        failure: { text: "The seal broke. Contamination inside — unusable. You exited with the sediment sample.", scrip: 5, ends: true },
                    },
                ],
            },
        ],
    },

    // ── 9. Pack Behavior ─────────────────────────────────────────────────
    {
        id: 'exc-pack-behavior',
        name: 'Pack Behavior',
        subtitle: 'High-sector fauna patterns',
        location: 'Quarantine Sector 7',
        description: "Reports of a Sow leading something else. A Sow doesn't lead. Whatever it's moving with is worth documenting before it's worth encountering.",
        difficulty: 'hard',
        energyCost: 4,
        baseReward: 15,
        stages: [
            {
                title: 'Track Entry',
                narrative: "Prints in the contamination residue. Large, plated — Sow. Alongside: smaller, bipedal, erratic spacing. The erratic spacing is the part that interests and concerns you equally.",
                canLeave: true,
                options: [
                    {
                        label: 'Follow the tracks',
                        type: 'continue',
                        success: { text: "You followed. The tracks were recent enough that you stayed at a calculated distance." },
                    },
                    {
                        label: 'Abort',
                        type: 'continue',
                        success: { text: "Whatever the Sow is moving with, it can move without your documentation.", ends: true },
                    },
                ],
            },
            {
                title: 'The Smaller Prints',
                narrative: "The bipedal prints are Feral. One individual, erratic in a way that looks like it's circling the Sow's path, not walking beside it. Surveillance behavior, maybe.",
                canLeave: true,
                options: [
                    {
                        label: 'Identify the Feral',
                        type: 'continue',
                        success: { text: "You matched the gait pattern to field logs. Feral. Mid-stage. Moving like it's learned something.", snippetId: 'feral-cryptic-01', terraId: 'feral' },
                    },
                    {
                        label: 'Focus on the Sow',
                        type: 'continue',
                        success: { text: "The Sow is the primary subject. The Feral is a variable." },
                    },
                ],
            },
            {
                title: 'Observation Point',
                narrative: "You have a sightline. The Sow moves through the sector with the Feral at a consistent twenty meters behind. The Feral matches pace exactly. This is not coincidence.",
                canLeave: true,
                options: [
                    {
                        label: 'Document the behavior',
                        type: 'continue',
                        success: { text: "You recorded movement patterns for eleven minutes. The Sow never acknowledged the Feral. The Feral never broke pace.", scrip: 8, snippetId: 'sow-cryptic-01', terraId: 'sow' },
                    },
                    {
                        label: 'Move closer',
                        type: 'continue',
                        success: { text: "You moved closer. Neither reacted. You had the distinct feeling this was intentional on their part." },
                    },
                    {
                        label: 'Extract now',
                        type: 'continue',
                        success: { text: "Enough. You had the basic pattern logged.", scrip: 10, ends: true },
                    },
                ],
            },
            {
                title: 'The Turn',
                narrative: "The Sow stopped. Turned directly toward you. You have not moved. The Feral continued forward, closing the gap. The Sow is watching the Feral approach you.",
                canLeave: true,
                options: [
                    {
                        label: 'Stand still',
                        type: 'continue',
                        success: { text: "You held position. The Feral stopped at six meters. The Sow stopped watching. The Feral did not move again until you did." },
                    },
                    {
                        label: 'Fight the Feral (WC 65+)',
                        type: 'fight',
                        wcRequired: 65,
                        success: { text: "You engaged the Feral. The Sow did not intervene. That was the most unsettling part.", scrip: 10, snippetId: 'feral-research-01', terraId: 'feral' },
                        failure: { text: "The Feral was faster than it looked. You ran. The Sow watched you run.", energyCost: 2, ends: true },
                    },
                    {
                        label: 'Back out slowly',
                        type: 'continue',
                        success: { text: "You backed away. The Feral followed at the same pace, stopping when you stopped. You made it to the sector boundary in about four minutes.", scrip: 5, ends: true },
                    },
                ],
            },
            {
                title: 'The Sow Alone',
                narrative: "The Feral is gone. The Sow resumes movement, now without escort. It moves directly toward something at the end of the sector. You are in its path.",
                canLeave: false,
                options: [
                    {
                        label: 'Step aside',
                        type: 'continue',
                        success: { text: "You got out of its path. The Sow passed within four meters. It did not deviate. You were beneath the threshold of notice." },
                    },
                ],
            },
            {
                title: 'The Cache',
                narrative: "What the Sow was moving toward: a sealed container, partially buried. It stood over it for two minutes, then left. You watched it leave before approaching.",
                canLeave: false,
                options: [
                    {
                        label: 'Open the container',
                        type: 'luck',
                        luckChance: 0.6,
                        success: { text: "The Sow had good taste. Pre-infection materials, sealed, intact.", scrip: 25, itemRarity: 'epic', snippetId: 'sow-research-01', terraId: 'sow', ends: true },
                        failure: { text: "Empty. The Sow had been here before you. The visit was sentimental, apparently.", scrip: 10, itemRarity: 'uncommon', ends: true },
                    },
                ],
            },
        ],
    },

    // ── 10. Sublevel Seven ───────────────────────────────────────────────
    {
        id: 'exc-sublevel-seven',
        name: 'Sublevel Seven',
        subtitle: 'Restricted complex access',
        location: 'Sublevel Research Complex',
        description: "Sublevel Seven doesn't appear on any floor plan. The elevator goes to Six. Something below Six has been heard on Six for months.",
        difficulty: 'extreme',
        energyCost: 5,
        baseReward: 25,
        stages: [
            {
                title: 'Below Six',
                narrative: "The maintenance shaft drops below sublevel six. Nobody installed lighting here. Whatever lighting exists now was not installed.",
                canLeave: true,
                options: [
                    {
                        label: 'Descend',
                        type: 'continue',
                        success: { text: "You descended. The shaft continued further than any architectural record supports." },
                    },
                    {
                        label: 'Surface',
                        type: 'continue',
                        success: { text: "There are things not on the floor plan for good reasons. You went back up.", ends: true },
                    },
                ],
            },
            {
                title: 'Sublevel Seven Exists',
                narrative: "Sublevel Seven exists. Pre-infection laboratory construction, sealed from above. The seals were broken from inside. Recently.",
                canLeave: true,
                options: [
                    {
                        label: 'Enter',
                        type: 'continue',
                        success: { text: "You entered. The interior was climate-controlled. Something maintains the temperature. That was the first wrong thing." },
                    },
                    {
                        label: 'Surface immediately',
                        type: 'continue',
                        success: { text: "Broken from inside. That was sufficient information.", ends: true },
                    },
                ],
            },
            {
                title: 'The Equipment',
                narrative: "Laboratory equipment, active. Not on backup power — primary power, sourced from somewhere unmapped. The research station displays information in a format that is not quite a language.",
                canLeave: true,
                options: [
                    {
                        label: 'Photograph the display',
                        type: 'continue',
                        success: { text: "You documented the display. Forty-three distinct symbols. Seven repeated in what might be a sentence structure.", scrip: 10, snippetId: 'apex-research-01', terraId: 'apex' },
                    },
                    {
                        label: 'Leave the equipment',
                        type: 'continue',
                        success: { text: "You moved past it. The display continued running." },
                    },
                ],
            },
            {
                title: 'The Brute',
                narrative: "A Brute, stationed at the end of the corridor. Not patrolling. Stationed. It has not moved from this position in a significant amount of time, judging by the floor.",
                canLeave: true,
                options: [
                    {
                        label: 'Attempt to pass (WC 90+)',
                        type: 'fight',
                        wcRequired: 90,
                        success: { text: "You moved past the Brute. It registered you. Chose not to escalate. You will not understand why.", snippetId: 'brute-cryptic-01', terraId: 'brute' },
                        failure: { text: "The Brute did not move. You moved. Backward. Quickly.", energyCost: 3, ends: true },
                    },
                    {
                        label: 'Find an alternate route (costs 1 energy)',
                        type: 'continue',
                        energyCost: 1,
                        success: { text: "Maintenance crawlspace, parallel corridor. You got around the Brute. It knew you were there." },
                    },
                    {
                        label: 'Retreat',
                        type: 'continue',
                        success: { text: "Knowing Sublevel Seven exists is already more than most people know.", scrip: 10, ends: true },
                    },
                ],
            },
            {
                title: 'The Interior',
                narrative: "Past the Brute: a secondary laboratory. Pristine. Active. Specimens in containment, labeled in the same non-language from the display. Some specimens move.",
                canLeave: true,
                options: [
                    {
                        label: 'Document the specimens',
                        type: 'continue',
                        success: { text: "You documented. Fifteen specimens, thirteen variant types. Two specimens documented you back.", scrip: 12, snippetId: 'brute-research-01', terraId: 'brute' },
                    },
                    {
                        label: 'Take a sample',
                        type: 'luck',
                        luckChance: 0.55,
                        success: { text: "You extracted one specimen from containment. Clean. Sealed. You did not look at it until you were out of the room.", scrip: 8, itemRarity: 'rare' },
                        failure: { text: "The containment alarm activated. A tone. Everything in the room turned toward you. You replaced the specimen.", ends: true },
                    },
                    {
                        label: 'Move to the source',
                        type: 'continue',
                        success: { text: "Something larger is generating the power and maintaining the temperature. You went toward it." },
                    },
                ],
            },
            {
                title: 'The Source',
                narrative: "The power source: a modified generator, integrated with organic material. The integration is seamless. It has been operational for approximately two years. The infection was eight months ago.",
                canLeave: true,
                options: [
                    {
                        label: 'Analyze the integration',
                        type: 'continue',
                        success: { text: "You spent twenty minutes on analysis. The organic components are Terra-sourced. The integration predates the infection. Someone was ready.", scrip: 15, snippetId: 'apex-radio-01', terraId: 'apex' },
                    },
                    {
                        label: 'Extract and leave',
                        type: 'continue',
                        success: { text: "Some findings you carry out and don't think about until you're above ground.", scrip: 8, ends: true },
                    },
                ],
            },
            {
                title: 'The Apex',
                narrative: "It is here. In the final chamber, motionless, watching the generator. It turns when you enter. Neither of you moves for a long time. You are in its space, not the other way around.",
                canLeave: false,
                options: [
                    {
                        label: 'State your purpose',
                        type: 'continue',
                        success: { text: "You said, out loud, that you were documenting. The Apex held position for eleven seconds, then moved aside from the exit. You took the exit." },
                    },
                ],
            },
            {
                title: 'Exfiltration',
                narrative: "The maintenance shaft back up. The Brute is still stationed. The display still runs. The Apex did not follow. Whether that's reassuring is a question for above ground.",
                canLeave: false,
                options: [
                    {
                        label: 'Extract',
                        type: 'luck',
                        luckChance: 0.7,
                        success: { text: "You exfiltrated clean. First confirmed Sublevel Seven documentation. The floor plan remains incomplete. Intentionally.", scrip: 30, itemRarity: 'epic', snippetId: 'apex-journal-01', terraId: 'apex', ends: true },
                        failure: { text: "The shaft collapsed two meters up. You rerouted. It cost you time and materials, but you made it.", scrip: 15, itemRarity: 'rare', ends: true },
                    },
                ],
            },
        ],
    },
];

export function getExcursionById(id: string): ExcursionDef | undefined {
    return ALL_EXCURSIONS.find(e => e.id === id);
}

// ── Display helpers ────────────────────────────────────────────────────────

export const DIFFICULTY_COLORS: Record<ExcursionDifficulty, string> = {
    easy: '#4ade80',
    medium: '#facc15',
    hard: '#f97316',
    extreme: '#ff3333',
};

export const DIFFICULTY_LABELS: Record<ExcursionDifficulty, string> = {
    easy: 'LOW RISK',
    medium: 'MODERATE',
    hard: 'HIGH RISK',
    extreme: 'EXTREME',
};

// ── Run helpers ────────────────────────────────────────────────────────────

export function startExcursion(def: ExcursionDef): ExcursionRun {
    return {
        excursionId: def.id,
        currentStageIndex: 0,
        status: 'active',
        loreUnlocks: [],
        totalScrip: def.baseReward,
        pendingItemRarity: undefined,
        pendingEnergyCost: 0,
        log: [],
    };
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'];

function higherRarity(a: Rarity | undefined, b: Rarity | undefined): Rarity | undefined {
    if (!a) return b;
    if (!b) return a;
    return RARITY_ORDER.indexOf(a) >= RARITY_ORDER.indexOf(b) ? a : b;
}

export function resolveOption(
    run: ExcursionRun,
    option: ExcursionOption,
    playerWC: number,
): ExcursionRun {
    let success = true;

    if (option.type === 'fight') {
        success = playerWC >= (option.wcRequired ?? 0);
    } else if (option.type === 'luck') {
        success = Math.random() < (option.luckChance ?? 0.5);
    }

    const outcome = success ? option.success : (option.failure ?? option.success);
    const newLog = [...run.log, outcome.text];

    const newLoreUnlocks: ExcursionLoreUnlock[] = outcome.snippetId && outcome.terraId
        ? [...run.loreUnlocks, { terraId: outcome.terraId, snippetId: outcome.snippetId }]
        : run.loreUnlocks;

    let nextStageIndex = run.currentStageIndex + 1;
    if (outcome.nextStage !== undefined) nextStageIndex = outcome.nextStage;

    const ended = outcome.ends === true;
    const newEnergyCost = run.pendingEnergyCost + (outcome.energyCost ?? 0) + (option.energyCost ?? 0);

    return {
        ...run,
        currentStageIndex: ended ? run.currentStageIndex : nextStageIndex,
        status: ended ? 'ended' : 'active',
        loreUnlocks: newLoreUnlocks,
        totalScrip: run.totalScrip + (outcome.scrip ?? 0),
        pendingItemRarity: higherRarity(run.pendingItemRarity as Rarity | undefined, outcome.itemRarity),
        pendingEnergyCost: newEnergyCost,
        log: newLog,
        endedText: ended ? outcome.text : run.endedText,
    };
}

export function rollExcursionRewardItem(rarity: Rarity): Item {
    return rollRandomItem(rarity, rarity);
}
