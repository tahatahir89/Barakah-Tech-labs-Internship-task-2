import { Download, LogOut } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/Fields';
import { useAuth } from '../context/AuthContext';
import { toApiError } from '../services/api';
import { userService } from '../services/authService';
import { downloadTaskTemplate } from '../utils/template';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.currentPassword) next.currentPassword = 'Enter your current password';
    if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) next.newPassword = 'Use 8+ characters with a letter and a number';
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await userService.changePassword(form);
      toast.success('Password updated successfully');
      setForm(EMPTY);
    } catch (err) {
      const apiErr = toApiError(err);
      if (apiErr.fields) setErrors(Object.fromEntries(Object.entries(apiErr.fields).map(([k, v]) => [k, v?.[0]])));
      toast.error(apiErr.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Settings</h1>

      <section className="glass p-5 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-white">Change password</h2>
        <p className="mt-1 text-sm text-zinc-500">You'll stay logged in on this device.</p>
        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <PasswordInput label="Current password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} error={errors.currentPassword} />
          <PasswordInput label="New password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} error={errors.newPassword} hint="At least 8 characters, with a letter and a number." />
          <PasswordInput label="Confirm new password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} />
          <div className="flex justify-end"><Button type="submit" loading={saving}>Update password</Button></div>
        </form>
      </section>

      <section className="glass flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Task template</h2>
          <p className="mt-1 text-sm text-zinc-500">A printable PDF for planning tasks offline.</p>
        </div>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => void downloadTaskTemplate()}>Download template</Button>
      </section>

      <section className="glass flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Session</h2>
          <p className="mt-1 text-sm text-zinc-500">Logging out clears your session cookie on this device.</p>
        </div>
        <Button variant="danger" icon={<LogOut className="h-4 w-4" />} onClick={async () => { await logout(); toast.success('Logged out successfully'); navigate('/login'); }}>Logout</Button>
      </section>
    </div>
  );
}
