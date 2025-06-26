import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default("2003"),
  //DATABASE_URL: z.string().url(),
  SECRET_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "[!] Found invalid environment variables:",
    parsedEnv.error.format()
  );
  process.exit(1);
}

export const env = parsedEnv.data;
