import type { Build, Item } from './types.ts';
import { getItemById, rollRandomItem } from './items.ts';
import { computeWeightClass } from './weightClass.ts';

function g(id: string) {
    return getItemById(id) ?? null;
}

function makeBuild(id: string, name: string, slots: (string | null)[]): Build {
    const backpack = slots.map(s => (s ? g(s) : null));
    const equipped = backpack.filter(Boolean) as Item[];
    return {
        id, name, backpack,
        weightClass: computeWeightClass(backpack),
        isNPC: true,
        stealableItems: equipped.slice(0, Math.min(2, equipped.length)),
    };
}

export const NPC_OPPONENTS: Build[] = [
    makeBuild('npc-patient-zero', 'Patient Zero', [
        'rusty-penknife', 'damp-bandana', null, null, null, null, null, null,
    ]),
    makeBuild('npc-janitor', 'The Janitor', [
        'crowbar', 'leather-vest', 'work-gloves', 'hazmat-boots', null, null, null, null,
    ]),
    makeBuild('npc-field-tech', 'Field Tech Rachel', [
        'cdc-jacket', 'filtered-resp', 'contam-suit-part', 'glass-shiv', 'spore-canister', null, null, null,
    ]),
    makeBuild('npc-mycologist', 'The Mycologist', [
        'mycelium-blade', 'spore-canister', 'specimen-jar', 'mycelium-shell', 'symbiont-brace', null, null, null,
    ]),
    makeBuild('npc-director', 'Director Chen', [
        'full-hazmat', 'bone-saw', 'outbreak-map', 'director-badge', 'qe-baton', null, null, null,
    ]),
    makeBuild('npc-collector', 'The Collector', [
        'cure7-vial', 'sporemother-crown', 'decon-cannon', 'outbreak-zero', null, null, null, null,
    ]),
];

export function getRandomNPCOpponent(): Build {
    return NPC_OPPONENTS[Math.floor(Math.random() * NPC_OPPONENTS.length)];
}

const SURVIVOR_NAMES = [
    'Dust_Walker', 'Ironlung_52', 'Blight_Signal', 'Null_Runner',
    'Quarantine_K', 'Spore_Bait', 'Ruin_Rat', 'Fog_Ghost',
    'Toxin_Trace', 'Hollow_Eye', 'Ashen_Jaw', 'Field_Three',
    'Carrier_Six', 'Slag_Heap', 'Void_March', 'Remnant_9',
    'Miasma_Jack', 'Breach_Unit', 'Pale_Signal', 'The_Scavenger',
    'Zone_Walker', 'Rust_Prophet', 'Spatter_Nine', 'Grim_Static',
    'Bleach_Protocol', 'Feral_Index', 'Gray_Tide', 'Rot_Witness',
    'Sector_Null', 'Outbreak_13', 'Drift_Marker', 'Void_Trace',
];

function generateFakePlayer(seed: number): Build {
    const nameIdx = (seed * 7 + Math.floor(Math.random() * SURVIVOR_NAMES.length)) % SURVIVOR_NAMES.length;
    const name = SURVIVOR_NAMES[nameIdx];
    const wcTarget = 10 + Math.random() * 230;
    const maxRarity = wcTarget < 40 ? 'common'
        : wcTarget < 90 ? 'uncommon'
        : wcTarget < 160 ? 'rare'
        : wcTarget < 210 ? 'epic'
        : 'legendary';
    const itemCount = 2 + Math.floor(Math.random() * 5);
    const backpack: (Item | null)[] = Array(8).fill(null);
    for (let i = 0; i < itemCount; i++) {
        const item = rollRandomItem('common', maxRarity);
        if (item.type !== 'consumable') backpack[i] = item;
    }
    const equipped = backpack.filter(Boolean) as Item[];

    const stealable: Item[] = [];
    if (equipped.length > 0) stealable.push(equipped[0]);
    if (equipped.length > 2) {
        const pick = equipped[Math.floor(Math.random() * equipped.length)];
        if (!stealable.includes(pick)) stealable.push(pick);
    }
    // 1 item they're "researching"
    const researchItem = rollRandomItem('common', maxRarity);
    if (researchItem.type !== 'consumable') stealable.push(researchItem);

    return {
        id: `player-${seed}-${String(Date.now()).slice(-5)}`,
        name,
        backpack,
        weightClass: computeWeightClass(backpack),
        isNPC: false,
        isPlayer: true,
        stealableItems: stealable,
    };
}

export function generateArenaOpponents(): Build[] {
    const playerCount = 3 + Math.floor(Math.random() * 2);
    const fakePlayers = Array.from({ length: playerCount }, (_, i) => generateFakePlayer(i));
    const npcCount = 2 + Math.floor(Math.random() * 2);
    const shuffledNPCs = [...NPC_OPPONENTS].sort(() => Math.random() - 0.5).slice(0, npcCount);
    return [...fakePlayers, ...shuffledNPCs];
}
