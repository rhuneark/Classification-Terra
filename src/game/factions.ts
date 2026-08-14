import type { Survivor, SurvivorRole, RivalFaction, Bounty, GlobalEvent } from './types.ts';

// ── SURVIVOR ROLES ─────────────────────────────────────────────────────────

export interface SurvivorRoleData {
    label: string;
    flavor: string;
    bonus: string;
    color: string;
    scrip: number;       // passive scrip per hour
    defense: number;     // base defense contribution
    offense: number;     // base offense contribution
    energyPerHrs?: number; // energy every N hours (offline)
    findBonus?: number;  // % find bonus in ruins
    researchPct?: number; // % reduction in research time
    raidPenalty?: number; // % reduction in rival raid success
}

export const SURVIVOR_ROLES: Record<SurvivorRole, SurvivorRoleData> = {
    scavenger: {
        label: 'SCAVENGER',
        flavor: 'Knows every ruin in a five-block radius. Will not shut up about it.',
        bonus: '+3 scrip/hr',
        color: '#fb923c',
        scrip: 3,
        defense: 0,
        offense: 0,
    },
    guard: {
        label: 'GUARD',
        flavor: "Hasn't left the perimeter in six days. Hasn't been asked to.",
        bonus: '+10 Base Defense',
        color: '#60a5fa',
        scrip: 0,
        defense: 10,
        offense: 0,
    },
    raider: {
        label: 'RAIDER',
        flavor: 'Asks fewer questions than most. Gets results for similar reasons.',
        bonus: '+8 Base Offense',
        color: '#ffd060',
        scrip: 0,
        defense: 0,
        offense: 8,
    },
    medic: {
        label: 'MEDIC',
        flavor: 'Patches what the ruins break. Works fast. Asks later.',
        bonus: '+1 energy every 4 hrs (offline)',
        color: '#4ade80',
        scrip: 0,
        defense: 0,
        offense: 0,
        energyPerHrs: 4,
    },
    scout: {
        label: 'SCOUT',
        flavor: "Returns from every run. Hasn't explained how yet.",
        bonus: '+3% item find chance per scout',
        color: '#34d399',
        scrip: 0,
        defense: 0,
        offense: 0,
        findBonus: 3,
    },
    engineer: {
        label: 'ENGINEER',
        flavor: 'Makes things out of other things. Occasionally intentional.',
        bonus: '-8% research time',
        color: '#a78bfa',
        scrip: 0,
        defense: 0,
        offense: 0,
        researchPct: 8,
    },
    enforcer: {
        label: 'ENFORCER',
        flavor: 'Former faction. Declined to say which one. You respected that.',
        bonus: '+12 DEF, -5% rival raid success',
        color: '#f87171',
        scrip: 0,
        defense: 12,
        offense: 0,
        raidPenalty: 5,
    },
};

const NAMES_BY_ROLE: Record<SurvivorRole, string[]> = {
    scavenger: ['Dust', 'Grim', 'Peck', 'Wren', 'Bolt', 'Slag', 'Nix'],
    guard: ['Stone', 'Brace', 'Wall', 'Lock', 'Thorn', 'Forge', 'Holt'],
    raider: ['Spike', 'Fang', 'Rend', 'Axe', 'Bite', 'Scar', 'Rust'],
    medic: ['Stitch', 'Balm', 'Patch', 'Serum', 'Suture', 'Vial', 'Swab'],
    scout: ['Ghost', 'Shade', 'Blur', 'Wisp', 'Dart', 'Echo', 'Ember'],
    engineer: ['Crank', 'Weld', 'Coil', 'Fuse', 'Splice', 'Rivet', 'Lever'],
    enforcer: ['Ward', 'Iron', 'Hull', 'Bulwark', 'Rampart', 'Claw', 'Vice'],
};

