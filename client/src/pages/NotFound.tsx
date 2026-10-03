import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Logo size={72} wordmark={false} />
      <h1 className="mt-6 font-display text-4xl font-bold text-white">Page not found</h1>
      <p className="mt-2 max-w-sm text-zinc-400">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
