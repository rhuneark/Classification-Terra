export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
export type ItemType = 'weapon' | 'armor' | 'utility' | 'consumable' | 'lore';
export type SpecialTag = 'bio' | 'hazmat' | 'bleed' | 'stun' | 'aoe' | 'nav' | 'cleanse' | 'growth';
export type LocationDanger = 'low' | 'medium' | 'high' | 'extreme';
export type LogType = 'loot' | 'ambush' | 'battle-win' | 'battle-loss' | 'trade' | 'info' | 'lore';
export type GameScreen = 'loot' | 'backpack' | 'codex' | 'trader';

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

export const BACKPACK_SLOTS = 8;
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
