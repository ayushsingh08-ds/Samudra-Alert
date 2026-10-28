import 'dotenv/config';
import { z } from 'zod';

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .default(isTestEnv ? 'mongodb://localhost:27017/samudra-alert-test' : undefined as unknown as string),
  JWT_ACCESS_SECRET: z
    .string()
    .min(10, 'JWT_ACCESS_SECRET must be set (min 10 chars)')
    .default(isTestEnv ? 'test-access-secret-fallback' : undefined as unknown as string),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10, 'JWT_REFRESH_SECRET must be set (min 10 chars)')
    .default(isTestEnv ? 'test-refresh-secret-fallback' : undefined as unknown as string),
  CLIENT_URL: z.string().default('http://localhost:5174'),

  // Cloudflare R2 (S3-compatible) — required for image uploads
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_BUCKET: z.string().default('samudra-alert-uploads'),
  R2_PUBLIC_URL: z.string().default(''), // e.g. https://pub-xxx.r2.dev or custom domain

  // Firebase Cloud Messaging — base64 of the service-account JSON
  FIREBASE_SERVICE_ACCOUNT_B64: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    // eslint-disable-next-line no-console
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

/** Extra CORS origins required by the Capacitor native WebView. */
export const NATIVE_ORIGINS = ['capacitor://localhost', 'http://localhost', 'https://localhost'];

export const allowedOrigins = [env.CLIENT_URL, ...NATIVE_ORIGINS].filter(Boolean);

export const r2Configured = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY,
);

export const firebaseConfigured = Boolean(env.FIREBASE_SERVICE_ACCOUNT_B64);
