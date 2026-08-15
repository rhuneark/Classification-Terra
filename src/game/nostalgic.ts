import type { Item, QualityTier } from './types.ts';
import { QUALITY_SELL_MULTIPLIERS } from './types.ts';

export interface NostalgicBase {
    id: string;
    name: string;
    description: string;
    realFact: string;
    setId?: string;
    baseValue: number;
}

export interface NostalgicSet {
    id: string;
    name: string;
    members: string[];
    bonusDescription: string;
}

export const QUALITY_TIERS: QualityTier[] = ['broken', 'worn', 'used', 'good', 'perfect'];

// Weighted drop pool — 60% broken/worn, 25% used, 12% good, 3% perfect
export const QUALITY_DROP_POOL: QualityTier[] = [
    'broken', 'broken', 'broken', 'broken', 'broken', 'broken', 'broken',
    'worn',   'worn',   'worn',   'worn',   'worn',   'worn',
    'used',   'used',   'used',   'used',   'used',   'used',
    'good',   'good',   'good',
    'perfect',
];

// ── SETS ─────────────────────────────────────────────────────────────────────

export const NOSTALGIC_SETS: NostalgicSet[] = [
    {
        id: 'the-archive',
        name: 'THE ARCHIVE',
        members: ['nost-shazaam', 'nost-sex-in-the-city', 'nost-interview-vampire', 'nost-champions-tape'],
        bonusDescription: '+20% sell value on all relics',
    },
    {
        id: 'the-shelf',
        name: 'THE SHELF',
        members: ['nost-jiffy-jar', 'nost-sketchers-box', 'nost-cornucopia-pin', 'nost-double-stuff'],
        bonusDescription: '+400 base resources when donated together',
    },
    {
        id: 'the-toybox',
        name: 'THE TOYBOX',
        members: ['nost-monocle-charm', 'nost-berenstein-book', 'nost-curious-plush', 'nost-silver-leg'],
        bonusDescription: 'Trophy room completion bonus: +15 base morale',
    },
    {
        id: 'screen-memories',
        name: 'SCREEN MEMORIES',
        members: ['nost-luke-script', 'nost-mirror-mirror', 'nost-chartreuse'],
        bonusDescription: 'All 3 trophied: unlocks hidden lore entry',
    },
];

// ── BASE ITEMS (30 total) ─────────────────────────────────────────────────────

