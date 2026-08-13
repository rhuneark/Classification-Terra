import RundotGameAPI from '@series-inc/rundot-game-sdk/api';
import { sdkReady } from '../sdk/runSdk.ts';
import type { Item, LogEntry, ResearchQueueItem, Rarity, ItemType, SpecialTag, LogType } from '../game/types.ts';
import { BACKPACK_SLOTS, MAX_ENERGY } from '../game/types.ts';
import { getItemById } from '../game/items.ts';

const SAVE_KEY = 'spore-run:save:v2';

export interface SaveData {
    currency: number;
    energy: number;
    inventory: Item[];
    backpack: (Item | null)[];
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
    totalExcursions: number;
}

const DEFAULTS: SaveData = {
    currency: 50,
    energy: 18,
    inventory: [
        getItemById('damp-bandana')!,
        getItemById('cracked-face-shield')!,
        getItemById('antibiotic-strip')!,
    ].filter(Boolean),
    backpack: [
        getItemById('duct-taped-club')!,
        getItemById('leather-vest')!,
        null, null, null, null, null, null,
    ],
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
    totalExcursions: 0,
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
        buyValue: r.buyValue != null ? Math.max(0, Number(r.buyValue)) : undefined,
        energyRestore: r.energyRestore != null ? Number(r.energyRestore) : undefined,
        luckBonus: r.luckBonus ? true : undefined,
        researchBoostMs: r.researchBoostMs != null ? Number(r.researchBoostMs) : undefined,
        energyBoostDuration: r.energyBoostDuration != null ? Number(r.energyBoostDuration) : undefined,
        uniqueDropRate: r.uniqueDropRate != null ? Number(r.uniqueDropRate) : undefined,
        loreTerraId: typeof r.loreTerraId === 'string' ? r.loreTerraId : undefined,
        loreSnippetId: typeof r.loreSnippetId === 'string' ? r.loreSnippetId : undefined,
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

function parse(raw: string | null): SaveData | null {
    if (!raw) return null;
    try {
        const p = JSON.parse(raw) as Partial<Record<string, unknown>>;
        const backpackRaw = Array.isArray(p.backpack) ? p.backpack : [];
        const backpack: (Item | null)[] = Array(BACKPACK_SLOTS).fill(null);
        for (let i = 0; i < Math.min(backpackRaw.length, BACKPACK_SLOTS); i++) {
            backpack[i] = backpackRaw[i] ? parseItem(backpackRaw[i]) : null;
        }
        return {
            currency: Math.max(0, Number(p.currency) || 0),
            energy: Math.min(MAX_ENERGY, Math.max(0, Number(p.energy) || 0)),
            inventory: Array.isArray(p.inventory)
                ? p.inventory.map(parseItem).filter(Boolean) as Item[]
                : [],
            backpack,
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
            totalExcursions: Math.max(0, Number(p.totalExcursions) || 0),
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
