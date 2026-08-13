import { useSyncExternalStore } from 'react';
import type {
    Item,
    LogEntry,
    LootEvent,
    PassiveResults,
    GameScreen,
    ResearchQueueItem,
    ExcursionRun,
} from '../game/types.ts';
import { BACKPACK_SLOTS, MAX_ENERGY } from '../game/types.ts';

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
    backpack: (Item | null)[];
    researchQueue: ResearchQueueItem[];

    foundUniqueIds: string[];
    discoveredTerraIds: string[];
    collectedLoreIds: string[];
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
    backpack: Array(BACKPACK_SLOTS).fill(null) as (Item | null)[],
    researchQueue: [],
    foundUniqueIds: [],
    discoveredTerraIds: [],
    collectedLoreIds: [],
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
