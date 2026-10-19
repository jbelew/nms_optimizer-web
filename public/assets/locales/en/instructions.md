# NMS Optimizer Instructions: Modules & Supercharged Slots

## Getting Started with the Grid

- Select a **Platform Type** (Starship, Multi-Tool, Corvette, etc.) with the <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> button.
- **Click** or **double-tap** (mobile) an empty slot to toggle its **Supercharged** state.
- **Ctrl-click (Windows) / ⌘-click (Mac) / single-tap (mobile)** a slot to toggle its **active** or **inactive** state.
- **Keyboard controls:** Press **Arrow keys** (↑, ↓, ←, →) and **Home** / **End** to move focus. Press **S** or **Shift+Enter** to toggle the **Supercharged** state. Press **Space** or **Enter** to toggle the **active** or **inactive** state.
- Use the **row toggles** to enable or disable an entire row. _(Row toggles lock after you place modules on the grid.)_
- Click the **Module Selection** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> button on a **Technology Category** to enable or disable individual modules and view the required **Solver Window** dimensions.

> 💡 **Note:**
> **Slot Restrictions** apply to Exosuits and Exocraft. Exocraft use a fixed **Default Grid Layout** where slots cannot be changed. Exosuits have fixed supercharged slot locations, so you can only change active and inactive slot states.

## Before You Begin

This tool is designed for **endgame optimization** and produces the best results when:

- Most or all grid slots are active.
- All modules in each **Technology Category** are unlocked.
- You have **three procedural upgrade modules** per **Technology Category**.

You can optimize partial setups, but the solver targets fully upgraded **Platform Types**.

## Usage Tips

Supercharged slots are limited. Distribute them across multiple **Technology Categories** for the highest total bonus:

- **Do not assign all supercharged slots to the first Technology Category.** This reduces the available bonus for other systems.
- Assign **2 to 3 supercharged slots** to your highest-priority **Technology Category**.
- Reserve **1 or more supercharged slots** for a second **Technology Category**.
- After all supercharged slots are occupied, solve **Technology Categories** that require larger **Solver Window** dimensions first.
- Set your priorities and let the solver calculate the optimal module placement.

### Solver Window & Optimization Alerts

Each **Technology Category** requires a **Solver Window** (`width × height`) based on its active **Module Selection**.

- If no contiguous region of active slots matches the required **Solver Window**, an **Optimization Alert** (**Pattern No Fit**) appears.
- From the alert, you can run a **Forced Solve** (full simulated annealing across available slots) or cancel, use **Technology Reset** on placed categories, and solve in a different order.
- **Pro Tip:** Temporarily set specific slots to **inactive** before solving to guide where the **Solver Window** is placed.

## Module Rank Order (Theta / Tau / Sigma)

**Module Rank Order** (`Theta → Tau → Sigma`) ranks procedural upgrade modules **by stat value**, not by upgrade class:

- **Theta (1)** — highest stats
- **Tau (2)** — middle stats
- **Sigma (3)** — lowest stats

These labels do not appear in-game. Compare the stat values of your procedural upgrades directly:

- Highest stats → **Theta**
- Second-highest stats → **Tau**
- Lowest stats → **Sigma**

**Upgrade class does not determine Module Rank Order.** An X-Class upgrade can have higher or lower stats than an S-Class upgrade.

## Corvettes

Corvettes support up to **three separate upgrade Module Groups** within a **Technology Category**:

- **Cosmetic modules** use the label `Cn`.
- **Reactor modules** use the label `Rn`.

The solver prioritizes stat bonuses over visual appearance when placing Cosmetic modules.

## Recommended Builds

Exosuits and Exocraft have fixed supercharged slots and fewer layout permutations. Use the **Recommended Builds** menu to load curated layouts for common setups.

Submit layout suggestions or feedback in the project discussions:
<https://github.com/jbelew/nms_optimizer-web/discussions>

## Saving, Loading, and Sharing

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Load** — Open a saved `.nms` **Build File** from disk.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Save** — Download the current layout as a `.nms` **Build File**.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Share** — Generate a **Shared Grid** URL that opens your layout in the optimizer.
- <radix-icon name="CameraIcon" size="20" color="var(--accent-11)"></radix-icon> **Screenshot** — Capture a PNG image of the current grid layout.
