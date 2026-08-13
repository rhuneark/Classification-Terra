import type { Item, LootEvent, LogEntry, Location } from './types.ts';
import { rollRandomItem, rollSecondaryItems } from './items.ts';
import { AMBUSH_FLAVORS, ENERGY_AMBUSH_FLAVORS, LOOT_FLAVORS } from './locations.ts';
import { pickAmbushSnippet, pickLoreItemForLocation } from './terras.ts';

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
    collectedLoreIds: string[],
): LootEvent {
    const ambushRoll = luckBonus ? Math.random() * 1.4 : Math.random();
    const isAmbush = ambushRoll < location.ambushChance;

    if (!isAmbush) {
        const foundItem = rollRandomItem(location.minRarity, location.maxRarity);
        const secondaryItems = rollSecondaryItems(location.danger, location.minRarity, luckBonus);

        // Rare chance to find a lore document (7% base, higher in dangerous areas)
        const loreDanger = { low: 0.06, medium: 0.10, high: 0.13, extreme: 0.18 };
        let loreItem: Item | undefined;
        if (Math.random() < loreDanger[location.danger] && location.terraIds.length > 0) {
            const found = pickLoreItemForLocation(location.terraIds, collectedLoreIds);
            if (found) loreItem = found;
        }

        return {
            type: 'loot',
            locationName: location.name,
            flavorText: pick(LOOT_FLAVORS),
            foundItem,
            secondaryItems,
            loreItem,
        };
    }

    // Ambush: attach Terra lore snippet (40% chance if location has terras)
    const terra = location.terraIds.length > 0
        ? location.terraIds[Math.floor(Math.random() * location.terraIds.length)]
        : undefined;

    let terraSnippet: { id: string; text: string; format: 'journal' | 'research' | 'radio' | 'cryptic' } | undefined;
    if (terra && Math.random() < 0.40) {
        const snippet = pickAmbushSnippet(terra, collectedLoreIds);
        if (snippet) {
            terraSnippet = { id: snippet.id, text: snippet.text, format: snippet.format };
        }
    }

    // Ambush: lose an inventory item (non-consumable, non-lore) or energy
    const losableItems = inventory.filter(i => i.type !== 'consumable' && i.type !== 'lore');
    if (losableItems.length > 0) {
        const lost = losableItems[Math.floor(Math.random() * losableItems.length)];
        return {
            type: 'ambush',
            locationName: location.name,
            flavorText: pick(AMBUSH_FLAVORS),
            lostItem: lost,
            secondaryItems: [],
            terraId: terra,
            terraSnippetId: terraSnippet?.id,
            terraSnippetText: terraSnippet?.text,
            terraSnippetFormat: terraSnippet?.format,
        };
    }

    const energyLost = Math.min(2, energy);
    return {
        type: 'ambush',
        locationName: location.name,
        flavorText: pick(ENERGY_AMBUSH_FLAVORS),
        energyLost,
        secondaryItems: [],
        terraId: terra,
        terraSnippetId: terraSnippet?.id,
        terraSnippetText: terraSnippet?.text,
        terraSnippetFormat: terraSnippet?.format,
    };
}

export function eventToLogEntry(event: LootEvent): LogEntry {
    let message = '';
    if (event.type === 'loot' && event.foundItem) {
        const extra = event.secondaryItems.length > 0
            ? ` +${event.secondaryItems.length} more item${event.secondaryItems.length > 1 ? 's' : ''} in research.`
            : '';
        const loreNote = event.loreItem ? ` Found: ${event.loreItem.name}.` : '';
        message = `[${event.locationName}] Found: ${event.foundItem.name}.${extra}${loreNote} ${event.flavorText}`;
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
