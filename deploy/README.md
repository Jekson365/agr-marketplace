# Deploying market.mtabari.com.ge

**The site is live.** https://market.mtabari.com.ge serves the marketplace over TLS, HTTP redirects
to HTTPS, and the certificate renews on certbot's existing timer.

Every push to `main` runs `.github/workflows/deploy.yml`, which SSHes to the server and triggers a
rebuild there — the same shape as the API repo: the build happens on the box against a freshly
fetched `main`, and the deploy key is pinned to one command so it can do nothing else.

**Only one thing is outstanding: the four repository secrets in step 4.** Until they are set the
workflow fails at the SSH step. Everything on the server itself is done.

---

## How the server is set up

Files, all already in place:

| Path | What it is |
|---|---|
| `/srv/agr-marketplace` | the clone the server builds from |
| `/var/www/market.mtabari.com.ge` | the published `dist/` |
| `/usr/local/bin/deploy-market` | the forced command; a copy of `deploy/deploy-market` |
| `/etc/nginx/sites-available/market` | the vhost — a copy is kept here as `nginx-site-market` |
| `/etc/nginx/snippets/market-app.conf` | shared root/gzip/caching/SPA-fallback |
| `/etc/nginx/snippets/market-sec-headers.conf` | HSTS, nosniff, frame options, referrer, CSP |
| `/etc/letsencrypt/live/market.mtabari.com.ge/` | the certificate |

The copies under `deploy/` are for reference and review. The server's copies are what actually
serve; if you change one here, copy it up and `nginx -t && systemctl reload nginx`.

### Why the config is hand-written, not certbot-managed

`sites-available/farm` is hand-maintained, with deliberate SSL settings and comments recording
nginx-1.24-specific choices (`http2` is a `listen` option there, and repeating it for an
`address:port` already configured elsewhere is a duplicate-options error). **`certbot --nginx`
rewrites config files**, so it was not used. The certificate was issued with:

```bash
certbot certonly --webroot -w /var/www/certbot -d market.mtabari.com.ge \
  --non-interactive --agree-tos --email admin@mtabari.com.ge --keep-until-expiring
```

`certonly` issues and renews without touching a single nginx file. The `market` vhost mirrors the
`farm` one: same cipher suite, same session and stapling settings, ACME challenges answered over
plain HTTP from `/var/www/certbot` so renewals work regardless of the HTTPS state.

### The SPA fallback

`market-app.conf` ends with `try_files $uri $uri/ /index.html`, and it has to stay last so it does
not shadow the `/assets/` and `/index.html` locations above it. `/listing/47` and
`/checkout/success` are client-side routes with no file behind them — without the fallback they
404 on reload and on every shared link, including the address BOG returns a buyer to after paying.

### Security headers

`market-sec-headers.conf` is re-included inside every `location` that declares its own
`add_header`, because nginx *drops* inherited `add_header` directives in that case rather than
merging them. Without the repetition, assets and `index.html` would go out with no headers at all.

HSTS is `max-age=31536000`, no `includeSubDomains`, no `preload` — matching the farm snippet's
reasoning, since neighbouring subdomains are not ours to speak for. **It is a commitment for its
lifetime**: a browser that has seen it refuses plain HTTP for this host, so a certificate that
stops renewing takes the site down rather than merely making it insecure.

The Content-Security-Policy is deliberately **`Content-Security-Policy-Report-Only`**. It has not
been exercised against the live page, and an enforcing policy one directive short white-screens the
site. Click through a listing and a checkout, watch the browser console, and when it is quiet drop
the `-Report-Only` suffix to enforce it.

The policy allows the inline theme script by SHA-256 hash — that script must run before first paint,
so it cannot move into a file. **Editing it invalidates the hash**; recompute from the exact bytes
between `<script>` and `</script>` in `index.html`:

```bash
openssl dgst -sha256 -binary script.js | openssl base64 -A
```

---

## Finishing the automated deploy

A deploy key already exists on the server at `/root/.ssh/market_deploy`, pinned in
`authorized_keys` to `command="/usr/local/bin/deploy-market"` with no port/agent/X11 forwarding and
no pty — anyone holding it can run that one script and nothing else.

### 4. Set the repository secrets

Read the values (they are printed to *your* terminal, not into a chat log):

```bash
ssh root@169.58.80.125 'cat /root/.ssh/market_deploy'      # SSH_PRIVATE_KEY
ssh-keyscan -t ed25519 169.58.80.125                       # SSH_KNOWN_HOSTS
```

Then in **github.com/Jekson365/agr-marketplace → Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `SSH_HOST` | `169.58.80.125` |
| `SSH_USER` | `root` |
| `SSH_PRIVATE_KEY` | the whole key, including the BEGIN/END lines |
| `SSH_KNOWN_HOSTS` | the `ssh-keyscan` line |

`SSH_KNOWN_HOSTS` is optional but worth setting: without it the workflow trusts whatever key the
host offers at the time, so a hijacked IP could collect the deploy key.

### 5. Prove it

Push to `main`, or run the workflow by hand from the Actions tab. It finishes by checking that `/`,
`/listing/1` and `/checkout/success` all return 200.

---

## Deploying by hand

From the server, the same script the workflow triggers:

```bash
ssh root@169.58.80.125 /usr/local/bin/deploy-market
```

Or `deploy/deploy.sh` from your own machine, which builds locally and copies the result up. It
takes authentication from your ssh config and never accepts a password.

## Checks

```bash
curl -sSI https://market.mtabari.com.ge | head -1                        # 200
curl -sS -o /dev/null -w '%{http_code}\n' http://market.mtabari.com.ge   # 301
certbot certificates                                                     # three domains
systemctl list-timers | grep certbot                                     # renewal armed
```

## What the site talks to

`VITE_API_URL` is compiled into the bundle and both deploy paths set it to `https://mtabari.com.ge`;
both refuse to publish a bundle that does not contain it, because a build made without it falls back
to `http://localhost:5261` and the published site talks to nothing. The API sends permissive CORS
headers, which is what lets a different subdomain call it. Nothing is proxied through this vhost.
