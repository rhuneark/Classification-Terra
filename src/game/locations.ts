import type { Location } from './types.ts';

export const ALL_LOCATIONS: Location[] = [
    {
        id: 'collapsed-overpass',
        name: 'Collapsed Overpass',
        description: 'Structure failed years ago. The crawlers claimed it before anyone could clear it.',
        danger: 'low',
        energyCost: 1,
        ambushChance: 0.12,
        minRarity: 'common',
        maxRarity: 'uncommon',
        terraIds: ['crawler', 'carrier'],
    },
    {
        id: 'mercy-general',
        name: 'Mercy General (Ruins)',
        description: 'Twelve floors. Never fully evacuated. The lower levels are something else\'s now.',
        danger: 'medium',
        energyCost: 2,
        ambushChance: 0.28,
        minRarity: 'common',
        maxRarity: 'rare',
        terraIds: ['lurker', 'turned', 'hound', 'molt', 'scion'],
    },
    {
        id: 'quarantine-sector-7',
        name: 'Quarantine Sector 7',
        description: 'Emergency containment, never formally lifted. The shades know every gap in the perimeter.',
        danger: 'high',
        energyCost: 3,
        ambushChance: 0.42,
        minRarity: 'uncommon',
        maxRarity: 'epic',
        terraIds: ['hollow', 'shade', 'warped', 'sow', 'feral', 'colony', 'runner', 'perch', 'veil'],
    },
    {
        id: 'sublevel-complex',
        name: 'Sublevel Research Complex',
        description: 'Active pre-collapse experiments. The researchers are gone. The subjects are not.',
        danger: 'extreme',
        energyCost: 4,
        ambushChance: 0.58,
        minRarity: 'rare',
        maxRarity: 'unique',
        terraIds: ['brute', 'apex', 'shepherd', 'witness', 'warped', 'feral'],
    },
];

export function getLocation(id: string): Location | undefined {
    return ALL_LOCATIONS.find(l => l.id === id);
}

export const LOOT_FLAVORS = [
    'Still sealed. Whoever left it isn\'t coming back.',
    'Back of a cabinet, under two years of debris. Worth it.',
    'You reached in blind and found something useful. Lucky.',
    'Field cache. Mostly intact.',
    'Hidden well. Not well enough.',
    'Someone stashed this here. You\'re someone now.',
    'You almost walked past it.',
    'Functional. That\'s the bar, and this clears it.',
    'Labeled. Sealed. Yours now.',
    'Found near the south wall. No sign of what left it.',
];

export const AMBUSH_FLAVORS = [
    'Well-coordinated. You\'ll remember that.',
    'You heard them too late.',
    'One moment everything was fine.',
    'The route looked clear on the map.',
    'They knew where you were going.',
    'Ambush. Fast, clean, professional. Not for you.',
    'They came from the ceiling.',
    'You didn\'t see a single one until it was already done.',
];

export const ENERGY_AMBUSH_FLAVORS = [
    'Nothing worth stealing. They took your time instead.',
    'You ran. Smart. Costly.',
    'Evasion successful. Barely.',
    'They lost interest. Eventually.',
    'You made it out. You\'re not sure how.',
];
