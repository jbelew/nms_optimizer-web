# NMS Optimizer Web Domain Model

This document outlines the core business domain language for the No Man's Sky technology layout optimizer.

## Language

**Module Rank Order**:
The hierarchical relationship (Theta &rarr; Tau &rarr; Sigma) between procedural upgrade modules where higher tiers depend on lower tiers.
_Avoid_: upgrade level, module level, module rank

**Technology Category**:
A functional system type (e.g., Pulse Engine, Deflector Shield) containing one or more variant groups of modules.
_Avoid_: tech group, ship component, system type

**Module Selection**:
The set of user-checked modules within a Technology Category that are selected as inputs for layout optimization.
_Avoid_: selected modules, checked upgrades

**Shared Grid**:
A technology layout imported into the workspace from an encoded URL query parameter rather than configured manually or loaded from a saved file.
_Avoid_: shared build, imported layout, URL grid

**Session Reset**:
The action of restoring the workspace to an empty, unconfigured layout and clearing all active module selections and URL parameters.
_Avoid_: rest grid, wipe grid, clear board

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

