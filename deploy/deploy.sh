#!/usr/bin/env bash
#
# Publishes the marketplace SPA to market.mtabari.com.ge.
#
# Run this from the marketplace/ directory on your own machine. It builds locally and copies the
# result up, so nothing needs installing on the server beyond nginx and certbot, which are already
# there for the apex domain.
#
#   cd marketplace && ./deploy/deploy.sh
#
# Authentication is left to your ssh config on purpose — this script never takes a password. If you
# are still on password auth for root, install a key first and turn password auth off:
#
#   ssh-copy-id root@169.58.80.125
#
set -euo pipefail

HOST="${DEPLOY_HOST:-root@169.58.80.125}"
DOMAIN="market.mtabari.com.ge"
WEBROOT="/var/www/${DOMAIN}"
API_URL="${VITE_API_URL:-https://mtabari.com.ge}"

cd "$(dirname "$0")/.."

echo "==> Building against ${API_URL}"
# VITE_API_URL is compiled into the bundle, so it has to be right at build time — a build made
# without it silently falls back to http://localhost:5261 and the deployed site talks to nothing.
VITE_API_URL="${API_URL}" npm run build

if ! grep -q "${API_URL}" dist/assets/index-*.js; then
  echo "!! The built bundle does not contain ${API_URL}. Refusing to deploy." >&2
  exit 1
fi

echo "==> Creating ${WEBROOT} on ${HOST}"
ssh "${HOST}" "mkdir -p '${WEBROOT}'"

echo "==> Uploading the site"
# Into a staging directory first, then swapped in one move: copying over a live webroot serves a
# half-updated site to anyone loading it mid-copy.
ssh "${HOST}" "rm -rf '${WEBROOT}.new' && mkdir -p '${WEBROOT}.new'"
scp -r dist/. "${HOST}:${WEBROOT}.new/"
ssh "${HOST}" "rm -rf '${WEBROOT}.old' && \
               if [ -d '${WEBROOT}' ]; then mv '${WEBROOT}' '${WEBROOT}.old'; fi && \
               mv '${WEBROOT}.new' '${WEBROOT}' && \
               rm -rf '${WEBROOT}.old' && \
               chown -R www-data:www-data '${WEBROOT}'"

echo "==> Installing the nginx site"
scp "deploy/${DOMAIN}.conf" "${HOST}:/etc/nginx/sites-available/${DOMAIN}"
ssh "${HOST}" "ln -sf '/etc/nginx/sites-available/${DOMAIN}' '/etc/nginx/sites-enabled/${DOMAIN}' && \
               nginx -t && systemctl reload nginx"

echo "==> Certificate"
# Idempotent: certbot leaves an existing, still-valid certificate alone. Only run once per domain
# in practice, but safe to leave in the script.
ssh "${HOST}" "certbot --nginx -d '${DOMAIN}' --non-interactive --agree-tos --redirect -m admin@mtabari.com.ge || \
               echo '!! certbot did not complete — check it by hand'"

echo "==> Checking the site"
sleep 2
for path in "/" "/listing/1" "/checkout/success"; do
  code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "https://${DOMAIN}${path}" || echo "000")
  echo "    ${path} -> ${code}"
done
echo "    (all three should be 200 — the last two prove the SPA fallback works)"
