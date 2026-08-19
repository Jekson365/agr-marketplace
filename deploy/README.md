# Deploying market.mtabari.com.ge

Every push to `main` runs `.github/workflows/deploy.yml`, which SSHes to the server and triggers a
build there. That mirrors the API repo: the build happens on the box against a freshly fetched
`main`, and the deploy key is pinned to one command so it can do nothing else.

**The one-time server setup below has to be done first.** Until it is, the workflow fails at the
SSH step — which is the right way round: a deploy that cannot run beats a deploy key that can do
anything.

---

## One-time setup, on the server

Run these as root on `169.58.80.125`.

### 1. Clone the repo and install the build script

```bash
apt-get update && apt-get install -y nodejs npm   # skip if node is already there for the API build
git clone https://github.com/Jekson365/agr-marketplace.git /srv/agr-marketplace
install -m 755 /srv/agr-marketplace/deploy/deploy-market /usr/local/bin/deploy-market
mkdir -p /var/www/market.mtabari.com.ge
```

### 2. Install the nginx site and get a certificate

```bash
cp /srv/agr-marketplace/deploy/market.mtabari.com.ge.conf \
   /etc/nginx/sites-available/market.mtabari.com.ge
ln -sf /etc/nginx/sites-available/market.mtabari.com.ge \
       /etc/nginx/sites-enabled/market.mtabari.com.ge
nginx -t && systemctl reload nginx

certbot --nginx -d market.mtabari.com.ge --agree-tos --redirect -m you@example.com
```

DNS already points `market.mtabari.com.ge` at this box, so certbot's HTTP challenge will pass.

### 3. Make a deploy key that can only deploy

Generate the key **on the server**, so the private half only ever travels once — into a GitHub
secret — rather than sitting on a laptop as well:

```bash
ssh-keygen -t ed25519 -N '' -f /root/.ssh/market_deploy -C 'agr-marketplace deploy'

# The forced command is what makes this key safe: anyone holding it can run deploy-market and
# nothing else, no shell, no port forwarding.
printf 'command="/usr/local/bin/deploy-market",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty %s\n' \
  "$(cat /root/.ssh/market_deploy.pub)" >> /root/.ssh/authorized_keys

echo '--- private key: paste into the SSH_PRIVATE_KEY secret ---'
cat /root/.ssh/market_deploy
echo '--- known hosts: paste into the SSH_KNOWN_HOSTS secret ---'
ssh-keyscan -t ed25519 169.58.80.125
```

### 4. Set the repository secrets

In **github.com/Jekson365/agr-marketplace → Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `SSH_HOST` | `169.58.80.125` |
| `SSH_USER` | `root` |
| `SSH_PRIVATE_KEY` | the private key printed above, including the BEGIN/END lines |
| `SSH_KNOWN_HOSTS` | the `ssh-keyscan` line printed above |

`SSH_KNOWN_HOSTS` is optional but worth setting: without it the workflow trusts whatever key the
host offers at the time, so a hijacked IP could collect the deploy key.

### 5. Prove it

Push to `main`, or run the workflow by hand from the Actions tab. It finishes by checking that `/`,
`/listing/1` and `/checkout/success` all return 200 — the last two prove nginx is falling back to
the app shell, without which every shared link and the address BOG returns a buyer to would 404.

---

## Deploying by hand

`deploy.sh` in this folder does the same thing from your own machine, building locally and copying
the result up. It takes authentication from your ssh config and never accepts a password.

```bash
cd marketplace && ./deploy/deploy.sh
```

## What the site talks to

`VITE_API_URL` is compiled into the bundle, and both deploy paths set it to `https://mtabari.com.ge`.
The API sends permissive CORS headers, which is what lets a different subdomain call it. Nothing is
proxied through this vhost.
