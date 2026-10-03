import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useId, useState } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

function Wrapper({ id, label, error, hint, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, error, hint, className, id, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Wrapper id={fid} label={label} error={error} hint={hint}>
      <input id={fid} aria-invalid={!!error} className={clsx('input', error && 'border-red-500/60', className)} {...rest} />
    </Wrapper>
  );
}

export function PasswordInput({ label, error, hint, className, id, ...rest }: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const uid = useId();
  const fid = id ?? uid;
  const [show, setShow] = useState(false);
  return (
    <Wrapper id={fid} label={label} error={error} hint={hint}>
      <div className="relative">
        <input id={fid} type={show ? 'text' : 'password'} aria-invalid={!!error} className={clsx('input pr-11', error && 'border-red-500/60', className)} {...rest} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500 hover:text-zinc-200"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Wrapper>
  );
}

export function Textarea({ label, error, hint, className, id, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Wrapper id={fid} label={label} error={error} hint={hint}>
      <textarea id={fid} aria-invalid={!!error} className={clsx('input min-h-[104px] resize-y', error && 'border-red-500/60', className)} {...rest} />
    </Wrapper>
  );
}

export function Select({ label, error, hint, className, id, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const uid = useId();
  const fid = id ?? uid;
  return (
    <Wrapper id={fid} label={label} error={error} hint={hint}>
      <select id={fid} className={clsx('input [&>option]:bg-zinc-900', className)} {...rest}>
        {children}
      </select>
    </Wrapper>
  );
}
