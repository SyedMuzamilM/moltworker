#!/bin/bash
# Startup script for OpenClaw in Cloudflare Sandbox
# This script:
# 1. Restores config from R2 backup if available
# 2. Configures OpenClaw with Moonshot AI (Kimi K2.5) from environment variables
# 3. Starts the gateway
#
# OpenClaw uses the native Moonshot provider (not OpenAI-compatible wrapper)
# Kimi K2.5 models available:
#   - moonshot/kimi-k2.5 (default, recommended)
#   - moonshot/kimi-k2-0905-preview
#   - moonshot/kimi-k2-turbo-preview
#   - moonshot/kimi-k2-thinking
#   - moonshot/kimi-k2-thinking-turbo

set -e

# Check if openclaw gateway is already running - bail early if so
if pgrep -f "openclaw gateway" > /dev/null 2>&1; then
    echo "OpenClaw gateway is already running, exiting."
    exit 0
fi

# Paths (OpenClaw paths)
CONFIG_DIR="/root/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"
TEMPLATE_DIR="/root/.openclaw-templates"
TEMPLATE_FILE="$TEMPLATE_DIR/openclaw.json.template"
BACKUP_DIR="/data/openclaw"

echo "Config directory: $CONFIG_DIR"
echo "Backup directory: $BACKUP_DIR"

# Create config directory
mkdir -p "$CONFIG_DIR"

# ============================================================
# RESTORE FROM R2 BACKUP
# ============================================================
# Check if R2 backup exists by looking for openclaw.json
# The BACKUP_DIR may exist but be empty if R2 was just mounted
# Note: backup structure is $BACKUP_DIR/openclaw/ and $BACKUP_DIR/skills/

# Helper function to check if R2 backup is newer than local
should_restore_from_r2() {
    local R2_SYNC_FILE="$BACKUP_DIR/.last-sync"
    local LOCAL_SYNC_FILE="$CONFIG_DIR/.last-sync"
    
    # If no R2 sync timestamp, don't restore
    if [ ! -f "$R2_SYNC_FILE" ]; then
        echo "No R2 sync timestamp found, skipping restore"
        return 1
    fi
    
    # If no local sync timestamp, restore from R2
    if [ ! -f "$LOCAL_SYNC_FILE" ]; then
        echo "No local sync timestamp, will restore from R2"
        return 0
    fi
    
    # Compare timestamps
    R2_TIME=$(cat "$R2_SYNC_FILE" 2>/dev/null)
    LOCAL_TIME=$(cat "$LOCAL_SYNC_FILE" 2>/dev/null)
    
    echo "R2 last sync: $R2_TIME"
    echo "Local last sync: $LOCAL_TIME"
    
    # Convert to epoch seconds for comparison
    R2_EPOCH=$(date -d "$R2_TIME" +%s 2>/dev/null || echo "0")
    LOCAL_EPOCH=$(date -d "$LOCAL_TIME" +%s 2>/dev/null || echo "0")
    
    if [ "$R2_EPOCH" -gt "$LOCAL_EPOCH" ]; then
        echo "R2 backup is newer, will restore"
        return 0
    else
        echo "Local data is newer or same, skipping restore"
        return 1
    fi
}

if [ -f "$BACKUP_DIR/openclaw/openclaw.json" ]; then
    if should_restore_from_r2; then
        echo "Restoring from R2 backup at $BACKUP_DIR/openclaw..."
        cp -a "$BACKUP_DIR/openclaw/." "$CONFIG_DIR/"
        # Copy the sync timestamp to local so we know what version we have
        cp -f "$BACKUP_DIR/.last-sync" "$CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored config from R2 backup"
    fi
elif [ -f "$BACKUP_DIR/openclaw.json" ]; then
    # Legacy backup format (flat structure) - check for old moltbot/clawdbot backups
    if should_restore_from_r2; then
        echo "Restoring from legacy R2 backup at $BACKUP_DIR..."
        cp -a "$BACKUP_DIR/." "$CONFIG_DIR/"
        cp -f "$BACKUP_DIR/.last-sync" "$CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored config from legacy R2 backup"
    fi
elif [ -d "$BACKUP_DIR" ]; then
    echo "R2 mounted at $BACKUP_DIR but no backup data found yet"
else
    echo "R2 not mounted, starting fresh"
fi

