import type { Item } from './types.ts';

export type SnippetFormat = 'journal' | 'research' | 'radio' | 'cryptic';

export interface LoreSnippet {
    id: string;
    terraId: string;
    format: SnippetFormat;
    source?: string;
    text: string;
}

export interface TerraVariant {
    id: string;
    name: string;
    formerlyKnownAs: string;
    classification: string;
    threat: 'low' | 'moderate' | 'high' | 'extreme';
    description: string;
    signs: string;
    snippets: LoreSnippet[];
}

const AMBUSH_SNIPPET_CHANCE: Record<TerraVariant['threat'], number> = {
    low: 0.38,
    moderate: 0.25,
    high: 0.12,
    extreme: 0.03,
};

export function getAmbushSnippetChance(terraId: string): number {
    const terra = getTerraById(terraId);
    return terra ? AMBUSH_SNIPPET_CHANCE[terra.threat] : 0.38;
}

export const TERRA_VARIANTS: TerraVariant[] = [
    {
        id: 'crawler',
        name: 'The Crawler',
        formerlyKnownAs: 'Rattus norvegicus / Sciurus carolinensis',
        classification: 'Terrae rattus-mutandis',
        threat: 'low',
        description: 'Small pack-hunters derived from pre-collapse rodent populations. Fast, numerous, and better coordinated than their size suggests.',
        signs: 'Rapid clicking in walls and overhead. Move in groups of 8-20. Nocturnal migration confirmed.',
        snippets: [
            {
                id: 'crawler-journal-01',
                terraId: 'crawler',
                format: 'journal',
                source: 'Handwritten field log, author unknown',
                text: 'Day 14. The crawlers were back tonight. You hear them before you see them -- that rapid clicking, like knuckles cracked over and over. Figured out it\'s echolocation. Some kind of laryngeal modification. Killed six. Thought about eating two. Thought better of it.',
            },
            {
                id: 'crawler-research-01',
                terraId: 'crawler',
                format: 'research',
                source: 'Infection Study: File C-001, partial',
                text: 'Specimen designation: Terrae rattus-mutandis. Bilateral limb hypertrophy inconsistent with pre-infection morphology. Echolocation organ confirmed via laryngeal modification. Pack intelligence: moderate. Individual intelligence: negligible. Do not engage in enclosed spaces. Do not engage in the dark.',
            },
            {
                id: 'crawler-radio-01',
                terraId: 'crawler',
                format: 'radio',
                source: 'Broadcast intercept, Sector 3 relay',
                text: '[static] -- anyone near the collapsed overpass, be advised -- the crawlers are migrating earlier this cycle -- repeat, they move at night now and they move in formation -- we counted at least forty -- [static] -- the clicking doesn\'t stop -- [static]',
            },
            {
                id: 'crawler-cryptic-01',
                terraId: 'crawler',
                format: 'cryptic',
                text: 'If you hear clicking, you\'re already surrounded.',
            },
        ],
    },
    {
        id: 'lurker',
        name: 'The Lurker',
        formerlyKnownAs: 'Procyon lotor / Didelphis virginiana',
        classification: 'Terrae procyon-infernus',
        threat: 'moderate',
        description: 'Mid-size ambush predators, formerly scavengers. Infection expanded olfactory processing to threat-detection acuity. Solitary hunters that target stressed prey.',
        signs: 'Nothing. That\'s the sign.',
        snippets: [
            {
                id: 'lurker-journal-01',
                terraId: 'lurker',
                format: 'journal',
                source: 'Personal log recovered from Mercy General, 4th floor',
                text: 'Found Yates at the south stairwell. Whatever got him was patient -- it waited for him to round the corner alone. Had to have been there already, just holding. I\'ve started making noise before I go anywhere now. Don\'t know if it helps. Feels like it should.',
            },
            {
                id: 'lurker-research-01',
                terraId: 'lurker',
                format: 'research',
                source: 'Field Pathology Report LP-003',
                text: 'Terrae procyon-infernus. Infection dramatically enhanced olfactory cortex function. Subject detects elevated cortisol at approximately 8 meter range. Behavioral note: subjects preferentially target prey displaying stress markers. Implication: remaining calm demonstrably reduces targeting probability. We are aware this is difficult to operationalize.',
            },
            {
                id: 'lurker-radio-01',
                terraId: 'lurker',
                format: 'radio',
                source: 'Recovered audio log, personal recorder',
                text: '[static] -- this is a personal log from Mercy General Floor 4 -- what we\'ve been calling lurkers, they hang from the ceiling support beams -- [pause] -- they just -- they drop -- [long static]',
            },
            {
                id: 'lurker-cryptic-01',
                terraId: 'lurker',
                format: 'cryptic',
                text: 'It already knows you\'re afraid.',
            },
        ],
    },
    {
        id: 'turned',
        name: 'The Turned',
        formerlyKnownAs: 'Homo sapiens',
        classification: 'Terrae homo-initiatus',
        threat: 'moderate',
        description: 'Early-stage infected humans. Still bipedal, still recognizably shaped. The infection preserves the form while emptying everything that made it familiar. Territorial, unpredictable, and deeply unsettling.',
        signs: 'Nothing seems wrong. Until the speed is wrong. Or the angle. Or the face.',
        snippets: [
            {
                id: 'turned-journal-01',
                terraId: 'turned',
                format: 'journal',
                source: 'Handwritten note, taped to a fire exit',
                text: 'She was standing at the end of the corridor, facing the wall. I called out. She turned around. Wrong speed. Wrong angle. I left. I\'m still thinking about her face.',
            },
            {
                id: 'turned-research-01',
                terraId: 'turned',
                format: 'research',
                source: 'Infection Report H-001, initial filing',
                text: 'Terrae homo-initiatus. Early infection stage. Bipedal locomotion preserved. Territorial behavior mirrors pre-infection nesting instinct. No documented speech. Response to name: zero. Recommend extreme caution -- the infected retain enough motor function to be deceptive.',
            },
            {
                id: 'turned-radio-01',
                terraId: 'turned',
                format: 'radio',
                source: 'North checkpoint internal broadcast',
                text: '[static] -- north checkpoint reports a turned blocking Corridor C -- staff are asked not to engage -- repeat, do not engage -- [pause] -- it was Marcus -- [static]',
            },
            {
                id: 'turned-cryptic-01',
                terraId: 'turned',
                format: 'cryptic',
                text: 'He still had his badge on.',
            },
        ],
    },
    {
        id: 'hollow',
        name: 'The Hollow',
        formerlyKnownAs: 'Odocoileus virginianus / Cervus canadensis',
        classification: 'Terrae cervus-invertus',
        threat: 'high',
        description: 'Large ungulates in terminal infection stage. Skeletal reformation severe but locomotor efficiency high. Fast beyond what their condition should allow.',
        signs: 'You won\'t see signs. You\'ll just see one.',
        snippets: [
            {
                id: 'hollow-journal-01',
                terraId: 'hollow',
                format: 'journal',
                source: 'Scavenger field notes, Sector 7',
                text: 'They look wrong in a way that\'s hard to explain. Ribs showing, eyes set too far forward, hind joints bent backward past where they should stop. But fast. Faster than anything that bony and obviously dying should be. No warning at all. Just gone. Like hitting a wall that moved.',
            },
            {
                id: 'hollow-research-01',
                terraId: 'hollow',
                format: 'research',
                source: 'Infection Study: File H-009',
                text: 'Terrae cervus-invertus. Skeletal reformation severe. Infection achieves locomotor efficiency at the cost of structural viability. Estimated subject lifespan: 18-24 months post-conversion. Terminal aggression phase observed in late-stage subjects. May target without threat stimulus. Approach vector: silent. Response time: none.',
            },
            {
                id: 'hollow-radio-01',
                terraId: 'hollow',
                format: 'radio',
                source: 'Emergency broadcast, Quarantine Authority',
                text: '[static] -- if you observe hollow-class terras near the quarantine line -- do not run -- repeat, do not run -- they respond primarily to motion -- [crackling] -- stand still if you can -- [static] -- we understand if you can\'t',
            },
            {
                id: 'hollow-cryptic-01',
                terraId: 'hollow',
                format: 'cryptic',
                text: 'She moved wrong. Everything about her moved wrong. That didn\'t slow her down at all.',
            },
        ],
    },
    {
        id: 'shade',
        name: 'The Shade',
        formerlyKnownAs: 'Felis catus / Lynx rufus',
        classification: 'Terrae felis-obscurus',
        threat: 'high',
        description: 'Solitary hunters derived from feline stock. Infection amplified photoreceptive capacity to function in near-zero light. Appear to track and study prey across multiple encounters.',
        signs: 'Two green lights in a dark corridor. Then nothing. Then you\'re bleeding.',
        snippets: [
            {
                id: 'shade-journal-01',
                terraId: 'shade',
                format: 'journal',
                source: 'Night watch log, author: Torres',
                text: 'You see their eyes first. The infection made the tapetum reflective beyond anything natural -- two green lights in the corridor, just floating there. Then gone. I\'ve started sleeping with lights on. I don\'t sleep much anymore, but I keep them on.',
            },
            {
                id: 'shade-research-01',
                terraId: 'shade',
                format: 'research',
                source: 'Field Pathology Report FS-017',
                text: 'Terrae felis-obscurus. Infection amplified tapetum lucidum to extreme photoreceptive capacity. Functional in near-zero lux environments. Strike pattern analysis suggests deliberate incapacitation priority over immediate lethality. Of note: subjects appear to learn individual prey behavioral patterns across multiple encounters. We do not know the upper limit of this.',
            },
            {
                id: 'shade-radio-01',
                terraId: 'shade',
                format: 'radio',
                source: 'Sector 7 internal relay, partial',
                text: '[static] -- confirmed three shade-class in upper floors of sector 7 -- warning, they are not behaving like earlier variants -- one of them opened a door -- [long pause] -- a closed door -- [static]',
            },
            {
                id: 'shade-cryptic-01',
                terraId: 'shade',
                format: 'cryptic',
                text: 'You\'ve been in this building longer than you think.',
            },
        ],
    },
    {
        id: 'warped',
        name: 'The Warped',
        formerlyKnownAs: 'Canis latrans / Vulpes vulpes',
        classification: 'Terrae canis-aberrans',
        threat: 'high',
        description: 'Highest confirmed cognitive index among non-human terra variants. Social hierarchy intact and formalized. Infection appears to have amplified prefrontal function. Modifies environment to constrain prey movement.',
        signs: 'Things get moved. Cans in rows. Corridors blocked from the other side.',
        snippets: [
            {
                id: 'warped-journal-01',
                terraId: 'warped',
                format: 'journal',
                source: 'Field journal: "I\'m calling them the warped"',
                text: 'They\'ve started using tools. Not building -- using. Found a stack of supply cans blocking a corridor. Whether it was a trap or just exploratory behavior I can\'t say. But it wasn\'t random. Nothing they do is random. I\'ve noticed that.',
            },
            {
                id: 'warped-research-01',
                terraId: 'warped',
                format: 'research',
                source: 'Field Pathology Report W-031',
                text: 'Terrae canis-aberrans. Highest confirmed cognitive index among non-human terra variants. Social hierarchy intact and apparently formalized, with consistent leadership behavior. Specimens observed modifying environment to constrain prey movement across multiple independent field observations. Infection appears to have amplified prefrontal cortex function. Extent unknown. Extreme caution advised.',
            },
            {
                id: 'warped-radio-01',
                terraId: 'warped',
                format: 'radio',
                source: 'Field Station 9 weekly log',
                text: '[static] -- this is Field Station 9 -- a warped pack followed our team for approximately two kilometers -- they kept pace, never attacked -- we made camp -- they made camp -- we left in the morning -- they did not follow -- [static] -- we do not know why they stopped.',
            },
            {
                id: 'warped-cryptic-01',
                terraId: 'warped',
                format: 'cryptic',
                text: 'The pack leader looked at Martinez for eleven seconds without moving. Then it looked away. Martinez didn\'t come back.',
            },
        ],
    },
    {
        id: 'sow',
        name: 'The Sow',
        formerlyKnownAs: 'Sus scrofa / Wild boar',
        classification: 'Terrae sus-fortis',
        threat: 'high',
        description: 'Infection produced heavy keratinous plating across the shoulder and cranial surface of these formerly dense-bodied mammals. Silent until the moment of contact. A charge rarely gives time to react.',
        signs: 'Structure damage at low heights. Doors forced off hinges. Walls dented inward, not outward.',
        snippets: [
            {
                id: 'sow-journal-01',
                terraId: 'sow',
                format: 'journal',
                source: 'Written on the back of a fuel receipt, sector 7 perimeter',
                text: 'Ran into a Sow near the substation. Didn\'t hear it coming. Three hundred pounds of infected boar moving at thirty miles an hour doesn\'t make a lot of noise until it\'s already too late. I\'m fine. The wall is not.',
            },
            {
                id: 'sow-research-01',
                terraId: 'sow',
                format: 'research',
                source: 'Threat Assessment: Sow-Class, compiled from field reports',
                text: 'Terrae sus-fortis. Infection produced heavy keratinous plating across shoulder and cranial surfaces. Forward charge velocity exceeds expectation for specimen mass. Recommend treating as armored threat. Ballistic penetration results: inconsistent. Maintain distance. Standard engagement doctrine does not apply.',
            },
            {
                id: 'sow-radio-01',
                terraId: 'sow',
                format: 'radio',
                source: 'Sector 7 logistics relay',
                text: '[static] -- team reported a Sow in sector 7\'s warehouse district -- they called it in, then we lost contact -- [static] -- we found the team -- [static]',
            },
            {
                id: 'sow-cryptic-01',
                terraId: 'sow',
                format: 'cryptic',
                text: 'You won\'t hear it. You\'ll just see the wall buckle.',
            },
        ],
    },
    {
        id: 'feral',
        name: 'The Feral',
        formerlyKnownAs: 'Homo sapiens',
        classification: 'Terrae homo-ferox',
        threat: 'high',
        description: 'Mid-stage infected humans. Cognitive function absent. Motor efficiency dramatically elevated beyond baseline. The form is still human. The behavior is not.',
        signs: 'Wrong posture. Bent. Too fast when they move. They don\'t move until they do.',
        snippets: [
            {
                id: 'feral-journal-01',
                terraId: 'feral',
                format: 'journal',
                source: 'Field observation log, eastern ward',
                text: 'They\'re faster than they look. The posture throws you -- bent, wrong angles -- but once they move, that\'s it. Haines said they smell fear. I told him that wasn\'t a thing. Haines is gone now.',
            },
            {
                id: 'feral-research-01',
                terraId: 'feral',
                format: 'research',
                source: 'Pathology Report HF-002, mid-stage conversion',
                text: 'Terrae homo-ferox. Mid-stage conversion. Cognitive function: absent. Motor efficiency dramatically elevated beyond baseline human. Subject covered 40 meters in 3.2 seconds on level ground. Threat profile: asymmetric. Do not confront without superior position and cover.',
            },
            {
                id: 'feral-radio-01',
                terraId: 'feral',
                format: 'radio',
                source: 'Eastern ward emergency channel',
                text: '[static] -- feral count in the eastern ward is now eleven -- quarantine has failed -- anyone on the east side, please -- [static]',
            },
            {
                id: 'feral-cryptic-01',
                terraId: 'feral',
                format: 'cryptic',
                text: 'It used to be someone. Now it is just the running.',
            },
        ],
    },
    {
        id: 'brute',
        name: 'The Brute',
        formerlyKnownAs: 'Ursus americanus / Canis lupus',
        classification: 'Terrae ursus-fortis',
        threat: 'extreme',
        description: 'Largest confirmed terra variant. Continuous keratinous plating covers the dorsal surface. Organ redundancy makes standard incapacitation unreliable. No documented field-safe countermeasure.',
        signs: 'Structure damage. Doors forced open. Walls that used to be walls.',
        snippets: [
            {
                id: 'brute-journal-01',
                terraId: 'brute',
                format: 'journal',
                source: 'Trail cam note recovered from sublevel, undated',
                text: 'Trail cam footage. Seven feet at the shoulder, maybe eight. Not charging anything. Just walking. Unhurried. Like nothing in this building is a concern. Which, looking at the footage, seems accurate.',
            },
            {
                id: 'brute-research-01',
                terraId: 'brute',
                format: 'research',
                source: 'Infection Study: File B-002, classified',
                text: 'Terrae ursus-fortis. Largest confirmed terra variant. Infection produces continuous keratinous plating across dorsal surface. Organ redundancy high -- subject sustained 40+ wound impacts before incapacitation in controlled trial. Avoid engagement. No field-safe countermeasure currently documented. Study ongoing. Researchers: two remaining.',
            },
            {
                id: 'brute-radio-01',
                terraId: 'brute',
                format: 'radio',
                source: 'Sublevel emergency broadcast, final transmission',
                text: '[static] -- lost the south generator room -- the brute that breached is too large for the reinforced blast door -- repeat, it is through the blast door -- [static] -- we have approximately six hours before -- [long static]',
            },
            {
                id: 'brute-cryptic-01',
                terraId: 'brute',
                format: 'cryptic',
                text: 'Leave the building. The building is no longer yours.',
            },
        ],
    },
    {
        id: 'apex',
        name: 'The Apex',
        formerlyKnownAs: 'Homo sapiens',
        classification: 'Terrae homo-regalis',
        threat: 'extreme',
        description: 'Final infection stage in human subjects. Infection fully integrated. Eerily still when observed. Other terra variants in proximity exhibit deferred behavior. Only one confirmed sighting. One survivor from that sighting.',
        signs: 'Everything else in the room is watching something. Then you see what.',
        snippets: [
            {
                id: 'apex-journal-01',
                terraId: 'apex',
                format: 'journal',
                source: 'Lab floor incident note, unsigned',
                text: 'We saw one. Just the once. It was standing in the center of the lab floor, surrounded by warped and brutes, and it wasn\'t doing anything. Then it looked at us. And everything else looked at us. We ran. I don\'t think that was the right choice but we ran.',
            },
            {
                id: 'apex-research-01',
                terraId: 'apex',
                format: 'research',
                source: 'Classified Study HR-001, single known copy',
                text: 'Terrae homo-regalis. Final infection stage. Infection appears to achieve pheromone-based coordination with other terra variants. Brute and Warped specimens in proximity exhibit deferred behavior. May represent apex of terra taxonomy. We have one documented sighting. One survivor from that sighting.',
            },
            {
                id: 'apex-radio-01',
                terraId: 'apex',
                format: 'radio',
                source: 'Sublevel security channel, final log entry',
                text: '[static] -- sublevel has an apex confirmed -- repeat, sublevel has an apex -- all personnel are to -- [static] -- it\'s looking at the camera -- [static]',
            },
            {
                id: 'apex-cryptic-01',
                terraId: 'apex',
                format: 'cryptic',
                text: 'Everything in that room was watching it. Then it moved, and everything moved with it.',
            },
        ],
    },
];

