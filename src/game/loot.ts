import type { Item, LootEvent, LogEntry, Location } from './types.ts';
import { rollRandomItem, rollSecondaryItems } from './items.ts';
import { AMBUSH_FLAVORS, ENERGY_AMBUSH_FLAVORS, LOOT_FLAVORS } from './locations.ts';

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

let _logIdCounter = Date.now();
export function makeLogId(): string {
    return String(++_logIdCounter);
}

export function rollLootEvent(
    location: Location,
    inventory: Item[],
    energy: number,
    luckBonus: boolean,
): LootEvent {
    const ambushRoll = luckBonus ? Math.random() * 1.4 : Math.random();
    const isAmbush = ambushRoll < location.ambushChance;

    if (!isAmbush) {
        const foundItem = rollRandomItem(location.minRarity, location.maxRarity);
        const secondaryItems = rollSecondaryItems(location.danger, location.minRarity, luckBonus);
        return {
            type: 'loot',
            locationName: location.name,
            flavorText: pick(LOOT_FLAVORS),
            foundItem,
            secondaryItems,
        };
    }

    // Ambush: lose an inventory item (non-consumable) or energy
    const losableItems = inventory.filter(i => i.type !== 'consumable');
    if (losableItems.length > 0) {
        const lost = losableItems[Math.floor(Math.random() * losableItems.length)];
        return {
            type: 'ambush',
            locationName: location.name,
            flavorText: pick(AMBUSH_FLAVORS),
            lostItem: lost,
            secondaryItems: [],
        };
    }

    const energyLost = Math.min(2, energy);
    return {
        type: 'ambush',
        locationName: location.name,
        flavorText: pick(ENERGY_AMBUSH_FLAVORS),
        energyLost,
        secondaryItems: [],
    };
}

export function eventToLogEntry(event: LootEvent): LogEntry {
    let message = '';
    if (event.type === 'loot' && event.foundItem) {
        const extra = event.secondaryItems.length > 0
            ? ` +${event.secondaryItems.length} more item${event.secondaryItems.length > 1 ? 's' : ''} in research.`
            : '';
        message = `[${event.locationName}] Found: ${event.foundItem.name}.${extra} ${event.flavorText}`;
    } else if (event.type === 'ambush' && event.lostItem) {
        message = `[${event.locationName}] Ambush. Lost: ${event.lostItem.name}. ${event.flavorText}`;
    } else if (event.type === 'ambush' && event.energyLost) {
        message = `[${event.locationName}] Ambush. Lost ${event.energyLost} energy. ${event.flavorText}`;
    }

    return {
        id: makeLogId(),
        type: event.type === 'loot' ? 'loot' : 'ambush',
        message,
        rarity: event.foundItem?.rarity,
        timestamp: Date.now(),
    };
}
