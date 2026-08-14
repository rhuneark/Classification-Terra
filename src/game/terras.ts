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
    threat: 'low' | 'medium' | 'high' | 'extreme';
    description: string;
    signs: string;
    snippets: LoreSnippet[];
}

const AMBUSH_SNIPPET_CHANCE: Record<TerraVariant['threat'], number> = {
    low: 0.38,
    medium: 0.25,
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
        threat: 'medium',
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
        threat: 'medium',
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

    // ── NEW TERRAS ──────────────────────────────────────────────────────────
    {
        id: 'carrier',
        name: 'The Carrier',
        formerlyKnownAs: 'Rattus rattus',
        classification: 'Terrae rattus-vectoris',
        threat: 'low',
        description: 'A smaller, more solitary variant of the Crawler lineage. Infection produced no visible physical change. The danger is invisible and cumulative. Field reports consistently note no visible signs before exposure.',
        signs: 'Fur remains intact. No visible modification. Prolonged proximity is the only reliable indicator.',
        snippets: [
            {
                id: 'carrier-journal-01',
                terraId: 'carrier',
                format: 'journal',
                source: 'Personal log, scavenger name unknown',
                text: "Day 3 of the Overpass run. Saw a small rat near the drainage pipe — normal-looking, nothing strange. Didn't bother it. Day 5, I've got a rash on my forearm where the pipe brushed my sleeve. Day 7, the rash has spread. I'm starting to feel the other symptoms from the field notes. I wish I'd read the field notes first.",
            },
            {
                id: 'carrier-research-01',
                terraId: 'carrier',
                format: 'research',
                source: 'Infection Study: File C-009, vector analysis',
                text: "Terrae rattus-vectoris. Infection produced no visible morphological change. Primary threat is pathogen vectoring via direct contact. Transmission confirmed: surface contact, respiratory proximity, contaminated water. The Carrier is not aggressive. It does not need to be. Recommend treating all small rodents as potential vectors regardless of apparent health.",
            },
            {
                id: 'carrier-radio-01',
                terraId: 'carrier',
                format: 'radio',
                source: 'Sector hygiene advisory, date unclear',
                text: "[static] — update on the Overpass sector — do not handle any rodent remains found in the area — repeat, do not handle — three teams have reported exposure symptoms after what they described as routine scavenging — [static] — the Carriers don't look like anything — that's the problem — [static]",
            },
            {
                id: 'carrier-cryptic-01',
                terraId: 'carrier',
                format: 'cryptic',
                text: "It looked fine. That was the only warning.",
            },
        ],
    },
    {
        id: 'hound',
        name: 'The Hound',
        formerlyKnownAs: 'Canis lupus familiaris',
        classification: 'Terrae canis-fidelis',
        threat: 'medium',
        description: 'Domesticated dogs, infection-modified. Pack loyalty intact, redirected. They no longer recognize former owners. They do still recognize pack hierarchy. Whoever leads their current pack leads them.',
        signs: 'Barking that stops too quickly. Coordinated movement without a signal. They wait at corners.',
        snippets: [
            {
                id: 'hound-journal-01',
                terraId: 'hound',
                format: 'journal',
                source: 'Recovery journal, Mercy General lower ward',
                text: "Found three of them in the east stairwell. They used to be someone's pets — you could tell from the collar hardware still attached. They were organized. One watched the entry, one watched the exit, one was in the middle and never moved. I didn't move either. We waited each other out for twenty minutes. They left first. I'm not sure who won.",
            },
            {
                id: 'hound-research-01',
                terraId: 'hound',
                format: 'research',
                source: 'Behavioral Study H-004, canis domesticus variants',
                text: "Terrae canis-fidelis. Pack loyalty fully intact. Infection appears to have eliminated individual attachment while preserving group behavior. Packs maintain territorial routes with high consistency. New individuals joining the pack are accepted within 72 hours. We do not recommend testing whether infected humans can join a Hound pack. We also note that one researcher tested this and we have not received a follow-up.",
            },
            {
                id: 'hound-radio-01',
                terraId: 'hound',
                format: 'radio',
                source: 'Hospital sector internal channel',
                text: "[static] — Hound pack has moved into the lower ward, rooms 14 through 22 — they haven't aggressed, but they're blocking the pharmacy access corridor — we've tried standard dispersal — they don't disperse — [pause] — one of them is wearing a collar that says 'Biscuit' — [long pause] — [static]",
            },
            {
                id: 'hound-cryptic-01',
                terraId: 'hound',
                format: 'cryptic',
                text: "It was waiting at the corner. It had been waiting for a while.",
            },
        ],
    },
    {
        id: 'molt',
        name: 'The Molt',
        formerlyKnownAs: 'Elaphe obsoleta / Crotalus horridus',
        classification: 'Terrae serpens-involutus',
        threat: 'medium',
        description: 'Large serpents, infection-enlarged beyond any recorded baseline. Shed skins found near Mercy General lower levels frequently measure over six meters. The living specimens are larger. They do not move until they decide to.',
        signs: 'Skins along corridors, translucent, recent. A cold draft from below floor level. Silence that doesn\'t break when it should.',
        snippets: [
            {
                id: 'molt-journal-01',
                terraId: 'molt',
                format: 'journal',
                source: 'Field notes, hospital basement survey',
                text: "Found a shed skin in the basement access corridor. Measured it against my arm span — approximately nine meters. That was the skin. I did not try to find what shed it. The note I'm leaving here is for whoever comes after me and thinks the basement is clear because they don't see anything. Check the floor drains. They fit.",
            },
            {
                id: 'molt-research-01',
                terraId: 'molt',
                format: 'research',
                source: 'Infection Study: File S-003, serpent variants',
                text: "Terrae serpens-involutus. Infection produced accelerated growth and enhanced thermal detection. Shed cycle: approximately 40 days. Shed skins serve as useful size indicators — skins found in Mercy General basement suggest specimens of 7-10 meters. Strike range exceeds visual warning range. Infrared masking recommended if available. Not available.",
            },
            {
                id: 'molt-radio-01',
                terraId: 'molt',
                format: 'radio',
                source: 'Recovered audio, personal recorder, hospital ID badge found nearby',
                text: "[static] — this is a personal log — I'm in the sub-basement and I found a skin that is — it's wider than my shoulders — [long pause] — something just moved the floor drain cover from below — [static]",
            },
            {
                id: 'molt-cryptic-01',
                terraId: 'molt',
                format: 'cryptic',
                text: "It was below you. It was always below you.",
            },
        ],
    },
    {
        id: 'scion',
        name: 'The Scion',
        formerlyKnownAs: 'Homo sapiens (juvenile)',
        classification: 'Terrae homo-junior',
        threat: 'medium',
        description: 'Juvenile humans in early infection stage. The infection behaves differently in younger subjects — cognition degraded more slowly, but behavioral patterns became alien faster. They still use the spaces children use.',
        signs: 'Small handprints. Toys arranged. Voices on floors where there should be no voices.',
        snippets: [
            {
                id: 'scion-journal-01',
                terraId: 'scion',
                format: 'journal',
                source: 'Handwritten note, pediatric ward, taped to a window',
                text: "I found a crayon drawing on the wall near the stairwell. It showed the hospital, very accurately. It showed where we had put the barricades. It showed where we had placed the night watch. The drawing was done in the last two days. I know because the barricade positions were updated two days ago.",
            },
            {
                id: 'scion-research-01',
                terraId: 'scion',
                format: 'research',
                source: 'Pediatric Infection Observation, File J-001',
                text: "Terrae homo-junior. Juvenile infection subjects exhibit slower cognitive degradation but accelerated behavioral divergence. Subjects retain spatial memory and fine motor skills beyond adult infection benchmarks. They organize environments. They leave records. The content of those records is not interpretable with current frameworks. Recommendation: Do not approach occupied pediatric wards.",
            },
            {
                id: 'scion-radio-01',
                terraId: 'scion',
                format: 'radio',
                source: 'Night watch recording, pediatric floor',
                text: "[static] — this is the night watch log, pediatric floor, hour 14 — I heard singing about twenty minutes ago from the east corridor — the east corridor was cleared two days ago — [pause] — the singing was in a language I recognize — [pause] — it was asking questions — [static]",
            },
            {
                id: 'scion-cryptic-01',
                terraId: 'scion',
                format: 'cryptic',
                text: "The drawing was accurate. That was the part that mattered.",
            },
        ],
    },
    {
        id: 'colony',
        name: 'The Colony',
        formerlyKnownAs: 'Vespula germanica / Apis mellifera (macro-colony hybrid)',
        classification: 'Terrae colonia-convergis',
        threat: 'high',
        description: 'Macro-colony formation — infection appears to have merged multiple insect species into a single coordinated mass. Individual insects are standard-sized. The colony behaves as a single organism, and has learned to occupy spaces no other terra variant can.',
        signs: 'Papery buildup in corners. Vibration in metal surfaces. A sound like static that doesn\'t come from electronics.',
        snippets: [
            {
                id: 'colony-journal-01',
                terraId: 'colony',
                format: 'journal',
                source: 'Quarantine Sector 7 field log, run 14',
                text: "The ventilation system in Block C is occupied. We didn't realize this until one of the vents opened — not by us — and the colony poured out of it in a stream that took four minutes to clear the room. Four minutes. We counted. We were not in the room at the time because we had noticed the vibration in the ductwork thirty seconds earlier. Pay attention to the ductwork.",
            },
            {
                id: 'colony-research-01',
                terraId: 'colony',
                format: 'research',
                source: 'Infection Study: File I-001, colonial organisms',
                text: "Terrae colonia-convergis. Multi-species colonial organism. The infection appears to have synchronized pheromone signaling across previously incompatible species, producing a unified behavioral system. The colony exhibits collective intelligence exceeding any documented individual insect capacity. It maps terrain. It avoids previously-experienced threats. Previous threat-avoidance data persists even when significant colony mass is lost.",
            },
            {
                id: 'colony-radio-01',
                terraId: 'colony',
                format: 'radio',
                source: 'Sector 7 evacuation channel',
                text: "[static] — all personnel evacuating through the west corridor — do not use the east corridor — the Colony has blocked it — repeat, the Colony has physically blocked the east corridor using structural material — [pause] — this is not accidental — [static]",
            },
            {
                id: 'colony-cryptic-01',
                terraId: 'colony',
                format: 'cryptic',
                text: "The vent opened. Then the room wasn't yours anymore.",
            },
        ],
    },
    {
        id: 'runner',
        name: 'The Runner',
        formerlyKnownAs: 'Equus ferus caballus',
        classification: 'Terrae equus-velox',
        threat: 'high',
        description: 'Formerly domesticated horses. Infection produced dramatic musculature enhancement and apparent removal of all fatigue-response limitations. They do not stop. They do not tire. Open sectors of Quarantine Sector 7 have been documented as Runner territory because nothing else can survive at that speed.',
        signs: 'Ground vibration before audible hoofbeats. Impact damage to structures at mid-height. Anything in an open corridor that moves first.',
        snippets: [
            {
                id: 'runner-journal-01',
                terraId: 'runner',
                format: 'journal',
                source: 'Sector 7 perimeter log, unnamed scavenger',
                text: "Saw a Runner cross the open stretch between Block F and the access road. Timed it at roughly 50 meters in two seconds. I have run that stretch. It takes me about twelve. The Runner didn't appear to notice me. I remained motionless for eleven minutes after it passed before continuing. Not because it came back. Because I needed eleven minutes.",
            },
            {
                id: 'runner-research-01',
                terraId: 'runner',
                format: 'research',
                source: 'Movement Study QS7-E-001, open sector observation',
                text: "Terrae equus-velox. Infection removed normal fatigue-response limitations. Subjects have been observed in continuous movement for periods exceeding 40 hours without apparent deceleration. Top speed documented: approximately 95 km/h. Standard evasion doctrine does not apply. Containment doctrine does not apply. No current effective countermeasure for open-space encounters.",
            },
            {
                id: 'runner-radio-01',
                terraId: 'runner',
                format: 'radio',
                source: 'Quarantine Authority emergency broadcast',
                text: "[static] — Runner-class in the open sector between Blocks C and H — all personnel are advised not to use the open sector — repeat — if you are currently in the open sector between C and H — [very long static]",
            },
            {
                id: 'runner-cryptic-01',
                terraId: 'runner',
                format: 'cryptic',
                text: "You heard the ground first. Then you heard nothing else.",
            },
        ],
    },
    {
        id: 'perch',
        name: 'The Perch',
        formerlyKnownAs: 'Haliaeetus leucocephalus / Buteo jamaicensis',
        classification: 'Terrae accipiter-vigilis',
        threat: 'high',
        description: 'Large raptors with infection-enhanced vision. They do not hunt immediately on sighting. They watch from height. Field reports uniformly describe the same thing: a bird, stationary on elevated infrastructure, watching you specifically.',
        signs: 'Shadow from no cloud. A bird on every high point that has line-of-sight to your position. The feeling of being selected.',
        snippets: [
            {
                id: 'perch-journal-01',
                terraId: 'perch',
                format: 'journal',
                source: 'Sector 7 scouting log, run 9',
                text: "One on the roof of the processing facility. One on the water tower. One on the dead traffic signal at the main intersection. All three were there when I entered the sector. All three were watching me. Only me — I checked whether they were tracking movement in general. They weren't. When I left, they stayed. The watches were specifically for me. I don't know what conclusion to draw from that.",
            },
            {
                id: 'perch-research-01',
                terraId: 'perch',
                format: 'research',
                source: 'Aerial Fauna Study AP-002',
                text: "Terrae accipiter-vigilis. Infection enhanced visual acuity significantly beyond pre-infection baseline. Individuals can resolve target-level detail at distances exceeding 2 kilometers. Attack behavior is preceded by extended observation period. Average observation time before strike: 18 minutes. The 18-minute window is not an opportunity — it is a countdown.",
            },
            {
                id: 'perch-radio-01',
                terraId: 'perch',
                format: 'radio',
                source: 'Cross-sector advisory, Quarantine Authority',
                text: "[static] — Perch activity confirmed across Sectors 5 through 9 — field teams report consistent surveillance behavior — if you see one watching you — [pause] — there are others you haven't seen yet — [static]",
            },
            {
                id: 'perch-cryptic-01',
                terraId: 'perch',
                format: 'cryptic',
                text: "It was watching you when you arrived. It was watching you when you left. It was always watching.",
            },
        ],
    },
    {
        id: 'veil',
        name: 'The Veil',
        formerlyKnownAs: 'Tadarida brasiliensis / Eptesicus fuscus',
        classification: 'Terrae chiroptera-obscurus',
        threat: 'high',
        description: 'Colony-forming bat variants with infection-enhanced echolocation. A single Veil individual is manageable. The Veil does not travel as individuals. Confirmed colony sizes in Sector 7 range from several hundred to an unknown upper figure.',
        signs: 'Ultrasonic interference on scanning equipment. A pressure change in enclosed spaces. Darkness that responds.',
        snippets: [
            {
                id: 'veil-journal-01',
                terraId: 'veil',
                format: 'journal',
                source: 'Night run log, Sector 7 upper floors',
                text: "The scanner started cutting out on the fourth floor. I assumed equipment failure. Then I noticed the temperature had dropped four degrees. Then I noticed the temperature wasn't the only thing that was wrong. The darkness in the west corridor was moving. I turned my light off. The darkness kept moving. I left through the east stairwell. I'm writing this in the morning and I still haven't figured out what exactly I saw.",
            },
            {
                id: 'veil-research-01',
                terraId: 'veil',
                format: 'research',
                source: 'Acoustic Study: File V-002',
                text: "Terrae chiroptera-obscurus. Enhanced echolocation producing 3D environmental mapping at range. Colony coordination via ultrasonic frequency invisible to human hearing. Scanning equipment interference confirmed — the echolocation signal disrupts standard frequency bands. Night encounters are not recommended under any loadout. Day encounters in enclosed spaces are equivalent to night encounters.",
            },
            {
                id: 'veil-radio-01',
                terraId: 'veil',
                format: 'radio',
                source: 'Sector 7 internal broadcast, upper floors',
                text: "[static] — Veil colony has occupied floors 8 through 12 — estimate 400-plus individuals — our scanning equipment is useless in that range — [pause] — the interesting part: they've been there for two weeks — they haven't expanded — they're waiting for something — [static]",
            },
            {
                id: 'veil-cryptic-01',
                terraId: 'veil',
                format: 'cryptic',
                text: "The darkness moved. You didn't.",
            },
        ],
    },
    {
        id: 'shepherd',
        name: 'The Shepherd',
        formerlyKnownAs: 'Canis lupus familiaris (herding breeds)',
        classification: 'Terrae canis-rector',
        threat: 'extreme',
        description: 'Herding breed dogs in late infection stage. Where the Warped show intelligence through tool use, the Shepherd shows intelligence through coordination of other terra variants. Confirmed field observations of Shepherds directing Brute and Sow movement.',
        signs: 'Other terra variants behaving in unfamiliar patterns. Coordinated approaches from multiple directions. Something watching the others.',
        snippets: [
            {
                id: 'shepherd-journal-01',
                terraId: 'shepherd',
                format: 'journal',
                source: 'Sublevel Complex access log, team lead notes',
                text: "We saw a Brute and two Sows moving together in the sublevel maintenance corridor. That shouldn't happen — they don't interact. Then we saw why. A mid-sized dog at the rear of the group was moving to maintain formation. It was positioning them. It moved left, the Brute moved left. It stopped, they stopped. We documented this for approximately ninety seconds and then spent the next twenty minutes finding a different corridor.",
            },
            {
                id: 'shepherd-research-01',
                terraId: 'shepherd',
                format: 'research',
                source: 'Cross-Variant Study SH-001, classified',
                text: "Terrae canis-rector. Herding instinct fully preserved and redirected. Unlike the Warped (which coordinates its own species), the Shepherd demonstrates cross-species coordination capability. Subject can direct Brute, Sow, and Feral class terras with apparent success. Current hypothesis: infection produced pheromone-based command signals compatible with other terra variant receptors. The practical implication is that a Shepherd-directed group exceeds any individual threat classification.",
            },
            {
                id: 'shepherd-radio-01',
                terraId: 'shepherd',
                format: 'radio',
                source: 'Sublevel Research Complex security channel',
                text: "[static] — sublevel team reports a Shepherd-coordinated group in section D — Brute confirmed, multiple Sow — the team is falling back to the upper maintenance shaft — [pause] — the Shepherd has positioned units at the shaft entrance — [static] — it knew where we were going — [static]",
            },
            {
                id: 'shepherd-cryptic-01',
                terraId: 'shepherd',
                format: 'cryptic',
                text: "It was small. That was the last thing you noticed about it.",
            },
        ],
    },
    {
        id: 'witness',
        name: 'The Witness',
        formerlyKnownAs: 'Homo sapiens',
        classification: 'Terrae homo-testis',
        threat: 'extreme',
        description: 'A distinct late-stage human infection variant. Where the Apex shows coordination and command behavior, the Witness shows none of these things. It observes. It records. It is always present at significant terra events — discoveries, deaths, structural failures — and always leaves before the outcome. Nobody knows why.',
        signs: 'You are not alone but nothing has engaged. A human silhouette in peripheral vision that is gone when you look directly.',
        snippets: [
            {
                id: 'witness-journal-01',
                terraId: 'witness',
                format: 'journal',
                source: 'Sublevel Complex log, final entry before extraction',
                text: "I've seen it three times. Once at the entrance when we first arrived. Once at the Brute incident. Once at the door to the generator room before we knew what the generator room was. Each time it was standing still at a distance. Each time when I looked directly at it, there was nothing there. I'm starting to believe the sightings are not coincidental. I'm starting to believe the Witness knows what happens before it happens.",
            },
            {
                id: 'witness-research-01',
                terraId: 'witness',
                format: 'research',
                source: 'Classified Study WT-001, single known copy, partially burned',
                text: "Terrae homo-testis. Late-stage human infection variant, distinct from Apex. No aggressive behavior documented. No territorial behavior. No communication with other terra variants. Subject appears at locations of significant ecological events — territory shifts, prey events, structural changes — prior to those events occurring. Precognitive capacity cannot be confirmed. Predictive modeling based on environmental data is the preferred working explanation. We note this explanation becomes less satisfying each time.",
            },
            {
                id: 'witness-radio-01',
                terraId: 'witness',
                format: 'radio',
                source: 'Sublevel facility final broadcast',
                text: "[static] — there is a figure standing at the end of the sublevel corridor — it has been standing there for six hours — it has not moved — it is watching the generator room — [pause] — the generator room started emitting the anomalous signal twelve minutes later — [static] — we believe the Witness knew — [long static]",
            },
            {
                id: 'witness-cryptic-01',
                terraId: 'witness',
                format: 'cryptic',
                text: "It was there before anything happened. It was gone after.",
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
