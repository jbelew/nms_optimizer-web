# NMS Optimizer Guide: Adjacency Bonus & Layout Optimization

## Basic Usage

- **Click or tap** the ⚙️ icon to select your **Platform** (Starships, Multi-tools, Corvettes, etc.).
- **Click or double-tap** (on Mobile) to mark a cell as **Supercharged**.
- **Ctrl-click** (Windows) / **⌘-click** (Mac) or **single tap** (on mobile) to toggle a cell's **active** state.
- Use the **row toggle buttons** to enable or disable entire rows. Row toggles are **disabled once modules are placed**.

> 💡 **Note:** Exosuits and Exocraft have fixed grid configurations. Exocraft cells cannot be modified at all. On Exosuits, you can only toggle cells active or inactive; changing the supercharged layout is not supported.

## Before You Begin

This tool is designed for **endgame players** optimizing their platform's technology layout for maximum efficiency. It works best when:

- You've unlocked **most or all cells** on your platform (Starship, Exosuit, Exocraft, or Multi-Tool).
- You have access to **all relevant technologies**.
- You own a **full set of three upgrade modules** per applicable technology.

If you're still unlocking cells or collecting modules, the tool can still provide insights — but it's primarily designed for **fully upgraded platforms**.

## Saving, Loading, and Sharing Builds

You can save your optimized layouts, reload them later, or share them with friends, making it easy to manage multiple configurations for the same platform.

- **Save Build** — Click the save icon to download your current layout as a `.nms` file. You'll be prompted to name your build; the tool also auto-generates themed names like `"Corvette - Crusade of the Starfall.nms"`, which you can customize.
- **Load Build** — Click the load icon to upload a previously saved `.nms` file. Your grid will immediately update to match the saved layout, including all module placements and supercharged cell positions.
- **Share Build** — Click the share icon to generate a shareable link for your current layout. Friends can use this link to load your build directly into their optimizer without needing the file.

## Information on Corvettes

Corvettes work a little differently from other platforms — instead of just one set of upgrades, they can have up to three.

- **Cosmetic upgrades** are shown as `Cn`.
- **Reactor upgrades** are shown as `Rn`.

The solver will also suggest the best Cosmetic upgrades if you'd rather prioritize performance over looks — though in practice, the trade-offs are pretty minimal most of the time.

## Recommended Builds

For platforms like **Exosuits** and **Exocraft**, where the supercharged cells are fixed, the number of viable layouts is **extremely limited**.
This allows the tool to offer **recommended builds** — carefully hand-picked and highly opinionated layouts reflecting the best combinations available.

If you have feedback or want to suggest alternate configurations, feel free to [start a discussion](https://github.com/jbelew/nms_optimizer-web/discussions) — these builds are curated, not auto-generated, and community input helps make them better.

## Usage Tips

Supercharged cells provide major bonuses but are limited — every placement matters. **Avoid blindly matching your in-game supercharged layout.** For best results:

- **Start with one high-impact technology** — one that fits your play style and benefits from two or three supercharged cells, such as _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_, or _Neutron Cannon_.
  Mark those cells as supercharged, then solve.
- **Use your remaining supercharged cells** for a second priority tech like _Hyperdrive_, _Scanner_, or _Mining Beam_, and solve again. Spreading bonuses usually beats stacking them all on one tech.
- After your core techs are solved, shift focus to those with **larger module counts** (e.g. _Hyperdrive_, _Starship Trails_) before running out of contiguous space.
- The solver does the heavy lifting — your job is to **prioritize technologies** based on how you play.

As grid space gets tight, you may need to **reset a few technologies** and solve them in a different order to avoid the dreaded **Optimization Alert**. With a fully upgraded starship, you'll often have a completely full grid.

## Pro Tip

There’s real math behind placement. The solver looks for fixed windows that match the number of modules a technology needs and usually finds the most space-efficient layout. If something isn’t lining up, try **temporarily disabling a few cells** to steer it toward a better spot on the grid.

