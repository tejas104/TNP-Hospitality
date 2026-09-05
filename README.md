# TNP Hospitality Demo

Responsive TNP Hospitality experience for event clients, planners, freelancers, and operations teams.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3001`.

## Production build

```bash
npm run build:vercel
```

The Vercel build uses Vinext with Nitro's Vercel preset and generates `.vercel/output`.

## Vercel deployment

Import the GitHub repository into Vercel. The checked-in `vercel.json` supplies the build command, so no extra framework configuration is required. The app exposes these demo routes:

- `/` homepage
- `/client` client portal
- `/planner` planner portal
- `/freelancer` freelancer portal
- `/admin` operations demo
