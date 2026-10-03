import { Toaster } from 'sonner';

export const AppToaster = () => (
  <Toaster
    theme="dark"
    position="top-right"
    toastOptions={{ style: { background: '#130b09', border: '1px solid rgba(255,122,26,0.28)', color: '#f4f4f5' } }}
  />
);

export { toast } from 'sonner';