# Restore skills from R2 backup if available (only if R2 is newer)
SKILLS_DIR="/root/openclaw/skills"
if [ -d "$BACKUP_DIR/skills" ] && [ "$(ls -A $BACKUP_DIR/skills 2>/dev/null)" ]; then
    if should_restore_from_r2; then
        echo "Restoring skills from $BACKUP_DIR/skills..."
        mkdir -p "$SKILLS_DIR"
        cp -a "$BACKUP_DIR/skills/." "$SKILLS_DIR/"
        echo "Restored skills from R2 backup"
    fi
fi

# If config file still doesn't exist, create from template
if [ ! -f "$CONFIG_FILE" ]; then
    echo "No existing config found, initializing from template..."
    if [ -f "$TEMPLATE_FILE" ]; then
        cp "$TEMPLATE_FILE" "$CONFIG_FILE"
    else
        # Create minimal config if template doesn't exist
        cat > "$CONFIG_FILE" << 'EOFCONFIG'
{
  "agents": {
    "defaults": {
      "workspace": "/root/openclaw"
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local"
  }
}
EOFCONFIG
    fi
else
    echo "Using existing config"
fi

# ============================================================
# UPDATE CONFIG FROM ENVIRONMENT VARIABLES
# ============================================================
node << 'EOFNODE'
const fs = require('fs');

const configPath = '/root/.openclaw/openclaw.json';
console.log('Updating config at:', configPath);
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
    console.log('Starting with empty config');
}

// Ensure nested objects exist
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.model = config.agents.defaults.model || {};
config.gateway = config.gateway || {};
config.channels = config.channels || {};
config.models = config.models || {};
config.models.mode = 'merge';

// Gateway configuration
config.gateway.port = 18789;
config.gateway.mode = 'local';
config.gateway.trustedProxies = ['10.1.0.0'];

// Set gateway token if provided
if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.token = process.env.OPENCLAW_GATEWAY_TOKEN;
}

// Allow insecure auth for dev mode
if (process.env.OPENCLAW_DEV_MODE === 'true') {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
}

// Telegram configuration
if (process.env.TELEGRAM_BOT_TOKEN) {
    config.channels.telegram = config.channels.telegram || {};
    config.channels.telegram.botToken = process.env.TELEGRAM_BOT_TOKEN;
    config.channels.telegram.enabled = true;
    config.channels.telegram.dm = config.channels.telegram.dm || {};
    config.channels.telegram.dmPolicy = process.env.TELEGRAM_DM_POLICY || 'pairing';
}

// Discord configuration
if (process.env.DISCORD_BOT_TOKEN) {
    config.channels.discord = config.channels.discord || {};
    config.channels.discord.token = process.env.DISCORD_BOT_TOKEN;
    config.channels.discord.enabled = true;
    config.channels.discord.dm = config.channels.discord.dm || {};
    config.channels.discord.dm.policy = process.env.DISCORD_DM_POLICY || 'pairing';
}

// Slack configuration
if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    config.channels.slack = config.channels.slack || {};
    config.channels.slack.botToken = process.env.SLACK_BOT_TOKEN;
    config.channels.slack.appToken = process.env.SLACK_APP_TOKEN;
    config.channels.slack.enabled = true;
}

// ============================================================
// KIMI CODE CONFIGURATION (DEFAULT AI PROVIDER)
// ============================================================
// Kimi Code is the default AI provider - optimized for coding tasks
// Uses dedicated endpoint: https://api.kimi.com/coding/v1
// Model: kimi-for-coding (with reasoning capabilities)

if (process.env.KIMICODE_API_KEY) {
    console.log('Configuring Kimi Code provider as DEFAULT AI...');
    
    const kimiCodeBaseUrl = process.env.KIMICODE_BASE_URL || 'https://api.kimi.com/coding/v1';
    console.log('Kimi Code base URL:', kimiCodeBaseUrl);
    
    // Configure the Kimi Code provider
    config.models.providers = config.models.providers || {};
    config.models.providers['kimi-code'] = {
        baseUrl: kimiCodeBaseUrl,
        apiKey: process.env.KIMICODE_API_KEY,
        api: 'openai-completions',
        models: [
            {
                id: 'kimi-for-coding',
                name: 'Kimi For Coding',
                reasoning: true,
                input: ['text'],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 262144,
                maxTokens: 32768,
                headers: { 'User-Agent': 'KimiCLI/0.77' },
                compat: { supportsDeveloperRole: false }
            }
        ]
    };
    
    // Set Kimi Code as the DEFAULT model
    config.agents.defaults.model.primary = 'kimi-code/kimi-for-coding';
    
    // Add Kimi Code to model allowlist with alias
    config.agents.defaults.models = config.agents.defaults.models || {};
    config.agents.defaults.models['kimi-code/kimi-for-coding'] = { alias: 'Kimi Code' };
    
    console.log('Kimi Code configured as DEFAULT AI model');
} else {
    console.log('Warning: KIMICODE_API_KEY not set - Kimi Code (default AI) will not work');
}

