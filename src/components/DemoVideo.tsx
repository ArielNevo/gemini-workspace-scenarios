import { useEffect, useRef } from 'react';

/** Silent screen recording of the site itself. Autoplays only when the user has not asked for reduced motion. */
export function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const base = import.meta.env.BASE_URL;
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) void v.play().catch(() => undefined);
  }, []);
  return (
    <figure className="demo-video">
      <video
        ref={ref}
        muted
        loop
        playsInline
        controls
        preload="metadata"
        poster={`${base}media/quick-path-poster.jpg`}
        aria-describedby="demo-video-desc"
      >
        <source src={`${base}media/quick-path.webm`} type="video/webm" />
      </video>
      <figcaption id="demo-video-desc">
        הקלטה של האתר עצמו, בלי קול: בוחרים יחידה ונושא, מקבלים שלושה שימושים, ופותחים הדגמה שמדגישה מה השתנה
        בנוהל מדומה.
      </figcaption>
    </figure>
  );
}
