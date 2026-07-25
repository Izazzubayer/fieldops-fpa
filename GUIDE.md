# FieldOps Financial Planning & Analysis — Simple Guide

This document explains what the project is, what you can do in it, what you should see, and why it matches the ConeTec Junior FP&A & Data Analyst role.

**Live app:** https://fieldops-fpa.vercel.app  
**Code:** https://github.com/Izazzubayer/fieldops-fpa

---

## What this project does (in plain English)

FieldOps is a **finance dashboard for a field-services / geotechnical-style company**.

It helps you:

1. See how the business is performing (revenue, margin, EBITDA).
2. Compare **actual results** to **budget**, **forecast**, and **prior year**.
3. Dig into *why* numbers moved (volume, pricing, mix, cost).
4. Connect **field operations** (crew utilization, idle equipment, backlog) to finance results.
5. Use **AI** to draft a management brief or answer questions about the numbers.
6. Export a **monthly reporting pack** you could send to leadership.

The data is sample company data (FieldOps Geotechnics) so you can demo safely. The workflow is the same kind of work FP&A teams do with Excel, Power BI, and AI tools.

---

## Pages and what you can do

### 1. Executive Overview (`/`)

**What it is:** The home screen for leadership-style KPIs.

**What you can do:**

- Change **As of** (month), **Scope** (MTD / QTD / YTD), **Compare to** (Budget / Forecast / Prior year).
- Filter by **Region** and **Service line**.
- Read the four KPI cards.
- Look at the revenue trend chart (12 months).
- Look at the EBITDA bridge (how you got from plan to actual).
- Scan the top variance list and the watchlist.

**What to expect:**

- Revenue, gross margin, EBITDA, and field utilization update when filters change.
- Green/red deltas show favorable vs unfavorable vs the compare basis.
- Charts refresh for the selected filters.
- “Where variance lives” lists the biggest segment gaps.

---

### 2. Variance Lab (`/variance`)

**What it is:** The deep-dive tool for “why are we off plan?”

**What you can do:**

- Same filters as Overview (period, scope, compare basis, region, service).
- View bar charts of variance **by region** and **by service line**.
- Click any row in the detailed table (Region × Service).
- Read the **driver breakdown** on the right (volume/utilization, rate/pricing, mix/timing, cost).

**What to expect:**

- Table shows Actual, Compare, Variance ($), and Variance (%).
- Clicking a row opens drivers with dollar impact and a short note.
- Useful story beats in the data:
  - **Prairies · Drilling** often looks soft (weather / mobilization).
  - **Pacific · CPT** often looks strong (large corridor work).

---

### 3. Ops Drivers (`/drivers`)

**What it is:** The ops-to-finance link.

**What you can do:**

- Filter period, scope, region, service line.
- Read utilization, billable days, idle hours, and backlog.
- View the utilization trend chart.
- Scan the utilization heatmap (low → high).

**What to expect:**

- Lower utilization / higher idle hours usually signal risk to margin and cash timing.
- Heatmap shows which region × service combinations are underused.
- This is how FP&A partners with operations, not just the P&L.

---

### 4. AI Analyst (`/ai`)

**What it is:** An AI helper grounded in the same numbers as the dashboards.

**What you can do:**

- Set the same filters.
- Click **Generate** to draft a full monthly brief.
- Type a question (or click a suggestion) and click **Ask**.
- Examples:
  - “Why is revenue off budget?”
  - “What’s going on with Prairies Drilling?”
  - “How is field utilization?”
  - “What should I put on the leadership agenda?”

**What to expect:**

- **Generate** returns a structured brief: headline, what moved, ops → finance, risks, actions.
- **Ask** returns a short answer with bullets, using numbers from the fact pack.
- Badge shows the AI is connected (or falls back to the rules engine if the model fails).
- Markdown formats cleanly (bold, headings, lists).
- The AI is instructed **not to invent numbers** — it should only use the metrics fact pack.

---

### 5. Monthly Pack (`/pack`)

**What it is:** One-click management reporting package.

**What you can do:**

- Set filters.
- Click **Copy brief** to copy Markdown to clipboard.
- Click **Download .md** to save a file.
- Read the on-screen snapshot, key points, risks, actions, and top variances.

**What to expect:**

- A leadership-ready text brief for the selected period/scope.
- Top variance appendix for the pack.
- Something you could paste into email, Slack, or slides.

---

## Filters (used almost everywhere)

