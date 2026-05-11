# Driftsättning: Netlify + Loopia

## Netlify

1. Skapa en ny site från detta Git-repo (eller drag-and-drop av mappen).
2. **Build settings:** command `npm run build`, publish directory `.` (punkt).
3. Under **Environment variables** lägg in:
   - `MAPBOX_API_TOKEN` — hemlig Mapbox-token (inte public token i frontend).
   - `ADMIN_PASSWORD` — starkt lösenord (minst 8 tecken).
4. Deploy. Netlify aktiverar **HTTPS** automatiskt (Let’s Encrypt).

## Mapbox-token

- Använd en **secret** token med åtkomst endast till *Geocoding API*.
- Under Mapbox → token restrictions: begränsa **URL** till din Netlify-domän (`https://*.netlify.app` under test, sedan din Loopia-domän).

## Loopia-domän

1. I Loopia: peka domänens **A-post** eller **CNAME** enligt Netlify under *Domain settings → Custom domains* (Netlify visar exakt värde, ofta `apex` → A-poster eller `www` → CNAME till `xxx.netlify.app`).
2. I Netlify: lägg till custom domain och vänta på DNS/SSL (kan ta några minuter till timmar).

## Lokal utveckling

```bash
npm install -g netlify-cli
netlify link
netlify dev
```

Öppna den URL som `netlify dev` visar så att `/api/address-suggest` och `/api/admin-auth` proxas till functions.

## Känslig kunddata

Personnummer och bokningsuppgifter lagras idag i **webbläsarens localStorage** på kundens enhet (ingen serverdatabas i detta repo). Det är lämpligt för prototyp/demo; för produktion med riktiga personuppgifter bör data lagras enligt GDPR på en säker backend.

## Prestanda (valfritt nästa steg)

`boka-tid.html` använder React + Babel via CDN och transpilerar JSX i webbläsaren — enkelt underhåll men tyngre första laddning. För bättre Lighthouse: bygg JSX till en minifierad bundle (t.ex. Vite) och serva en enda `booking-calendar.js` utan Babel i klienten.

