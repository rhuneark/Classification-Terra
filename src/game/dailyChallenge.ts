import { ALL_LOCATIONS } from './locations.ts';
import type { Location } from './types.ts';

export function getTodayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

function dateHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h * 31 + s.charCodeAt(i)) | 0) >>> 0;
    }
    return h;
}

export function getDailyChallengeLocation(): Location {
    const today = getTodayStr();
    return ALL_LOCATIONS[dateHash(today) % ALL_LOCATIONS.length];
}
