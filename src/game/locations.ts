import type { Location } from './types.ts';

export const ALL_LOCATIONS: Location[] = [
    {
        id: 'strip-mall',
        name: 'Abandoned Strip Mall',
        description: '"Final sale" signs still up. Final sale ongoing.',
        danger: 'low',
        energyCost: 1,
        ambushChance: 0.1,
        minRarity: 'common',
        maxRarity: 'uncommon',
    },
    {
        id: 'survivor-cache',
        name: "Survivor's Cache (reported)",
        description: 'Someone left this here. Unclear if intentionally.',
        danger: 'low',
        energyCost: 1,
        ambushChance: 0.12,
        minRarity: 'common',
        maxRarity: 'rare',
    },
    {
        id: 'fungal-grove',
        name: 'Fungal Grove (was: city park)',
        description: "It's almost peaceful. The spores help with that.",
        danger: 'low',
        energyCost: 1,
        ambushChance: 0.15,
        minRarity: 'common',
        maxRarity: 'uncommon',
    },
    {
        id: 'overgrown-hospital',
        name: 'Overgrown Hospital',
        description: 'The infection started here. Hard to tell from the hallway.',
        danger: 'medium',
        energyCost: 2,
        ambushChance: 0.3,
        minRarity: 'common',
        maxRarity: 'rare',
    },
    {
        id: 'cdc-office',
        name: 'CDC Field Office',
        description: 'Locked, then unlocked, then organically sealed.',
        danger: 'high',
        energyCost: 3,
        ambushChance: 0.4,
        minRarity: 'uncommon',
        maxRarity: 'epic',
    },
    {
        id: 'quarantine-zone-d',
        name: 'Quarantine Zone D',
        description: 'Barriers still up. Personnel: absent.',
        danger: 'high',
        energyCost: 3,
        ambushChance: 0.45,
        minRarity: 'uncommon',
        maxRarity: 'epic',
    },
    {
        id: 'mycology-institute',
        name: 'Mycology Institute',
        description: 'Once studied fungi. Now studied by them.',
        danger: 'high',
        energyCost: 3,
        ambushChance: 0.35,
        minRarity: 'uncommon',
        maxRarity: 'legendary',
    },
    {
        id: 'research-lab',
        name: 'Research Lab (sublevel)',
        description: 'The experiments are ongoing. Without researchers.',
        danger: 'extreme',
        energyCost: 4,
        ambushChance: 0.6,
        minRarity: 'rare',
        maxRarity: 'unique',
    },
];

export function getLocation(id: string): Location | undefined {
    return ALL_LOCATIONS.find(l => l.id === id);
}

export const LOOT_FLAVORS = [
    'Still sealed. Whoever left it is not coming back for it.',
    'Back of a storage cabinet, under three inches of mold. Worth it.',
    'You reached in and found something useful. Lucky.',
    'Field cache. Mostly intact.',
    'Hidden well. Not well enough.',
    "Someone stashed this here. You're someone now.",
    'You almost walked past it. You did not.',
    'Contamination-adjacent, but functional.',
    'Labeled. Sealed. Yours now.',
];

export const AMBUSH_FLAVORS = [
    "Well-coordinated. You'll remember that.",
    'You heard them too late.',
    'One moment everything was fine.',
    'The sector map was optimistic about this area.',
    'Professionally executed, honestly.',
    'Ambush. Clean, fast, effective. Not for you.',
    'They knew the route. You know that now.',
];

export const ENERGY_AMBUSH_FLAVORS = [
    'Nothing worth stealing. They took your time instead.',
    'You ran. Smart. Costly.',
    'Evasion successful. Barely.',
    'They lost interest. Eventually.',
];