// ============================================================
// MOONSHOT AI (KIMI K2.5) CONFIGURATION (OPTIONAL FALLBACK)
// ============================================================
// Moonshot/Kimi K2.5 is available as an optional fallback provider
// All Kimi K2.5 variants are configured here with proper metadata

if (process.env.MOONSHOT_API_KEY) {
    console.log('Configuring Moonshot AI provider as fallback option...');
    
    const moonshotBaseUrl = process.env.MOONSHOT_BASE_URL || 'https://api.moonshot.ai/v1';
    console.log('Moonshot base URL:', moonshotBaseUrl);
    
    // Configure the Moonshot provider with all Kimi K2.5 variants
    config.models.providers = config.models.providers || {};
    config.models.providers.moonshot = {
        baseUrl: moonshotBaseUrl,
        apiKey: process.env.MOONSHOT_API_KEY,
        api: 'openai-completions',
        models: [
            {
                id: 'kimi-k2.5',
                name: 'Kimi K2.5',
                reasoning: false,
                input: ['text'],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 256000,
                maxTokens: 8192
            },
            {
                id: 'kimi-k2-0905-preview',
                name: 'Kimi K2 0905 Preview',
                reasoning: false,
                input: ['text'],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 256000,
                maxTokens: 8192
            },
            {
                id: 'kimi-k2-turbo-preview',
                name: 'Kimi K2 Turbo',
                reasoning: false,
                input: ['text'],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 256000,
                maxTokens: 8192
            },
            {
                id: 'kimi-k2-thinking',
                name: 'Kimi K2 Thinking',
                reasoning: true,
                input: ['text'],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 256000,
                maxTokens: 8192
            },
            {
                id: 'kimi-k2-thinking-turbo',
                name: 'Kimi K2 Thinking Turbo',
                reasoning: true,
                input: ['text'],
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: 256000,
                maxTokens: 8192
            }
        ]
    };
    
    // Only set Moonshot as default if Kimi Code is NOT configured
    if (!process.env.KIMICODE_API_KEY) {
        config.agents.defaults.model.primary = 'moonshot/kimi-k2.5';
        console.log('Moonshot AI configured as default model (Kimi Code not configured)');
    } else {
        console.log('Moonshot AI configured as fallback option (Kimi Code is default)');
    }
    
    // Configure model allowlist with aliases for all variants
    config.agents.defaults.models = config.agents.defaults.models || {};
    config.agents.defaults.models['moonshot/kimi-k2.5'] = { alias: 'Kimi K2.5' };
    config.agents.defaults.models['moonshot/kimi-k2-0905-preview'] = { alias: 'Kimi K2' };
    config.agents.defaults.models['moonshot/kimi-k2-turbo-preview'] = { alias: 'Kimi K2 Turbo' };
    config.agents.defaults.models['moonshot/kimi-k2-thinking'] = { alias: 'Kimi K2 Thinking' };
    config.agents.defaults.models['moonshot/kimi-k2-thinking-turbo'] = { alias: 'Kimi K2 Thinking Turbo' };
    
    console.log('Moonshot AI provider configured successfully');
} else {
    console.log('Note: MOONSHOT_API_KEY not set - Moonshot AI features will not be available');
}

// Write updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration updated successfully');
console.log('Active model:', config.agents.defaults.model.primary);
EOFNODE

# ============================================================
# START GATEWAY
# ============================================================
# Note: R2 backup sync is handled by the Worker's cron trigger
echo "Starting OpenClaw Gateway..."
echo "Gateway will be available on port 18789"

# Clean up stale lock files
rm -f /tmp/openclaw-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

BIND_MODE="lan"
echo "Dev mode: ${OPENCLAW_DEV_MODE:-false}, Bind mode: $BIND_MODE"

if [ -n "$OPENCLAW_GATEWAY_TOKEN" ]; then
    echo "Starting gateway with token auth..."
    exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE" --token "$OPENCLAW_GATEWAY_TOKEN"
else
    echo "Starting gateway with device pairing (no token)..."
    exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE"
fi
