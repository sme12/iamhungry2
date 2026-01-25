import type { AppState, Day, Meal, MealSlotStatus } from "@/schemas/appState";
import type { DayPlan, MealSlot } from "@/schemas/mealPlanResponse";
import {
  BANNED_INGREDIENTS,
  COOKING_TIME,
  DAYS_ORDER,
  EXCLUDED_CUISINES,
  MEAT_RULES,
  PEOPLE,
} from "@/config/defaults";

// Day names in Russian
const DAY_NAMES: Record<Day, string> = {
  mon: "Понедельник",
  tue: "Вторник",
  wed: "Среда",
  thu: "Четверг",
  fri: "Пятница",
  sat: "Суббота",
  sun: "Воскресенье",
};

// Meal names in Russian
const MEAL_NAMES: Record<Meal, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
};

// Slot status descriptions
const STATUS_DESCRIPTIONS: Record<MealSlotStatus, string> = {
  full: "готовим",
  soup: "суп",
  coffee: "легкий",
  skip: "пропуск",
};

// Person names in Russian
const PERSON_NAMES: Record<string, string> = {
  vitalik: "Виталик",
  lena: "Лена",
};

interface MealSlotInfo {
  day: Day;
  meal: Meal;
  portions: number;
  description: string;
}

/**
 * Calculate portions and description for a meal slot based on both schedules.
 */
function getMealSlotInfo(state: AppState, day: Day, meal: Meal): MealSlotInfo {
  const vitalikStatus = state.schedules.vitalik[day][meal];
  const lenaStatus = state.schedules.lena[day][meal];

  // Count people who are eating (full or coffee)
  let portions = 0;
  const eatingPeople: string[] = [];

  for (const person of PEOPLE) {
    const status = state.schedules[person][day][meal];
    if (status === "full" || status === "soup" || status === "coffee") {
      portions++;
      eatingPeople.push(PERSON_NAMES[person]);
    }
  }

  // Build description
  let description: string;
  if (portions === 0) {
    description = "пропуск (никто не ест)";
  } else if (vitalikStatus === lenaStatus) {
    description = STATUS_DESCRIPTIONS[vitalikStatus];
    if (vitalikStatus === "coffee") {
      description = "легкий (оба)";
    } else if (vitalikStatus === "soup") {
      description = "суп (оба)";
    }
  } else {
    const parts: string[] = [];
    for (const person of PEOPLE) {
      const status = state.schedules[person][day][meal];
      parts.push(`${PERSON_NAMES[person]}: ${STATUS_DESCRIPTIONS[status]}`);
    }
    description = parts.join(", ");
  }

  return { day, meal, portions, description };
}

function buildCuisinesSection(
  state: AppState,
  cuisineNames: Record<string, string>
): string {
  const selectedCuisineNames = state.selectedCuisines.map(
    (id) => cuisineNames[id] || id
  );
  return `КУХНИ
Выбранные: ${selectedCuisineNames.join(", ")}
Исключённые: ${EXCLUDED_CUISINES.join(", ")}`;
}

function buildRestrictionsSection(): string {
  return `ОГРАНИЧЕНИЯ ПО ПРОДУКТАМ
- Свинина: ${MEAT_RULES.pork}
- Говядина: ${MEAT_RULES.beef}
- Рыба: ${MEAT_RULES.fish}
- Запрещённые: ${BANNED_INGREDIENTS.join(", ")}`;
}

function buildCookingTimeSection(): string {
  return `ВРЕМЯ ПРИГОТОВЛЕНИЯ
- Оптимально: ${COOKING_TIME.optimal} мин
- Максимум: ${COOKING_TIME.max} мин`;
}

function buildSpecialConditionsSection(state: AppState): string | null {
  if (state.specialConditions.trim()) {
    return `ОСОБЫЕ УСЛОВИЯ ЭТОЙ НЕДЕЛИ
${state.specialConditions.trim()}`;
  }
  return null;
}

function buildPreviousMealsSection(previousMeals?: string[]): string | null {
  if (previousMeals && previousMeals.length > 0) {
    return `БЛЮДА ПРОШЛОЙ НЕДЕЛИ (не повторять)
${previousMeals.map((m) => `- ${m}`).join("\n")}`;
  }
  return null;
}

function buildMealRulesSection(): string {
  return `ПРАВИЛА СЛОТОВ
- Если указано "null" — блюдо не нужно, поставь null в ответе
- Если "легкий" — простое быстрое блюдо (бутерброд, круассан), макс ${COOKING_TIME.lightMax} мин
- Количество порций указано для каждого приёма`;
}

