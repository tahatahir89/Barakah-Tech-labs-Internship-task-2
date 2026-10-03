import { useQuery } from '@tanstack/react-query';
import { Camera, LogOut, Trash2 } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserAvatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Fields';
import { ErrorState, LoadingSpinner } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { toApiError } from '../services/api';
import { userService } from '../services/authService';
import { formatDate, timeAgo } from '../utils/format';
import { resizeImage } from '../utils/image';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const profile = useQuery({ queryKey: ['profile'], queryFn: userService.profile });
  const [form, setForm] = useState({ name: user?.name ?? '', username: user?.username ?? '', email: user?.email ?? '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  if (!user) return null;
  if (profile.isError) return <ErrorState message={toApiError(profile.error).message} onRetry={() => profile.refetch()} />;
  const me = profile.data?.user ?? user;
  const stats = profile.data?.stats;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(form.username)) next.username = 'Use 3-24 letters, numbers or underscores';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      setUser(await userService.update({ name: form.name.trim(), username: form.username.trim().toLowerCase(), email: form.email.trim() }));
      toast.success('Profile updated successfully');
      void profile.refetch();
    } catch (err) {
      const apiErr = toApiError(err);
      if (apiErr.fields) setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v?.[0]])));
      toast.error(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  const changeImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return void toast.error('Choose an image file.');
    setImageBusy(true);
    try {
      setUser(await userService.uploadAvatar(await resizeImage(file, 640)));
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setImageBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = async () => {
    setImageBusy(true);
    try {
      setUser(await userService.removeAvatar());
      toast.success('Image removed');
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setImageBusy(false);
    }
  };

  const onLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const cards: [string, string][] = [
    ['Account created', formatDate(me.createdAt, true)],
    ['Total tasks', stats ? String(stats.total) : '-'],
    ['Completed tasks', stats ? String(stats.completed) : '-'],
    ['Pending tasks', stats ? String(stats.pending) : '-'],
    ['Current status', me.status === 'active' ? 'Active' : 'Offline'],
    ['Last active', me.status === 'active' ? 'Just now' : timeAgo(me.lastActive)],
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="glass flex flex-wrap items-center gap-5 p-5 sm:p-7">
        <button onClick={() => fileRef.current?.click()} disabled={imageBusy} className="group relative rounded-full" aria-label="Change profile image">
          <UserAvatar user={me} size={88} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {imageBusy ? <LoadingSpinner /> : <Camera className="h-5 w-5" />}
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void changeImage(e.target.files?.[0])} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold text-white">{me.name}</h1>
          <p className="text-sm text-zinc-500">@{me.username}</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-300">
            <span className={`h-2.5 w-2.5 rounded-full ${me.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-zinc-500'}`} />
            {me.status === 'active' ? 'Active' : `Offline - last active ${timeAgo(me.lastActive)}`}
          </p>
        </div>
        <div className="flex gap-2">
          {me.profileImage && <Button variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={removeImage} disabled={imageBusy}>Remove image</Button>}
          <Button variant="danger" icon={<LogOut className="h-4 w-4" />} onClick={onLogout} className="lg:hidden">Logout</Button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Account overview">
        {cards.map(([label, value]) => (
          <div key={label} className="glass p-4">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1.5 font-display text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="glass p-5 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-white">Account details</h2>
        <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={errors.username} />
          <div className="sm:col-span-2"><Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} /></div>
          <div className="flex justify-end sm:col-span-2"><Button type="submit" loading={saving}>Save changes</Button></div>
        </form>
      </section>
    </div>
  );
}
