import RundotGameAPI from '@series-inc/rundot-game-sdk/api';
import { sdkReady } from '../sdk/runSdk.ts';
import type { Item, LogEntry, ResearchQueueItem, Rarity, ItemType, SpecialTag, LogType, Loadout, Survivor, SurvivorRole, RivalFaction, Bounty } from '../game/types.ts';
import { MAX_ENERGY, emptyLoadout } from '../game/types.ts';
import { getItemById } from '../game/items.ts';

const SAVE_KEY = 'spore-run:save:v4';

export interface SaveData {
    currency: number;
    energy: number;
    inventory: Item[];
    loadout: Loadout;
    researchQueue: ResearchQueueItem[];
    eventLog: LogEntry[];
    lastOnline: number;
    totalBattles: number;
    wins: number;
    foundUniqueIds: string[];
    totalScrip: number;
    totalScavenges: number;
    totalAmbushes: number;
    energyBoostUntil: number;
    muteMusic: boolean;
    muteSfx: boolean;
    lastLoginDay: string;
    loginStreak: number;
    lastDailyChallengeDay: string;
    discoveredTerraIds: string[];
    collectedLoreIds: string[];
    completedExcursionIds: string[];
    totalExcursions: number;
    // Faction system
    survivors: Survivor[];
    rivalFactions: RivalFaction[];
    bounties: Bounty[];
    bountiesRefreshedAt: number;
    totalCrafts: number;
    totalRaids: number;
}

function makeDefaultLoadout(): Loadout {
    const l = emptyLoadout();
    l.hand1 = getItemById('duct-taped-club') ?? null;
    l.torso = getItemById('leather-vest') ?? null;
    return l;
}

const DEFAULTS: SaveData = {
    currency: 50,
    energy: 18,
    inventory: [
        getItemById('damp-bandana')!,
        getItemById('cracked-face-shield')!,
        getItemById('antibiotic-strip')!,
    ].filter(Boolean),
    loadout: makeDefaultLoadout(),
    researchQueue: [],
    eventLog: [{
        id: 'start-1',
        type: 'info',
        message: 'You found a stash. Modest. Better than nothing.',
        timestamp: 0,
    }],
    lastOnline: 0,
    totalBattles: 0,
    wins: 0,
    foundUniqueIds: [],
    totalScrip: 0,
    totalScavenges: 0,
    totalAmbushes: 0,
    energyBoostUntil: 0,
    muteMusic: false,
    muteSfx: false,
    lastLoginDay: '',
    loginStreak: 0,
    lastDailyChallengeDay: '',
    discoveredTerraIds: [],
    collectedLoreIds: [],
    completedExcursionIds: [],
    totalExcursions: 0,
    survivors: [],
    rivalFactions: [],
    bounties: [],
    bountiesRefreshedAt: 0,
    totalCrafts: 0,
    totalRaids: 0,
};

function parseItem(raw: unknown): Item | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
    return {
        id: String(r.id),
        name: String(r.name),
        description: String(r.description ?? ''),
        rarity: (r.rarity as Rarity) ?? 'common',
        type: (r.type as ItemType) ?? 'utility',
        power: Math.max(0, Number(r.power) || 0),
        damage: Math.max(0, Number(r.damage) || 0),
        defense: Math.max(0, Number(r.defense) || 0),
        special: Array.isArray(r.special) ? (r.special as SpecialTag[]) : [],
        sellValue: Math.max(0, Number(r.sellValue) || 0),
        equipSlot: typeof r.equipSlot === 'string' ? (r.equipSlot as import('../game/types.ts').EquipSlot) : undefined,
        buyValue: r.buyValue != null ? Math.max(0, Number(r.buyValue)) : undefined,
        energyRestore: r.energyRestore != null ? Number(r.energyRestore) : undefined,
        luckBonus: r.luckBonus ? true : undefined,
        researchBoostMs: r.researchBoostMs != null ? Number(r.researchBoostMs) : undefined,
        energyBoostDuration: r.energyBoostDuration != null ? Number(r.energyBoostDuration) : undefined,
        uniqueDropRate: r.uniqueDropRate != null ? Number(r.uniqueDropRate) : undefined,
        loreTerraId: typeof r.loreTerraId === 'string' ? r.loreTerraId : undefined,
        loreSnippetId: typeof r.loreSnippetId === 'string' ? r.loreSnippetId : undefined,
        setId: typeof r.setId === 'string' ? r.setId : undefined,
    };
}

