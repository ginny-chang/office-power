# Office Power UI system

## Source of truth

- `src-shared/ui/tokens.json`: semantic color, typography, spacing, radius, shadow and motion values.
- `npm run tokens`: regenerate `tokens.css` after editing JSON.
- `src-shared/ui/index.jsx` and `components.css`: shared Button, Card, Dialog, Badge, FormField, ResourceList/Row and DataTable.
- `workspace.css`: visual adapters for existing route-specific components. Keep route layout and behavior in route files; avoid adding new visual variants there.
- `npm run storybook`: local component review on port 6006.
- `npm run build-storybook`: portable static review in `storybook-static/`.

## Component decisions

| Area | Decision |
| --- | --- |
| My Board | Keep spatial Office and actionable Agent cards. Use shared control tokens. |
| Chat | Preserve Agent/conversation lists; flatten welcome content and suggested questions. |
| NOVA Apps | Keep cards for app screenshots and launch/edit actions; remove card-shaped gallery container. |
| APP Pack | Keep results/screenshots; use a single metric strip and version record list. |
| Files & Library | Use tables for library name, description, file count and actions. |
| NOVA data | Compare table name, linked app, row count and column count in a table. |
| MCP / Skills | Use tables with status, metadata and actions. |
| Organization | Keep employee table and graph; standardize controls and dialogs. |
| Account | Use headings and dividers for settings instead of repeated cards. |
| Runtime | Retain engine summary; use rows for Slack workers and share the repeated explanation. |
| Agent settings | Standardize dialog/form styling; flatten nested setting groups. |
| Scheduling | Keep full-screen settings with consistent fields, actions and table/list borders. |

## Rules

- Button variants: primary, secondary, ghost, danger; default 40px, touch 44px. Small is reserved for dense desktop rows.
- Cards represent independent actionable objects, not every heading or one-line statistic.
- Lists suit repeated short entries; tables suit comparing the same attributes.
- Dialog: 20px radius, consistent heading/body/footer, secondary cancel and primary save. Shared Dialog restores trigger focus and handles Escape.
- Typeface: Archivo with Noto Sans TC fallback. Use the token scale; do not add arbitrary small text.
- Semantic state always includes text/icon, not color alone.
- Product previews inside NOVA Apps retain their app-specific themes. Historical marketing pages are not workspace UI and are outside this normalization.

## Verification

- Vite production build and static Storybook build.
- Browser smoke review of Dashboard, Chat, NOVA Apps, APP Pack, Capabilities, Organization and Account.
- Actual knowledge-library dialog open/cancel and focus restoration.
- Storybook dialog save state and focus restoration; mobile viewport review.
- Token contrast checks: text/surface 11.83, muted/surface 5.36, muted/canvas 4.89, white/primary 5.85; semantic badge pairs all above 5:1.

This is a visual consistency pass, not a claim of complete accessibility certification. Existing feature-specific dialog bodies remain route components using the shared visual adapters.
