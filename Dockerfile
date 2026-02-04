FROM docker.io/cloudflare/sandbox:0.7.0

# Install Node.js 22 (required by OpenClaw) and rsync (for R2 backup sync)
# The base image has Node 20, we need to replace it with Node 22
# Using direct binary download for reliability
ENV NODE_VERSION=22.13.1
RUN apt-get update && apt-get install -y xz-utils ca-certificates rsync \
    && curl -fsSLk https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz -o /tmp/node.tar.xz \
    && tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
    && rm /tmp/node.tar.xz \
    && node --version \
    && npm --version

# Install pnpm globally
RUN npm install -g pnpm

# Install OpenClaw (previously clawdbot/moltbot)
# Pin to specific version for reproducible builds
RUN npm install -g openclaw@2026.1.29 \
    && openclaw --version

# Create OpenClaw directories
# Templates are stored in /root/.openclaw-templates for initialization
RUN mkdir -p /root/.openclaw \
    && mkdir -p /root/.openclaw-templates \
    && mkdir -p /root/openclaw \
    && mkdir -p /root/openclaw/skills

# Copy startup script
# Build cache bust: 2026-02-04-openclaw-v3
COPY start-openclaw.sh /usr/local/bin/start-openclaw.sh
RUN chmod +x /usr/local/bin/start-openclaw.sh

# Copy default configuration template
COPY openclaw.json.template /root/.openclaw-templates/openclaw.json.template

# Copy agent persona templates
COPY docs/agents/ /root/.openclaw-templates/agents/

# Copy custom skills
COPY skills/ /root/openclaw/skills/

# Copy Mission Control notification daemon
COPY daemon/ /root/openclaw/daemon/
RUN chmod +x /root/openclaw/daemon/notifications.js

# Set working directory
WORKDIR /root/openclaw

# Expose the gateway port
EXPOSE 18789
