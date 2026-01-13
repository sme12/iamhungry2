import type { CuisineId, Day, DaySchedule, MealSlotStatus } from "@/schemas/appState";

// Participants (hardcoded)
export const PEOPLE = ["vitalik", "lena"] as const;
export type PersonId = (typeof PEOPLE)[number];

// All available cuisines for UI selection
export const AVAILABLE_CUISINES: CuisineId[] = [
  "eastern-european",
  "asian",
  "mexican",
  "american",
  "italian",
  "mediterranean",
  "japanese",
  "thai",
  "georgian",
  "scandinavian",
];

// Default selection (pre-selected on first visit)
export const DEFAULT_SELECTED_CUISINES: CuisineId[] = [
  "eastern-european",
  "asian",
  "mexican",
  "american",
];

// Explicitly excluded — hardcoded, not shown in UI
export const EXCLUDED_CUISINES = ["Индийская", "Непальская"];

// Cooking time
export const COOKING_TIME = {
  optimal: 30, // minutes
  max: 60,
};

// Banned ingredients/dishes
export const BANNED_INGREDIENTS = [
  "Морковный крем-суп",
  "минестроне",
  "Гречка",
  "овсянка",
  "Чернослив",
  "курага",
  "сухофрукты",
  "Овощные запеканки",
  "Батат",
  "Чечевичные и фасолевые супы",
  "Каперсы",
];

// Meat rules
export const MEAT_RULES = {
  pork: "bacon only",
  beef: "maximum once per week",
  fish: "salmon/trout/tuna only, maximum once per week",
};

// Days of the week in order
export const DAYS_ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// Default daily schedule
export const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  breakfast: "full",
  lunch: "skip",
  dinner: "full",
};

// Default weekday schedule (lunch — skip)
export const DEFAULT_WEEKDAY_SCHEDULE: DaySchedule = {
  breakfast: "full",
  lunch: "skip",
  dinner: "full",
};

// Default weekend schedule (all meals — full)
export const DEFAULT_WEEKEND_SCHEDULE: DaySchedule = {
  breakfast: "full",
  lunch: "full",
  dinner: "full",
};

// Function to create default weekly schedule
export function createDefaultWeekSchedule(): Record<Day, DaySchedule> {
  return {
    mon: { ...DEFAULT_WEEKDAY_SCHEDULE },
    tue: { ...DEFAULT_WEEKDAY_SCHEDULE },
    wed: { ...DEFAULT_WEEKDAY_SCHEDULE },
    thu: { ...DEFAULT_WEEKDAY_SCHEDULE },
    fri: { ...DEFAULT_WEEKDAY_SCHEDULE },
    sat: { ...DEFAULT_WEEKEND_SCHEDULE },
    sun: { ...DEFAULT_WEEKEND_SCHEDULE },
  };
}

// Status cycle on click
export const STATUS_CYCLE: MealSlotStatus[] = ["full", "coffee", "skip"];

// Status emojis
export const STATUS_EMOJI: Record<MealSlotStatus, string> = {
  full: "🍽️",
  coffee: "☕",
  skip: "❌",
};

// Product category emojis
export const CATEGORY_EMOJI = {
  dairy: "🥛",
  meat: "🥩",
  produce: "🥬",
  pantry: "🍝",
  frozen: "❄️",
  bakery: "🥖",
  condiments: "🧂",
} as const;
