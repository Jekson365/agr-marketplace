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

**This is the step that fixes the two things wrong with the subdomain today.** Until it is done,
nginx has no server block matching `market.mtabari.com.ge`, so it falls through to the default
vhost: the subdomain serves the *main site's* content, and presents the *apex* certificate — which
is why HTTPS fails with a name mismatch (`SEC_E_WRONG_PRINCIPAL`) rather than a connection error.
TLS is answering on 443; it is answering for the wrong host.

```bash
cp /srv/agr-marketplace/deploy/market.mtabari.com.ge.conf /etc/nginx/sites-available/market.mtabari.com.ge
ln -sf /etc/nginx/sites-available/market.mtabari.com.ge /etc/nginx/sites-enabled/market.mtabari.com.ge
nginx -t && systemctl reload nginx
```

At this point `http://market.mtabari.com.ge` serves the marketplace instead of the main site.
Then issue the certificate:

```bash
certbot --nginx -d market.mtabari.com.ge --agree-tos --redirect -m you@example.com
```

DNS already points `market.mtabari.com.ge` at this box, and certbot is already working here (the
apex holds a valid Let's Encrypt certificate), so the HTTP-01 challenge will pass. `--redirect`
makes certbot turn the `:80` block into a permanent redirect to HTTPS.

Check it:

```bash
curl -sSI https://market.mtabari.com.ge | head -1                        # expect 200
curl -sS -o /dev/null -w '%{http_code}\n' http://market.mtabari.com.ge   # expect 301
certbot certificates                                                     # both domains, with expiry
systemctl list-timers | grep -i certbot                                  # renewal timer armed
```

Renewal is automatic through certbot's systemd timer — the same one already renewing the apex.

#### About the security headers

The site config sets HSTS (`max-age=31536000`, no `includeSubDomains`, no `preload`), plus
`nosniff`, `X-Frame-Options` and a referrer policy.

**HSTS is a one-way door for its lifetime.** A browser that has seen it refuses plain HTTP for this
host until the max-age lapses, so if the certificate ever stops renewing the site becomes
unreachable rather than merely insecure. That is the intended trade, but it is worth knowing before
the first visitor loads the page. Lower the max-age if you would rather ease into it.

There is also a Content-Security-Policy, deliberately set as **`Content-Security-Policy-Report-Only`**.
It has never been exercised against the real page, and an enforcing policy one directive short
white-screens the site. Load the site, click through a listing and a checkout, and watch the browser
console; when it is quiet, rename the header to `Content-Security-Policy` to switch it on.

The policy allows the inline theme script by SHA-256 hash — that script has to run before first
paint, so it cannot move into a file. **Editing it, even by one character, invalidates the hash**,
and the script will be blocked once the policy is enforcing. Recompute it from the exact bytes
between `<script>` and `</script>` in `index.html`:

```bash
openssl dgst -sha256 -binary script.js | openssl base64 -A
```

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