export function getTerraById(id: string): TerraVariant | undefined {
    return TERRA_VARIANTS.find(t => t.id === id);
}

export function getSnippetById(id: string): LoreSnippet | undefined {
    for (const t of TERRA_VARIANTS) {
        const s = t.snippets.find(s => s.id === id);
        if (s) return s;
    }
    return undefined;
}

export function getSnippetsForTerra(terraId: string, collectedIds: string[]): LoreSnippet[] {
    const terra = getTerraById(terraId);
    if (!terra) return [];
    return terra.snippets.filter(s => collectedIds.includes(s.id));
}

export function pickAmbushSnippet(terraId: string, alreadySeen: string[]): LoreSnippet | null {
    const terra = getTerraById(terraId);
    if (!terra) return null;
    const unseen = terra.snippets.filter(s => !alreadySeen.includes(s.id));
    const pool = unseen.length > 0 ? unseen : terra.snippets;
    return pool[Math.floor(Math.random() * pool.length)];
}

export const FORMAT_LABELS: Record<SnippetFormat, string> = {
    journal: 'SURVIVOR LOG',
    research: 'RESEARCH FILE',
    radio: 'RADIO INTERCEPT',
    cryptic: 'UNKNOWN SOURCE',
};

export const LORE_ITEMS: Item[] = [
    // Crawler (low)
    {
        id: 'lore-crawler-field-01',
        name: 'Crawler Field Notes',
        description: 'A small notebook. Smells like copper wire and fear.',
        rarity: 'common',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 2,
        loreTerraId: 'crawler',
        loreSnippetId: 'crawler-journal-01',
    },
    {
        id: 'lore-crawler-report-01',
        name: 'Infection Report C-001',
        description: 'A printed research file. Partial. Damp.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'crawler',
        loreSnippetId: 'crawler-research-01',
    },
    // Lurker (moderate)
    {
        id: 'lore-lurker-log-01',
        name: 'Ward Log: Floor 4',
        description: 'Personal log recovered from a hospital corridor.',
        rarity: 'common',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 2,
        loreTerraId: 'lurker',
        loreSnippetId: 'lurker-journal-01',
    },
    {
        id: 'lore-lurker-report-01',
        name: 'Pathology Report LP-003',
        description: 'Clinical notation. Written by someone who knew too much.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'lurker',
        loreSnippetId: 'lurker-research-01',
    },
    // Turned (moderate, formerly human)
    {
        id: 'lore-turned-checkpoint-01',
        name: 'Ward Checkpoint Note',
        description: 'Scrawled near a fire exit. The handwriting gets worse toward the end.',
        rarity: 'common',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 2,
        loreTerraId: 'turned',
        loreSnippetId: 'turned-journal-01',
    },
    {
        id: 'lore-turned-report-01',
        name: 'Infection Report H-001',
        description: 'Early-stage documentation. Someone filed this officially. Once.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'turned',
        loreSnippetId: 'turned-research-01',
    },
    // Hollow (high)
    {
        id: 'lore-hollow-notes-01',
        name: 'Sector 7 Field Notes',
        description: 'Handwritten on the back of a quarantine notice.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'hollow',
        loreSnippetId: 'hollow-journal-01',
    },
    // Shade (high)
    {
        id: 'lore-shade-watch-01',
        name: 'Night Watch Entry #14',
        description: 'Written in the margins of a building schematic.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'shade',
        loreSnippetId: 'shade-journal-01',
    },
    {
        id: 'lore-shade-report-01',
        name: 'Pathology Report FS-017',
        description: 'A classified summary. Someone crossed out the classification.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 6,
        loreTerraId: 'shade',
        loreSnippetId: 'shade-research-01',
    },
    // Warped (high)
    {
        id: 'lore-warped-journal-01',
        name: 'Field Journal: "The Warped"',
        description: 'A personal journal, 47 entries. You found it at entry 12.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'warped',
        loreSnippetId: 'warped-journal-01',
    },
    {
        id: 'lore-warped-station-01',
        name: 'Station 9 Weekly Log',
        description: 'Audio log transcript. Static fills the margins.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 6,
        loreTerraId: 'warped',
        loreSnippetId: 'warped-radio-01',
    },
    // Sow (high)
    {
        id: 'lore-sow-substation-01',
        name: 'Substation Encounter Note',
        description: 'Written very fast. On the back of a fuel receipt.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'sow',
        loreSnippetId: 'sow-journal-01',
    },
    {
        id: 'lore-sow-assessment-01',
        name: 'Threat Assessment: Sow-Class',
        description: 'Military-formatted report. Mostly ballistic testing data.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 6,
        loreTerraId: 'sow',
        loreSnippetId: 'sow-research-01',
    },
    // Feral (high, formerly human)
    {
        id: 'lore-feral-fieldnotes-01',
        name: 'Eastern Ward Field Notes',
        description: 'Observations from someone who watched from a distance. Wisely.',
        rarity: 'uncommon',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 4,
        loreTerraId: 'feral',
        loreSnippetId: 'feral-journal-01',
    },
    {
        id: 'lore-feral-report-01',
        name: 'Pathology Report HF-002',
        description: 'Mid-stage conversion data. Some details are redacted in pen.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 6,
        loreTerraId: 'feral',
        loreSnippetId: 'feral-research-01',
    },
    // Brute (extreme)
    {
        id: 'lore-brute-cam-01',
        name: 'Trail Cam Note',
        description: 'A note taped to a camera housing. Undated.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 6,
        loreTerraId: 'brute',
        loreSnippetId: 'brute-journal-01',
    },
    {
        id: 'lore-brute-study-01',
        name: 'Classified Study B-002',
        description: 'Red stamp reads DESTROY. Someone didn\'t.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 8,
        loreTerraId: 'brute',
        loreSnippetId: 'brute-research-01',
    },
    // Apex (extreme, formerly human)
    {
        id: 'lore-apex-incident-01',
        name: 'Lab Floor Incident Note',
        description: 'A memo about a sighting. Signed by someone who didn\'t file another one.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 6,
        loreTerraId: 'apex',
        loreSnippetId: 'apex-journal-01',
    },
    {
        id: 'lore-apex-study-01',
        name: 'Classified Study HR-001',
        description: 'Single known copy. Wet. Most of the second page is gone.',
        rarity: 'rare',
        type: 'lore',
        power: 0, damage: 0, defense: 0, special: [],
        sellValue: 8,
        loreTerraId: 'apex',
        loreSnippetId: 'apex-research-01',
    },
];

export function pickLoreItemForLocation(terraIds: string[], collectedIds: string[]): Item | null {
    const eligible = LORE_ITEMS.filter(li =>
        li.loreTerraId && terraIds.includes(li.loreTerraId) &&
        li.loreSnippetId && !collectedIds.includes(li.loreSnippetId)
    );
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
}
