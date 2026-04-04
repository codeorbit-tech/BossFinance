# Design System Document: The Architectural Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Sovereign Architect"**

In high-stakes finance, precision is expected, but authority is earned. This design system departs from the cluttered, "dashboard-in-a-box" aesthetic. Instead, it adopts the principles of **Architectural Editorialism**. We treat the interface like a premium financial ledger—defined by expansive white space, intentional depth, and a hierarchy that speaks in a whisper rather than a shout.

By utilizing high-contrast data visualization against an understated, layered background, we create a "Sovereign" feel. We break the grid through asymmetrical stat cards and overlapping surface layers, ensuring the "Boss Finance & Consulting" experience feels custom-tailored, bespoke, and undeniably professional.

---

## 2. Colors: Tonal Authority
Our palette is rooted in the "Deep Forest" of professional stability, punctuated by the "Vitality Green" of growth.

### Core Tokens
*   **Primary (`#00280f`)**: Reserved for high-authority zones like the Sidebar. It represents the "Old Guard" of financial trust.
*   **Secondary (`#426651`)**: Used for supportive UI elements and softer actions.
*   **Tertiary (`#1f1f33`)**: The "Ink" of the system. Used for headers to ensure maximum legibility and an editorial feel.
*   **Accent (On-Primary-Container: `#57b171`)**: A vibrant, modern green for CTAs and "Success" indicators.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** To maintain a premium feel, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through:
1.  **Background Shifts:** Place a `surface-container-low` component on a `surface` background.
2.  **Tonal Transitions:** Use a subtle `surface-variant` to distinguish the header from the body.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine stationery.
*   **Base:** `surface` (#f8f9fa)
*   **Sectioning:** `surface-container-low` (#f3f4f5)
*   **Actionable Cards:** `surface-container-lowest` (#ffffff) to provide "lift" from the page.

### The Glass & Gradient Rule
To prevent the UI from feeling "flat" or "static":
*   **Floating Elements:** Modals and Popovers must use `surface-container-lowest` with a 12px `backdrop-blur` and 85% opacity.
*   **CTAs:** Buttons should utilize a subtle linear gradient from `on-primary-container` to `primary_container` to add tactile depth.

---

## 3. Typography: Editorial Precision
We pair the geometric authority of **Manrope** for displays with the utilitarian clarity of **Inter** for data.

*   **Display & Headlines (Manrope):** Large, bold, and spaced with a slight negative letter-spacing (-2%). This creates a "branded" editorial look for totals and page titles.
*   **Body & Labels (Inter):** High x-height for readability in data-heavy tables.
*   **The Hierarchy of Trust:** Large `display-md` numbers (Total Assets) should be 3x the size of their supporting labels to emphasize what matters: the bottom line.

---

## 4. Elevation & Depth: Tonal Layering
We avoid the "floating card" look of 2010s Material Design. Depth is achieved through **Tonal Layering**.

*   **The Layering Principle:** Instead of shadows, nest a `surface-container-lowest` card inside a `surface-container` area. The contrast in "brightness" creates a natural, sophisticated lift.
*   **Ambient Shadows:** Use only for high-tier floating elements (e.g., active dropdowns). Use `on-surface` at 6% opacity with a 32px blur and 16px Y-offset. It should feel like a soft glow, not a dark smudge.
*   **The "Ghost Border" Fallback:** In high-density data tables where separation is critical, use `outline-variant` at 15% opacity. It should be barely visible—a "suggestion" of a line.

---

## 5. Components: Functional Elegance

### Buttons
*   **Primary:** High-gloss gradient (`primary_container` to `on-primary-container`), `md` (0.375rem) corner radius. No border.
*   **Secondary:** `surface-container-high` background with `on-surface` text.
*   **Tertiary:** Transparent background, `primary` text, underlined only on hover.

### Stats Cards (The "Signature" Component)
*   **Layout:** Asymmetrical. Large `display-sm` value in the top left, `label-md` trend indicator (+2.4%) in a glassmorphic chip in the top right. 
*   **Background:** Use a subtle "Atmospheric Gradient" (Primary at 5% opacity fading to 0%) to give the card a sense of life.

### Data Tables
*   **The "No-Divider" Rule:** Remove horizontal lines. Use 16px of vertical padding and alternating row tints (`surface` vs `surface-container-low`) to guide the eye.
*   **Header:** `tertiary_fixed` text color, `label-md` uppercase with 0.05em tracking.

### Status Badges
*   **Logic:** High-saturation text on low-saturation backgrounds (e.g., Active: Dark Green text on 10% Green background).
*   **Shape:** `full` (pill) radius to provide a soft counterpoint to the rigid data grid.

### Input Fields
*   **Style:** `surface-container-highest` background, no border, 2px "Focus" underline in `primary` when active. Labels are always `label-md` and placed above the field, never floating.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use whitespace as a separator. If elements feel cluttered, add 8px of padding before adding a line.
*   **DO** use "Primary" green sparingly. It is a beacon for action, not a decorative element.
*   **DO** align data to the right in tables for financial comparison clarity.

### Don't
*   **DON'T** use pure black (#000000). Always use `tertiary` or `on-surface` for a softer, more premium contrast.
*   **DON'T** use "Standard" drop shadows. If it looks like a default Photoshop shadow, it’s too heavy.
*   **DON'T** use icons as primary navigation without labels. In finance, clarity beats minimalism every time.