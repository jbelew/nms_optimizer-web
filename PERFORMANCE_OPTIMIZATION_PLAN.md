# Performance Optimization Plan

## Priority Levels
- **P0 (Critical)**: Major impact, causes visible jank or slow interactions
- **P1 (High)**: Noticeable performance impact, easy to fix
- **P2 (Medium)**: Measurable impact, moderate effort
- **P3 (Low)**: Minor impact, can defer

---

## Phase 1: Critical Path Optimizations (P0)

### 1.1 Fix O(n²) Grid Operations in GridStore
**Files**: `src/store/GridStore.ts`  
**Issues**:
- `hasTechInGrid` (lines 581-585): Nested `.some()` without early optimization
- `resetGridTech` (lines 614-619): Nested `forEach` iterates all cells
- `selectTotalSuperchargedCells` (line 626): `.flat().filter()` on entire grid

**Impact**: Grid operations are called frequently during state updates  
**Solution**:
- Replace nested loops with indexed lookups (Map/Set based)
- Add early exit conditions
- Batch grid mutations

**Effort**: Medium | **Impact**: High

---

### 1.2 Eliminate N+1 Pattern in useTechTree
**Files**: `src/hooks/useTechTree/useTechTree.tsx`  
**Issue**: Lines 280-281 call `setActiveGroup()` in a loop instead of batching

**Impact**: Creates multiple store updates, triggers multiple renders  
**Solution**:
- Collect all active groups into object
- Single batch update to store

**Effort**: Low | **Impact**: High

---

### 1.3 Fix Inline Array Creation in GridRow
**Files**: `src/components/GridRow/GridRow.tsx`  
**Issue**: Line 42 `Array.from({ length: gridWidth }).map()` recreates array every render

**Impact**: Creates new array object on every GridRow render (many per grid)  
**Solution**:
- Use `useMemo` with gridWidth dependency
- Or pre-generate array outside component

**Effort**: Low | **Impact**: Medium-High

---

## Phase 2: Effects & Dependencies (P1)

### 2.1 Fix useEffect Dependencies in useTechTree
**Files**: `src/hooks/useTechTree/useTechTree.tsx`  
**Issues**:
- Lines 250-295: Two separate effects when `techTree` changes
- First effect (255-275): Complex loop building colors/groups
- Recreates even when data hasn't structurally changed

**Impact**: Excessive re-computation on every tech tree load  
**Solution**:
- Combine related effects
- Add deeper dependency checks
- Memoize computation before store update

**Effort**: Medium | **Impact**: Medium

---

### 2.2 Optimize useEffect in useOptimize
**Files**: `src/hooks/useOptimize/useOptimize.tsx`  
**Issue**: Lines 86-90 scroll effect has broad dependencies (`scrollIntoView` callback recreates)

**Impact**: Unnecessary scroll triggers  
**Solution**:
- Wrap scroll function in `useCallback`
- Review dependency array

**Effort**: Low | **Impact**: Low

---

## Phase 3: Memoization & Rendering (P2)

### 3.1 Add Missing useMemo for Object Operations
**Files**:
- `src/components/ShipSelection/ShipSelection.tsx` (line 117): `Object.keys(shipTypes)`
- `src/hooks/useTechTree/useTechTree.tsx` (255-275): colors/groups/activeGroups building

**Impact**: Small objects recreated, but affects downstream comparisons  
**Solution**:
- Wrap in `useMemo` with appropriate dependencies
- Memoize before passing to context/store

**Effort**: Low | **Impact**: Low-Medium

---

### 3.2 Fix O(n²) Dependency Mapping in ModuleGroup
**Files**: `src/components/ModuleSelectionDialog/ModuleGroup.tsx`  
**Issue**: Lines 93-107 map modules, each calls `.find()` on dependency map

**Impact**: Creates multiple lookups per render  
**Solution**:
- Pre-build dependency lookup Map during sort
- Single pass to map dependencies

**Effort**: Medium | **Impact**: Medium

---

### 3.3 Optimize useTechModuleManagement Loop
**Files**: `src/components/TechTreeRow/useTechModuleManagement.ts`  
**Issue**: Inner loop in useMemo (lines 73-87) with conditional logic

**Impact**: Complex grouping calculation  
**Solution**:
- Profile to confirm bottleneck
- Consider reducing grouping logic complexity

**Effort**: Medium | **Impact**: Low-Medium (needs profiling)

---

## Phase 4: Component Memoization (P2)

### 4.1 Memoize GridTableButtons
**Files**: `src/components/GridTableButtons/GridTableButtons.tsx`

**Impact**: Medium (renders frequently)  
**Solution**:
- Wrap with `React.memo`
- Use `useCallback` for event handlers

**Effort**: Low | **Impact**: Low-Medium

---

### 4.2 Review GridCell Memoization Overhead
**Files**: `src/components/GridCell/GridCell.tsx`  
**Issue**: Heavy memoization with extensive dependency array (lines 118-188)

**Impact**: Memoization overhead might exceed benefit  
**Solution**:
- Measure before/after with React DevTools Profiler
- Consider splitting into smaller components
- Reduce dependency array if possible

**Effort**: High | **Impact**: Uncertain (profile first)

---

## Phase 5: Inline Objects & Styling (P3)

### 5.1 Fix Inline Style Objects
**Files**: `src/components/TechTree/TechTree.tsx` (lines 73-75)

**Impact**: Minor (static styles)  
**Solution**:
- Extract to constants outside component

**Effort**: Low | **Impact**: Low

---

## Implementation Order

1. **Week 1** (P0 - High Impact, Quick Wins):
   - 1.1: GridStore O(n²) fixes
   - 1.2: useTechTree N+1 batching
   - 1.3: GridRow array memoization

2. **Week 2** (P1 - Dependencies):
   - 2.1: useTechTree effect consolidation
   - 2.2: useOptimize callback wrap

3. **Week 3** (P2 - Memoization):
   - 3.1: Missing useMemo additions
   - 3.2: ModuleGroup O(n²) fix
   - 4.1: GridTableButtons memoization

4. **Week 4** (P2/P3 - Polish):
   - 3.3: useTechModuleManagement profiling
   - 4.2: GridCell profile & optimize
   - 5.1: Inline styles cleanup

---

## Testing Strategy

- Use React DevTools Profiler before/after each phase
- Test with large grids (100+ cells)
- Measure render times and component commit counts
- E2E tests for interaction responsiveness
- Monitor bundle size (ensure memoization doesn't bloat code)

---

## Success Criteria

- Grid render time reduced by 30-50%
- Tech tree initialization faster by 20%+
- No unnecessary re-renders on interaction
- Smooth scrolling and interactions maintained
