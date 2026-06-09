import * as Joi from 'joi';

export default () => ({
  port: parseInt(process.env.API_PORT ?? '3600', 10),
  corsOrigins: process.env.CORS_ORIGINS ?? 'http://localhost:4600',
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY,
  },
});

export const validationSchema = Joi.object({
  API_PORT: Joi.number().default(3600),
  CORS_ORIGINS: Joi.string().required(),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  SUPABASE_JWT_SECRET: Joi.string().required(),
  ADMIN_API_KEY: Joi.string().optional(),
});
