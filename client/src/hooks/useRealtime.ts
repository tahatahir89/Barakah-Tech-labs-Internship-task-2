import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';
import { useEffect } from 'react';
import { userService } from '../services/authService';

const API = import.meta.env.VITE_API_URL || '/api';

/** Live sync: when any of the user's tabs/devices changes a task, refetch here. No-ops without Pusher keys. */
export function useRealtime(userId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const key = import.meta.env.VITE_PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER;
    if (!userId || !key || !cluster) return;

    const pusher = new Pusher(key, { cluster, channelAuthorization: { endpoint: `${API}/realtime/auth`, transport: 'ajax' } });
    const name = `private-user-${userId}`;
    const channel = pusher.subscribe(name);
    channel.bind('task:changed', () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(name);
      pusher.disconnect();
    };
  }, [userId, qc]);
}

/** Tells the server the user is still here, at most once every two minutes and only after real interaction. */
export function useHeartbeat(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let last = Date.now();
    const ping = () => {
      if (document.visibilityState === 'hidden' || Date.now() - last < 120_000) return;
      last = Date.now();
      userService.heartbeat().catch(() => undefined); // best effort; failures must not disturb the UI
    };
    const events = ['pointerdown', 'keydown', 'visibilitychange'];
    events.forEach((e) => window.addEventListener(e, ping, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, ping));
  }, [enabled]);
}
