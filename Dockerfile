FROM node:22.11.0-bookworm

# Download `run` utility.
RUN \
    wget https://raw.githubusercontent.com/jotaen/run.sh/refs/heads/main/run -O /usr/bin/run \
    && chmod +x /usr/bin/run

ENTRYPOINT ["/bin/bash"]
