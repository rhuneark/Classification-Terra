import RundotGameAPI from '@series-inc/rundot-game-sdk/api';
import { sdkReady } from '../sdk/runSdk.ts';
import type { ResearchQueueItem } from './types.ts';
import { ENERGY_REGEN_MINUTES, MAX_ENERGY } from './types.ts';

export function scheduleResearchNotif(queue: ResearchQueueItem[]): void {
    if (!queue.length || !sdkReady()) return;
    const earliest = queue.reduce((a, b) =>
        a.startedAt + a.durationMs < b.startedAt + b.durationMs ? a : b
    );
    const delaySec = Math.floor((earliest.startedAt + earliest.durationMs - Date.now()) / 1000);
    if (delaySec < 5 || delaySec > 7 * 24 * 3600) return;
    RundotGameAPI.notifications.submitMessageAsync({
        channels: ['local'],
        title: 'Research Complete',
        body: `${earliest.item.name} is ready.`,
        delaySeconds: delaySec,
        collapseKey: 'research-complete',
    }).catch(() => {});
}

export function scheduleEnergyNotif(energy: number): void {
    if (!sdkReady() || energy >= MAX_ENERGY) return;
    const delaySec = (MAX_ENERGY - energy) * ENERGY_REGEN_MINUTES * 60;
    if (delaySec < 60 || delaySec > 7 * 24 * 3600) return;
    RundotGameAPI.notifications.submitMessageAsync({
        channels: ['local'],
        title: 'Energy Recharged',
        body: 'Your energy is full. Time to scavenge.',
        delaySeconds: delaySec,
        collapseKey: 'energy-full',
    }).catch(() => {});
}
