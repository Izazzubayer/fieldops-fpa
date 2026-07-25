# FieldOps FP&A

**Open-source finance command center** for a fictional multi-entity geotechnical / field-services company. Built to demonstrate Junior FP&A + Data Analyst skills: variance analysis, ops-to-finance KPIs, automated management packs, and practical AI in Finance.

> Synthetic demo data only. Not affiliated with ConeTec or any employer.

## Links

- **Live demo:** https://fieldops-fpa.vercel.app
- **GitHub:** https://github.com/Izazzubayer/fieldops-fpa

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Why this exists (interview framing)

ConeTec’s Junior FP&A & Data Analyst role sits at the intersection of **financial planning**, **Power BI / BI**, and **AI-enabled finance**. This app is a transparent TypeScript implementation of that workflow:

| JD expectation | What FieldOps shows |
| --- | --- |
| Variance analysis (actual vs budget / forecast / PY) | **Variance Lab** with volume · rate · mix · cost drivers |
| Multi-entity / BU performance | Pacific · Prairies · Ontario · Atlantic × service lines |
| Dashboards & automated reporting | Executive Overview + one-click **Monthly Pack** |
| Ops metrics as business drivers | Utilization, idle hours, backlog → margin & cash tells |
| AI in Finance | Deterministic analyst + narrative generation (Copilot-ready pattern) |

### Interview walkthrough (3 minutes)

1. **Variance Lab** — Set scope to YTD 2026-06, compare to Budget. Open **Prairies · Drilling** (adverse weather / mobilization story) vs **Pacific · CPT** (corridor upside). Speak to volume first, then cost.
2. **Ops Drivers** — Show utilization heatmap and idle hours as leading indicators you’d wire from ERP / field systems into Power BI.
3. **AI Analyst → Monthly Pack** — Generate the brief, copy to clipboard. Position AI as *draft narrative over trusted metrics*, not a black box — same idea as Microsoft Copilot + a governed semantic model.

### How you’d rebuild this at ConeTec

- **Power BI / Fabric**: star schema (Date, Entity, ServiceLine, Project), DAX time intelligence for MTD/QTD/YTD, variance measures, field utilization from ops facts.
- **Excel / Power Query**: land ERP extracts, same variance waterfall for ad-hoc.
- **Power Automate**: schedule the monthly pack to Teams/Email.
- **Copilot**: ground prompts on the certified dataset — never free-form over raw GL dumps.

## AI (Hugging Face)

The **AI Analyst** page calls Hugging Face Inference Providers (`router.huggingface.co`) with **Qwen2.5-7B-Instruct**.

Architecture (interview talking point):

1. TypeScript metrics engine builds a **fact pack** (P&L, variances, ops KPIs, drivers).
2. The model is instructed to **only narrate those facts** — no invented numbers.
3. If `HF_TOKEN` is missing or the provider errors, the app falls back to a deterministic analyst.

Set secrets (never commit):

```bash
# .env.local
HF_TOKEN=hf_***
HF_MODEL=Qwen/Qwen2.5-7B-Instruct:fastest
```

On Vercel: Project → Settings → Environment Variables → `HF_TOKEN`, `HF_MODEL`.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Recharts
- Hugging Face Inference (chat completions)
- Seeded multi-entity P&L + ops metrics (`src/data/seed.ts`)
- Pure TypeScript metrics engine (`src/lib/metrics.ts`) — easy to unit test and explain

## Project structure

```
src/
  app/           # Overview, Variance, Drivers, AI, Monthly Pack
  components/    # Shell, filters, charts, variance table
  data/          # Types + synthetic seed
  lib/           # format, metrics, AI narrative
```

## Deploy on Vercel

1. Push this repo to GitHub (public).
2. Import in [Vercel](https://vercel.com) → Framework Preset: Next.js → Deploy.
3. Add the live URL to your application / LinkedIn.

## License

MIT — use it, fork it, show it in interviews.
