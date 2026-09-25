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

**Platform Type**:
A specific equipment or vessel classification (e.g., Solar, Freighter, Multi-Tool, Exocraft, Exosuit) defining available technologies and grid dimensions.
_Avoid_: ship type, vehicle category, gear kind

**Class**:
The grade rating (C, B, A, S) of an equipment platform derived from the number of active supercharged slots (1 &rarr; C, 2 &rarr; B, 3 &rarr; A, 4 &rarr; S). Not applicable to Exocraft or Exosuits.
_Avoid_: platform class, ship tier, gear rank, upgrade class
