import { store, useStore } from '../state/store.ts';
import { computeWeightClass } from '../game/weightClass.ts';
import { resolveBattle } from '../game/battle.ts';
import { RARITY_COLORS } from '../game/types.ts';
import type { Build, Item } from '../game/types.ts';
import { updateSave, getSave } from '../state/save.ts';
import { makeLogId } from '../game/loot.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

function OpponentCard({ build, onBattle }: { build: Build; onBattle: () => void }) {
    const playerBackpack = useStore(s => s.backpack);
    const playerWC = computeWeightClass(playerBackpack);
    const diff = playerWC - build.weightClass;
    const diffColor = diff > 15 ? '#4ade80' : diff < -15 ? '#f43f5e' : '#facc15';

    return (
        <div
            className="rounded p-4"
            style={{ background: '#0b1a0d', border: '1px solid #1a2e1c' }}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="text-[1rem] font-bold text-white">{build.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[0.85rem]" style={{ color: '#6b7a6c' }}>WC {build.weightClass}</span>
                        <span className="text-[0.8rem] font-bold" style={{ color: diffColor }}>
                            {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '±0'} vs you
                        </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                        {(build.backpack.filter(Boolean) as Item[]).slice(0, 4).map(item => (
                            <span
                                key={item.id}
                                className="rounded px-1 text-[0.65rem]"
                                style={{ color: RARITY_COLORS[item.rarity], background: RARITY_COLORS[item.rarity] + '22' }}
                            >
                                {item.name.split(' ')[0]}
                            </span>
                        ))}
                        {(build.backpack.filter(Boolean) as Item[]).length > 4 && (
                            <span className="text-[0.65rem]" style={{ color: '#4a5a4c' }}>
                                +{(build.backpack.filter(Boolean) as Item[]).length - 4} more
                            </span>
                        )}
                    </div>
                </div>
                <button
                    type="button"
                    className="shrink-0 rounded px-4 py-2 text-[0.9rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#7ccf5a', color: '#050d07' }}
                    onClick={onBattle}
                >
                    FIGHT
                </button>
            </div>
        </div>
    );
}

function BattleResultModal() {
    const battle = useStore(s => s.lastBattle);
    if (!battle) return null;

    function dismiss() {
        store.patch({ lastBattle: null });
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 40 }}>
            <div
                className="w-full max-w-sm rounded p-5"
                style={{ background: '#0b1a0d', border: '1px solid #1a2e1c', maxHeight: '85vh', overflowY: 'auto' }}
            >
                <div
                    className="text-[1.1rem] font-bold tracking-widest"
                    style={{ color: battle.won ? '#4ade80' : '#f43f5e' }}
                >
                    {battle.won ? 'VICTORY' : 'DEFEAT'}
                </div>
                <div className="mt-1 text-[0.8rem]" style={{ color: '#6b7a6c' }}>
                    vs. {battle.opponentName} (WC {battle.opponentWeightClass})
                    {' '}— Your WC: {battle.playerWeightClass}
                </div>

                <div className="mt-3 space-y-1">
                    {battle.exchanges.map((line, i) => (
                        <div key={i} className="text-[0.85rem] leading-snug" style={{ color: i === battle.exchanges.length - 1 ? '#d4e4d4' : '#6b7a6c' }}>
                            {line}
                        </div>
                    ))}
                </div>

                <div className="mt-4 space-y-1.5" style={{ borderTop: '1px solid #1a2e1c', paddingTop: '12px' }}>
                    <div className="flex justify-between text-[0.9rem]">
                        <span style={{ color: '#6b7a6c' }}>Scrip {battle.won ? 'earned' : 'consolation'}</span>
                        <span className="font-bold" style={{ color: '#fb923c' }}>+{battle.currencyGained}</span>
                    </div>
                    {battle.itemGained && (
                        <div className="rounded p-2.5" style={{ background: '#050d07', border: `1px solid ${RARITY_COLORS[battle.itemGained.rarity]}44` }}>
                            <div className="text-[0.7rem]" style={{ color: '#4ade80' }}>ITEM REWARD</div>
                            <div className="text-[0.95rem] font-bold" style={{ color: RARITY_COLORS[battle.itemGained.rarity] }}>
                                {battle.itemGained.name}
                            </div>
                            <div className="text-[0.75rem]" style={{ color: '#6b7a6c' }}>{battle.itemGained.description}</div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="mt-5 w-full rounded py-3 text-[1rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: battle.won ? '#7ccf5a' : '#1a2e1c', color: battle.won ? '#050d07' : '#7ccf5a', border: battle.won ? 'none' : '1px solid #2a4e2c' }}
                    onClick={dismiss}
                >
                    {battle.won ? 'COLLECT & CONTINUE' : 'CONTINUE'}
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

    function handleBattle(opponent: Build) {
        RundotGameAPI.analytics.recordCustomEvent('arena_battle_started', { opponentId: opponent.id }).catch(() => {});

        const result = resolveBattle(backpack, opponent);

        const s = store.get();
        const newCurrency = s.currency + result.currencyGained;
        const newInventory = result.itemGained ? [...s.inventory, result.itemGained] : s.inventory;

        const logEntry = {
            id: makeLogId(),
            type: result.won ? ('battle-win' as const) : ('battle-loss' as const),
            message: result.won
                ? `[ARENA] Beat ${opponent.name} (WC ${opponent.weightClass}). +${result.currencyGained} scrip.`
                : `[ARENA] Lost to ${opponent.name} (WC ${opponent.weightClass}). +${result.currencyGained} scrip.`,
            timestamp: Date.now(),
        };
        const newLog = [logEntry, ...s.eventLog].slice(0, 50);

        store.patch({
            currency: newCurrency,
            inventory: newInventory,
            eventLog: newLog,
            lastBattle: result,
        });

        const save = getSave();
        updateSave({
            currency: newCurrency,
            inventory: newInventory,
            eventLog: newLog,
            totalBattles: save.totalBattles + 1,
            wins: save.wins + (result.won ? 1 : 0),
        });

        if (result.won) {
            RundotGameAPI.analytics.recordCustomEvent('arena_battle_won', {
                opponentId: opponent.id,
                currencyGained: result.currencyGained,
                hadItemReward: !!result.itemGained,
            }).catch(() => {});
        } else {
            RundotGameAPI.analytics.recordCustomEvent('arena_battle_lost', {
                opponentId: opponent.id,
            }).catch(() => {});
        }
    }

    return (
        <div className="relative flex h-full flex-col" style={{ background: '#050d07' }}>
            {/* Header */}
            <div className="shrink-0 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid #0b1a0d' }}>
                <div className="flex items-center justify-between">
                    <div className="text-[1rem] font-bold tracking-widest text-primary">ARENA</div>
                    <div className="text-right">
                        <div className="text-[0.85rem] font-bold text-white">YOUR WC: {wc}</div>
                        <div className="text-[0.75rem]" style={{ color: '#6b7a6c' }}>{currency} scrip</div>
                    </div>
                </div>
                <p className="text-[0.75rem]" style={{ color: '#4a5a4c' }}>
                    Auto-resolved. Your loadout does the fighting.
                </p>
            </div>

            {wc === 0 && (
                <div className="mx-4 mt-4 rounded p-4" style={{ background: '#160a00', border: '1px solid #3a1500' }}>
                    <p className="text-[0.9rem]" style={{ color: '#f97316' }}>
                        No gear equipped. Visit LOADOUT first.
                    </p>
                </div>
            )}

            <div className="scroll-area flex-1 space-y-2 p-3">
                {opponents.map(opp => (
                    <OpponentCard key={opp.id} build={opp} onBattle={() => handleBattle(opp)} />
                ))}
            </div>

            <BattleResultModal />
        </div>
    );
}
