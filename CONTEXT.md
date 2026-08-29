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
