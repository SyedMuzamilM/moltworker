import { describe, it, expect } from 'vitest';
import { buildEnvVars } from './env';
import { createMockEnv } from '../test-utils';

describe('buildEnvVars', () => {
  it('returns empty object when no env vars set', () => {
    const env = createMockEnv();
    const result = buildEnvVars(env);
    expect(result).toEqual({});
  });

  it('includes MOONSHOT_API_KEY when set', () => {
    const env = createMockEnv({ MOONSHOT_API_KEY: 'sk-test-key' });
    const result = buildEnvVars(env);
    expect(result.MOONSHOT_API_KEY).toBe('sk-test-key');
  });

  it('includes MOONSHOT_BASE_URL when set', () => {
    const env = createMockEnv({ 
      MOONSHOT_API_KEY: 'sk-test-key',
      MOONSHOT_BASE_URL: 'https://api.moonshot.cn/v1' 
    });
    const result = buildEnvVars(env);
    expect(result.MOONSHOT_BASE_URL).toBe('https://api.moonshot.cn/v1');
  });

  it('maps OPENCLAW_GATEWAY_TOKEN for container', () => {
    const env = createMockEnv({ OPENCLAW_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_GATEWAY_TOKEN).toBe('my-token');
  });

  it('maps DEV_MODE to OPENCLAW_DEV_MODE for container', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
    });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_DEV_MODE).toBe('true');
  });

  it('includes OPENCLAW_BIND_MODE when set', () => {
    const env = createMockEnv({
      OPENCLAW_BIND_MODE: 'lan',
    });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_BIND_MODE).toBe('lan');
  });

  it('includes all channel tokens when set', () => {
    const env = createMockEnv({
      TELEGRAM_BOT_TOKEN: 'tg-token',
      TELEGRAM_DM_POLICY: 'pairing',
      DISCORD_BOT_TOKEN: 'discord-token',
      DISCORD_DM_POLICY: 'open',
      SLACK_BOT_TOKEN: 'slack-bot',
      SLACK_APP_TOKEN: 'slack-app',
    });
    const result = buildEnvVars(env);
    
    expect(result.TELEGRAM_BOT_TOKEN).toBe('tg-token');
    expect(result.TELEGRAM_DM_POLICY).toBe('pairing');
    expect(result.DISCORD_BOT_TOKEN).toBe('discord-token');
    expect(result.DISCORD_DM_POLICY).toBe('open');
    expect(result.SLACK_BOT_TOKEN).toBe('slack-bot');
    expect(result.SLACK_APP_TOKEN).toBe('slack-app');
  });

  it('combines all env vars correctly', () => {
    const env = createMockEnv({
      MOONSHOT_API_KEY: 'sk-key',
      OPENCLAW_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
    const result = buildEnvVars(env);
    
    expect(result).toEqual({
      MOONSHOT_API_KEY: 'sk-key',
      OPENCLAW_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
  });
});
