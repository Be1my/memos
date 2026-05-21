import { z } from "zod";

export const localeSchema = z.enum(["en", "zh-Hans"]).catch("en");

export type Locale = z.infer<typeof localeSchema>;
