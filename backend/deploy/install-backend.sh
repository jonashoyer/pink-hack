#!/usr/bin/env bash
set -euo pipefail
release_dir="/opt/pink-hack/releases/release-$(date +%s)"
sudo install -d -o pink-hack -g pink-hack "$release_dir"
sudo tar -xzf /tmp/backend-source.tar.gz -C "$release_dir"
sudo chown -R pink-hack:pink-hack "$release_dir"
sudo -u pink-hack bash -c 'cd "$1"; pnpm install --frozen-lockfile; pnpm --filter server build; cp -R packages/db/src/migrations apps/server/migrations' bash "$release_dir"
sudo install -m 600 /tmp/backend.env /etc/pink-hack/backend.env
sudo rm /tmp/backend.env
sudo ln -sfn "$release_dir" /opt/pink-hack/current
sudo systemctl enable --now pink-hack
sudo systemctl restart pink-hack
sudo tee /etc/caddy/Caddyfile >/dev/null <<'CADDY'
pink-hack-demo-20261024.swedencentral.cloudapp.azure.com {
  reverse_proxy 127.0.0.1:3000
}
CADDY
sudo systemctl reload caddy
sudo systemctl is-active pink-hack
