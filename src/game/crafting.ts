import type { Item, CraftRecipe, CraftSet, EquipSlot, SpecialTag } from './types.ts';

function ci(id: string, name: string, desc: string, rarity: Item['rarity'], type: Item['type'],
    power: number, damage: number, defense: number, special: SpecialTag[], sellValue: number,
    equipSlot: EquipSlot, extra?: Partial<Item>): Item {
    return { id, name, description: desc, rarity, type, power, damage, defense, special, sellValue, equipSlot, ...extra };
}

// ── CRAFTED ITEMS (only obtainable via crafting) ──────────────────────────────

export const CRAFTED_ITEMS: Item[] = [
    // Scout Set
    ci('scout-helm', "Scout's Modified Helm", "Binoculars mounted and wired in. What you see is what you work with.", 'uncommon', 'armor', 24, 0, 24, ['nav'], 10, 'head', { setId: 'scout' }),
    ci('scout-rig', "Scout's Field Rig", "Motion sensor wired to the collar. Pockets for everything important.", 'uncommon', 'armor', 22, 0, 22, ['nav'], 9, 'torso', { setId: 'scout' }),

    // Medic Set
    ci('medic-vest', "Medic's Reinforced Vest", "PROPERTY OF MEDICAL RESPONSE. Reinforced with whatever was on hand.", 'rare', 'armor', 44, 0, 44, ['bio'], 18, 'protection', { setId: 'medic' }),
    ci('medic-kit', "Enhanced Trauma Kit", "Lab-grade analysis, field-grade expectations. It does both.", 'rare', 'utility', 22, 0, 22, ['bio', 'cleanse'], 14, 'hand', { setId: 'medic' }),

    // Breacher Set
    ci('breach-blade', "Breaching Tool", "Crowbar meets blade. Neither one compromised in the merger.", 'rare', 'weapon', 35, 32, 5, [], 15, 'hand', { setId: 'breacher' }),
    ci('breach-vest', "Breacher's Plate Vest", "Chain over ballistic over hope. Heavy. Still worth it.", 'rare', 'armor', 45, 0, 42, [], 18, 'torso', { setId: 'breacher' }),

    // HazOps Set
    ci('hazops-suit', "HazOps Containment Suit", "Three suits combined into one coverage solution. Zero gaps.", 'epic', 'armor', 98, 0, 95, ['hazmat', 'bio'], 40, 'protection', { setId: 'hazops' }),
    ci('hazops-hood', "HazOps Combat Hood", "NBC-rated. Mil-spec visor. You look exactly like the threat you are.", 'epic', 'armor', 48, 0, 45, ['hazmat'], 20, 'head', { setId: 'hazops' }),
    ci('hazops-blade', "Contaminated Breacher", "The contamination isn't an accident. It's the whole point.", 'epic', 'weapon', 60, 56, 0, ['bio', 'hazmat'], 25, 'hand', { setId: 'hazops' }),

    // BioReaper Set
    ci('bioreaper-blade', "Bio-Reaper's Edge", "Three delivery systems. One strike. One outcome.", 'epic', 'weapon', 72, 68, 0, ['bio', 'bleed', 'growth'], 30, 'hand', { setId: 'bioreaper' }),
    ci('bioreaper-shell', "Mycelium Battle Shell", "It grew into the existing plates. You've stopped noticing the breathing.", 'epic', 'armor', 108, 0, 102, ['bio', 'growth'], 44, 'protection', { setId: 'bioreaper' }),

    // Black Project Set
    ci('blackproject-arm', "Black Project Arm", "No serial number. No documentation. Maximum accountability.", 'legendary', 'weapon', 130, 125, 0, ['stun'], 52, 'hand', { setId: 'blackproject' }),
    ci('blackproject-shell', "Override Carapace", "Self-sealing, adaptive, undocumented. Three features, one suit.", 'legendary', 'armor', 168, 0, 165, ['hazmat', 'bio', 'cleanse'], 68, 'protection', { setId: 'blackproject' }),

    // CLASSIFIED Set (hidden until paperclip-classified found)
    ci('redacted-ops-vest', "Redacted Ops Vest", "The label has been removed. The protection hasn't.", 'legendary', 'armor', 170, 0, 168, ['hazmat', 'bio'], 69, 'protection', { setId: 'classified-cache' }),
    ci('void-edge', "Void Edge", "No classification. No documentation. Exceptional reach.", 'legendary', 'weapon', 158, 152, 0, ['stun', 'bleed'], 64, 'hand', { setId: 'classified-cache' }),

    // Solo crafted items (no set)
    ci('compound-shiv', "Compound Shiv", "Glass core, cable wrap. Holds the edge. Barely. That's enough.", 'uncommon', 'weapon', 25, 25, 0, [], 10, 'hand'),
    ci('spike-baton', "Modified Spike Baton", "Bone structure with electrical discharge. Persuasive twice over.", 'uncommon', 'weapon', 30, 30, 0, ['stun'], 12, 'hand'),
    ci('field-plate', "Field-Welded Plate", "Ceramic bolted to pipe frame and wrapped tight. Heavier than planned. Works.", 'rare', 'armor', 46, 0, 45, [], 18, 'torso'),
    ci('jury-boots', "Jury-Rigged Combat Boots", "Two incompatible pairs merged into something better than either.", 'rare', 'armor', 32, 0, 30, ['hazmat'], 14, 'feet'),
    ci('scrap-launcher', "Scrap Launcher", "Nail driver with explosive augment. Don't stand behind it.", 'rare', 'weapon', 44, 42, 0, ['aoe'], 18, 'hand'),
    ci('patched-nbc', "Patched NBC Suit", "NBC plus respirator plus vest. Three layers address the gaps.", 'rare', 'armor', 65, 0, 62, ['hazmat'], 26, 'protection'),
    ci('reinforced-helm', "Reinforced Combat Helm", "Two helmets' worth of coverage fused into one. Heavier. Worth it.", 'rare', 'armor', 44, 0, 42, [], 18, 'head'),
];

