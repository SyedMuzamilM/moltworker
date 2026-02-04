#!/usr/bin/env node
const fs = require('fs');

const rawArgs = process.argv.slice(2);
const formatIndex = rawArgs.indexOf('--format');
let format = 'json';
let args = rawArgs;

if (formatIndex !== -1) {
  const formatValue = rawArgs[formatIndex + 1];
  if (formatValue && !formatValue.startsWith('--')) {
    format = formatValue;
  }
  args = rawArgs.filter((_, index) => index !== formatIndex && index !== formatIndex + 1);
}

function printUsage() {
  console.log(`
Mission Control CLI

Usage:
  mission-control.js query <path> [argsJson] [--format json]
  mission-control.js mutation <path> [argsJson] [--format json]
  mission-control.js monitor [--limit N] [--format json]

Examples:
  mission-control.js query tasks:list '{}'
  mission-control.js mutation tasks:updateStatus '{"id":"TASK_ID","status":"completed"}' --format json
  mission-control.js mutation documents:create '{"title":"Spec","type":"markdown"}'
  mission-control.js monitor --limit 50

Environment:
  CONVEX_URL (required)
  CONVEX_ADMIN_KEY (optional)
`);
}

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const command = args[0];
const convexUrl = process.env.CONVEX_URL;
const convexAdminKey = process.env.CONVEX_ADMIN_KEY;

if (!convexUrl) {
  console.error('Error: CONVEX_URL is not set');
  process.exit(1);
}

function parseArgs(input) {
  if (!input) return {};
  if (input.startsWith('@')) {
    const filePath = input.slice(1);
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }
  return JSON.parse(input);
}

async function callConvex(kind, path, callArgs) {
  const url = new URL(`/api/${kind}`, convexUrl);
  const headers = { 'Content-Type': 'application/json' };
  if (convexAdminKey) {
    const normalized = convexAdminKey.includes(' ')
      ? convexAdminKey
      : `Convex ${convexAdminKey}`;
    headers.Authorization = normalized;
  }

  url.searchParams.set('format', format);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ path, args: callArgs || {}, format }),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return text;
  }

  if (!response.ok) {
    const message = json.errorMessage || json.error || json.message || text;
    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  if (json?.status === 'error') {
    const message = json.errorMessage || json.error || json.message || 'Convex error';
    throw new Error(message);
  }

  if (Object.prototype.hasOwnProperty.call(json, 'value')) {
    return json.value;
  }

  return json;
}

async function run() {
  if (command === 'query' || command === 'mutation') {
    const path = args[1];
    if (!path) {
      printUsage();
      process.exit(1);
    }

    const callArgs = parseArgs(args[2]);
    const result = await callConvex(command, path, callArgs);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'monitor') {
    const limitIndex = args.indexOf('--limit');
    const limitValue = limitIndex !== -1 ? Number(args[limitIndex + 1]) : 50;
    const limit = Number.isFinite(limitValue) ? limitValue : 50;

    const [tasks, agents, messages, documents, activities, notifications] =
      await Promise.all([
        callConvex('query', 'tasks:list', {}),
        callConvex('query', 'agents:list', {}),
        callConvex('query', 'messages:list', {}),
        callConvex('query', 'documents:list', {}),
        callConvex('query', 'activities:list', {}),
        callConvex('query', 'notifications:list', {}),
      ]);

    const payload = {
      tasks: tasks.slice(0, limit),
      agents: agents.slice(0, limit),
      messages: messages.slice(0, limit),
      documents: documents.slice(0, limit),
      activities: activities.slice(0, limit),
      notifications: notifications.slice(0, limit),
    };

    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printUsage();
  process.exit(1);
}

run().catch((err) => {
  console.error('Error:', err.message || String(err));
  process.exit(1);
});
