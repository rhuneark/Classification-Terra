import { useSyncExternalStore } from 'react';
import type {
    Item,
    LogEntry,
    LootEvent,
    PassiveResults,
    GameScreen,
    ResearchQueueItem,
    ExcursionRun,
    Loadout,
    Survivor,
    RivalFaction,
    Bounty,
    GlobalEvent,
} from '../game/types.ts';
import { MAX_ENERGY, emptyLoadout } from '../game/types.ts';

export interface AppState {
    phase: 'loading' | 'menu' | 'playing';
    screen: GameScreen;
    loadProgress: number;
    paused: boolean;

    energy: number;
    maxEnergy: number;
    currency: number;
    energyBoostUntil: number;

    inventory: Item[];
    safeHouse: Item[];
    inventoryCapacity: number;
    loadout: Loadout;
    researchQueue: ResearchQueueItem[];

    foundUniqueIds: string[];
    discoveredTerraIds: string[];
    collectedLoreIds: string[];
    completedExcursionIds: string[];
    muteMusic: boolean;
    muteSfx: boolean;

    eventLog: LogEntry[];
    activeLootEvent: LootEvent | null;

    traderInventory: Item[];
    traderLastRefresh: number;

    passiveResults: PassiveResults | null;
    luckBonusActive: boolean;
    selectedInventoryItemId: string | null;
    loginBonus: { scrip: number; streak: number } | null;
    activeExcursion: ExcursionRun | null;

    // Faction system
    survivors: Survivor[];
    rivalFactions: RivalFaction[];
    bounties: Bounty[];
    bountiesRefreshedAt: number;
    globalEvent: GlobalEvent | null;
    pendingSurvivorEncounter: Survivor | null;
    totalCrafts: number;
    totalRaids: number;
}

const listeners = new Set<() => void>();

let state: AppState = {
    phase: 'loading',
    screen: 'loot',
    loadProgress: 0,
    paused: false,
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    currency: 0,
    energyBoostUntil: 0,
    inventory: [],
    safeHouse: [],
    inventoryCapacity: 20,
    loadout: emptyLoadout(),
    researchQueue: [],
    foundUniqueIds: [],
    discoveredTerraIds: [],
    collectedLoreIds: [],
    completedExcursionIds: [],
    muteMusic: false,
    muteSfx: false,
    eventLog: [],
    activeLootEvent: null,
    traderInventory: [],
    traderLastRefresh: 0,
    passiveResults: null,
    luckBonusActive: false,
    selectedInventoryItemId: null,
    loginBonus: null,
    activeExcursion: null,

    survivors: [],
    rivalFactions: [],
    bounties: [],
    bountiesRefreshedAt: 0,
    globalEvent: null,
    pendingSurvivorEncounter: null,
    totalCrafts: 0,
    totalRaids: 0,
};

export const store = {
    get: (): AppState => state,
    patch(partial: Partial<AppState>): void {
        state = { ...state, ...partial };
        for (const l of listeners) l();
    },
    subscribe(l: () => void): () => void {
        listeners.add(l);
        return () => listeners.delete(l);
    },
};

export function useStore<T = AppState>(
    selector: (s: AppState) => T = (s) => s as unknown as T
): T {
    return useSyncExternalStore(store.subscribe, () => selector(state));
}
