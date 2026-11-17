import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../lib/content';
import { Sparkle } from './Illustrations';

const MEDIA = `${import.meta.env.BASE_URL}media/`;
const GREETING = 'היי, אני אריאל. רוצים שאסביר בדקה איך מוצאים כאן את השימושים שמתאימים לכם?';
const OUTRO = 'זהו. בחרו יחידה ונושא, או עיינו בכל השימושים.';

/**
 * Transparent talking clip: encoded as a vertical stack (colour on top, alpha matte below) in plain
 * H.264 and composited onto a canvas, so it works in every browser. Same technique as the ROI Simulator.
 */
function useStackedAlpha(
  video: React.RefObject<HTMLVideoElement | null>,
  canvas: React.RefObject<HTMLCanvasElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const v = video.current;
    const c = canvas.current;
    if (!v || !c || !active) return;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const tmp = document.createElement('canvas');
    const tctx = tmp.getContext('2d', { willReadFrequently: true });
    if (!ctx || !tctx) return;
    let raf = 0;
    const draw = () => {
      const w = v.videoWidth;
      const h = v.videoHeight / 2;
      if (w && h) {
        if (c.width !== w || c.height !== h) {
          c.width = w;
          c.height = h;
          tmp.width = w;
          tmp.height = h * 2;
        }
        tctx.drawImage(v, 0, 0);
        const color = tctx.getImageData(0, 0, w, h);
        const mask = tctx.getImageData(0, h, w, h).data;
        const px = color.data;
        for (let i = 0, j = 3; i < mask.length; i += 4, j += 4) px[j] = mask[i]!;
        ctx.putImageData(color, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [video, canvas, active]);
}

/** Ariel's AI avatar greets the visitor and points to the quick path. Local media only, labelled as AI. */
export function Presenter({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle');
  const [cue, setCue] = useState('');
  const [progress, setProgress] = useState(0);
  const [noVideo, setNoVideo] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const track = v.textTracks[0];
    const onCue = () => {
      const c = track?.activeCues?.[0] as VTTCue | undefined;
      if (c) setCue(c.text);
    };
    const onTime = () => setProgress(v.duration ? v.currentTime / v.duration : 0);
    const onEnd = () => {
      setState('done');
      setProgress(0);
    };
    const onErr = () => setNoVideo(true);
    if (track) {
      track.mode = 'hidden';
      track.addEventListener('cuechange', onCue);
    }
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnd);
    v.addEventListener('error', onErr, true);
    return () => {
      track?.removeEventListener('cuechange', onCue);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnd);
      v.removeEventListener('error', onErr, true);
    };
  }, []);

  useStackedAlpha(ref, canvasRef, state === 'playing');

  const play = () => {
    const v = ref.current;
    if (!v || noVideo) return;
    v.muted = false;
    v.currentTime = 0;
    v.play()
      .then(() => setState('playing'))
      .catch(() => setNoVideo(true));
  };
  const stop = () => {
    const v = ref.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setState('idle');
    setCue('');
  };

  const bubble = state === 'idle' ? GREETING : state === 'playing' ? cue || '…' : OUTRO;

  return (
    <div className="presenter">
      <div className="bubble" aria-live="polite">
        <div className="bubble-head">
          <span className="mono-label">{siteConfig.consult.name || 'אריאל נבו'}</span>
          <span className="ai-label">
            <Sparkle /> אווטאר וקול שנוצרו ב-AI
          </span>
        </div>
        <p className="bubble-text">{bubble}</p>
        {state === 'playing' && (
          <div className="bubble-progress" aria-hidden="true">
            <progress max={1} value={progress} />
          </div>
        )}
        <div className="bubble-actions">
          {state === 'idle' && (
            <>
              {!noVideo && (
                <button type="button" className="pill pill-dark" onClick={play}>
                  ▷ כן, ספר לי
                </button>
              )}
              <button type="button" className="pill" onClick={onStart}>
                {noVideo ? 'בואו נתחיל' : 'לא, אתחיל לבד'}
              </button>
            </>
          )}
          {state === 'playing' && (
            <button type="button" className="pill pill-small" onClick={stop}>
              ❚❚ עצור
            </button>
          )}
          {state === 'done' && (
            <>
              <button type="button" className="pill pill-dark" onClick={onStart}>
                לבחירת יחידה ונושא
              </button>
              <Link to="/catalog" className="pill">
                לכל השימושים
              </Link>
              <button type="button" className="pill pill-small" onClick={play}>
                ▷ שוב
              </button>
            </>
          )}
        </div>
      </div>
      <div className="figure" aria-hidden="true">
        <img
          src={`${MEDIA}avatar-poster.png`}
          alt=""
          className={state === 'playing' ? 'is-hidden' : 'breathe'}
        />
        <canvas ref={canvasRef} className={state === 'playing' ? '' : 'is-hidden'} />
        <video ref={ref} playsInline preload="none" className="visually-hidden" tabIndex={-1}>
          <source src={`${MEDIA}avatar-greet-stacked.mp4`} type="video/mp4" />
          <track kind="captions" srcLang="he" label="עברית" src={`${MEDIA}avatar-greet.he.vtt`} default />
        </video>
        <div className="figure-shadow" />
      </div>
    </div>
  );
}
