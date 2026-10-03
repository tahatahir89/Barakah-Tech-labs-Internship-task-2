import clsx from 'clsx';
import { Eraser, PenTool, Pencil, Redo2, Save, Trash2, Undo2 } from 'lucide-react';
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Drawing, Stroke } from '../types';
import { Button } from './ui/Button';

const W = 1000;
const H = 600;
const MAX_STROKES = 400;
const MAX_POINTS = 3000;
const COLORS = ['#fafafa', '#ff7a1a', '#ff2e3a', '#ffb020', '#38bdf8', '#4ade80'];
type Tool = Stroke['tool'];

function paint(ctx: CanvasRenderingContext2D, s: Stroke) {
  const p = s.points;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.globalAlpha = s.tool === 'pencil' ? 0.8 : 1;
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.tool === 'eraser' ? s.size * 4 : s.size;
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  if (p.length === 1) {
    ctx.lineTo(p[0][0] + 0.01, p[0][1]);
  } else if (s.tool === 'pen') {
    // Pen smooths the path through midpoints; pencil keeps the raw, slightly rougher line.
    for (let i = 1; i < p.length - 1; i++) {
      ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
    }
    ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
  } else {
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
  }
  ctx.stroke();
  ctx.restore();
}

interface Props { initial?: Drawing | null; onSave: (drawing: Drawing) => void; saving?: boolean }

export function DrawingCanvas({ initial, onSave, saving }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef<Stroke | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>(initial?.strokes ?? []);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(3);
  const [dirty, setDirty] = useState(false);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, W, H);
    strokes.forEach((s) => paint(ctx, s));
    if (live.current) paint(ctx, live.current);
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const point = (e: ReactPointerEvent<HTMLCanvasElement>): [number, number] => {
    const r = e.currentTarget.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) * W) / r.width * 10) / 10, Math.round(((e.clientY - r.top) * H) / r.height * 10) / 10];
  };

  const down = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (strokes.length >= MAX_STROKES) return void toast.error('This drawing is full. Clear or undo some strokes to keep going.');
    e.currentTarget.setPointerCapture(e.pointerId);
    live.current = { tool, color, size, points: [point(e)] };
    redraw();
  };
  const move = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = live.current;
    if (!s || s.points.length >= MAX_POINTS) return;
    const [x, y] = point(e);
    const last = s.points[s.points.length - 1];
    if (Math.hypot(x - last[0], y - last[1]) < 1.5) return;
    s.points.push([x, y]);
    redraw();
  };
  const up = () => {
    const s = live.current;
    if (!s) return;
    live.current = null;
    setStrokes((prev) => [...prev, s]);
    setRedoStack([]);
    setDirty(true);
  };

  const undo = () => {
    if (!strokes.length) return;
    setRedoStack((r) => [...r, strokes[strokes.length - 1]]);
    setStrokes(strokes.slice(0, -1));
    setDirty(true);
  };
  const redo = () => {
    if (!redoStack.length) return;
    setStrokes([...strokes, redoStack[redoStack.length - 1]]);
    setRedoStack(redoStack.slice(0, -1));
    setDirty(true);
  };
  const clear = () => {
    if (!strokes.length) return;
    setStrokes([]);
    setRedoStack([]);
    setDirty(true);
  };

  const toolBtn = (t: Tool, label: string, Icon: typeof Pencil) => (
    <button
      type="button"
      onClick={() => setTool(t)}
      aria-pressed={tool === t}
      className={clsx('inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition', tool === t ? 'bg-neon-orange/15 text-neon-orange ring-1 ring-neon-orange/40' : 'text-zinc-300 hover:bg-white/[0.07]')}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">{toolBtn('pencil', 'Pencil', Pencil)}{toolBtn('pen', 'Pen', PenTool)}{toolBtn('eraser', 'Eraser', Eraser)}</div>
        <div className="flex items-center gap-1.5" role="group" aria-label="Colour">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              aria-pressed={color === c && tool !== 'eraser'}
              onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
              className={clsx('h-6 w-6 rounded-full border transition', color === c && tool !== 'eraser' ? 'scale-110 border-white' : 'border-white/20')}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          Size
          <input type="range" min={1} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-[#ff7a1a]" />
        </label>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" onClick={undo} disabled={!strokes.length} icon={<Undo2 className="h-4 w-4" />} aria-label="Undo" title="Undo" />
          <Button variant="ghost" onClick={redo} disabled={!redoStack.length} icon={<Redo2 className="h-4 w-4" />} aria-label="Redo" title="Redo" />
          <Button variant="ghost" onClick={clear} disabled={!strokes.length} icon={<Trash2 className="h-4 w-4" />}>Clear</Button>
          <Button onClick={() => { onSave({ width: W, height: H, strokes }); setDirty(false); }} disabled={!dirty} loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        aria-label="Drawing board"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="aspect-[5/3] w-full touch-none cursor-crosshair rounded-xl border border-white/10 bg-black/40"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
    </div>
  );
}
