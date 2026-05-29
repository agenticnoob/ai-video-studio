FROM docker.m.daocloud.io/library/node:22-bookworm

WORKDIR /workspace

ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_CACHE=/npm-cache

CMD ["bash"]
