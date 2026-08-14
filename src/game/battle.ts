import type { Item, BattleResult, Build } from './types.ts';
import { computeWeightClassFromArray } from './weightClass.ts';

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const OPEN_LINES_HEAVY = [
    'Weight class advantage: yours.',
    'You are heavier on the board.',
    'Opening exchange goes your way.',
];
const OPEN_LINES_LIGHT = [
    'You are outweighed. Proceed carefully.',
    'Weight class disadvantage. You will need to be efficient.',
    'Opening exchange: theirs.',
];
const OPEN_LINES_EVEN = [
    'Weight classes within range. Coin flip.',
    'Even match. Comes down to execution.',
    'Close weight class. Could go either way.',
];
const MID_WON = [
    'Round 3. You are pulling ahead.',
    'Mid-fight assessment: favorable.',
    'They are not gaining ground.',
    'Your loadout is holding.',
];
const MID_LOST = [
    'Round 3. The gap is showing.',
    'Mid-fight: you are not closing the deficit.',
    'Their weight class is consistent.',
    'You are absorbing more than you are dealing.',
];
const FINAL_WON = [
    'Final exchange. Weight class rules.',
    'They yield. You go through their gear.',
    'Decisive. Efficient.',
    'Win logged. You take something useful.',
];
const FINAL_LOST = [
    'They outweigh you. Consistently.',
    'You withdraw. Still breathing. That is the goal.',
    'Loss noted. You leave empty-handed.',
    'Weight class wins. It usually does.',
];

export function resolveBattle(playerBackpack: (Item | null)[], opponent: Build): BattleResult {
    const playerWC = computeWeightClassFromArray(playerBackpack);
    const opponentWC = opponent.weightClass;

    const winProb = (playerWC + 1) / (playerWC + opponentWC + 2);
    const won = Math.random() < winProb;

    const playerEquipped = playerBackpack.filter(Boolean) as Item[];
    const playerWeapon = playerEquipped.find(i => i.type === 'weapon');
    const opponentBuild = opponent.backpack.filter(Boolean) as Item[];
    const opponentWeapon = opponentBuild.find(i => i.type === 'weapon');
    const bioCount = playerEquipped.filter(i => i.special.includes('bio')).length;
    const hazmtCount = playerEquipped.filter(i => i.special.includes('hazmat')).length;

    const exchanges: string[] = [];

    // Opening
    const diff = playerWC - opponentWC;
    if (diff > 15) exchanges.push(pick(OPEN_LINES_HEAVY));
    else if (diff < -15) exchanges.push(pick(OPEN_LINES_LIGHT));
    else exchanges.push(pick(OPEN_LINES_EVEN));

    // Weapon exchange
    if (playerWeapon && opponentWeapon) {
        exchanges.push(`${playerWeapon.name} vs ${opponentWeapon.name}. Both land.`);
    } else if (playerWeapon) {
        exchanges.push(`${playerWeapon.name} meets no counter. Favorable.`);
    } else if (opponentWeapon) {
        exchanges.push(`${opponentWeapon.name} in play. You absorb it.`);
    }

    // Combo callouts
    if (bioCount >= 3) {
        exchanges.push('Bio combo active. Spores doing their thing.');
    }
    if (hazmtCount >= 2) {
        exchanges.push('Hazmat sync reducing incoming environmental damage.');
    }

    // Mid-fight
    exchanges.push(won ? pick(MID_WON) : pick(MID_LOST));

    // Final
    exchanges.push(won ? pick(FINAL_WON) : pick(FINAL_LOST));

    const currencyGained = won ? Math.max(10, Math.floor(10 + opponentWC / 5)) : 3;

    // On win: steal one item from opponent's at-risk items
    let stolenItem: Item | undefined;
    if (won && opponent.stealableItems.length > 0) {
        stolenItem = opponent.stealableItems[Math.floor(Math.random() * opponent.stealableItems.length)];
    }

    return {
        won,
        opponentName: opponent.name,
        exchanges,
        currencyGained,
        stolenItem,
        playerWeightClass: playerWC,
        opponentWeightClass: opponentWC,
    };
}
