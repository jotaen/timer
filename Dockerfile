FROM node:26.7.0-trixie

# Download `run` utility.
RUN \
    wget https://raw.githubusercontent.com/jotaen/run.sh/refs/heads/main/run -O /usr/bin/run \
    && chmod +x /usr/bin/run

# Swap npm for pnpm.
RUN \
    npm install -g pnpm@latest-10 \
    && npm uninstall -g npm

# Create the working dir and hand it to the node user.
RUN \
    mkdir /app \
    && chown node:node /app

# Switch to the built-in non-root `node` user.
ENV HOME=/home/node
USER node
WORKDIR /app

# Install Claude CLI.
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/home/node/.local/bin:$PATH"
RUN cat <<EOF > /home/node/.claude.json
{
  "hasCompletedOnboarding": true,
  "theme": "dark"
}
EOF

ENTRYPOINT ["/bin/bash"]