export function generateSurvivor(): Survivor {
    const roles: SurvivorRole[] = ['scavenger', 'guard', 'raider', 'medic', 'scout', 'engineer', 'enforcer'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const namePool = NAMES_BY_ROLE[role];
    const name = namePool[Math.floor(Math.random() * namePool.length)];
    return {
        id: `survivor-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        name,
        role,
        joinedAt: Date.now(),
    };
}

// ── BASE STATS ────────────────────────────────────────────────────────────────

export interface BaseStats {
    defense: number;
    offense: number;
    scripPerHour: number;
    stability: number; // 0-100
    upkeep: number;    // scrip per session (every 2 hrs)
    researchReduction: number; // % reduction in research
    findBonus: number; // % bonus to item find
}

export function computeBaseStats(survivors: Survivor[]): BaseStats {
    let defense = 0, offense = 0, scripPerHour = 0, researchReduction = 0, findBonus = 0;
    const roleCounts: Partial<Record<SurvivorRole, number>> = {};

    for (const s of survivors) {
        const data = SURVIVOR_ROLES[s.role];
        defense += data.defense;
        offense += data.offense;
        scripPerHour += data.scrip;
        if (data.researchPct) researchReduction += data.researchPct;
        if (data.findBonus) findBonus += data.findBonus;
        roleCounts[s.role] = (roleCounts[s.role] ?? 0) + 1;
    }

    const rolesPresent = Object.keys(roleCounts).length;
    const stability = survivors.length === 0 ? 0 : Math.round((rolesPresent / 7) * 100);

    // Upkeep: 2 scrip per survivor per session, halved if stability >= 85%
    const baseUpkeep = survivors.length * 2;
    const upkeep = stability >= 85 ? Math.ceil(baseUpkeep / 2) : baseUpkeep;

    return { defense, offense, scripPerHour, stability, upkeep, researchReduction, findBonus };
}

// ── RIVAL FACTIONS ────────────────────────────────────────────────────────────

export const BASE_RIVAL_FACTIONS: Omit<RivalFaction, 'grudge' | 'lastRaidedByPlayerAt' | 'lastRaidedUsAt'>[] = [
    {
        id: 'collectors',
        name: 'The Collectors',
        flavor: "They catalog everything. You're on the list.",
        offense: 28,
        defense: 24,
    },
    {
        id: 'the-rot',
        name: 'The Rot',
        flavor: "They made peace with the infection. You haven't.",
        offense: 48,
        defense: 14,
    },
    {
        id: 'remnants',
        name: 'The Remnants',
        flavor: 'Former enforcement division. Still enforcing something.',
        offense: 22,
        defense: 42,
    },
    {
        id: 'wanderers',
        name: 'Wandering Scavs',
        flavor: "Nobody's sure where they came from. Nobody's asked.",
        offense: 14,
        defense: 10,
    },
];

export function initRivalFactions(): RivalFaction[] {
    return BASE_RIVAL_FACTIONS.map(f => ({ ...f, grudge: 0 }));
}

/** Probability of player successfully raiding (0–1) */
export function raidSuccessChance(playerOffense: number, rivalDefense: number): number {
    const total = playerOffense + rivalDefense + 1;
    return Math.min(0.9, Math.max(0.05, playerOffense / total));
}

/** Probability of rival successfully raiding player (0–1) */
export function defenseSuccessChance(playerDefense: number, rivalOffense: number, enforceCount: number): number {
    const penaltyPct = enforceCount * (SURVIVOR_ROLES.enforcer.raidPenalty ?? 0);
    const adjustedOffense = rivalOffense * (1 - penaltyPct / 100);
    const total = playerDefense + adjustedOffense + 1;
    return Math.min(0.95, Math.max(0.1, playerDefense / total));
}

/** Next raid time for a rival (ms timestamp). Call on login or after raid. */
export function nextRivalRaidMs(factionId: string, grudge: number): number {
    // Base interval varies by faction aggressiveness
    const baseHours: Record<string, number> = {
        collectors: 10,
        'the-rot': 6,
        remnants: 14,
        wanderers: 20,
    };
    const base = (baseHours[factionId] ?? 12) * 3_600_000;
    const grudgeReduction = Math.floor(grudge / 20) * 3_600_000; // up to -5 hrs at max grudge
    return Math.max(2 * 3_600_000, base - grudgeReduction);
}

// ── BOUNTIES ──────────────────────────────────────────────────────────────────

const BOUNTY_POOL: Omit<Bounty, 'id' | 'expiresAt' | 'completed' | 'claimed' | 'progress'>[] = [
    { description: 'Raid a rival faction successfully', rewardScrip: 50, type: 'raid', target: 1 },
    { description: 'Raid a rival faction successfully', rewardScrip: 50, type: 'raid', target: 1 },
    { description: 'Complete 3 Ruins scavenges', rewardScrip: 25, rewardItemRarity: 'uncommon', type: 'scavenge', target: 3 },
    { description: 'Complete 5 Ruins scavenges', rewardScrip: 40, rewardItemRarity: 'rare', type: 'scavenge', target: 5 },
    { description: 'Survive 2 ambushes', rewardScrip: 30, type: 'survive', target: 2 },
    { description: 'Survive 3 ambushes', rewardScrip: 45, type: 'survive', target: 3 },
    { description: 'Recruit a survivor to your base', rewardScrip: 20, type: 'recruit', target: 1 },
    { description: 'Craft any item at the Workbench', rewardScrip: 35, type: 'craft', target: 1 },
    { description: 'Fill all 8 loadout slots', rewardScrip: 30, type: 'loadout', target: 8 },
    { description: 'Fill all 8 loadout slots with rare or better', rewardScrip: 55, rewardItemRarity: 'rare', type: 'loadout', target: 8 },
];

const BOUNTY_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

export function generateBounties(now: number): Bounty[] {
    const shuffled = [...BOUNTY_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((b, i) => ({
        ...b,
        id: `bounty-${now}-${i}`,
        expiresAt: now + BOUNTY_REFRESH_MS,
        completed: false,
        claimed: false,
        progress: 0,
    }));
}

export { BOUNTY_REFRESH_MS };

// ── GLOBAL EVENTS ─────────────────────────────────────────────────────────────

const EVENT_DEFINITIONS: Omit<GlobalEvent, 'activeUntil'>[] = [
    { type: 'terra_surge', name: 'Terra Migration', description: 'Terra activity is elevated across all ruins.', effect: 'Ambush chance +20%' },
    { type: 'market_crash', name: 'Trade Route Collapse', description: 'The usual supply lines are cut.', effect: 'Outpost prices +30%' },
    { type: 'rival_surge', name: 'Faction Wars', description: 'Rival groups are consolidating territory aggressively.', effect: 'Rival raids more frequent' },
    { type: 'energy_drought', name: 'Energy Crisis', description: 'Supplies are low. Moving costs more.', effect: 'Energy regen halved' },
    { type: 'bounty_rush', name: 'Resource Scramble', description: 'Everyone needs something. Pay is good.', effect: 'Bounty rewards doubled' },
    { type: 'safe_passage', name: 'Quiet Window', description: 'Terra movement is unusually low. Make use of it.', effect: 'Ambush chance -30%' },
    { type: 'salvage_run', name: 'Rich Pickings', description: 'Untouched supply caches reported across sectors.', effect: '+20% item find chance' },
];

/**
 * Deterministic per-day global event, active 12:00–18:00 UTC.
 * All players see the same event on the same day.
 */
export function getCurrentGlobalEvent(): GlobalEvent | null {
    const now = new Date();
    const hour = now.getUTCHours();
    if (hour < 12 || hour >= 18) return null;
    const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) / 86_400_000
    );
    const def = EVENT_DEFINITIONS[dayOfYear % EVENT_DEFINITIONS.length];
    const activeUntil = new Date(now);
    activeUntil.setUTCHours(18, 0, 0, 0);
    return { ...def, activeUntil: activeUntil.getTime() };
}

// ── PASSIVE SCRIP FROM SCAVENGERS ─────────────────────────────────────────────

/** Calculate offline scrip earned from scavengers since lastOnline */
export function passiveScripGained(survivors: Survivor[], msAway: number): number {
    const scavengers = survivors.filter(s => s.role === 'scavenger').length;
    if (scavengers === 0) return 0;
    const hoursAway = msAway / 3_600_000;
    const cappedHours = Math.min(hoursAway, 48); // cap at 48 hours
    const perHour = SURVIVOR_ROLES.scavenger.scrip * scavengers;
    return Math.floor(cappedHours * perHour);
}

/** Calculate offline energy from medics */
export function passiveEnergyFromMedics(survivors: Survivor[], msAway: number): number {
    const medics = survivors.filter(s => s.role === 'medic').length;
    if (medics === 0) return 0;
    const intervalMs = (SURVIVOR_ROLES.medic.energyPerHrs ?? 4) * 3_600_000;
    const ticks = Math.floor(msAway / intervalMs);
    return ticks * medics;
}
