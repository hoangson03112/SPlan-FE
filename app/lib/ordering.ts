/**
 * Fractional ordering: placing an item between two neighbors only requires
 * recomputing that one item's own order value (the midpoint), instead of
 * reindexing every sibling. Good enough for drag-and-drop at this scale.
 */
export function midpointOrder(prev?: number, next?: number): number {
  if (prev === undefined && next === undefined) return 0;
  if (prev === undefined) return next! - 1;
  if (next === undefined) return prev + 1;
  return (prev + next) / 2;
}