function parseLoadout(raw: unknown): Loadout {
    const def = emptyLoadout();
    if (!raw || typeof raw !== 'object') return def;
    const r = raw as Record<string, unknown>;
    return {
        head: r.head ? parseItem(r.head) : null,
        torso: r.torso ? parseItem(r.torso) : null,
        legs: r.legs ? parseItem(r.legs) : null,
        feet: r.feet ? parseItem(r.feet) : null,
        hand1: r.hand1 ? parseItem(r.hand1) : null,
        hand2: r.hand2 ? parseItem(r.hand2) : null,
        protection: r.protection ? parseItem(r.protection) : null,
        consumableSlot: r.consumableSlot ? parseItem(r.consumableSlot) : null,
    };
}

function parseLogEntry(raw: unknown): LogEntry | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.message !== 'string') return null;
    return {
        id: String(r.id ?? String(Math.random())),
        type: (r.type as LogType) ?? 'info',
        message: r.message,
        rarity: r.rarity as Rarity | undefined,
        timestamp: Number(r.timestamp) || 0,
    };
}

function parseResearchItem(raw: unknown): ResearchQueueItem | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    const item = parseItem(r.item);
    if (!item) return null;
    return {
        instanceId: String(r.instanceId ?? String(Math.random())),
        item,
        startedAt: Number(r.startedAt) || Date.now(),
        durationMs: Math.max(60_000, Number(r.durationMs) || 60_000),
    };
}

function parseSurvivor(raw: unknown): Survivor | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.name !== 'string' || typeof r.role !== 'string') return null;
    return {
        id: String(r.id),
        name: String(r.name),
        role: r.role as SurvivorRole,
        joinedAt: Number(r.joinedAt) || 0,
        grudge: Boolean(r.grudge),
    };
}

function parseRivalFaction(raw: unknown): RivalFaction | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string') return null;
    return {
        id: String(r.id),
        name: String(r.name ?? ''),
        flavor: String(r.flavor ?? ''),
        offense: Number(r.offense) || 0,
        defense: Number(r.defense) || 0,
        grudge: Math.max(0, Math.min(100, Number(r.grudge) || 0)),
        lastRaidedByPlayerAt: r.lastRaidedByPlayerAt != null ? Number(r.lastRaidedByPlayerAt) : undefined,
        lastRaidedUsAt: r.lastRaidedUsAt != null ? Number(r.lastRaidedUsAt) : undefined,
    };
}

function parseBounty(raw: unknown): Bounty | null {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== 'string') return null;
    return {
        id: String(r.id),
        description: String(r.description ?? ''),
        rewardScrip: Number(r.rewardScrip) || 0,
        rewardItemRarity: typeof r.rewardItemRarity === 'string' ? (r.rewardItemRarity as Rarity) : undefined,
        expiresAt: Number(r.expiresAt) || 0,
        completed: Boolean(r.completed),
        claimed: Boolean(r.claimed),
        type: (r.type as Bounty['type']) ?? 'scavenge',
        progress: Number(r.progress) || 0,
        target: Number(r.target) || 1,
    };
}

