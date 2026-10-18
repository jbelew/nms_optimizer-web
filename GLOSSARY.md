# NMS Optimizer Web Domain Model

This document outlines the core business domain language for the No Man's Sky technology layout optimizer.

## Language

**Module Rank Order**:
The hierarchical relationship (Theta &rarr; Tau &rarr; Sigma) between procedural upgrade modules where higher tiers depend on lower tiers.
_Avoid_: upgrade level, module level, module rank

**Technology Category**:
A functional system type (e.g., Pulse Engine, Deflector Shield) containing one or more Technology Variants.
_Avoid_: tech group, ship component, system type

**Technology Variant**:
A distinct configuration mode (e.g., `normal`, `max`) within a Technology Category that defines its available modules and Solver Window rules.
_Avoid_: active group, tech group variant, group type

**Module Group**:
A functional sub-classification of modules within a Technology Variant (e.g., `core`, `figurines`, `bonus`, `upgrade`, `atlantid`, `reactor`, `cosmetic`, `trails`) governing display order and Module Rank Order rules.
_Avoid_: module type bucket, module category, validation group

**Module Selection**:
The set of user-checked modules within a Technology Category that are selected as inputs for layout optimization.
_Avoid_: selected modules, checked upgrades

**Shared Grid**:
A technology layout imported into the workspace from an encoded URL query parameter rather than configured manually or loaded from a Build File.
_Avoid_: shared build, imported layout, URL grid

**Build File**:
A portable `.nms` JSON snapshot capturing the active Platform Type, grid layout, Module Selection, solver bonus scores, and a SHA-256 integrity checksum for saving or restoring a build from disk.
_Avoid_: save file, exported build, layout file

**Default Grid Layout**:
The baseline slot configuration for the active Platform Type (or Ship Class), consisting of its initial active and supercharged slot states with no placed modules.
_Avoid_: empty grid, blank board, default state

**Session Reset**:
The action of restoring the workspace to the platform's Default Grid Layout, restoring all technology Module Selections to their defaults, and clearing URL grid parameters.
_Avoid_: rest grid, wipe grid, clear board

**Technology Reset**:
The action of clearing all placed modules and solver bonus scores for a single Technology Category while preserving its Module Selection and the rest of the grid layout.
_Avoid_: tech reset, row reset, clear tech

**Recommended Builds**:
Curated, preconfigured technology layouts bundled within the application that provide optimal module placements for common setups.
_Avoid_: Community Builds, default builds, preset setups

**Platform Type**:
The vehicle or gear category being configured (e.g. Starship, Multi-Tool, Exosuit, Freighter).
_Avoid_: ship type, vehicle type, gear type

**Ship Class**:
The tier rating of a starship (`C`, `B`, `A`, `S`) determining available inventory dimensions and supercharged slot allocations.
_Avoid_: ship rank, ship tier, platform class

**PWA Self-Healing**:
The automatic client-side eviction of outdated service worker registrations and corrupted CacheStorage upon detected version mismatch or dynamic import failure.
_Avoid_: SW nuke, hard reset, cache bust

**Silent Background Activation**:
The process of activating a staged waiting service worker when the application tab becomes hidden or idle without displaying an intrusive prompt.
_Avoid_: silent reload, stealth update, background push

**Staged Worker**:
A newly installed service worker sitting in the `waiting` state ready to activate once the active client session permits cutover.
_Avoid_: pending worker, queued worker, background worker

**Solver Window**:
The bounding subgrid dimensions (width × height) dynamically allocated for a Technology Category based on its active Module Selection, within which localized module permutation and simulated annealing occur.
_Avoid_: window size, search window, tech window, bounding box

**Slot Restriction**:
A rule preventing an invalid grid cell modification (locked grid layout, occupied module slot, supercharged row limit, fixed supercharged layout, or maximum supercharged count) that provides immediate shake feedback and a one-time session warning after repeated attempts.
_Avoid_: cell error, validation error, session error

**Routed Dialog**:
A modal view bound to a canonical, localized URL path (such as `/about/`, `/instructions/`, `/changelog/`, `/userstats/`, or `/performance/`) so it can be bookmarked, shared, and indexed independently of the workspace grid.
_Avoid_: modal page, route wrapper, dialog route
