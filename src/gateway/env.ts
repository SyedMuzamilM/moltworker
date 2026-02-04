import type { OpenClawEnv } from '../types';

/**
 * Build environment variables to pass to the OpenClaw container process
 * 
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: OpenClawEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Pass Moonshot API key for Kimi K2.5 models
  if (env.MOONSHOT_API_KEY) {
    envVars.MOONSHOT_API_KEY = env.MOONSHOT_API_KEY;
  }

  // Pass optional Moonshot base URL override
  if (env.MOONSHOT_BASE_URL) {
    envVars.MOONSHOT_BASE_URL = env.MOONSHOT_BASE_URL;
  }

  // Pass Kimi Code API key for coding-optimized model
  if (env.KIMICODE_API_KEY) {
    envVars.KIMICODE_API_KEY = env.KIMICODE_API_KEY;
  }

  // Pass optional Kimi Code base URL override
  if (env.KIMICODE_BASE_URL) {
    envVars.KIMICODE_BASE_URL = env.KIMICODE_BASE_URL;
  }

  // Map OPENCLAW_GATEWAY_TOKEN to container
  if (env.OPENCLAW_GATEWAY_TOKEN) envVars.OPENCLAW_GATEWAY_TOKEN = env.OPENCLAW_GATEWAY_TOKEN;
  
  // Pass DEV_MODE as OPENCLAW_DEV_MODE to container
  if (env.DEV_MODE) envVars.OPENCLAW_DEV_MODE = env.DEV_MODE;
  
  if (env.OPENCLAW_BIND_MODE) envVars.OPENCLAW_BIND_MODE = env.OPENCLAW_BIND_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  // WhatsApp configuration
  if (env.WHATSAPP_ENABLED) envVars.WHATSAPP_ENABLED = env.WHATSAPP_ENABLED;
  if (env.WHATSAPP_DM_POLICY) envVars.WHATSAPP_DM_POLICY = env.WHATSAPP_DM_POLICY;
  if (env.WHATSAPP_ALLOW_FROM) envVars.WHATSAPP_ALLOW_FROM = env.WHATSAPP_ALLOW_FROM;
  if (env.WHATSAPP_SELF_CHAT_MODE) envVars.WHATSAPP_SELF_CHAT_MODE = env.WHATSAPP_SELF_CHAT_MODE;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;
  if (env.CONVEX_URL) envVars.CONVEX_URL = env.CONVEX_URL;
  if (env.CONVEX_ADMIN_KEY) envVars.CONVEX_ADMIN_KEY = env.CONVEX_ADMIN_KEY;

  return envVars;
}