function parse(raw: string | null): SaveData | null {
    if (!raw) return null;
    try {
        const p = JSON.parse(raw) as Partial<Record<string, unknown>>;
        return {
            currency: Math.max(0, Number(p.currency) || 0),
            energy: Math.min(MAX_ENERGY, Math.max(0, Number(p.energy) || 0)),
            inventory: Array.isArray(p.inventory)
                ? p.inventory.map(parseItem).filter(Boolean) as Item[]
                : [],
            loadout: parseLoadout(p.loadout),
            researchQueue: Array.isArray(p.researchQueue)
                ? p.researchQueue.map(parseResearchItem).filter(Boolean) as ResearchQueueItem[]
                : [],
            eventLog: Array.isArray(p.eventLog)
                ? (p.eventLog as unknown[]).slice(0, 50).map(parseLogEntry).filter(Boolean) as LogEntry[]
                : [],
            lastOnline: Number(p.lastOnline) || 0,
            totalBattles: Math.max(0, Number(p.totalBattles) || 0),
            wins: Math.max(0, Number(p.wins) || 0),
            foundUniqueIds: Array.isArray(p.foundUniqueIds)
                ? (p.foundUniqueIds as unknown[]).filter(s => typeof s === 'string') as string[]
                : [],
            totalScrip: Math.max(0, Number(p.totalScrip) || 0),
            totalScavenges: Math.max(0, Number(p.totalScavenges) || 0),
            totalAmbushes: Math.max(0, Number(p.totalAmbushes) || 0),
            energyBoostUntil: Number(p.energyBoostUntil) || 0,
            muteMusic: Boolean(p.muteMusic),
            muteSfx: Boolean(p.muteSfx),
            lastLoginDay: typeof p.lastLoginDay === 'string' ? p.lastLoginDay : '',
            loginStreak: Math.max(0, Number(p.loginStreak) || 0),
            lastDailyChallengeDay: typeof p.lastDailyChallengeDay === 'string' ? p.lastDailyChallengeDay : '',
            discoveredTerraIds: Array.isArray(p.discoveredTerraIds)
                ? (p.discoveredTerraIds as unknown[]).filter(s => typeof s === 'string') as string[]
                : [],
            collectedLoreIds: Array.isArray(p.collectedLoreIds)
                ? (p.collectedLoreIds as unknown[]).filter(s => typeof s === 'string') as string[]
                : [],
            completedExcursionIds: Array.isArray(p.completedExcursionIds)
                ? (p.completedExcursionIds as unknown[]).filter(s => typeof s === 'string') as string[]
                : [],
            totalExcursions: Math.max(0, Number(p.totalExcursions) || 0),
            survivors: Array.isArray(p.survivors)
                ? (p.survivors as unknown[]).map(parseSurvivor).filter(Boolean) as Survivor[]
                : [],
            rivalFactions: Array.isArray(p.rivalFactions)
                ? (p.rivalFactions as unknown[]).map(parseRivalFaction).filter(Boolean) as RivalFaction[]
                : [],
            bounties: Array.isArray(p.bounties)
                ? (p.bounties as unknown[]).map(parseBounty).filter(Boolean) as Bounty[]
                : [],
            bountiesRefreshedAt: Number(p.bountiesRefreshedAt) || 0,
            totalCrafts: Math.max(0, Number(p.totalCrafts) || 0),
            totalRaids: Math.max(0, Number(p.totalRaids) || 0),
        };
    } catch {
        return null;
    }
}

let data: SaveData = structuredClone(DEFAULTS);

export async function loadSave(): Promise<SaveData> {
    let loaded: SaveData | null = null;
    if (sdkReady()) {
        try {
            loaded = parse(await RundotGameAPI.appStorage.getItem(SAVE_KEY));
        } catch { /* host unavailable */ }
    }
    if (!loaded) {
        try { loaded = parse(localStorage.getItem(SAVE_KEY)); } catch { /* blocked */ }
    }
    data = loaded ?? structuredClone(DEFAULTS);
    return data;
}

export function getSave(): SaveData {
    return data;
}

export function updateSave(partial: Partial<SaveData>): void {
    data = { ...data, ...partial };
    flushSave();
}

export function flushSave(): void {
    const raw = JSON.stringify(data);
    try { localStorage.setItem(SAVE_KEY, raw); } catch { /* blocked */ }
    if (sdkReady()) {
        try {
            RundotGameAPI.appStorage.setItem(SAVE_KEY, raw).catch(() => {});
        } catch { /* non-fatal */ }
    }
}

export function markUniqueFound(itemId: string): void {
    if (!data.foundUniqueIds.includes(itemId)) {
        data.foundUniqueIds = [...data.foundUniqueIds, itemId];
        flushSave();
    }
}

export function addEarnedScrip(amount: number): void {
    data.totalScrip = (data.totalScrip ?? 0) + amount;
}
