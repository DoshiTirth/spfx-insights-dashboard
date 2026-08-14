<p align="center">
  <img src="sharepoint/assets/logo.svg" width="96" height="96" alt="Insights Dashboard logo" />
</p>

<h1 align="center">SPFx Insights Dashboard</h1>

<p align="center">
  A SharePoint Framework web part that turns any SharePoint list into a live KPI dashboard —
  summary cards, a drill-down chart, and category filtering, with zero code changes needed per site.
</p>

![version](https://img.shields.io/badge/version-1.0.0-green.svg)
![SPFx](https://img.shields.io/badge/SPFx-React-blue.svg)
![license](https://img.shields.io/badge/license-MIT-lightgrey.svg)

## Why this exists

Most teams track their numbers in a SharePoint list, then screenshot it into a report or rebuild
it in Power BI just to get a readable summary. This web part skips that step: point it at a list,
map three fields, and it renders as a proper dashboard — right on the page the list already lives on.

## Features

- **KPI cards** — total, record count, average, and top category, computed live from the list.
- **Interactive chart** — bar, line, pie, or doughnut (configurable), rendered with Chart.js.
- **Click-to-drill** — click a bar or slice to open a detail table of the underlying records for that category.
- **Category filtering** — a dropdown scoped to the values actually present in the list.
- **Fully permission-aware** — reads through the current user's own SharePoint session (`SPHttpClient`); never bypasses list permissions.
- **Handles large lists** — pages through `@odata.nextLink` automatically so lists with hundreds of items still load in full.
- **No-code configuration** — list name and field mappings are set entirely from the web part's property pane.

## How it's built

- **Framework:** SharePoint Framework (SPFx) 1.23, React, TypeScript
- **Build system:** Heft
- **UI:** Fluent UI (`@fluentui/react`)
- **Charts:** Chart.js via `react-chartjs-2`
- **Data access:** `SPHttpClient` against `_api/web/lists/getbytitle(...)/items`, with pagination handling

## Configuration

All configuration happens through the web part's property pane — no code editing required:

| Setting | What it does |
|---|---|
| Dashboard title | Heading shown above the dashboard |
| SharePoint list name | Exact title of the source list |
| Category field internal name | Column used to group/filter (e.g. `Category`) |
| Value field internal name | Numeric column summed into the KPIs and chart (e.g. `Value`) |
| Date field internal name | Column shown in the drill-down table (e.g. `Created`) |
| Chart type | Bar / Line / Pie / Doughnut |

## Getting started (development)

```bash
npm install
npm run serve
```

This opens the local SPFx workbench for development. To package for deployment:

```bash
npm run build
gulp bundle --ship
gulp package-solution --ship
```

This produces a `.sppkg` package under `sharepoint/solution/`, ready to upload to a SharePoint App Catalog and deploy to any site in a tenant.

## Disclaimer

Provided as-is, without warranty of any kind.
