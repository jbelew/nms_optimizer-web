# NMS Optimizer: Tech Layout Builder & Adjacency Calculator

![Screenshot of NMS Optimizer application showing a starship technology grid with optimized module placement](/assets/img/screenshots/screenshot.png)

NMS Optimizer figures out where to put your technology modules so you don't have to. Pick your platform, select your modules, mark your supercharged slots, and the optimizer calculates the layout that gets the most out of your adjacency bonuses. It works for starships, corvettes, multitools, exosuits, exocraft, and freighters.

## What Is an Adjacency Bonus?

When you place compatible technology modules next to each other in No Man's Sky, they get a stat boost. The game doesn't tell you much about how this works, but the short version: modules of the same type that share an edge get a percentage increase to their stats. The more edges shared, the bigger the bonus. Figuring out the right arrangement by hand is tedious, especially on larger grids with supercharged slots to account for.

## What Are Supercharged Slots?

Some inventory slots in No Man's Sky are supercharged. Any technology module placed in one gets a large stat multiplier on top of normal adjacency bonuses. They're randomly placed on each piece of gear, so the optimal layout changes depending on where your supercharged slots landed. That's the hard part, and it's what this tool is built to solve.

## How It Works

The optimizer uses a combination of deterministic pattern matching and simulated annealing. For smaller module sets it can find the exact best layout. For larger or more complex grids, simulated annealing explores thousands of arrangements to find one that scores as high as possible. The scoring accounts for adjacency bonuses, supercharged slot placement, and module-specific stat weights. The backend runs in Rust for speed.

## Supported Platforms

- **Starships:** Standard, Exotic, Sentinel, Solar, and Living
- **Corvettes:** Including unique reactor modules and cosmetic technology slots
- **Multitools:** All types including Staves
- **Exocraft:** All vehicle types (Nomad, Colossus, Pilgrim, Roamer, Minotaur, Nautilon)
- **Exosuits:** All technology types
- **Freighters:** Capital ship technology layouts
