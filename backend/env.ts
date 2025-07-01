import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default("2003"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "[!] Found invalid environment variables:",
    parsedEnv.error.format()
  );
  process.exit(1);
}

console.log(parsedEnv.data);

export const env = parsedEnv.data;
