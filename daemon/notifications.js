#!/usr/bin/env node
/**
 * Mission Control Notification Daemon for OpenClaw Sandbox
 * 
 * Polls Convex for undelivered notifications and sends them to agents
 * via OpenClaw sessions. Runs inside the Cloudflare Sandbox container.
 * 
 * This daemon starts alongside the OpenClaw gateway and:
 * 1. Polls Convex every 2 seconds for undelivered notifications
 * 2. Sends notifications to agents via openclaw sessions send
 * 3. Marks notifications as delivered in Convex
 * 
 * Environment variables:
 *   CONVEX_URL - Your Convex deployment URL
 *   CONVEX_ADMIN_KEY - Convex admin key (optional)
 * 
 * To start: node /root/openclaw/daemon/notifications.js
 */

const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const POLL_INTERVAL_MS = 2000;
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
const OPENCLAW_GATEWAY_PORT = process.env.OPENCLAW_GATEWAY_PORT || 18789;
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

// Agent session key mapping (from agent ID to OpenClaw session key)
const AGENT_SESSION_MAP = {
  // These map Convex agent IDs to OpenClaw session keys
  // Will be populated from the agents table
};

// Simple Convex HTTP client
function convexQuery(functionName, args = {}) {
  return new Promise((resolve, reject) => {
    if (!CONVEX_URL) {
      reject(new Error('CONVEX_URL not set'));
      return;
    }

    const url = new URL(CONVEX_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    // Convex function path
    const path = `/api/query/${functionName}`;
    
    const postData = JSON.stringify({ args });
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.value);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function convexMutation(functionName, args = {}) {
  return new Promise((resolve, reject) => {
    if (!CONVEX_URL) {
      reject(new Error('CONVEX_URL not set'));
      return;
    }

    const url = new URL(CONVEX_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const path = `/api/mutation/${functionName}`;
    const postData = JSON.stringify({ args });
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.value);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Send notification to agent via OpenClaw
async function sendNotificationToAgent(agentId, content, notificationId) {
  try {
    // First, get agent details from Convex to get session key
    const agents = await convexQuery('agents:list', {});
    const agent = agents.find(a => a._id === agentId);
    
    if (!agent) {
      console.warn(`Agent ${agentId} not found in Convex`);
      return false;
    }
    
    const sessionKey = agent.sessionKey;
    if (!sessionKey) {
      console.warn(`No session key for agent ${agent.name}`);
      return false;
    }
    
    // Escape content for shell
    const escapedContent = content.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    // Build command
    let command = `openclaw sessions send --session "${sessionKey}" --message "${escapedContent}"`;
    
    if (OPENCLAW_GATEWAY_TOKEN) {
      command += ` --token "${OPENCLAW_GATEWAY_TOKEN}"`;
    }
    
    console.log(`📤 Sending to ${agent.name} (${sessionKey})...`);
    
    try {
      await execAsync(command);
      console.log(`✅ Delivered to ${agent.name}`);
      return true;
    } catch (execError) {
      // Agent might be offline - notification stays queued
      console.log(`⏳ Agent ${agent.name} is offline or session not active, notification queued`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to send to ${agentId}:`, error.message);
    return false;
  }
}

// Mark notification as delivered
async function markDelivered(notificationId) {
  try {
    await convexMutation('notifications:markDelivered', { id: notificationId });
  } catch (error) {
    console.error(`Failed to mark ${notificationId} delivered:`, error.message);
  }
}

// Process undelivered notifications
async function processNotifications() {
  try {
    // Fetch undelivered notifications from Convex
    const undelivered = await convexQuery('notifications:getUndelivered', {});
    
    if (!Array.isArray(undelivered)) {
      console.warn('Invalid response from Convex:', undelivered);
      return;
    }
    
    if (undelivered.length > 0) {
      console.log(`📬 Processing ${undelivered.length} notifications...`);
    }
    
    for (const notification of undelivered) {
      const delivered = await sendNotificationToAgent(
        notification.agentId,
        notification.content,
        notification._id
      );
      
      if (delivered) {
        await markDelivered(notification._id);
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error.message);
  }
}

// Main loop
async function main() {
  console.log('🚀 Mission Control Notification Daemon');
  console.log('========================================');
  console.log(`📡 Convex URL: ${CONVEX_URL || 'NOT SET'}`);
  console.log(`🎯 OpenClaw Gateway: http://localhost:${OPENCLAW_GATEWAY_PORT}`);
  console.log(`⏱️  Polling every ${POLL_INTERVAL_MS}ms`);
  console.log('');
  
  if (!CONVEX_URL) {
    console.error('❌ CONVEX_URL not set! Set it in environment variables.');
    console.log('   Example: CONVEX_URL=https://your-deployment.convex.cloud');
    process.exit(1);
  }
  
  // Initial check
  await processNotifications();
  
  // Start polling loop
  console.log('👀 Watching for notifications...\n');
  setInterval(processNotifications, POLL_INTERVAL_MS);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Notification daemon shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Notification daemon shutting down...');
  process.exit(0);
});

// Start the daemon
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