// ── CRAFT SETS ────────────────────────────────────────────────────────────────

export const CRAFT_SETS: CraftSet[] = [
    {
        id: 'scout',
        name: 'Scout Field Kit',
        members: ['scout-helm', 'scout-rig'],
        bonusDescription: '+5 WC, +20% item find chance in Ruins',
        bonusWcBoost: 5,
    },
    {
        id: 'medic',
        name: "Medic's Protocol",
        members: ['medic-vest', 'medic-kit'],
        bonusDescription: '+8 WC, +1 energy recovered after ambushes',
        bonusWcBoost: 8,
    },
    {
        id: 'breacher',
        name: "Breacher's Combo",
        members: ['breach-blade', 'breach-vest'],
        bonusDescription: '+25 WC from combined assault/defense stack',
        bonusWcBoost: 25,
    },
    {
        id: 'hazops',
        name: 'HazOps Clearance',
        members: ['hazops-suit', 'hazops-hood', 'hazops-blade'],
        bonusDescription: '+40 WC — full hazmat clearance suite operational',
        bonusWcBoost: 40,
    },
    {
        id: 'bioreaper',
        name: 'Bio Reaper Protocol',
        members: ['bioreaper-blade', 'bioreaper-shell'],
        bonusDescription: '+60 WC — bio-growth fusion fully active',
        bonusWcBoost: 60,
    },
    {
        id: 'blackproject',
        name: 'Black Project Cache',
        members: ['blackproject-arm', 'blackproject-shell'],
        bonusDescription: '+100 WC — classified leverage applied',
        bonusWcBoost: 100,
    },
    {
        id: 'classified-cache',
        name: '???',
        members: ['paperclip-classified', 'redacted-ops-vest', 'void-edge'],
        bonusDescription: '[REDACTED] +300 WC',
        bonusWcBoost: 300,
        hiddenUntilItemId: 'paperclip-classified',
    },
];

// ── CRAFT RECIPES ─────────────────────────────────────────────────────────────

