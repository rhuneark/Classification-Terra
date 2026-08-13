import { useEffect } from 'react';
import { store, useStore } from '../state/store.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import { resolveBattle } from '../game/battle.ts';
import { generateArenaOpponents } from '../game/opponents.ts';
import { RARITY_COLORS, randomResearchDuration } from '../game/types.ts';
import type { Build, Item } from '../game/types.ts';
import { updateSave, getSave, addEarnedScrip } from '../state/save.ts';
import { makeLogId } from '../game/loot.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

function OpponentCard({ build, onBattle }: { build: Build; onBattle: () => void }) {
    const playerBackpack = useStore(s => s.backpack);
    const playerWC = computeWeightClass(playerBackpack);
    const diff = playerWC - build.weightClass;
    const diffColor = diff > 15 ? '#4ade80' : diff < -15 ? '#f43f5e' : '#facc15';
    const equipped = build.backpack.filter(Boolean) as Item[];

    return (
        <div className="rounded p-3.5" style={{ background: '#0e2010', border: '1px solid #243e26' }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="rounded px-1.5 py-0.5 text-[0.62rem] font-bold tracking-wide"
                            style={{
                                background: build.isPlayer ? '#1a3e2a' : '#2e1a0e',
                                color: build.isPlayer ? '#4ade80' : '#fb923c',
                            }}>
                            {build.isPlayer ? 'SURVIVOR' : 'THREAT'}
                        </span>
                        <span className="text-[1rem] font-bold text-white truncate">{build.name}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[0.85rem]" style={{ color: '#a8c4aa' }}>WC {build.weightClass}</span>
                        <span className="text-[0.82rem] font-bold" style={{ color: diffColor }}>
                            {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '+0'} vs you
                        </span>
                    </div>
                </div>
                <button type="button"
                    className="shrink-0 rounded px-4 py-2 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#070e08' }}
                    onClick={onBattle}>
                    FIGHT
                </button>
            </div>

            {equipped.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {equipped.slice(0, 4).map(item => (
                        <span key={item.id} className="rounded px-1.5 py-0.5 text-[0.65rem] font-bold"
                            style={{ color: RARITY_COLORS[item.rarity], background: RARITY_COLORS[item.rarity] + '22' }}>
                            {item.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                    ))}
                    {equipped.length > 4 && (
                        <span className="text-[0.65rem]" style={{ color: '#6a9e6c' }}>+{equipped.length - 4} more</span>
                    )}
                </div>
            )}

            {build.stealableItems.length > 0 && (
                <div className="mt-2 rounded px-2.5 py-1.5" style={{ background: '#070e08', border: '1px solid #1a3e1c' }}>
                    <div className="text-[0.65rem] font-bold tracking-wide mb-1" style={{ color: '#5a9e5c' }}>
                        AT RISK IF YOU WIN
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {build.stealableItems.map((item, i) => (
                            <span key={i} className="rounded px-1.5 py-0.5 text-[0.7rem] font-bold"
                                style={{ color: RARITY_COLORS[item.rarity], background: RARITY_COLORS[item.rarity] + '18' }}>
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BattleResultModal() {
    const battle = useStore(s => s.lastBattle);
    if (!battle) return null;

    function handleDismiss() {
        store.patch({ lastBattle: null, arenaOpponents: generateArenaOpponents() });
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.90)', zIndex: 40 }}>
            <div className="w-full max-w-sm rounded p-5" style={{ background: '#0e2010', border: '1px solid #243e26', maxHeight: '88vh', overflowY: 'auto' }}>
                <div className="text-[1.2rem] font-bold tracking-widest" style={{ color: battle.won ? '#4ade80' : '#f43f5e' }}>
                    {battle.won ? 'VICTORY' : 'DEFEAT'}
                </div>
                <div className="mt-0.5 text-[0.82rem]" style={{ color: '#a8c4aa' }}>
                    vs. {battle.opponentName} -- WC {battle.opponentWeightClass} -- Yours: {battle.playerWeightClass}
                </div>

                <div className="mt-3 space-y-1.5">
                    {battle.exchanges.map((line, i) => (
                        <div key={i} className="text-[0.88rem] leading-snug"
                            style={{ color: i === battle.exchanges.length - 1 ? '#d8f0d8' : '#a8c4aa' }}>
                            {line}
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-2" style={{ borderTop: '1px solid #1a3e1c', paddingTop: '12px' }}>
                    <div className="flex justify-between text-[0.92rem]">
                        <span style={{ color: '#a8c4aa' }}>Scrip {battle.won ? 'earned' : '(consolation)'}</span>
                        <span className="font-bold" style={{ color: '#fb923c' }}>+{battle.currencyGained}</span>
                    </div>

                    {battle.won && battle.stolenItem && (
                        <div className="rounded p-2.5" style={{ background: '#070e08', border: `1px solid ${RARITY_COLORS[battle.stolenItem.rarity]}44` }}>
                            <div className="text-[0.7rem] font-bold" style={{ color: '#4ade80' }}>LOOTED -- QUEUED FOR RESEARCH</div>
                            <div className="mt-0.5 text-[1rem] font-bold" style={{ color: RARITY_COLORS[battle.stolenItem.rarity] }}>
                                {battle.stolenItem.name}
                            </div>
                            <div className="text-[0.82rem]" style={{ color: '#bcd4bd' }}>{battle.stolenItem.description}</div>
                        </div>
                    )}

                    {battle.won && !battle.stolenItem && (
                        <div className="text-[0.85rem]" style={{ color: '#5a7e5c' }}>
                            They had nothing worth taking.
                        </div>
                    )}

                    {!battle.won && (
                        <div className="rounded p-2.5" style={{ background: '#1a0a00', border: '1px solid #4a1500' }}>
                            <div className="text-[0.7rem] font-bold" style={{ color: '#f97316' }}>COST</div>
                            <div className="mt-0.5 text-[0.95rem] font-bold text-white">-1 energy</div>
                            <div className="text-[0.78rem]" style={{ color: '#a07060' }}>You walked away. That counts for something.</div>
                        </div>
                    )}
                </div>

                <button type="button"
                    className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{
                        background: battle.won ? '#7ccf5a' : '#1f3822',
                        color: battle.won ? '#070e08' : '#7ccf5a',
                        border: battle.won ? 'none' : '1px solid #2a5e2c',
                    }}
                    onClick={handleDismiss}>
                    {battle.won ? 'COLLECT AND CONTINUE' : 'CONTINUE'}
                </button>
            </div>
        </div>
    );
}

export default function ArenaScreen() {
    const backpack = useStore(s => s.backpack);
    const currency = useStore(s => s.currency);
    const opponents = useStore(s => s.arenaOpponents);
    const wc = computeWeightClass(backpack);

    const players = opponents.filter(o => o.isPlayer);
    const npcs = opponents.filter(o => o.isNPC);

    useEffect(() => {
        store.patch({ arenaOpponents: generateArenaOpponents() });
    }, []);

    function handleBattle(opponent: Build) {
        RundotGameAPI.analytics.recordCustomEvent('arena_battle_started', { opponentId: opponent.id }).catch(() => {});
        const result = resolveBattle(backpack, opponent);
        const s = store.get();
        const newCurrency = s.currency + result.currencyGained;
        addEarnedScrip(result.currencyGained);

        let newInventory = s.inventory;
        let newQueue = s.researchQueue;
        if (result.stolenItem) {
            if (result.stolenItem.type === 'consumable') {
                newInventory = [...s.inventory, result.stolenItem];
            } else {
                newQueue = [...s.researchQueue, {
                    instanceId: String(Date.now() + Math.random()),
                    item: result.stolenItem,
                    startedAt: Date.now(),
                    durationMs: randomResearchDuration(result.stolenItem.rarity),
                }];
            }
        }

        const newEnergy = !result.won ? Math.max(0, s.energy - 1) : s.energy;

        const logEntry = {
            id: makeLogId(),
            type: result.won ? ('battle-win' as const) : ('battle-loss' as const),
            message: result.won
                ? `[ARENA] Beat ${opponent.name} (WC ${opponent.weightClass}). +${result.currencyGained} scrip.${result.stolenItem ? ` Looted: ${result.stolenItem.name}.` : ''}`
                : `[ARENA] Lost to ${opponent.name} (WC ${opponent.weightClass}). -1 energy.`,
            timestamp: Date.now(),
        };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);

        store.patch({
            currency: newCurrency,
            energy: newEnergy,
            inventory: newInventory,
            researchQueue: newQueue,
            eventLog: newLog,
            lastBattle: result,
        });

        const save = getSave();
        updateSave({
            currency: newCurrency,
            energy: newEnergy,
            inventory: newInventory,
            researchQueue: newQueue,
            eventLog: newLog,
            totalBattles: save.totalBattles + 1,
            wins: save.wins + (result.won ? 1 : 0),
        });

        if (result.won) {
            RundotGameAPI.analytics.recordCustomEvent('arena_battle_won', {
                opponentId: opponent.id,
                currencyGained: result.currencyGained,
                stolenItemId: result.stolenItem?.id,
            }).catch(() => {});
        } else {
            RundotGameAPI.analytics.recordCustomEvent('arena_battle_lost', { opponentId: opponent.id }).catch(() => {});
        }
    }

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#070e08' }}>
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #142816' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">ARENA</div>
                    <div className="text-right">
                        <div className="text-[0.9rem] font-bold text-white">YOUR WC: {wc}</div>
                        <div className="text-[0.78rem]" style={{ color: '#7aaa7c' }}>{currency} scrip</div>
                    </div>
                </div>
                <p className="mt-0.5 text-[0.75rem]" style={{ color: '#6a9e6c' }}>
                    Win: steal their gear into research. Lose: -1 energy.
                </p>
            </div>

            {wc === 0 && (
                <div className="mx-4 mt-4 rounded p-4" style={{ background: '#1a0a00', border: '1px solid #4a2000' }}>
                    <p className="text-[0.9rem]" style={{ color: '#f97316' }}>No gear equipped. Visit LOADOUT first.</p>
                </div>
            )}

            <div className="scroll-area flex-1 p-3 space-y-4">
                {players.length > 0 && (
                    <div>
                        <div className="mb-2 text-[0.68rem] font-bold tracking-widest" style={{ color: '#5a7e5c' }}>
                            SURVIVORS ({players.length})
                        </div>
                        <div className="space-y-2">
                            {players.map(opp => (
                                <OpponentCard key={opp.id} build={opp} onBattle={() => handleBattle(opp)} />
                            ))}
                        </div>
                    </div>
                )}

                {npcs.length > 0 && (
                    <div>
                        <div className="mb-2 text-[0.68rem] font-bold tracking-widest" style={{ color: '#5a7e5c' }}>
                            KNOWN THREATS
                        </div>
                        <div className="space-y-2">
                            {npcs.map(opp => (
                                <OpponentCard key={opp.id} build={opp} onBattle={() => handleBattle(opp)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BattleResultModal />
        </div>
    );
}
