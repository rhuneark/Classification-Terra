import type { Item, Rarity } from './types.ts';

export const ALL_ITEMS: Item[] = [
    // COMMON
    { id: 'rusty-penknife', name: 'Rusty Penknife', description: 'Technically a weapon.', rarity: 'common', type: 'weapon', power: 10, damage: 5, defense: 0, special: [], sellValue: 5 },
    { id: 'torn-hazmat-glove', name: 'Torn Hazmat Glove (L)', description: 'Protects one hand.', rarity: 'common', type: 'armor', power: 8, damage: 0, defense: 3, special: [], sellValue: 4 },
    { id: 'cracked-face-shield', name: 'Cracked Face Shield', description: 'Reduces vision. Also reduces infection.', rarity: 'common', type: 'armor', power: 10, damage: 0, defense: 4, special: [], sellValue: 5 },
    { id: 'duct-taped-club', name: 'Duct-Taped Club', description: 'Structural integrity: ongoing concern.', rarity: 'common', type: 'weapon', power: 12, damage: 8, defense: 0, special: [], sellValue: 6 },
    { id: 'damp-bandana', name: 'Damp Bandana', description: 'Filters some things.', rarity: 'common', type: 'armor', power: 6, damage: 0, defense: 2, special: [], sellValue: 3 },
    { id: 'bent-fork', name: 'Bent Fork', description: 'Versatile.', rarity: 'common', type: 'weapon', power: 5, damage: 3, defense: 0, special: [], sellValue: 2 },
    { id: 'waterlogged-boot', name: 'Waterlogged Boot (one)', description: 'Half a pair.', rarity: 'common', type: 'armor', power: 7, damage: 0, defense: 3, special: [], sellValue: 3 },
    { id: 'expired-antibiotic', name: 'Expired Antibiotic Strip', description: 'Still functions as a placebo.', rarity: 'common', type: 'utility', power: 8, damage: 0, defense: 0, special: [], sellValue: 4 },
    { id: 'crumpled-tin-can', name: 'Crumpled Tin Can', description: 'Former contents: peaches.', rarity: 'common', type: 'utility', power: 5, damage: 0, defense: 0, special: [], sellValue: 2 },
    { id: 'scavenged-shoelace', name: 'Scavenged Shoelace', description: 'Fourteen uses. Twelve verified.', rarity: 'common', type: 'utility', power: 6, damage: 0, defense: 0, special: [], sellValue: 3 },

    // UNCOMMON
    { id: 'spore-canister', name: 'Fungal Spore Canister', description: 'Concentrated local atmosphere.', rarity: 'uncommon', type: 'weapon', power: 22, damage: 15, defense: 0, special: ['bio'], sellValue: 15 },
    { id: 'leather-vest', name: 'Patched Leather Vest', description: 'The patches have patches.', rarity: 'uncommon', type: 'armor', power: 20, damage: 0, defense: 10, special: [], sellValue: 12 },
    { id: 'antiseptic-spray', name: 'Antiseptic Spray (half)', description: 'Effective against 2 of the 47 known strains.', rarity: 'uncommon', type: 'utility', power: 18, damage: 0, defense: 0, special: ['cleanse'], sellValue: 10 },
    { id: 'crowbar', name: 'Salvaged Crowbar', description: 'Opens things. Sometimes people.', rarity: 'uncommon', type: 'weapon', power: 25, damage: 18, defense: 0, special: [], sellValue: 15 },
    { id: 'work-gloves', name: 'Work Gloves (pair)', description: 'A complete set. Rare.', rarity: 'uncommon', type: 'armor', power: 20, damage: 0, defense: 8, special: [], sellValue: 12 },
    { id: 'quarantine-badge', name: 'Quarantine Badge (expired)', description: 'The expiry date is a suggestion.', rarity: 'uncommon', type: 'utility', power: 16, damage: 0, defense: 0, special: [], sellValue: 8 },
    { id: 'hazmat-boots', name: 'Hazmat Boots (too big)', description: 'Secure. Also slow.', rarity: 'uncommon', type: 'armor', power: 18, damage: 0, defense: 9, special: [], sellValue: 10 },
    { id: 'glass-shiv', name: 'Improvised Shiv (glass)', description: 'Effective once.', rarity: 'uncommon', type: 'weapon', power: 24, damage: 20, defense: 0, special: [], sellValue: 14 },
    { id: 'filtered-respirator', name: 'Filtered Respirator (partial)', description: 'Covers the important parts.', rarity: 'uncommon', type: 'armor', power: 26, damage: 0, defense: 12, special: ['hazmat'], sellValue: 16 },
    { id: 'scavenged-rope', name: 'Scavenged Rope (5m)', description: 'Useful. Extremely.', rarity: 'uncommon', type: 'utility', power: 22, damage: 0, defense: 0, special: [], sellValue: 13 },

    // RARE
    { id: 'mycelium-blade', name: 'Mycelium Blade', description: 'Grown, not forged. Still sharp.', rarity: 'rare', type: 'weapon', power: 42, damage: 30, defense: 0, special: ['bio'], sellValue: 30 },
    { id: 'cdc-jacket', name: 'CDC Field Jacket', description: 'Issued to personnel who did not return it.', rarity: 'rare', type: 'armor', power: 40, damage: 0, defense: 20, special: ['hazmat'], sellValue: 28 },
    { id: 'spore-grenade', name: 'Spore Cloud Grenade', description: 'Single use. Radius: larger than expected.', rarity: 'rare', type: 'weapon', power: 38, damage: 25, defense: 0, special: ['bio', 'aoe'], sellValue: 25 },
    { id: 'contam-suit', name: 'Contamination Suit (partial)', description: 'Covers the important 70%.', rarity: 'rare', type: 'armor', power: 44, damage: 0, defense: 22, special: ['hazmat'], sellValue: 30 },
    { id: 'specimen-jar', name: 'Infected Specimen Jar', description: 'Something inside remains active.', rarity: 'rare', type: 'utility', power: 35, damage: 0, defense: 0, special: ['bio'], sellValue: 22 },
    { id: 'scalpel-set', name: 'Scalpel Set (intact)', description: 'Surgical precision. Unconventional application.', rarity: 'rare', type: 'weapon', power: 36, damage: 28, defense: 0, special: ['bleed'], sellValue: 24 },
    { id: 'lab-face-shield', name: 'Lab-Grade Face Shield', description: 'Rated for chemical splash. Repurposed.', rarity: 'rare', type: 'armor', power: 34, damage: 0, defense: 18, special: [], sellValue: 22 },

    // EPIC
    { id: 'bone-saw', name: 'Pneumatic Bone Saw', description: 'Medical-grade, in the loosest sense.', rarity: 'epic', type: 'weapon', power: 70, damage: 50, defense: 0, special: ['bleed'], sellValue: 55 },
    { id: 'full-hazmat', name: 'Full Hazmat Suit (minor breach)', description: 'The breach is in the back.', rarity: 'epic', type: 'armor', power: 75, damage: 0, defense: 40, special: ['hazmat'], sellValue: 60 },
    { id: 'outbreak-map', name: 'Outbreak Map (sector 7)', description: 'Routes passable as of last Tuesday.', rarity: 'epic', type: 'utility', power: 65, damage: 0, defense: 0, special: ['nav'], sellValue: 50 },
    { id: 'fungal-brace', name: 'Fungal Symbiont Brace', description: "It's grown into the frame. That's fine.", rarity: 'epic', type: 'utility', power: 68, damage: 0, defense: 0, special: ['bio', 'growth'], sellValue: 52 },
    { id: 'enforcer-baton', name: "Quarantine Enforcer's Baton", description: 'Used in official capacity. Once.', rarity: 'epic', type: 'weapon', power: 72, damage: 55, defense: 0, special: ['stun'], sellValue: 58 },
    { id: 'mycelium-shell', name: 'Mycelium Armor Shell', description: 'Grown from the same cultures as the Blade.', rarity: 'epic', type: 'armor', power: 78, damage: 0, defense: 45, special: ['bio'], sellValue: 62 },

    // LEGENDARY
    { id: 'the-paperclip', name: 'The Paperclip', description: "You've had it three years. It's gotten you this far.", rarity: 'legendary', type: 'utility', power: 100, damage: 0, defense: 0, special: [], sellValue: 5 },
    { id: 'cure-7', name: 'Last Vial of Cure-7', description: 'Label says CURE-7. Note taped to it says DO NOT.', rarity: 'legendary', type: 'utility', power: 120, damage: 0, defense: 0, special: ['bio', 'cleanse'], sellValue: 90 },
    { id: 'chen-badge', name: "Director Chen's Access Badge", description: 'Opens everything, including things that should stay closed.', rarity: 'legendary', type: 'utility', power: 110, damage: 0, defense: 0, special: ['nav'], sellValue: 85 },
    { id: 'outbreak-zero', name: 'Outbreak Zero Sample', description: 'Labeled EXTREMELY HAZARDOUS. Labeled correctly.', rarity: 'legendary', type: 'weapon', power: 130, damage: 90, defense: 0, special: ['bio', 'aoe'], sellValue: 100 },

    // UNIQUE / ONE-OF-A-KIND
    { id: 'sporemothers-crown', name: "Sporemother's Crown", description: 'Grows when worn. You are not thinking about that.', rarity: 'unique', type: 'utility', power: 150, damage: 0, defense: 0, special: ['bio', 'growth'], sellValue: 200 },
    { id: 'decon-cannon', name: 'Decontamination Cannon', description: 'Decontaminates everything in range. Including you.', rarity: 'unique', type: 'weapon', power: 155, damage: 100, defense: 0, special: ['aoe', 'hazmat'], sellValue: 250 },
    { id: 'safe-haven-key', name: 'Last Safe Haven Key', description: 'Opens something. The door may not exist anymore.', rarity: 'unique', type: 'utility', power: 145, damage: 0, defense: 0, special: ['nav'], sellValue: 200 },
];

