import type { Build } from './types.ts';
import { getItemById } from './items.ts';
import { computeWeightClass } from './weightClass.ts';

function g(id: string) {
    return getItemById(id) ?? null;
}

function makeBuild(id: string, name: string, slots: (string | null)[]): Build {
    const backpack = slots.map(s => (s ? g(s) : null));
    return { id, name, backpack, weightClass: computeWeightClass(backpack), isNPC: true };
}

export const NPC_OPPONENTS: Build[] = [
    makeBuild('npc-patient-zero', 'Patient Zero', [
        'rusty-penknife', 'damp-bandana', null, null, null, null, null, null,
    ]),
    makeBuild('npc-janitor', 'The Janitor', [
        'crowbar', 'leather-vest', 'work-gloves', 'hazmat-boots', null, null, null, null,
    ]),
    makeBuild('npc-field-tech', 'Field Tech Rachel', [
        'cdc-jacket', 'filtered-respirator', 'contam-suit', 'glass-shiv', 'spore-canister', null, null, null,
    ]),
    makeBuild('npc-mycologist', 'The Mycologist', [
        'mycelium-blade', 'spore-canister', 'specimen-jar', 'mycelium-shell', 'fungal-brace', null, null, null,
    ]),
    makeBuild('npc-director', 'Director Chen', [
        'full-hazmat', 'bone-saw', 'outbreak-map', 'chen-badge', 'enforcer-baton', null, null, null,
    ]),
    makeBuild('npc-collector', 'The Collector', [
        'the-paperclip', 'cure-7', 'sporemothers-crown', 'decon-cannon', 'outbreak-zero', null, null, null,
    ]),
];

export function getRandomNPCOpponent(): Build {
    return NPC_OPPONENTS[Math.floor(Math.random() * NPC_OPPONENTS.length)];
}
