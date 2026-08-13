import type { Item } from './types.ts';

export function computeWeightClass(backpack: (Item | null)[]): number {
    const equipped = backpack.filter(Boolean) as Item[];
    if (equipped.length === 0) return 0;

    let base = equipped.reduce((sum, item) => sum + item.power, 0);

    const bioCount = equipped.filter(i => i.special.includes('bio')).length;
    const hazmtCount = equipped.filter(i => i.special.includes('hazmat')).length;

    if (bioCount >= 3) base = Math.floor(base * 1.15);
    if (hazmtCount >= 2) base += 20;

    return base;
}

export function getActiveComboLabels(backpack: (Item | null)[]): string[] {
    const equipped = backpack.filter(Boolean) as Item[];
    const labels: string[] = [];
    const bioCount = equipped.filter(i => i.special.includes('bio')).length;
    const hazmtCount = equipped.filter(i => i.special.includes('hazmat')).length;
    if (bioCount >= 3) labels.push(`BIO x${bioCount} (+15% WC)`);
    if (hazmtCount >= 2) labels.push(`HAZMAT x${hazmtCount} (+20 WC)`);
    return labels;
}
