// One wall-clock timeline for the portrait, walk-back and panel entrance.
export const OPENING = { retreatAt: 1250, tourAt: 2000, panelMs: 380, staggerMs: 24 };

export function openingBounce(elapsed, reduced = false) {
  if (reduced) return { y: 0, scaleY: 1, scaleXZ: 1 };
  const ms = Math.max(0, elapsed);
  let y = 0;
  let stretch = 0;
  if (ms < 620) {
    const t = ms / 620;
    // Ballistic rise from below the frame, overshoot, then land.
    y = -2.4 + 7.2 * t - 4.8 * t * t;
    stretch = Math.sin(Math.PI * t) * .06;
  }
  // One landing compression only: no second lift or rebound.
  const landing = (ms - 620) / 130;
  const squash = landing >= 0 && landing <= 1 ? Math.sin(Math.PI * landing) * .1 : 0;
  const scaleY = 1 + stretch - squash;
  return { y, scaleY, scaleXZ: 1 / Math.sqrt(scaleY) };
}