/**
 * Build the meal plan generation prompt in Russian.
 */
export function buildMealPlanPrompt(
  state: AppState,
  cuisineNames: Record<string, string>,
  previousMeals?: string[]
): string {
  const sections: string[] = [];

  // ROLE
  sections.push(`РОЛЬ
Ты — планировщик питания для семьи из ${PEOPLE.length} человек в Финляндии.`);

  // MEAL STRUCTURE
  const scheduleLines: string[] = [];
  for (const day of DAYS_ORDER) {
    const dayName = DAY_NAMES[day];
    const meals: string[] = [];

    for (const meal of ["breakfast", "lunch", "dinner"] as Meal[]) {
      const info = getMealSlotInfo(state, day, meal);
      if (info.portions > 0) {
        meals.push(`${MEAL_NAMES[meal]}: ${info.portions} порц. (${info.description})`);
      } else {
        meals.push(`${MEAL_NAMES[meal]}: null`);
      }
    }

    scheduleLines.push(`${dayName}: ${meals.join(", ")}`);
  }

  sections.push(`СТРУКТУРА ПИТАНИЯ
Расписание на неделю:
${scheduleLines.join("\n")}`);

  sections.push(buildMealRulesSection());
  sections.push(buildCuisinesSection(state, cuisineNames));
  sections.push(buildRestrictionsSection());
  sections.push(buildCookingTimeSection());

  const specialConditions = buildSpecialConditionsSection(state);
  if (specialConditions) sections.push(specialConditions);

  const previousMealsSection = buildPreviousMealsSection(previousMeals);
  if (previousMealsSection) sections.push(previousMealsSection);

  // OUTPUT FORMAT
  sections.push(`ФОРМАТ ВЫВОДА
JSON-объект:
{
  "weekPlan": [
    {
      "day": "mon",
      "breakfast": { "name": "Название блюда", "time": 15, "portions": 2 } | null,
      "lunch": { "name": "...", "time": 30, "portions": 2 } | null,
      "dinner": { "name": "...", "time": 45, "portions": 2 } | null
    },
    ...для всех 7 дней
  ]
}

ВАЖНО:
- Все названия блюд — на русском языке
- Дни в порядке: mon, tue, wed, thu, fri, sat, sun
- time — время приготовления в минутах
- Не повторяй блюда в течение недели
- Разнообразие: чередуй кухни и типы блюд`);

  return sections.join("\n\n");
}

/**
 * Build the shopping list generation prompt in Russian.
 */
export function buildShoppingListPrompt(
  weekPlan: DayPlan[],
  _state: AppState
): string {
  const sections: string[] = [];

  // TASK
  sections.push(`ЗАДАЧА
Составь список покупок для следующего плана питания на неделю.`);

  // MEAL PLAN
  const planLines: string[] = [];
  for (const dayPlan of weekPlan) {
    const dayName = DAY_NAMES[dayPlan.day];
    const meals: string[] = [];

    if (dayPlan.breakfast) {
      meals.push(`Завтрак — ${dayPlan.breakfast.name} (${dayPlan.breakfast.time} мин, ${dayPlan.breakfast.portions} порц.)`);
    }
    if (dayPlan.lunch) {
      meals.push(`Обед — ${dayPlan.lunch.name} (${dayPlan.lunch.time} мин, ${dayPlan.lunch.portions} порц.)`);
    }
    if (dayPlan.dinner) {
      meals.push(`Ужин — ${dayPlan.dinner.name} (${dayPlan.dinner.time} мин, ${dayPlan.dinner.portions} порц.)`);
    }

    if (meals.length > 0) {
      planLines.push(`${dayName}: ${meals.join("; ")}`);
    }
  }

  sections.push(`ПЛАН ПИТАНИЯ
${planLines.join("\n")}`);

  // OUTPUT FORMAT
  sections.push(`ФОРМАТ ВЫВОДА
JSON-объект:
{
  "shoppingTrips": [
    {
      "label": "Закупка 1 (Пн-Чт)",
      "items": [
        { "name": "Яйца", "amount": "10 шт", "category": "dairy" },
        { "name": "Куриное филе", "amount": "600 г", "category": "meat" },
        ...
      ]
    },
    {
      "label": "Закупка 2 (Пт-Вс)",
      "items": [...]
    }
  ]
}

КАТЕГОРИИ (обязательно использовать эти ID):
- dairy — молочные продукты (яйца, молоко, сыр, йогурт, сметана, творог)
- meat — мясо и рыба
- produce — овощи и фрукты
- pantry — бакалея (крупы, макароны, консервы, соусы в банках)
- frozen — заморозка
- bakery — хлеб и выпечка
- condiments — соусы и приправы

ПРАВИЛА:
- Объединяй одинаковые ингредиенты (суммируй количество)
- НЕ включай базовые продукты: соль, перец, растительное масло, сахар
- Раздели на 2 закупки: начало недели (Пн-Чт) и конец недели (Пт-Вс)
- Все названия — на русском языке`);

  return sections.join("\n\n");
}

