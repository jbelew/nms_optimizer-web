# NMS Optimizer Help

## Basic Usage

- Select a **Platform** (Starship, Multi-Tool, Corvette, etc.) using the <radix-icon name="GearIcon" size="20" color="var(--accent-11)"></radix-icon> icon.
- **Click** or **double-tap** (mobile) a cell to mark it **Supercharged**.
- **Ctrl-click (Windows) / ⌘-click (Mac) / single-tap (mobile)** to toggle a cell **active** or **inactive**.
- Use **row toggles** to enable or disable entire rows. *(Row toggles are disabled once modules are placed.)*
- Use the **module selection** <radix-icon name="OpenInNewWindowIcon" size="20" color="var(--accent-11)"></radix-icon> button to add or remove individual modules within a technology group.

> 💡 **Note:**
> Exosuits and Exocraft have fixed grids. Exocraft cells cannot be modified. On Exosuits, only active/inactive states can be changed — supercharged layouts are fixed.

## Before You Begin

This tool is intended for **endgame optimization** and works best when:

- Most or all grid cells are unlocked.
- All relevant technologies are available.
- You have **three upgrade modules** per technology.

Partial setups are supported, but results are optimized for fully upgraded platforms.

## Theta / Tau / Sigma

These labels rank procedural upgrades **by stats**, not by class. They are legacy terms retained for consistency.

- **Theta (1)** — best stats
- **Tau (2)** — middle
- **Sigma (3)** — weakest

You won’t see these labels in-game. They are assigned by directly comparing upgrade stats.

### In-Game Comparison

Ignore class letters (S, X, etc.) and compare stats:

- Best → **Theta**
- Second → **Tau**
- Worst → **Sigma**

**Class does not determine rank.** X-Class upgrades can outperform or underperform S-Class.

## Corvettes

Corvettes differ from other platforms: they can have **up to three separate upgrade sets**.

- **Cosmetic upgrades** are shown as `Cn`.
- **Reactor upgrades** are shown as `Rn`.

The solver may suggest Cosmetic upgrades for performance over appearance, though differences are usually minor.

## Recommended Builds

For **Exosuits** and **Exocraft**, supercharged cells are fixed and viable layouts are limited.
The tool provides **hand-curated recommended builds** reflecting optimal combinations.

Suggestions and alternate layouts are welcome via the project discussions:
https://github.com/jbelew/nms_optimizer-web/discussions

## Saving, Loading, and Sharing

- <radix-icon name="FileIcon" size="20" color="var(--accent-11)"></radix-icon> **Load** — Upload a saved `.nms` file to restore a layout.
- <radix-icon name="DownloadIcon" size="20" color="var(--accent-11)"></radix-icon> **Save** — Download the current layout as a `.nms` file.
- <radix-icon name="Share1Icon" size="20" color="var(--accent-11)"></radix-icon> **Share** — Generate a link others can open directly in the optimizer.

## Usage Tips

Supercharged cells are limited — placement matters.

- Start with **one high-impact technology** that benefits from multiple supercharged cells.
- Allocate remaining supercharged cells to a **second priority tech** rather than stacking everything in one place.
- Prioritize technologies with **larger module counts** before space becomes constrained.
- Let the solver handle placement; your role is to **set priorities**.

If space becomes tight, you may need to reset and solve technologies in a different order to avoid an **Optimization Alert**.

## Pro Tip

The solver uses fixed windows sized to each technology’s module count to find space-efficient placements.
If results aren’t ideal, **temporarily disable cells** to guide the solver toward a better layout.
