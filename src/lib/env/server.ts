import { z } from "zod";

const serverEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  PIPEDREAM_CLIENT_ID: z.string().min(1).optional(),
  PIPEDREAM_CLIENT_SECRET: z.string().min(1).optional(),
  PIPEDREAM_PROJECT_ID: z.string().min(1).optional(),
  PIPEDREAM_ENVIRONMENT: z.enum(["development", "production"]).optional(),
  PIPEDREAM_APP_SLUG: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.string().min(1).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

export const getServerEnv = () =>
  serverEnvSchema.parse({
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    PIPEDREAM_CLIENT_ID: process.env.PIPEDREAM_CLIENT_ID,
    PIPEDREAM_CLIENT_SECRET: process.env.PIPEDREAM_CLIENT_SECRET,
    PIPEDREAM_PROJECT_ID: process.env.PIPEDREAM_PROJECT_ID,
    PIPEDREAM_ENVIRONMENT: process.env.PIPEDREAM_ENVIRONMENT,
    PIPEDREAM_APP_SLUG: process.env.PIPEDREAM_APP_SLUG,
  });

