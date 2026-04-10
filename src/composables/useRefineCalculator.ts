import { ref, computed, watch } from 'vue'
import { Location } from '@/types/items'
import {
  type MaterialType,
  MATERIALS,
  RAW_NAMES,
  REFINED_NAMES,
  CITY_BONUS,
  RAW_QTY,
  ITEM_VALUE_TABLE,
  RRR_TABLE,
  BASE_FOCUS_NORMAL,
  BASE_FOCUS_STONE,
  ENCHANTMENT_SUFFIX,
  tierBadge,
} from '@/data/refineData'

export function useRefineCalculator() {
  // ── State ────────────────────────────────────────────────────────────────

  const material = ref<MaterialType>('wood')
  const tier = ref(5)
  const enchantment = ref(0)
  const stoneEnchantment = ref(0)
  const city = ref<Location>(Location.FortSterling)
  const eventBonus = ref(0)
  const useFocus = ref(false)
  const specT4 = ref(0)
  const specT5 = ref(0)
  const specT6 = ref(0)
  const specT7 = ref(0)
  const specT8 = ref(0)
  const focusBudget = ref(30000)
  const rawPrice = ref(0)
  const subPrice = ref(0)
  const quantity = ref(1)
  const sellPrice = ref(0)
  const stationFee = ref(0) // prata por 100 de nutrição

  // ── Watchers ─────────────────────────────────────────────────────────────

  watch(focusBudget, (v) => {
    if (v > 30000) focusBudget.value = 30000
    if (v < 0) focusBudget.value = 0
  })

  watch(material, (m) => {
    if (m === 'stone') enchantment.value = 0
    else stoneEnchantment.value = 0
    city.value = CITY_BONUS[m]
  })

  watch(tier, (t) => {
    if (t < 4) {
      enchantment.value = 0
      stoneEnchantment.value = 0
    }
  })

  // ── Recipe / yield computeds ──────────────────────────────────────────────

  // Non-stone subtiers only from T4 upward
  const hasSubtiers = computed(() => material.value !== 'stone' && tier.value >= 4)
  // Stone recipe variants: raw stone has enchantment .0–.3 for T4+; output block never has enchantment
  const hasStoneSubtier = computed(() => material.value === 'stone' && tier.value >= 4)
  const hasSubIngredient = computed(() => tier.value > 2)

  // Sub-ingredient quantity: 2^stoneEnchantment for stone T4+, otherwise 1 (or 0 for T2)
  const subQty = computed(() => {
    if (!hasSubIngredient.value) return 0
    if (material.value === 'stone' && tier.value >= 4) return Math.pow(2, stoneEnchantment.value)
    return 1
  })

  // Output yield per refine action: 2^stoneEnchantment for stone T4+, otherwise always 1
  const outputYield = computed(() => {
    if (material.value === 'stone' && tier.value >= 4) return Math.pow(2, stoneEnchantment.value)
    return 1
  })

  const bonusCity = computed(() => CITY_BONUS[material.value])
  const hasBonusCity = computed(() => city.value === bonusCity.value)
  const rawQty = computed(() => RAW_QTY[tier.value])
  const mat = computed(() => MATERIALS[material.value])

  // ── Display names ─────────────────────────────────────────────────────────

  const rawName = computed(() => RAW_NAMES[material.value][tier.value] ?? '')
  const refinedName = computed(() => REFINED_NAMES[material.value][tier.value] ?? '')
  const subRefinedName = computed(() => REFINED_NAMES[material.value][tier.value - 1] ?? '')

  const rawDisplayName = computed(() => {
    const enc = material.value === 'stone' ? stoneEnchantment.value : enchantment.value
    return rawName.value + (ENCHANTMENT_SUFFIX[enc] ?? '')
  })
  const refinedDisplayName = computed(
    () => refinedName.value + (ENCHANTMENT_SUFFIX[enchantment.value] ?? ''),
  )
  const subRefinedDisplayName = computed(() => {
    const enc = tier.value > 4 ? enchantment.value : 0
    return subRefinedName.value + (ENCHANTMENT_SUFFIX[enc] ?? '')
  })

  // Tier badges (label + color class)
  // Badge for the raw input (stone uses stoneEnchantment, others use enchantment)
  const rawBadge = computed(() =>
    tierBadge(tier.value, material.value === 'stone' ? stoneEnchantment.value : enchantment.value),
  )
  const subBadge = computed(() => tierBadge(tier.value - 1, tier.value > 4 ? enchantment.value : 0))
  const refinedBadge = computed(() => tierBadge(tier.value, enchantment.value))

  // ── Focus / spec computeds ────────────────────────────────────────────────

  const totalSpecSum = computed(
    () => specT4.value + specT5.value + specT6.value + specT7.value + specT8.value,
  )

  const specByTier = computed<Record<number, number>>(() => ({
    4: specT4.value,
    5: specT5.value,
    6: specT6.value,
    7: specT7.value,
    8: specT8.value,
  }))

  const focusCostBase = computed(() => {
    const enc = material.value === 'stone' ? stoneEnchantment.value : enchantment.value
    const table = material.value === 'stone' ? BASE_FOCUS_STONE : BASE_FOCUS_NORMAL
    return table[tier.value]?.[enc] ?? 0
  })

  /**
   * Focus cost per refine action after spec reduction.
   * T2/T3: fixed at baseCost (spec has no effect).
   * T4+: FocusCost = baseCost × 0.5^((totalSpec×0.3 + specTx×2.5) / 100)
   */
  const focusCostPerRefine = computed(() => {
    if (!useFocus.value || focusCostBase.value === 0) return 0
    if (tier.value <= 3) return focusCostBase.value
    const specTx = specByTier.value[tier.value] ?? 0
    const exponent = (totalSpecSum.value * 0.3 + specTx * 2.5) / 100
    return Math.round(focusCostBase.value * Math.pow(0.5, exponent))
  })

  const focusSpecReductionPct = computed(() => {
    if (tier.value <= 3) return 0
    const specTx = specByTier.value[tier.value] ?? 0
    const exponent = (totalSpecSum.value * 0.3 + specTx * 2.5) / 100
    return (1 - Math.pow(0.5, exponent)) * 100
  })

  // ── Return rates ──────────────────────────────────────────────────────────

  function rrrKey(isBonusCity: boolean, event: number, focus: boolean): string {
    return `${isBonusCity ? 'bonus' : 'other'}_${event}_${focus ? 'focus' : 'nofocus'}`
  }

  const returnRateNoFocus = computed(
    () => RRR_TABLE[rrrKey(hasBonusCity.value, eventBonus.value, false)] ?? 0.152,
  )

  const returnRate = computed(
    () => RRR_TABLE[rrrKey(hasBonusCity.value, eventBonus.value, useFocus.value)] ?? 0.152,
  )

  const returnRatePct = computed(() => (returnRate.value * 100).toFixed(1))

  // ── Cost breakdown (per refine action) ────────────────────────────────────

  const rawGross = computed(() => (rawQty.value ?? 0) * rawPrice.value)
  const subGross = computed(() => subQty.value * subPrice.value)
  const totalGross = computed(() => rawGross.value + subGross.value)
  const rawReturn = computed(() => rawGross.value * returnRate.value)
  const subReturn = computed(() => subGross.value * returnRate.value)
  const totalReturn = computed(() => totalGross.value * returnRate.value)

  // Refine actions needed (one action can yield multiple items for stone with enchantment)
  const refineActions = computed(() => Math.ceil(quantity.value / outputYield.value))

  // ── Scaled totals ─────────────────────────────────────────────────────────

  const rawQtyTotal = computed(() => (rawQty.value ?? 0) * refineActions.value)
  const subQtyTotal = computed(() => subQty.value * refineActions.value)
  const rawGrossTotal = computed(() => rawGross.value * refineActions.value)
  const subGrossTotal = computed(() => subGross.value * refineActions.value)
  const totalGrossTotal = computed(() => totalGross.value * refineActions.value)
  const rawReturnTotal = computed(() => rawReturn.value * refineActions.value)
  const subReturnTotal = computed(() => subReturn.value * refineActions.value)
  const totalReturnTotal = computed(() => totalReturn.value * refineActions.value)

  // ── Focus budget split ────────────────────────────────────────────────────

  const actionsWithFocus = computed(() => {
    if (!useFocus.value || focusCostPerRefine.value === 0) return 0
    return Math.min(refineActions.value, Math.floor(focusBudget.value / focusCostPerRefine.value))
  })
  const actionsWithoutFocus = computed(() => refineActions.value - actionsWithFocus.value)
  const focusUsed = computed(() => actionsWithFocus.value * focusCostPerRefine.value)
  const isBudgetLimited = computed(
    () => useFocus.value && focusCostPerRefine.value > 0 && actionsWithoutFocus.value > 0,
  )

  const costPerItemWithFocus = computed(
    () => (totalGross.value * (1 - returnRate.value)) / outputYield.value,
  )
  const costPerItemNoFocus = computed(
    () => (totalGross.value * (1 - returnRateNoFocus.value)) / outputYield.value,
  )

  const itemsWithFocus = computed(() => actionsWithFocus.value * outputYield.value)
  const itemsWithoutFocus = computed(() => actionsWithoutFocus.value * outputYield.value)

  const costPerItem = computed(() => {
    if (!useFocus.value) return costPerItemNoFocus.value
    if (quantity.value === 0) return 0
    return (
      (costPerItemWithFocus.value * itemsWithFocus.value +
        costPerItemNoFocus.value * itemsWithoutFocus.value) /
      quantity.value
    )
  })

  const totalCost = computed(() => costPerItem.value * quantity.value)
  const totalFocus = computed(() => focusUsed.value)

  // ── Nutrition cost ────────────────────────────────────────────────────────

  const itemValue = computed(() => {
    const enc = material.value === 'stone' ? 0 : enchantment.value
    return ITEM_VALUE_TABLE[tier.value]?.[enc] ?? 0
  })

  const nutritionPerAction = computed(() =>
    tier.value <= 2 ? 0 : itemValue.value * 0.1125 * outputYield.value,
  )
  const nutritionCostPerAction = computed(() => (nutritionPerAction.value * stationFee.value) / 100)
  const totalNutritionCost = computed(() => nutritionCostPerAction.value * refineActions.value)
  const nutritionCostPerItem = computed(() =>
    quantity.value > 0 ? totalNutritionCost.value / quantity.value : 0,
  )

  // ── Profit ────────────────────────────────────────────────────────────────

  const profitPerItem = computed(() =>
    sellPrice.value > 0 ? sellPrice.value - costPerItem.value - nutritionCostPerItem.value : null,
  )
  const totalProfit = computed(() =>
    profitPerItem.value !== null ? profitPerItem.value * quantity.value : null,
  )

  const profitMarginPct = computed(() => {
    if (profitPerItem.value === null) return null
    const netCost = costPerItem.value + nutritionCostPerItem.value
    if (netCost === 0) return null
    return (profitPerItem.value / netCost) * 100
  })

  // ─────────────────────────────────────────────────────────────────────────

  return {
    // State refs
    material,
    tier,
    enchantment,
    stoneEnchantment,
    city,
    eventBonus,
    useFocus,
    specT4,
    specT5,
    specT6,
    specT7,
    specT8,
    focusBudget,
    rawPrice,
    subPrice,
    quantity,
    sellPrice,
    stationFee,
    // Recipe
    hasSubtiers,
    hasStoneSubtier,
    hasSubIngredient,
    subQty,
    outputYield,
    rawQty,
    bonusCity,
    hasBonusCity,
    mat,
    // Display
    rawDisplayName,
    refinedDisplayName,
    subRefinedDisplayName,
    rawBadge,
    subBadge,
    refinedBadge,
    // Focus
    focusCostBase,
    focusCostPerRefine,
    focusSpecReductionPct,
    // Rates
    returnRate,
    returnRateNoFocus,
    returnRatePct,
    // Costs per action
    rawGross,
    subGross,
    totalGross,
    rawReturn,
    subReturn,
    totalReturn,
    refineActions,
    // Scaled totals
    rawQtyTotal,
    subQtyTotal,
    rawGrossTotal,
    subGrossTotal,
    totalGrossTotal,
    rawReturnTotal,
    subReturnTotal,
    totalReturnTotal,
    // Focus split
    actionsWithFocus,
    actionsWithoutFocus,
    focusUsed,
    isBudgetLimited,
    costPerItemWithFocus,
    costPerItemNoFocus,
    costPerItem,
    totalCost,
    totalFocus,
    // Nutrition
    nutritionPerAction,
    totalNutritionCost,
    nutritionCostPerItem,
    // Profit
    profitPerItem,
    totalProfit,
    profitMarginPct,
  }
}
