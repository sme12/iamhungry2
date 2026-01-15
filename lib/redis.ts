import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const KV_PREFIX = "meal-planner";
export const PLAN_INDEX_KEY = `${KV_PREFIX}:plan-index`;
