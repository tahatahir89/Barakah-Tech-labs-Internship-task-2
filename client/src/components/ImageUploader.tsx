import { ImagePlus, Trash2 } from 'lucide-react';
import { DragEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Attachment } from '../types';
import { resizeImage } from '../utils/image';
import { LoadingSpinner } from './ui/States';
import { Modal } from './ui/Modal';

interface Props {
  attachments: Attachment[];
  onUpload: (file: File) => Promise<unknown>;
  onRemove: (id: string) => void;
  maxFiles?: number;
}

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({ attachments, onUpload, onRemove, maxFiles = 8 }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);

  const handle = async (list: FileList | File[]) => {
    const files = Array.from(list);
    const room = maxFiles - attachments.length;
    if (room <= 0) return void toast.error(`A task can have up to ${maxFiles} images.`);
    setBusy(true);
    try {
      for (const file of files.slice(0, room)) {
        if (!TYPES.includes(file.type)) {
          toast.error(`${file.name}: only JPG, PNG, WebP or GIF images are supported.`);
          continue;
        }
        const ready = await resizeImage(file);
        if (ready.size > 4 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 4 MB).`);
          continue;
        }
        await onUpload(ready).catch(() => undefined); // the mutation already shows its own error toast
      }
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const drop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) void handle(e.dataTransfer.files);
  };

  return (
    <div>
      {attachments.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {attachments.map((a) => (
            <li key={a.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <button onClick={() => setPreview(a)} className="h-full w-full" aria-label={`Preview ${a.name ?? 'image'}`}>
                <img src={a.url} alt={a.name ?? 'Task attachment'} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              </button>
              <button
                onClick={() => onRemove(a.id)}
                aria-label="Remove image"
                className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-red-300 opacity-100 transition hover:bg-red-500/30 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={`flex flex-col items-center rounded-xl border border-dashed px-4 py-8 text-center transition ${dragging ? 'border-neon-orange bg-neon-orange/5' : 'border-white/15'}`}
      >
        {busy ? <LoadingSpinner className="h-6 w-6" /> : <ImagePlus className="h-6 w-6 text-neon-orange" />}
        <p className="mt-3 text-sm text-zinc-300">{busy ? 'Uploading...' : 'Drag images here or choose files'}</p>
        <p className="mt-1 text-xs text-zinc-500">JPG, PNG, WebP or GIF. Large photos are resized automatically. {attachments.length}/{maxFiles} used.</p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-outline mt-4">Choose images</button>
        <input ref={input} type="file" accept={TYPES.join(',')} multiple hidden onChange={(e) => e.target.files && void handle(e.target.files)} />
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? 'Image preview'} size="lg">
        {preview && <img src={preview.url} alt={preview.name ?? 'Attachment preview'} className="max-h-[70vh] w-full rounded-lg object-contain" />}
      </Modal>
    </div>
  );
}
