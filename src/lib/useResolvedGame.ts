import { useEffect, useState } from 'react';
import { resolveGame, type Game } from '@/data';

/** setTimeout tops out at ~24.8 days; clamp and re-arm for a launch further out. */
const MAX_DELAY = 2_147_483_000;

/**
 * A game with its launch overrides applied once `releaseAt` passes on the
 * visitor's own clock. It also schedules a re-render at the exact launch moment,
 * so a page left open across it flips to "out now" without a reload. Games with
 * no `releaseAt` are returned unchanged and schedule nothing.
 */
export function useResolvedGame(game: Game): Game {
  // `now` only advances when the launch passes; that's all resolveGame needs.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!game.releaseAt) return;
    const at = Date.parse(game.releaseAt);
    if (!Number.isFinite(at)) return;
    let id: number | undefined;
    const tick = () => {
      const remaining = at - Date.now();
      if (remaining <= 0) {
        setNow(Date.now()); // launched — resolve to the released state
        return;
      }
      id = window.setTimeout(tick, Math.min(remaining, MAX_DELAY));
    };
    tick();
    return () => window.clearTimeout(id);
  }, [game.releaseAt]);

  return resolveGame(game, now);
}
