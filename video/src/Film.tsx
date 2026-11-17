import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/fonts';
import timeline from './timeline.json';

for (const [family, file, weight] of [
  ['Frank Ruhl Libre', 'frank-ruhl-libre-hebrew-900-normal.woff2', '900'],
  ['Frank Ruhl Libre', 'frank-ruhl-libre-latin-900-normal.woff2', '900'],
  ['Heebo', 'heebo-hebrew-wght-normal.woff2', '100 900'],
  ['Heebo', 'heebo-latin-wght-normal.woff2', '100 900'],
] as const) {
  void loadFont({ family, url: staticFile(`fonts/${file}`), weight });
}

const C = {
  paper: '#f6f3ec',
  paper2: '#eee9dd',
  ink: '#14161a',
  ink2: '#3b4048',
  line: '#ddd6c6',
  signal: '#2b3cff',
  blue: '#bcdcf7',
  mint: '#cdeedd',
  teal: '#0f6d62',
  copper: '#b8651b',
};
const DISPLAY = "'Frank Ruhl Libre', serif";
const SANS = "'Heebo', sans-serif";

type Scene = (typeof timeline.scenes)[number];
const scene = (id: string) => timeline.scenes.find((s) => s.id === id)!;

function useEnter(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.7 } });
}

function Rise({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useEnter(delay);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style }}>{children}</div>
  );
}

function Tile({ label, bg, fg = C.ink }: { label: string; bg: string; fg?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: bg,
        color: fg,
        padding: '10px 26px',
        borderRadius: 18,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 40,
        direction: 'ltr',
      }}
    >
      {label}
    </span>
  );
}

/** Rounded "screen" with a clip from the official channel, slowed to fill its slot if needed. */
function ClipFrame({ src, slot, clipSeconds }: { src: string; slot: number; clipSeconds: number }) {
  const { fps } = useVideoConfig();
  const rate = Math.max(0.55, Math.min(1, clipSeconds / (slot / fps)));
  const p = useEnter(0);
  return (
    <div
      style={{
        width: 1100,
        height: 619,
        borderRadius: 32,
        overflow: 'hidden',
        background: C.ink,
        boxShadow: '0 50px 90px -40px rgba(20,22,26,0.6)',
        border: `1px solid ${C.line}`,
        transform: `scale(${0.94 + p * 0.06})`,
        opacity: p,
      }}
    >
      <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

function Credit({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        top: 90,
        fontFamily: SANS,
        fontSize: 22,
        fontWeight: 500,
        color: C.ink2,
        direction: 'rtl',
        background: 'rgba(255,253,248,0.85)',
        padding: '6px 16px',
        borderRadius: 999,
      }}
    >
      {text}
    </div>
  );
}

function Captions({ s }: { s: Scene }) {
  const frame = useCurrentFrame() + s.start;
  const cap = s.captions.find((c) => frame >= c.from && frame < c.to + 8);
  if (!cap) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          direction: 'rtl',
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.35,
          color: C.paper,
          background: 'rgba(20,22,26,0.82)',
          padding: '12px 30px',
          borderRadius: 18,
        }}
      >
        {cap.text}
      </div>
    </div>
  );
}

function Stage({ s, children, credit }: { s: Scene; children: ReactNode; credit?: string }) {
  return (
    <AbsoluteFill style={{ background: C.paper, direction: 'rtl' }}>
      {children}
      {credit && <Credit text={credit} />}
      <Captions s={s} />
    </AbsoluteFill>
  );
}

const YT = 'קטעים: ערוץ Google Workspace ב-YouTube';

function Title({ tile, children }: { tile: ReactNode; children: ReactNode }) {
  return (
    <Rise style={{ position: 'absolute', top: 70, right: 110, left: 110, display: 'flex', alignItems: 'center', gap: 28 }}>
      {tile}
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: C.ink }}>{children}</div>
    </Rise>
  );
}

function S1({ s }: { s: Scene }) {
  const frame = useCurrentFrame();
  const len = s.end - s.start;
  const zoom = interpolate(frame, [0, len], [1.04, 1.14]);
  const words = ['נהלים', 'פסקי דין', 'טיוטות', 'הערות', 'פרוטוקולים', 'תזכירים'];
  return (
    <Stage s={s}>
      <Img
        src={staticFile('art/hero.jpg')}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }}
      />
      <AbsoluteFill style={{ background: 'linear-gradient(270deg, rgba(246,243,236,0.95) 0%, rgba(246,243,236,0.75) 45%, rgba(246,243,236,0) 80%)' }} />
      <div style={{ position: 'absolute', top: 150, right: 120, display: 'flex', flexWrap: 'wrap', gap: 18, maxWidth: 900 }}>
        {words.map((w, i) => (
          <Rise key={w} delay={6 + i * 9}>
            <span style={{ display: 'inline-block', fontFamily: SANS, fontWeight: 700, fontSize: 46, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 999, padding: '10px 30px', transform: `rotate(${(i % 2 ? 1 : -1) * 2}deg)` }}>
              {w}
            </span>
          </Rise>
        ))}
      </div>
      <Rise delay={Math.round(len * 0.55)} style={{ position: 'absolute', top: 470, right: 120, maxWidth: 1000 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, lineHeight: 1.05, color: C.ink }}>
          יותר מדי חומר.
          <br />
          <span style={{ color: C.signal }}>מעט מדי זמן.</span>
        </div>
      </Rise>
    </Stage>
  );
}

