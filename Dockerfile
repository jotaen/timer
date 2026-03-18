FROM node:22.11.0-bookworm

# Download `run` utility.
RUN \
    wget https://raw.githubusercontent.com/jotaen/run.sh/refs/heads/main/run -O /usr/bin/run \
    && chmod +x /usr/bin/run

# Install Claude. Populate API-key at runtime via `$ANTHROPIC_API_KEY`.
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/root/.local/bin:$PATH"
RUN cat <<EOF > /root/.claude.json
{
  "hasCompletedOnboarding": true,
  "theme": "dark"
}
EOF

# Swap npm for pnpm.
RUN npm install -g pnpm@latest-10
RUN npm uninstall -g npm

ENTRYPOINT ["/bin/bash"]
