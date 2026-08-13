// Shared regen timer — module-level so BackpackScreen can reset it when a drink is used

export let lastEnergyRegenAt = Date.now();

export function touchEnergyRegenTimer(): void {
    lastEnergyRegenAt = Date.now();
}

// Call when the boost activates so the first boosted tick fires quickly
export function primeEnergyRegenTimer(): void {
    // Set as if the last regen was 50s ago → next 10s tick will fire (60s threshold met)
    lastEnergyRegenAt = Date.now() - 50_000;
}
