import type { Item, Loadout } from './types.ts';
import { loadoutItems } from './types.ts';

export function getLoadoutStats(loadout: Loadout): { wc: number; attack: number; defense: number } {
    const items = loadoutItems(loadout);
    if (items.length === 0) return { wc: 0, attack: 0, defense: 0 };

    const attack = items.reduce((sum, i) => sum + i.damage, 0);
    const defense = items.reduce((sum, i) => sum + i.defense, 0);

    let wc = items.reduce((sum, item) => sum + item.power, 0);

    const bioCount = items.filter(i => i.special.includes('bio')).length;
    const hazmtCount = items.filter(i => i.special.includes('hazmat')).length;

    if (bioCount >= 3) wc = Math.floor(wc * 1.15);
    if (hazmtCount >= 2) wc += 20;

    return { wc, attack, defense };
}

export function computeWeightClass(loadout: Loadout): number {
    return getLoadoutStats(loadout).wc;
}

// For NPCs and battle.ts which use legacy (Item | null)[] arrays
export function computeWeightClassFromArray(backpack: (Item | null)[]): number {
    const equipped = backpack.filter(Boolean) as Item[];
    if (equipped.length === 0) return 0;

    let base = equipped.reduce((sum, item) => sum + item.power, 0);

    const bioCount = equipped.filter(i => i.special.includes('bio')).length;
    const hazmtCount = equipped.filter(i => i.special.includes('hazmat')).length;

    if (bioCount >= 3) base = Math.floor(base * 1.15);
    if (hazmtCount >= 2) base += 20;

    return base;
}

export function getActiveComboLabels(loadout: Loadout): string[] {
    const equipped = loadoutItems(loadout);
    const labels: string[] = [];
    const bioCount = equipped.filter(i => i.special.includes('bio')).length;
    const hazmtCount = equipped.filter(i => i.special.includes('hazmat')).length;
    if (bioCount >= 3) labels.push(`BIO x${bioCount} (+15% WC)`);
    if (hazmtCount >= 2) labels.push(`HAZMAT x${hazmtCount} (+20 WC)`);
    return labels;
}
