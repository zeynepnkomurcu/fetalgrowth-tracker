# Deployment

De app draait op **Vercel**. Elke push naar `main` triggert automatisch een nieuwe deploy (~30-60 sec).

---

## Eenmalige Vercel setup (eerste keer)

1. Login op https://vercel.com (gebruik GitHub account `zeynepnkomurcu` — eigenaar van de repo).
2. **Add New → Project** → kies repo `fetalgrowth-tracker2`.
3. Framework wordt automatisch herkend als **Vite**.
4. Build settings (laat default — Vercel detecteert dit zelf):
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. **Deploy** → wacht ~1 minuut → URL verschijnt.
6. (Optioneel) Custom domain in **Settings → Domains**.

---

## Daarna deployen

```bash
git add .
git commit -m "feat: nieuwe feature"
git push origin main
```

Klaar. Vercel pakt het automatisch op. Status zie je op https://vercel.com/dashboard.

---

## Live URL bijhouden

Live URL staat in:
- `README.md` (sectie "🔗 Live")
- Vercel dashboard → project → Domains tab

---

## Troubleshooting

### Build faalt op Vercel maar werkt lokaal

- Check **Vite base path** in `vite.config.js` — die moet **leeg** zijn (geen `base: "/iets/"`). Anders breken asset-paths op Vercel.
- Check Vercel build log voor missende dependencies in `package.json` (alles wat lokaal in `devDependencies` staat moet ook in package-lock.json zitten).

### Site laadt maar routing geeft 404 bij refresh op `/patient/123`

Vercel heeft een SPA-rewrite nodig. Maak `vercel.json` aan in repo-root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Dit stuurt elke onbekende URL naar `index.html` zodat react-router de routing kan afhandelen.

### Dependencies updaten

```bash
npm outdated      # zie wat ouder is
npm update        # minor + patch updates (binnen ~~ranges van package.json)
```

Voor major-versie bumps (bv. React 19 → 20): manueel in `package.json` aanpassen, dan `npm install`. **Test altijd lokaal** voor pushen.

### Cache issue — oude versie blijft in browser

- Hard reload: `Ctrl+Shift+R` (Windows) of `Cmd+Shift+R` (Mac)
- Vercel → project → Settings → Data Cache → Purge
- iOS Add-to-Home-Screen icon: bekend probleem dat oude versie blijft hangen — workaround: privé Safari → opnieuw Add to Home Screen.

---

## Niet doen

- ❌ **Geen `base` path in `vite.config.js`** — alleen voor GitHub Pages relevant, breekt Vercel.
- ❌ **Geen GitHub Actions workflow toevoegen** — Vercel doet de deploy, een Actions workflow daarbovenop conflicteert.
- ❌ **Geen secrets in code** — Vercel env vars gebruiken voor API keys (Settings → Environment Variables).
