import { useState } from 'react';
import { store, useStore } from '../state/store.ts';
import { updateSave } from '../state/save.ts';
import { CRAFT_RECIPES, CRAFT_SETS, CRAFTED_ITEMS, canCraft, applyCraft, getActiveCraftSetBonuses } from '../game/crafting.ts';
import { RARITY_COLORS, RARITY_LABELS, loadoutItems } from '../game/types.ts';
import { getItemById } from '../game/items.ts';
import RundotGameAPI from '@series-inc/rundot-game-sdk/api';

export default function WorkbenchTab() {
    const inventory = useStore(s => s.inventory);
    const loadout = useStore(s => s.loadout);
    const foundUniqueIds = useStore(s => s.foundUniqueIds);
    const [craftedMsg, setCraftedMsg] = useState<string | null>(null);

    const allEquipped = loadoutItems(loadout);
    const equippedIds = allEquipped.map(i => i.id);
    const activeSets = getActiveCraftSetBonuses(equippedIds);

    function handleCraft(recipeId: string) {
        const s = store.get();
        const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return;
        const result = applyCraft(recipe, s.inventory);
        if (!result) return;

        const { newInventory, result: craftedItem } = result;
        const newTotalCrafts = (s.totalCrafts ?? 0) + 1;

        store.patch({ inventory: newInventory, totalCrafts: newTotalCrafts });
        updateSave({ inventory: newInventory, totalCrafts: newTotalCrafts });

        setCraftedMsg(`${craftedItem.name} added to Safe House.`);
        setTimeout(() => setCraftedMsg(null), 3000);

        RundotGameAPI.analytics.recordCustomEvent('workbench_crafted', {
            recipeId,
            resultItemId: recipe.resultItemId,
            setId: recipe.setId ?? null,
        }).catch(() => {});
    }

    const setRecipes = CRAFT_SETS.map(set => ({
        set,
        recipes: CRAFT_RECIPES.filter(r => r.setId === set.id),
    }));
    const soloRecipes = CRAFT_RECIPES.filter(r => !r.setId);

    function RecipeCard({ recipeId }: { recipeId: string }) {
        const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return null;
        const resultItem = CRAFTED_ITEMS.find(i => i.id === recipe.resultItemId);
        if (!resultItem) return null;

        const color = RARITY_COLORS[resultItem.rarity];
        const craftable = canCraft(recipe, inventory);
        const alreadyHave = inventory.some(i => i.id === resultItem.id) || equippedIds.includes(resultItem.id);

        return (
            <div className="rounded p-2.5 mb-2"
                style={{ background: '#0e2010', border: `1px solid ${craftable ? color + '55' : '#1a3e1c'}` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {resultItem.setId && (
                                <span className="text-[0.65rem]" style={{ color: '#fb923c' }}>⚙</span>
                            )}
                            <span className="text-[0.9rem] font-bold truncate" style={{ color }}>{resultItem.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                            <span className="text-[0.65rem] font-bold" style={{ color: color + 'aa' }}>{RARITY_LABELS[resultItem.rarity]}</span>
                            {resultItem.equipSlot && (
                                <span className="text-[0.6rem] rounded px-1" style={{ background: '#142816', color: '#7aaa7c' }}>
                                    {resultItem.equipSlot.toUpperCase().replace('-', ' ')}
                                </span>
                            )}
                        </div>
                        <div className="mt-0.5 text-[0.78rem]" style={{ color: '#9ab09c' }}>{resultItem.description}</div>
                    </div>
                    <div className="shrink-0 text-right space-y-0.5">
                        {resultItem.damage > 0 && (
                            <div className="text-[0.7rem] font-bold" style={{ color: '#ffd060' }}>ATK {resultItem.damage}</div>
                        )}
                        {resultItem.defense > 0 && (
                            <div className="text-[0.7rem] font-bold" style={{ color: '#60a5fa' }}>DEF {resultItem.defense}</div>
                        )}
                    </div>
                </div>

                <div className="space-y-0.5 mb-2">
                    <div className="text-[0.62rem] font-bold tracking-widest mb-1" style={{ color: '#5a8a5c' }}>REQUIRES</div>
                    {recipe.ingredients.map(ing => {
                        const ingItem = getItemById(ing.itemId);
                        const have = inventory.filter(i => i.id === ing.itemId).length;
                        const ok = have >= ing.count;
                        return (
                            <div key={ing.itemId} className="flex items-center gap-1.5">
                                <span className="text-[0.75rem]" style={{ color: ok ? '#4ade80' : '#f97316' }}>
                                    {ok ? '✓' : '✗'}
                                </span>
                                <span className="text-[0.78rem]" style={{ color: ok ? '#bcd4bd' : '#8aaa8c' }}>
                                    {ingItem?.name ?? ing.itemId}
                                </span>
                                <span className="text-[0.65rem] ml-auto" style={{ color: ok ? '#4a8a4c' : '#6a5a4c' }}>
                                    {have}/{ing.count}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {alreadyHave ? (
                    <div className="text-[0.75rem] text-center py-1" style={{ color: '#5a8a5c' }}>
                        Already crafted
                    </div>
                ) : (
                    <button type="button"
                        disabled={!craftable}
                        className="w-full rounded py-1.5 text-[0.85rem] font-bold tracking-wide transition-transform active:scale-95 disabled:opacity-40"
                        style={{
                            background: craftable ? '#1a4e1c' : '#0e1e10',
                            color: craftable ? '#7ccf5a' : '#4a7a4c',
                            border: `1px solid ${craftable ? '#3a7e3c' : '#1a3e1c'}`,
                        }}
                        onClick={() => handleCraft(recipeId)}>
                        {craftable ? 'CRAFT' : 'MISSING PARTS'}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full" style={{ background: '#070e08' }}>
            <div className="px-4 pt-3 pb-2 shrink-0" style={{ borderBottom: '1px solid #142816' }}>
                <div className="text-[0.9rem] font-bold tracking-widest text-primary">WORKBENCH</div>
                <div className="mt-0.5 text-[0.8rem]" style={{ color: '#8aaa8c' }}>
                    Combine items to craft better gear. Set items <span style={{ color: '#fb923c' }}>⚙</span> unlock bonuses when equipped together.
                </div>
                {activeSets.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {activeSets.map(s => (
                            <span key={s.id} className="rounded px-2 py-0.5 text-[0.72rem] font-bold"
                                style={{ background: '#1a2e1c', color: '#fb923c', border: '1px solid #3a4e1c' }}>
                                ⚙ {s.name}: {s.bonusDescription}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {craftedMsg && (
                <div className="mx-3 mt-2 rounded px-3 py-2 text-[0.85rem] font-bold text-center"
                    style={{ background: '#0a2e0c', color: '#4ade80', border: '1px solid #1a5e1c' }}>
                    {craftedMsg}
                </div>
            )}

            <div className="scroll-area flex-1 px-3 pt-3 pb-20 space-y-5">
                {/* Craft sets — always expanded */}
                {setRecipes.map(({ set, recipes }) => {
                    const isHidden = !!set.hiddenUntilItemId && !foundUniqueIds.includes(set.hiddenUntilItemId);
                    const craftedCount = set.members.filter(m =>
                        m === 'paperclip-classified'
                            ? foundUniqueIds.includes(m)
                            : inventory.some(i => i.id === m) || equippedIds.includes(m)
                    ).length;
                    const setName = isHidden ? '???' : set.name.toUpperCase();
                    const bonusDesc = isHidden ? '???' : set.bonusDescription;

                    return (
                        <div key={set.id}>
                            {/* Set header */}
                            <div className="mb-2 rounded p-2.5"
                                style={{ background: '#0a1a0c', border: '1px solid #1e3e20' }}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[0.75rem] font-bold tracking-widest" style={{ color: '#fb923c' }}>
                                            ⚙ {setName}
                                        </span>
                                        <span className="text-[0.65rem] rounded px-1.5"
                                            style={{
                                                background: craftedCount > 0 ? '#1a3e0c' : '#0e1a0e',
                                                color: craftedCount > 0 ? '#4ade80' : '#4a7a4c',
                                                border: '1px solid #243e26',
                                            }}>
                                            {craftedCount}/{set.members.length}
                                        </span>
                                    </div>
                                    <span className="text-[0.7rem] shrink-0" style={{ color: '#7aaa7c' }}>{bonusDesc}</span>
                                </div>
                                {isHidden && (
                                    <div className="mt-1 text-[0.72rem]" style={{ color: '#5a7a5c' }}>
                                        Discover the hidden paperclip to reveal this set.
                                    </div>
                                )}
                            </div>
                            {/* Recipe cards — always shown */}
                            {recipes.map(r => <RecipeCard key={r.id} recipeId={r.id} />)}
                        </div>
                    );
                })}

                {/* Solo crafts */}
                <div>
                    <div className="text-[0.72rem] font-bold tracking-widest mb-2" style={{ color: '#6a9e6c' }}>STANDALONE CRAFTS</div>
                    {soloRecipes.map(r => <RecipeCard key={r.id} recipeId={r.id} />)}
                </div>
            </div>
        </div>
    );
}
