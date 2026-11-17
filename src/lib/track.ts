/**
 * Analytics hook. Intentionally a no-op: the site has no analytics (brief section 3).
 * A future, approved adapter can replace this implementation without touching call sites.
 */
export type TrackEvent = { name: string; props?: Record<string, string | number | boolean> };
export function track(_event: TrackEvent): void {
  // no-op by design
}
