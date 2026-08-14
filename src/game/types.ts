export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
export type ItemType = 'weapon' | 'armor' | 'utility' | 'consumable' | 'lore';
export type SpecialTag = 'bio' | 'hazmat' | 'bleed' | 'stun' | 'aoe' | 'nav' | 'cleanse' | 'growth';
export type LocationDanger = 'low' | 'medium' | 'high' | 'extreme';
export type LogType = 'loot' | 'ambush' | 'battle-win' | 'battle-loss' | 'trade' | 'info' | 'lore' | 'excursion';
export type GameScreen = 'loot' | 'backpack' | 'codex' | 'trader' | 'log';

// Equipment slot system
export type EquipSlot = 'head' | 'torso' | 'legs' | 'feet' | 'hand' | 'protection' | 'consumable-slot';

export interface Loadout {
    head: Item | null;
    torso: Item | null;
    legs: Item | null;
    feet: Item | null;
    hand1: Item | null;
    hand2: Item | null;
    protection: Item | null;
    consumableSlot: Item | null;
}

export function emptyLoadout(): Loadout {
    return { head: null, torso: null, legs: null, feet: null, hand1: null, hand2: null, protection: null, consumableSlot: null };
}

export function loadoutItems(loadout: Loadout): Item[] {
    return Object.values(loadout).filter(Boolean) as Item[];
}

export const SLOT_LABELS: Record<string, string> = {
    head: 'HEAD',
    torso: 'TORSO',
    legs: 'LEGS',
    feet: 'FEET',
    hand1: 'HAND L',
    hand2: 'HAND R',
    protection: 'PROTECT',
    consumableSlot: 'CONSUMBL',
};

export const SLOT_ACCEPT: Record<string, EquipSlot[]> = {
    head: ['head'],
    torso: ['torso'],
    legs: ['legs'],
    feet: ['feet'],
    hand1: ['hand'],
    hand2: ['hand'],
    protection: ['protection'],
    consumableSlot: ['consumable-slot'],
};

export interface ExcursionLoreUnlock {
    terraId: string;
    snippetId: string;
}

export interface ExcursionRun {
    excursionId: string;
    currentStageIndex: number;
    status: 'active' | 'ended';
    loreUnlocks: ExcursionLoreUnlock[];
    totalScrip: number;
    pendingItemRarity?: string;
    pendingEnergyCost: number;
    log: string[];
    endedText?: string;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    type: ItemType;
    power: number;
    damage: number;
    defense: number;
    special: SpecialTag[];
    sellValue: number;
    equipSlot?: EquipSlot;
    buyValue?: number;
    energyRestore?: number;
    luckBonus?: boolean;
    researchBoostMs?: number;
    energyBoostDuration?: number;
    uniqueDropRate?: number;
    loreTerraId?: string;
    loreSnippetId?: string;
}

export interface ResearchQueueItem {
    instanceId: string;
    item: Item;
    startedAt: number;
    durationMs: number;
}

export interface Location {
    id: string;
    name: string;
    description: string;
    danger: LocationDanger;
    energyCost: number;
    ambushChance: number;
    minRarity: Rarity;
    maxRarity: Rarity;
    terraIds: string[];
}

export interface LogEntry {
    id: string;
    type: LogType;
    message: string;
    rarity?: Rarity;
    timestamp: number;
}

export interface Build {
    id: string;
    name: string;
    backpack: (Item | null)[];
    weightClass: number;
    isNPC: boolean;
    isPlayer?: boolean;
    stealableItems: Item[];
}

export interface BattleResult {
    won: boolean;
    opponentName: string;
    exchanges: string[];
    currencyGained: number;
    stolenItem?: Item;
    playerWeightClass: number;
    opponentWeightClass: number;
}

export interface LootEvent {
    type: 'loot' | 'ambush';
    locationName: string;
    flavorText: string;
    foundItem?: Item;
    secondaryItems: Item[];
    lostItem?: Item;
    energyLost?: number;
    loreItem?: Item;
    terraId?: string;
    terraSnippetId?: string;
    terraSnippetText?: string;
    terraSnippetFormat?: 'journal' | 'research' | 'radio' | 'cryptic';
}

export interface PassiveResults {
    battlesCount: number;
    wins: number;
    losses: number;
    currencyGained: number;
    energyGained: number;
    hoursAway: number;
}

export const MAX_ENERGY = 20;
export const ENERGY_REGEN_MINUTES = 5;
export const TRADER_REFRESH_MS = 2 * 60 * 1000;

export const RARITY_COLORS: Record<Rarity, string> = {
    common: '#9ca3af',
    uncommon: '#4ade80',
    rare: '#60a5fa',
    epic: '#c084fc',
    legendary: '#fb923c',
    unique: '#f43f5e',
};

export const RARITY_LABELS: Record<Rarity, string> = {
    common: 'COMMON',
    uncommon: 'UNCOMMON',
    rare: 'RARE',
    epic: 'EPIC',
    legendary: 'LEGENDARY',
    unique: 'ONE-OF-A-KIND',
};

export const DANGER_LABELS: Record<LocationDanger, string> = {
    low: 'LOW', medium: 'MEDIUM', high: 'HIGH', extreme: 'EXTREME',
};

export const DANGER_COLORS: Record<LocationDanger, string> = {
    low: '#4ade80', medium: '#facc15', high: '#f97316', extreme: '#f43f5e',
};

export const SLOT_COLORS: Record<EquipSlot, string> = {
    'head': '#60a5fa',
    'torso': '#4ade80',
    'legs': '#facc15',
    'feet': '#a78bfa',
    'hand': '#f43f5e',
    'protection': '#fb923c',
    'consumable-slot': '#34d399',
};

// Research time ranges [min, max] in ms per rarity
export const RESEARCH_DURATION_MS: Record<Rarity, [number, number]> = {
    common:    [60_000,    180_000],
    uncommon:  [120_000,   480_000],
    rare:      [300_000,   900_000],
    epic:      [600_000,  1_500_000],
    legendary: [1_200_000, 1_800_000],
    unique:    [1_500_000, 1_800_000],
};

export function randomResearchDuration(rarity: Rarity): number {
    const [min, max] = RESEARCH_DURATION_MS[rarity];
    return Math.floor(min + Math.random() * (max - min));
}