export const NOSTALGIC_BASES: NostalgicBase[] = [
    // THE ARCHIVE set (4)
    {
        id: 'nost-shazaam',
        name: '"Shazaam" VHS',
        description: 'Sinbad as a genie. 1994. Everyone saw it. Tape shows nothing but static.',
        realFact: 'No such film was ever produced.',
        setId: 'the-archive',
        baseValue: 80,
    },
    {
        id: 'nost-sex-in-the-city',
        name: '"Sex In The City" DVD',
        description: 'Season 3 box set. The title is spelled wrong. No one notices.',
        realFact: 'The show is titled "Sex AND the City."',
        setId: 'the-archive',
        baseValue: 65,
    },
    {
        id: 'nost-interview-vampire',
        name: '"Interview With The Vampire" VHS',
        description: 'Everyone remembers "The." It says "A." Always did.',
        realFact: 'The film title is "Interview with the Vampire." The novel: "Interview with the Vampire." Both correct. The "A" vs "The" debate persists.',
        setId: 'the-archive',
        baseValue: 70,
    },
    {
        id: 'nost-champions-tape',
        name: '"Champions of the World" Cassette',
        description: 'Live recording. Ends at "of the world." Crowd goes silent. Tape ends.',
        realFact: '"We Are the Champions" fades out before "of the world." The line isn\'t there.',
        setId: 'the-archive',
        baseValue: 60,
    },

    // THE SHELF set (4)
    {
        id: 'nost-jiffy-jar',
        name: '"Jiffy" Peanut Butter Jar',
        description: 'Dusty label. Bold lettering. Says JIFFY. Never existed. You\'re sure of it.',
        realFact: 'The brand is "Jif." "Jiffy" is the false memory.',
        setId: 'the-shelf',
        baseValue: 55,
    },
    {
        id: 'nost-sketchers-box',
        name: '"Sketchers" Shoe Box',
        description: 'Lightly used box. Pristine lettering. The spelling looks wrong to you now.',
        realFact: 'The brand is "Skechers." One "t." Always.',
        setId: 'the-shelf',
        baseValue: 50,
    },
    {
        id: 'nost-cornucopia-pin',
        name: 'Cornucopia Lapel Pin',
        description: 'Found in a cereal box. Tiny fruit horn of plenty. Says it\'s from the logo.',
        realFact: 'No cornucopia appears in the Fruit of the Loom logo. Never did.',
        setId: 'the-shelf',
        baseValue: 75,
    },
    {
        id: 'nost-double-stuff',
        name: '"Double Stuff" Cookie Package',
        description: 'Two layers of filling. Two f\'s. You\'d swear that\'s right.',
        realFact: '"Double Stuf" — one "f." Has always been one "f."',
        setId: 'the-shelf',
        baseValue: 45,
    },

    // THE TOYBOX set (4)
    {
        id: 'nost-monocle-charm',
        name: 'Monocle Top Hat Charm',
        description: 'Small pewter charm. Top hat. Monocle. Mustache. Exactly as remembered.',
        realFact: 'The Monopoly mascot never wore a monocle. Never depicted with one.',
        setId: 'the-toybox',
        baseValue: 85,
    },
    {
        id: 'nost-berenstein-book',
        name: '"Berenstein Bears" Book',
        description: 'The spine says BERENSTEIN. In your memory that\'s correct. It isn\'t.',
        realFact: 'Always "Berenstain." The "-stein" ending is the false memory.',
        setId: 'the-toybox',
        baseValue: 60,
    },
    {
        id: 'nost-curious-plush',
        name: 'Tailless Monkey Plush',
        description: 'Small stuffed monkey. No tail. Tag says he\'s curious. He doesn\'t have one.',
        realFact: 'Curious George has no tail in the books. He does in your memory.',
        setId: 'the-toybox',
        baseValue: 55,
    },
    {
        id: 'nost-silver-leg',
        name: 'C-3PO Silver Leg Note',
        description: 'Handwritten memo: "Left leg — silver panel. Always silver. Check."',
        realFact: 'C-3PO has a silver lower right leg. Most people paint it gold in memory.',
        setId: 'the-toybox',
        baseValue: 70,
    },

    // SCREEN MEMORIES set (3)
    {
        id: 'nost-luke-script',
        name: '"Luke, I Am Your Father" Script',
        description: 'Yellowed pages. The line is circled twice. It reads differently than you remember.',
        realFact: 'The line is "No. I am your father." "Luke" is never said.',
        setId: 'screen-memories',
        baseValue: 90,
    },
    {
        id: 'nost-mirror-mirror',
        name: '"Mirror Mirror on the Wall" Card',
        description: 'Old stage prompt. Quotes the Evil Queen verbatim. You\'ve said this line wrong your whole life.',
        realFact: 'The line is "Magic Mirror on the wall." Not "Mirror Mirror."',
        setId: 'screen-memories',
        baseValue: 75,
    },
    {
        id: 'nost-chartreuse',
        name: 'Chartreuse Color Swatch',
        description: 'Paint chip. Labeled CHARTREUSE. The color is a yellow-green. Your brain says purple.',
        realFact: 'Chartreuse is yellow-green. The purple memory is universal and entirely wrong.',
        setId: 'screen-memories',
        baseValue: 65,
    },

    // Solo relics (15)
    {
        id: 'nost-looney-toons',
        name: '"Looney Toons" VHS',
        description: 'Bugs on the label. The title is spelled with an "oo." That looks wrong to you.',
        realFact: '"Looney Tunes." "Toons" is the persistent misspelling.',
        baseValue: 50,
    },
    {
        id: 'nost-oscar-meyer',
        name: '"Oscar Meyer" Wiener Whistle',
        description: 'Promotional tin whistle from a hot dog brand. The spelling is bothering you.',
        realFact: '"Oscar Mayer." One "e," not two.',
        baseValue: 45,
    },
    {
        id: 'nost-chik-sauce',
        name: '"Chik-fil-A" Sauce Packet',
        description: 'Foil packet, slightly sticky. The name looks misspelled. You\'re not sure why.',
        realFact: '"Chick-fil-A." Two c\'s. Always.',
        baseValue: 40,
    },
    {
        id: 'nost-kitkat-wrapper',
        name: 'Kit-Kat Wrapper',
        description: 'Smooth chocolate bar wrapper. Hyphenated. You\'re not certain it ever was.',
        realFact: 'The brand name has no hyphen. "KitKat." The hyphen is the false memory.',
        baseValue: 45,
    },
    {
        id: 'nost-depends-pack',
        name: '"Depends" Package',
        description: 'Medical supply packaging. The "s" at the end feels right. It isn\'t.',
        realFact: 'The brand is "Depend." No "s." Ever.',
        baseValue: 35,
    },
    {
        id: 'nost-ricochet-sticker',
        name: 'Ricochet Rabbit Sticker',
        description: 'Cartoon rabbit, cowboy hat, silver star. You remember this clearly. You\'re not sure why.',
        realFact: 'Ricochet Rabbit is a real cartoon. The Mandela effect: many remember him as a Bugs Bunny sidekick. He wasn\'t.',
        baseValue: 55,
    },
    {
        id: 'nost-interview-mag',
        name: '"Interview" Magazine Back Issue',
        description: 'Celebrity on the cover. Pre-apocalypse printing. The celebrity\'s face is familiar for reasons you can\'t place.',
        realFact: '"Interview" magazine is real. Most people misremember who was on the cover.',
        baseValue: 50,
    },
    {
        id: 'nost-pikachu-tail',
        name: 'Pikachu Tail Sketch',
        description: 'Hand-drawn fan art. Tail tip colored solid black. The artist was certain.',
        realFact: 'Pikachu\'s tail has no black tip. It\'s entirely yellow. Always has been.',
        baseValue: 65,
    },
    {
        id: 'nost-tank-photo',
        name: '"Tank Standing" Photograph',
        description: 'Blurry print. Man in white shirt. Facing a tank. Not under one.',
        realFact: 'The man stood in front of the tank. He was not run over. Many misremember the outcome.',
        baseValue: 95,
    },
    {
        id: 'nost-monopoly-car',
        name: 'Monopoly Iron Token',
        description: 'Small pewter iron game piece. You always played as the car. You remember an iron though.',
        realFact: 'The iron token was retired in 2013. Many remember it as never existing.',
        baseValue: 60,
    },
    {
        id: 'nost-froot-loops',
        name: '"Froot Loops" Cereal Box',
        description: 'Colorful toucan on front. Spelled with two o\'s. Both times. That\'s the real version.',
        realFact: '"Froot Loops" — not "Fruit Loops." Always spelled "Froot."',
        baseValue: 40,
    },
    {
        id: 'nost-kb-toys',
        name: '"Kay Bee Toys" Gift Card',
        description: 'Unused gift card. Bright yellow. The store name is full. Most people remember it shorter.',
        realFact: 'Officially "Kay-Bee Toys." Many remember it as just "KB Toys."',
        baseValue: 50,
    },
    {
        id: 'nost-ford-logo',
        name: 'Ford Logo Badge',
        description: 'Chrome emblem. The F has an extra curl at the bottom. You never noticed before.',
        realFact: 'Many people believe the Ford logo lacks the lower curl on the "F." It has always been there.',
        baseValue: 70,
    },
    {
        id: 'nost-nelson-mandela',
        name: 'Mandela Tribute Pamphlet',
        description: 'Memorial program. 2013 date. Many readers remember attending a different one decades earlier.',
        realFact: 'Nelson Mandela died in 2013. Widespread false memory of his death in prison in the 1980s gave the effect its name.',
        baseValue: 100,
    },
    {
        id: 'nost-coca-cola-logo',
        name: 'Coca-Cola Bottle Cap',
        description: 'Red cap with the logo. The hyphen placement looks off to you. It probably is.',
        realFact: 'Many people misremember whether "Coca-Cola" always had the hyphen. It always did.',
        baseValue: 55,
    },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

export function createNostalgicItem(base: NostalgicBase, quality: QualityTier): Item {
    const mult = QUALITY_SELL_MULTIPLIERS[quality];
    return {
        id: `${base.id}-${quality}`,
        name: `${base.name}`,
        description: base.description,
        rarity: 'nostalgic',
        type: 'nostalgic',
        power: 0,
        damage: 0,
        defense: 0,
        special: [],
        sellValue: Math.round(base.baseValue * mult),
        qualityTier: quality,
        nostalgicBaseId: base.id,
        setId: base.setId,
    };
}

export function rollNostalgicQuality(): QualityTier {
    return QUALITY_DROP_POOL[Math.floor(Math.random() * QUALITY_DROP_POOL.length)];
}

export function rollRandomNostalgicItem(): Item {
    const base = NOSTALGIC_BASES[Math.floor(Math.random() * NOSTALGIC_BASES.length)];
    return createNostalgicItem(base, rollNostalgicQuality());
}

export function getNostalgicBaseById(baseId: string): NostalgicBase | undefined {
    return NOSTALGIC_BASES.find(b => b.id === baseId);
}

export function getNostalgicSetById(setId: string): NostalgicSet | undefined {
    return NOSTALGIC_SETS.find(s => s.id === setId);
}

export function restoreNostalgicItem(itemId: string): Item | null {
    // id format: {baseId}-{quality}
    const lastDash = itemId.lastIndexOf('-');
    if (lastDash < 0) return null;
    const baseId = itemId.slice(0, lastDash);
    const quality = itemId.slice(lastDash + 1) as QualityTier;
    const base = getNostalgicBaseById(baseId);
    if (!base) return null;
    if (!(['broken', 'worn', 'used', 'good', 'perfect'] as QualityTier[]).includes(quality)) return null;
    return createNostalgicItem(base, quality);
}