function Clips({ s, items }: { s: Scene; items: { src: string; secs: number }[] }) {
  const len = s.end - s.start;
  const slot = Math.floor(len / items.length);
  return (
    <>
      {items.map((it, i) => (
        <Sequence key={it.src} from={i * slot} durationInFrames={i === items.length - 1 ? len - i * slot : slot}>
          <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', paddingTop: 185 }}>
            <ClipFrame src={it.src} slot={slot} clipSeconds={it.secs} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </>
  );
}

function S2({ s }: { s: Scene }) {
  return (
    <Stage s={s} credit={YT}>
      <Clips s={s} items={[{ src: 'clips/docs-summary.mp4', secs: 5 }, { src: 'clips/docs-plain.mp4', secs: 6 }]} />
      <Title tile={<Tile label="Gemini" bg={C.blue} />}>עוזר להתחיל</Title>
    </Stage>
  );
}

function S3({ s }: { s: Scene }) {
  return (
    <Stage s={s} credit={YT}>
      <Clips s={s} items={[{ src: 'clips/notebook.mp4', secs: 8.3 }]} />
      <Title tile={<Tile label="Gemini Notebook" bg={C.mint} />}>תשובה עם הפניה למקור</Title>
    </Stage>
  );
}

function S4({ s }: { s: Scene }) {
  return (
    <Stage s={s} credit={YT}>
      <Clips s={s} items={[{ src: 'clips/gmail.mp4', secs: 7 }, { src: 'clips/sheets.mp4', secs: 4.8 }]} />
      <Title tile={<Tile label="Workspace" bg={C.teal} fg={C.paper} />}>בתוך הכלים המוכרים</Title>
    </Stage>
  );
}

function S5({ s }: { s: Scene }) {
  const len = s.end - s.start;
  const rules = [
    ['1', 'עובדים בחשבון הארגוני', C.teal, C.paper],
    ['2', 'בודקים כל תשובה מול המקור', C.mint, C.ink],
    ['3', 'כשיש ספק, מתייעצים', C.blue, C.ink],
  ];
  return (
    <Stage s={s}>
      <Rise style={{ position: 'absolute', top: 80, right: 120, fontFamily: DISPLAY, fontWeight: 900, fontSize: 84 }}>
        שלושה כללים
      </Rise>
      <div style={{ position: 'absolute', top: 260, right: 120, left: 120, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36 }}>
        {rules.map(([n, text, bg, fg], i) => (
          <Rise key={n} delay={Math.round((len * (0.18 + i * 0.22)))}>
            <div style={{ background: bg, color: fg, borderRadius: 40, padding: '40px 44px', height: 420, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 120, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 54, lineHeight: 1.15 }}>{text}</div>
            </div>
          </Rise>
        ))}
      </div>
    </Stage>
  );
}

function S6({ s }: { s: Scene }) {
  return (
    <Stage s={s}>
      <Img src={staticFile('art/hero.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <AbsoluteFill style={{ background: 'rgba(246,243,236,0.88)' }} />
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 120 }}>
        <Rise delay={4}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, textAlign: 'center', lineHeight: 1.1, maxWidth: 1700 }}>
            גלו איפה <span style={{ color: C.signal }}>Gemini</span> יכול לעזור בעבודה שלכם
          </div>
        </Rise>
        <Rise delay={18}>
          <div style={{ fontFamily: SANS, fontSize: 30, color: C.ink2, textAlign: 'center' }}>
            קריינות: הקול של אריאל נבו, משובט בבינה מלאכותית · קטעי מוצר: ערוץ Google Workspace ב-YouTube
          </div>
        </Rise>
      </AbsoluteFill>
    </Stage>
  );
}

const SCENES: Record<string, (p: { s: Scene }) => ReactNode> = { P1: S1, P2: S2, P3: S3, P4: S4, P5: S5, P6: S6 };

export function Film() {
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {timeline.scenes.map((s) => {
        const Comp = SCENES[s.id]!;
        return (
          <Sequence key={s.id} from={s.start} durationInFrames={s.end - s.start}>
            <Comp s={s} />
          </Sequence>
        );
      })}
      {timeline.scenes.map((s) => (
        <Sequence key={`a-${s.id}`} from={s.audioFrom} durationInFrames={s.audioDur + 2}>
          <Audio src={staticFile(`audio/${s.id}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

export { scene };