export const CONSUMABLES: Item[] = [
    { id: 'recovery-juice', name: 'Recovery Juice (half bottle)', description: 'Restores energy. Contents: indeterminate.', rarity: 'common', type: 'consumable', power: 0, damage: 0, defense: 0, special: [], sellValue: 5, buyValue: 15, energyRestore: 3 },
    { id: 'scout-map', name: "Scout's Map (partial)", description: 'Better odds on the next run. Verified by someone who survived it.', rarity: 'uncommon', type: 'consumable', power: 0, damage: 0, defense: 0, special: [], sellValue: 10, buyValue: 30, luckBonus: true },
];

export function getItemById(id: string): Item | undefined {
    return ALL_ITEMS.find(i => i.id === id) ?? CONSUMABLES.find(i => i.id === id);
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'];

function rarityIndex(r: Rarity): number {
    return RARITY_ORDER.indexOf(r);
}

const RARITY_WEIGHTS: Record<Rarity, number> = {
    common: 50,
    uncommon: 28,
    rare: 14,
    epic: 5,
    legendary: 2,
    unique: 1,
};

export function rollRandomItem(minRarity: Rarity, maxRarity: Rarity): Item {
    const minIdx = rarityIndex(minRarity);
    const maxIdx = rarityIndex(maxRarity);
    const pool = ALL_ITEMS.filter(i => {
        const idx = rarityIndex(i.rarity);
        return idx >= minIdx && idx <= maxIdx;
    });
    if (pool.length === 0) return ALL_ITEMS[0];

    // Weight by rarity — higher tiers are rarer
    const weights = pool.map(i => RARITY_WEIGHTS[i.rarity]);
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return pool[i];
    }
    return pool[pool.length - 1];
}

export function generateTraderInventory(): Item[] {
    const result: Item[] = [...CONSUMABLES.map(c => ({ ...c }))];
    const pool = ALL_ITEMS.filter(i =>
        ['common', 'uncommon', 'rare'].includes(i.rarity) && i.type !== 'consumable'
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    for (const item of shuffled) {
        result.push({ ...item, buyValue: item.sellValue * 2 });
    }
    return result;
}