export const CRAFT_RECIPES: CraftRecipe[] = [
    // Scout Set
    { id: 'r-scout-helm', resultItemId: 'scout-helm', ingredients: [{ itemId: 'military-cap', count: 1 }, { itemId: 'field-binos', count: 1 }], setId: 'scout' },
    { id: 'r-scout-rig', resultItemId: 'scout-rig', ingredients: [{ itemId: 'industrial-poncho', count: 1 }, { itemId: 'motion-detect', count: 1 }], setId: 'scout' },
    // Medic Set
    { id: 'r-medic-vest', resultItemId: 'medic-vest', ingredients: [{ itemId: 'cdc-jacket', count: 1 }, { itemId: 'medical-toolkit', count: 1 }], setId: 'medic' },
    { id: 'r-medic-kit', resultItemId: 'medic-kit', ingredients: [{ itemId: 'portable-lab', count: 1 }, { itemId: 'antiseptic-spray', count: 1 }, { itemId: 'purif-tabs', count: 1 }], setId: 'medic' },
    // Breacher Set
    { id: 'r-breach-blade', resultItemId: 'breach-blade', ingredients: [{ itemId: 'military-knife', count: 1 }, { itemId: 'crowbar', count: 1 }], setId: 'breacher' },
    { id: 'r-breach-vest', resultItemId: 'breach-vest', ingredients: [{ itemId: 'ballistic-vest', count: 1 }, { itemId: 'chain-mail-frag', count: 1 }], setId: 'breacher' },
    // HazOps Set
    { id: 'r-hazops-suit', resultItemId: 'hazops-suit', ingredients: [{ itemId: 'full-hazmat', count: 1 }, { itemId: 'contam-suit-part', count: 1 }, { itemId: 'nbc-partial', count: 1 }], setId: 'hazops' },
    { id: 'r-hazops-hood', resultItemId: 'hazops-hood', ingredients: [{ itemId: 'military-helmet', count: 1 }, { itemId: 'nbc-complete', count: 1 }], setId: 'hazops' },
    { id: 'r-hazops-blade', resultItemId: 'hazops-blade', ingredients: [{ itemId: 'field-machete', count: 1 }, { itemId: 'chem-sprayer', count: 1 }], setId: 'hazops' },
    // BioReaper Set
    { id: 'r-bioreaper-blade', resultItemId: 'bioreaper-blade', ingredients: [{ itemId: 'mycelium-blade', count: 1 }, { itemId: 'dart-set', count: 1 }, { itemId: 'spore-grenade', count: 1 }], setId: 'bioreaper' },
    { id: 'r-bioreaper-shell', resultItemId: 'bioreaper-shell', ingredients: [{ itemId: 'mycelium-shell', count: 1 }, { itemId: 'symbiont-brace', count: 1 }], setId: 'bioreaper' },
    // Black Project Set
    { id: 'r-blackproject-arm', resultItemId: 'blackproject-arm', ingredients: [{ itemId: 'classified-sidearm', count: 1 }, { itemId: 'qe-baton', count: 1 }, { itemId: 'emp-device', count: 1 }], setId: 'blackproject' },
    { id: 'r-blackproject-shell', resultItemId: 'blackproject-shell', ingredients: [{ itemId: 'containment-shell', count: 1 }, { itemId: 'exo-frame', count: 1 }], setId: 'blackproject' },
    // CLASSIFIED Set — requires the Easter egg paperclip to complete, craftables need legendary mats
    { id: 'r-redacted-ops-vest', resultItemId: 'redacted-ops-vest', ingredients: [{ itemId: 'classified-file', count: 1 }, { itemId: 'exo-frame', count: 1 }, { itemId: 'power-armor-frame', count: 1 }], setId: 'classified-cache' },
    { id: 'r-void-edge', resultItemId: 'void-edge', ingredients: [{ itemId: 'classified-sidearm', count: 1 }, { itemId: 'project-eden', count: 1 }, { itemId: 'tier6-asset', count: 1 }], setId: 'classified-cache' },
    // Solo items
    { id: 'r-compound-shiv', resultItemId: 'compound-shiv', ingredients: [{ itemId: 'glass-shiv', count: 1 }, { itemId: 'rope-5m', count: 1 }] },
    { id: 'r-spike-baton', resultItemId: 'spike-baton', ingredients: [{ itemId: 'bone-baton', count: 1 }, { itemId: 'taser', count: 1 }] },
    { id: 'r-field-plate', resultItemId: 'field-plate', ingredients: [{ itemId: 'ceramic-plate', count: 1 }, { itemId: 'steel-pipe', count: 1 }, { itemId: 'rope-5m', count: 1 }] },
    { id: 'r-jury-boots', resultItemId: 'jury-boots', ingredients: [{ itemId: 'tactical-boots', count: 1 }, { itemId: 'hazmat-boots', count: 1 }] },
    { id: 'r-scrap-launcher', resultItemId: 'scrap-launcher', ingredients: [{ itemId: 'explosive-compound', count: 1 }, { itemId: 'nail-driver', count: 1 }] },
    { id: 'r-patched-nbc', resultItemId: 'patched-nbc', ingredients: [{ itemId: 'nbc-partial', count: 1 }, { itemId: 'filtered-resp', count: 1 }, { itemId: 'patched-vest', count: 1 }] },
    { id: 'r-reinforced-helm', resultItemId: 'reinforced-helm', ingredients: [{ itemId: 'military-helmet', count: 1 }, { itemId: 'lab-face-shield', count: 1 }] },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function getCraftedItemById(id: string): Item | undefined {
    return CRAFTED_ITEMS.find(i => i.id === id);
}

export function getRecipeByResultId(resultId: string): CraftRecipe | undefined {
    return CRAFT_RECIPES.find(r => r.resultItemId === resultId);
}

export function getSetById(setId: string): CraftSet | undefined {
    return CRAFT_SETS.find(s => s.id === setId);
}

/** Count how many of an ingredient the player has across inventory + all loadout slots */
export function countIngredient(itemId: string, inventory: Item[], loadoutItems: Item[]): number {
    const fromInv = inventory.filter(i => i.id === itemId).length;
    const fromLoadout = loadoutItems.filter(i => i.id === itemId).length;
    return fromInv + fromLoadout;
}

/** Check whether every ingredient is available (inventory only — loadout items can't be consumed directly) */
export function canCraft(recipe: CraftRecipe, inventory: Item[]): boolean {
    for (const ing of recipe.ingredients) {
        const have = inventory.filter(i => i.id === ing.itemId).length;
        if (have < ing.count) return false;
    }
    return true;
}

/** Remove ingredients from inventory and return the new inventory + the crafted item */
export function applyCraft(recipe: CraftRecipe, inventory: Item[]): { newInventory: Item[]; result: Item } | null {
    if (!canCraft(recipe, inventory)) return null;
    const result = CRAFTED_ITEMS.find(i => i.id === recipe.resultItemId);
    if (!result) return null;

    let remaining = [...inventory];
    for (const ing of recipe.ingredients) {
        let toRemove = ing.count;
        remaining = remaining.filter(item => {
            if (item.id === ing.itemId && toRemove > 0) {
                toRemove--;
                return false;
            }
            return true;
        });
    }
    return { newInventory: remaining, result };
}

/** Like applyCraft but draws ingredients from bag first, then safe house. */
export function applyCraftFull(
    recipe: CraftRecipe,
    bag: Item[],
    safeHouse: Item[]
): { newBag: Item[]; newSafeHouse: Item[]; result: Item } | null {
    const combined = [...bag, ...safeHouse];
    if (!canCraft(recipe, combined)) return null;
    const result = CRAFTED_ITEMS.find(i => i.id === recipe.resultItemId);
    if (!result) return null;

    let remainingBag = [...bag];
    let remainingSafeHouse = [...safeHouse];

    for (const ing of recipe.ingredients) {
        let toRemove = ing.count;
        const newBag: Item[] = [];
        for (const item of remainingBag) {
            if (item.id === ing.itemId && toRemove > 0) { toRemove--; }
            else { newBag.push(item); }
        }
        remainingBag = newBag;
        if (toRemove > 0) {
            const newSh: Item[] = [];
            for (const item of remainingSafeHouse) {
                if (item.id === ing.itemId && toRemove > 0) { toRemove--; }
                else { newSh.push(item); }
            }
            remainingSafeHouse = newSh;
        }
    }
    return { newBag: remainingBag, newSafeHouse: remainingSafeHouse, result };
}

/** Return active set bonuses for a given set of equipped item IDs */
export function getActiveCraftSetBonuses(equippedItemIds: string[]): CraftSet[] {
    return CRAFT_SETS.filter(set =>
        set.members.every(memberId => equippedItemIds.includes(memberId))
    );
}

export function getTotalCraftSetWcBonus(equippedItemIds: string[]): number {
    return getActiveCraftSetBonuses(equippedItemIds).reduce((sum, s) => sum + s.bonusWcBoost, 0);
}