| Control | Meaning |
| --- | --- |
| **As of** | The month you are analyzing |
| **Scope** | MTD = that month only; QTD = quarter to date; YTD = year to date |
| **Compare to** | Budget, Forecast, or Prior year |
| **Region** | Pacific, Prairies, Ontario, Atlantic, or All |
| **Service line** | CPT, Drilling, Lab Testing, Instrumentation, Consulting, or All |

Changing filters recalculates KPIs, charts, tables, AI context, and the pack.

---

## Suggested 3-minute walkthrough

1. **Overview** — Show YTD vs Budget. Point to revenue/EBITDA and the bridge.
2. **Variance Lab** — Open Prairies Drilling (soft) vs Pacific CPT (strong). Explain volume vs cost.
3. **Ops Drivers** — Show utilization/idle hours as leading indicators.
4. **AI Analyst** — Click Generate, then ask one question.
5. **Monthly Pack** — Copy or download the brief.

---

## How this is relevant to the ConeTec JD

ConeTec’s Junior FP&A & Data Analyst role asks for finance planning, analytics, Power BI-style reporting, automation, and AI in Finance. This project maps to that as follows:

### Financial Planning & Business Performance

| JD expectation | What this project shows |
| --- | --- |
| Support budget, forecast, planning | Actual vs Budget / Forecast / Prior year across entities |
| Analyze results across business units | Regions × service lines |
| Prepare variance analysis | Variance Lab with $ and % gaps |
| Monitor drivers and KPIs | Revenue, margin, EBITDA, utilization, backlog |
| Cash / profitability / working capital thinking | Idle hours + backlog as leading indicators |

### Data Analytics & Business Intelligence

| JD expectation | What this project shows |
| --- | --- |
| Build / maintain dashboards | Executive Overview, charts, heatmap |
| Turn large data into insights | Seeded multi-entity monthly dataset → clear KPIs |
| Find trends, risks, opportunities | Trend charts, watchlist, AI risks/actions |
| Automate reporting | Monthly Pack copy/download |
| Improve data usability | Shared filters + one metrics engine behind every page |

### AI & Finance Transformation

| JD expectation | What this project shows |
| --- | --- |
| Practical AI in Finance / FP&A | AI Analyst briefs and Q&A |
| Use modern AI tools | Hugging Face open model over a trusted fact pack |
| Automate analysis and insight generation | Generate + Ask flows |
| Finance transformation mindset | “Metrics first, AI second” — same idea as Copilot over governed data |

### Reporting, Insights & Decision Support

| JD expectation | What this project shows |
| --- | --- |
| Monthly / quarterly packs | Monthly Pack page |
| Support executive materials | Structured brief + variance appendix |
| Concise recommendations | Risks and recommended actions |
| Ad hoc analysis | Filters + Ask the analyst |

### Skills the JD lists that you can speak to

- **Advanced Excel / analytical thinking** → variance math, bridges, drivers (implemented in TypeScript instead of Excel cells).
- **Financial statements / attention to detail** → revenue, COGS, OpEx, gross profit, EBITDA.
- **Power BI / Power Query / automation** → say: “I’d rebuild this star schema and DAX in Power BI; this web app proves the logic and UX.”
- **ERP familiarity** → the app assumes ERP-style actuals/budget/ops facts; you’d connect Dynamics/SAP/NetSuite in production.
- **AI tools (Copilot, ChatGPT, Claude, etc.)** → live Hugging Face analyst grounded in finance facts.
- **Soft skills** → curious questions, clear recommendations, business-minded narrative.

### One sentence you can say in the interview

> “I built a multi-entity FP&A workspace that does variance analysis, links field ops to finance, and uses AI to draft management briefs from a trusted metrics fact pack — the same workflow I’d run at ConeTec with Power BI, Excel, and Copilot.”

---

## Tech (short version)

- Next.js + TypeScript + Tailwind (web app)
- Charts for trends and bridges
- Metrics engine for variance and KPIs
- Hugging Face for AI briefs/Q&A
- Hosted on Vercel; code on GitHub

You do **not** need to memorize every library. Focus on the finance workflow and the AI grounding story.

---

## What this is not

- Not live ConeTec data (and not affiliated with ConeTec).
- Not a full ERP or Power BI replacement.
- Not a black-box AI — numbers come from the metrics engine first.

That is intentional: it shows judgment and process, which is what FP&A hiring managers care about.
