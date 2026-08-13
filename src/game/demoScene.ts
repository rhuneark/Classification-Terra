// Demo scene replaced by text-based game screens. This file is kept but unused.
import type { Application } from 'pixi.js';
import type { Stage } from './stage.ts';

export interface Scene {
    destroy(): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createDemoScene(_app: Application, _stage: Stage): Scene {
    return { destroy() {} };
}
