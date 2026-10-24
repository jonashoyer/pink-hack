#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl xz-utils caddy build-essential python3
task_node_dir=$(mktemp -d)
cd "$task_node_dir"
curl -fsS https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt -o SHASUMS256.txt
task_node_archive=$(awk '/node-v[0-9.]+-linux-x64.tar.xz$/ {print $2;exit}' SHASUMS256.txt)
test -n "$task_node_archive"
curl -fsS "https://nodejs.org/dist/latest-v24.x/$task_node_archive" -o "$task_node_archive"
awk -v archive="$task_node_archive" '$2==archive' SHASUMS256.txt | sha256sum -c -
tar -xJf "$task_node_archive" --strip-components=1 -C /usr/local
npm install -g pnpm@10.28.1
id pink-hack >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/pink-hack --shell /usr/sbin/nologin pink-hack
install -d -o pink-hack -g pink-hack /opt/pink-hack/releases /var/lib/pink-hack
install -d -m 700 /etc/pink-hack
cat > /etc/systemd/system/pink-hack.service <<'UNIT'
[Unit]
Description=Pink Hack demo backend
After=network-online.target
Wants=network-online.target
[Service]
User=pink-hack
WorkingDirectory=/opt/pink-hack/current/apps/server
EnvironmentFile=/etc/pink-hack/backend.env
ExecStartPre=/usr/local/bin/node dist/migrate.mjs
ExecStart=/usr/local/bin/node dist/index.mjs
Restart=on-failure
RestartSec=3
TimeoutStopSec=15
NoNewPrivileges=true
PrivateTmp=true
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
echo 'VM bootstrap complete'
