import { Camera, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthShell } from '../components/AuthShell';
import { UserAvatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Fields';
import { useAuth } from '../context/AuthContext';
import { toApiError } from '../services/api';
import { resizeImage } from '../utils/image';

type Values = { name: string; username: string; email: string; password: string; confirmPassword: string };

function validate(v: Values) {
  const e: Partial<Record<keyof Values, string>> = {};
  if (v.name.trim().length < 2) e.name = 'Enter your full name';
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(v.username)) e.username = 'Use 3-24 letters, numbers or underscores';
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Enter a valid email address';
  if (v.password.length < 8 || !/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) e.password = 'Use 8+ characters with a letter and a number';
  if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match';
  return e;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Values>({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const preview = useMemo(() => (avatar ? URL.createObjectURL(avatar) : null), [avatar]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const set = (key: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const pickAvatar = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return void toast.error('Choose an image file.');
    setAvatar(await resizeImage(file, 640));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await register({ ...values, name: values.name.trim(), username: values.username.trim().toLowerCase(), email: values.email.trim() }, avatar);
      toast.success('Account created. Welcome to TaskFlow!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiErr = toApiError(err);
      if (apiErr.fields) setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v?.[0]])));
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organizing your work in a minute."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-neon-orange hover:underline">Login</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="group relative rounded-full" aria-label="Choose profile image">
            <UserAvatar user={{ name: values.name || 'You', profileImage: preview }} size={64} />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Camera className="h-5 w-5" /></span>
          </button>
          <div className="text-sm">
            <p className="font-medium text-zinc-200">Profile image <span className="font-normal text-zinc-500">(optional)</span></p>
            {avatar ? (
              <button type="button" onClick={() => setAvatar(null)} className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"><X className="h-3 w-3" /> Remove</button>
            ) : (
              <p className="mt-0.5 text-xs text-zinc-500">JPG, PNG or WebP</p>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void pickAvatar(e.target.files?.[0])} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
          <Input label="Username" autoComplete="username" value={values.username} onChange={set('username')} error={errors.username} />
        </div>
        <Input label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
        <PasswordInput label="Password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} hint="At least 8 characters, with a letter and a number." />
        <PasswordInput label="Confirm password" autoComplete="new-password" value={values.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        <Button type="submit" loading={loading} className="w-full py-3">Create account</Button>
      </form>
    </AuthShell>
  );
}
