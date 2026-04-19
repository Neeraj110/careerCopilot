# Design System Strategy: The Intelligent Interface

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Concierge"**

This design system moves beyond the "generic SaaS dashboard" by adopting a high-end editorial approach to career management. Rather than a static grid of boxes, the interface acts as a fluid, intelligent canvas. We draw inspiration from the precision of **Linear** and the structural clarity of **Notion**, but we elevate the experience through **Intentional Asymmetry** and **Tonal Depth**.

The goal is to convey "Productive Serenity." By utilizing high-contrast typography scales (the Manrope/Inter pairing) and sophisticated layering, we ensure that an information-dense environment feels breathable and premium. We break the "template" look by favoring overlapping surface tiers and generous whitespace over rigid lines and borders.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones (`#0b1326`) and refined emerald accents. It is designed to feel authoritative yet modern.

### The "No-Line" Rule
**Borders are a design failure of the past.** In this system, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through:
*   **Background Shifts:** Transitioning from `surface` to `surface-container-low`.
*   **Tonal Transitions:** Using subtle variations in the container scale to denote hierarchy.
*   **Negative Space:** Using the Spacing Scale (`spacing-8` or `10`) to create "invisible containers."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine materials.
*   **Base:** `surface` (#0b1326) is the desk.
*   **Primary Workspaces:** `surface-container` (#171f33) provides the first level of focus.
*   **Interactive Components:** `surface-container-high` (#222a3d) sits on top, signifying actionability.
*   **Floating Intelligence:** Modals and tooltips use `surface-container-highest` (#2d3449) with a 20px backdrop blur.

### The "Glass & Gradient" Rule
To inject "soul" into the data-driven environment:
*   **Glassmorphism:** Use `surface-variant` at 60% opacity with a `blur-xl` for sidebar navigations and floating action panels.
*   **Signature Gradients:** Primary CTAs should transition from `primary` (#4edea3) to `primary-container` (#00b17b) at a 135-degree angle to create a sense of forward momentum.

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with legibility.

*   **Display & Headlines (Manrope):** This is our "Editorial Voice." Large, bold, and unapologetic. Use `display-md` for high-level stats (e.g., Match Scores) to make data feel like a headline.
*   **Interface & Body (Inter):** Our "Utility Voice." Inter is used for all functional text, ensuring high readability at small sizes.
*   **Hierarchy Tip:** Pair a `headline-sm` (Manrope, Bold) with a `label-md` (Inter, Medium, `on-surface-variant`) to create a clear distinction between "The News" and "The Detail."

---

## 4. Elevation & Depth
We reject the "drop shadow" default. Depth is achieved through light and layering.

*   **The Layering Principle:** Place a `surface-container-lowest` card inside a `surface-container-low` section. This creates a "recessed" look, making the card feel like a tray holding important data.
*   **Ambient Shadows:** For floating elements (Modals, Popovers), use a multi-layered shadow:
    *   Shadow 1: `0 4px 20px rgba(6, 14, 32, 0.4)`
    *   Shadow 2: `0 10px 40px rgba(6, 14, 32, 0.2)`
*   **The "Ghost Border" Fallback:** When high-density data requires a container (e.g., a complex data table), use `outline-variant` at **15% opacity**. It should be felt, not seen.
*   **Tonal Match Scores:** High-match scores (Emerald) should utilize `primary-fixed-dim` for the background and `on-primary-fixed` for text to ensure a "vibrant but integrated" look.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (`primary` to `primary-container`), `rounded-md`, `label-md` (Bold).
*   **Secondary:** `surface-container-highest` background, `on-surface` text. No border.
*   **Tertiary:** Ghost style. `on-surface-variant` text, shifting to `on-surface` on hover.

### Cards & Job Feeds
*   **Forbid Dividers:** Do not use lines between job listings. Use `spacing-4` vertical padding and a subtle `surface-container` background on hover to highlight the active row.
*   **Match Chips:** Use `rounded-full`. High match: `primary-container` background with `on-primary-container` text.

### Input Fields
*   **Resting:** `surface-container-low` background, no border.
*   **Focus:** `outline` (at 30% opacity) border with a 2px `primary` "glow" (shadow-sm).
*   **Labels:** Always use `label-sm` in `on-surface-variant` positioned 0.4rem above the input.

### AI Copilot Specific Components
*   **Intelligence Insights:** Use a `tertiary-container` background with a subtle "pulse" animation to signify AI-generated content.
*   **Match Score Gauge:** A semi-circle gauge using `primary` for high scores and `secondary` for medium, set against a `surface-variant` track.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use `surface-container` tiers to create hierarchy. If it’s important, it should be "higher" (brighter).
*   **Do** use Manrope for all numerical data-points to emphasize the "data-driven" nature of the Copilot.
*   **Do** lean into `spacing-10` and `spacing-12` for page margins to give the dashboard an expensive, airy feel.

### Don't:
*   **Don't** use `#000000` or `#ffffff` for anything. Use the provided surface and on-surface tokens.
*   **Don't** use 1px dividers to separate list items. Use whitespace or tonal shifts.
*   **Don't** use standard "Material Blue" for links. Use `primary` (#4edea3) to maintain the signature brand identity.
*   **Don't** use sharp corners. Stick strictly to the `rounded-md` (0.75rem) and `rounded-lg` (1rem) tokens for a soft, modern touch.