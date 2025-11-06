## Basic Usage

- **Click or tap** the ⚙️ icon to select your **Platform** (Starships, Multi-tools, Corvettes, etc.).
- **Click or double-tap** a cell to mark it as **Supercharged** (up to 4 per grid).
- **Ctrl-click** (Windows) / **⌘-click** (Mac) or **single tap** (on mobile) to toggle a cell’s **active** state — active cells can hold modules.
- Use the **row toggle buttons** to enable or disable entire rows. Row toggles are **disabled once modules are placed**, and re-enabled when you press **Reset Grid**.

> 💡 **Note:** Exosuits and Exocraft have fixed grid configurations. Exocraft cells cannot be modified at all. On Exosuits, you can only toggle cells active or inactive; changing the supercharged layout is not supported.

## Before You Begin

This tool is for **endgame players** optimizing their platform’s technology layout for maximum efficiency. It works best when:

- You’ve unlocked **most or all cells** on your platform (Starship, Exosuit, Exocraft, or Multi-Tool).
- You have access to **all relevant technologies**.
- You own a **full set of three upgrade modules** per applicable technology.

If you're still unlocking cells or collecting modules, the tool can still provide insights — but it's primarily designed for **fully upgraded platforms**.

## Information on Corvettes

Corvettes work a little differently from other platforms — instead of just one set of upgrades, they can have up to three.

- **Cosmetic upgrades** are shown as `Cn`.
- **Reactor upgrades** are shown as `Rn`.

The solver will also suggest the best Cosmetic upgrades if you’d rather prioritize performance over looks — though in practice, the trade-offs are pretty minimal most of the time.

Keep in mind that a fully upgraded Corvette tech sub-system takes up **a lot** of space. With a full 60 technology slots, you’ll typically only have space for three or four **min/max solves**, so choose wisely.

## Recommended Builds

For platforms like **Exosuits** and **Exocraft**, where the supercharged cells are fixed, the number of viable layouts is **extremely limited**. Instead of dealing with billions of permutations as we do for starships or multi-tools, we’re working with just a handful of best-case possibilities.

This allows the tool to offer **recommended builds** — carefully hand-picked and highly opinionated layouts reflecting the best combinations available. The system also supports **multiple builds per platform**, tailored to different use cases. For example:

- The **Minotaur** includes both a **general-purpose build** (for when you're actively piloting it) and a **dedicated AI support build** (optimized for remote deployment).

Other platforms may include **specialized variants in the future** — such as a **Pilgrim racing setup** or a **Scanner-boosted Exosuit** — depending on user feedback and demand.

If you have feedback or want to suggest alternate configurations, feel free to [start a discussion](https://github.com/jbelew/nms_optimizer-web/discussions) — these builds are curated, not auto-generated, and community input helps make them better.

## Usage Tips

Supercharged cells provide major bonuses but are limited — every placement matters. **Avoid blindly matching your in-game supercharged layout.** For best results:

- **Start with one high-impact technology** — one that fits your play style and benefits from two or three supercharged cells, such as _Pulse Engine_, _Pulse Spitter_, _Infra-Knife Accelerator_, or _Neutron Cannon_.
  Mark those cells as supercharged, then solve.
- **Use your remaining supercharged cells** for a second priority tech like _Hyperdrive_, _Scanner_, or _Mining Beam_, and solve again. Spreading bonuses usually beats stacking them all on one tech.
- After your core techs are solved, shift focus to those with **larger module counts** (e.g. _Hyperdrive_, _Starship Trails_) before running out of contiguous space.
- The solver does the heavy lifting — your job is to **prioritize technologies** based on how you play.

As grid space gets tight, you may need to **reset a few technologies** and solve them in a different order to avoid the dreaded **Optimization Alert**. With a fully upgraded starship, you’ll often be left with just one open cell — or none at all if you're optimizing an **Interceptor**.

## Pro Tip

There’s real math behind placement. The solver works within fixed windows based on how many modules a technology requires and generally picks the most efficient layout without wasting space. But if things aren’t lining up:

- Try **disabling a few cells** to guide the solver toward a better window.
- A small adjustment can free up key placement zones and improve your final layout.