/**
 * Build prompt for partial meal plan regeneration (only specific slots).
 */
export function buildPartialRegenerationPrompt(
  state: AppState,
  currentPlan: DayPlan[],
  slotsToRegenerate: MealSlot[],
  cuisineNames: Record<string, string>,
  previousMeals?: string[]
): string {
  const sections: string[] = [];

  // ROLE
  sections.push(`РОЛЬ
Ты — планировщик питания для семьи из ${PEOPLE.length} человек в Финляндии.
Тебе нужно ЗАМЕНИТЬ только указанные блюда, сохранив остальные.`);

  // CURRENT PLAN
  const currentPlanLines: string[] = [];
  for (const dayPlan of currentPlan) {
    const dayName = DAY_NAMES[dayPlan.day];
    const meals: string[] = [];

    for (const meal of ["breakfast", "lunch", "dinner"] as Meal[]) {
      const mealItem = dayPlan[meal];
      const isToRegenerate = slotsToRegenerate.some(
        (s) => s.day === dayPlan.day && s.meal === meal
      );

      if (mealItem) {
        const marker = isToRegenerate ? " ⟵ ЗАМЕНИТЬ" : "";
        meals.push(`${MEAL_NAMES[meal]}: ${mealItem.name}${marker}`);
      } else {
        meals.push(`${MEAL_NAMES[meal]}: null`);
      }
    }

    currentPlanLines.push(`${dayName}: ${meals.join(", ")}`);
  }

  sections.push(`ТЕКУЩИЙ ПЛАН (блюда помеченные "ЗАМЕНИТЬ" нужно заменить на новые)
${currentPlanLines.join("\n")}`);

  // SLOTS TO REGENERATE
  const slotsDescription = slotsToRegenerate
    .map((s) => {
      const info = getMealSlotInfo(state, s.day, s.meal);
      return `${DAY_NAMES[s.day]} — ${MEAL_NAMES[s.meal]}: ${info.portions} порц. (${info.description})`;
    })
    .join("\n");
  sections.push(`СЛОТЫ ДЛЯ ЗАМЕНЫ
${slotsDescription}`);

  sections.push(buildMealRulesSection());
  sections.push(buildCuisinesSection(state, cuisineNames));
  sections.push(buildRestrictionsSection());
  sections.push(buildCookingTimeSection());

  const specialConditions = buildSpecialConditionsSection(state);
  if (specialConditions) sections.push(specialConditions);

  const previousMealsSection = buildPreviousMealsSection(previousMeals);
  if (previousMealsSection) sections.push(previousMealsSection);

  // OUTPUT FORMAT
  sections.push(`ФОРМАТ ВЫВОДА
JSON-объект с ПОЛНЫМ планом на неделю (все 7 дней):
{
  "weekPlan": [
    {
      "day": "mon",
      "breakfast": { "name": "Название блюда", "time": 15, "portions": 2 } | null,
      "lunch": { "name": "...", "time": 30, "portions": 2 } | null,
      "dinner": { "name": "...", "time": 45, "portions": 2 } | null
    },
    ...для всех 7 дней
  ]
}

ВАЖНО:
- Верни ПОЛНЫЙ план на неделю (все 7 дней)
- Для слотов НЕ помеченных "ЗАМЕНИТЬ" — верни ТОЧНО ТЕ ЖЕ блюда что сейчас
- Для слотов помеченных "ЗАМЕНИТЬ" — придумай НОВЫЕ блюда
- Новые блюда должны отличаться от текущих в плане
- Все названия блюд — на русском языке
- Дни в порядке: mon, tue, wed, thu, fri, sat, sun`);

  return sections.join("\n\n");
}
