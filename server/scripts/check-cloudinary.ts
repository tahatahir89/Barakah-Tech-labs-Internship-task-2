// Run with: npm run check:cloudinary
// Sends one real signed upload straight to Cloudinary and prints its raw reply, so you can see exactly why it refuses.
// (The Cloudinary SDK throws the explanation away for 403 responses; this script does not.)
import { createHash } from 'node:crypto';
import { cloudinary, cloudinaryReady } from '../src/config/cloudinary';
import { env } from '../src/config/env';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

function show(label: string, value?: string, hide = false) {
  if (!value) return console.log(`${label}: (missing)`);
  const shown = hide ? `${value.slice(0, 3)}***` : value;
  const warn = value !== value.trim() ? '  <-- has leading/trailing spaces!' : /["'<>]/.test(value) ? '  <-- remove quotes or <> characters' : '';
  console.log(`${label}: ${shown} (${value.length} chars)${warn}`);
}

function explain(body: string) {
  const b = body.toLowerCase();
  if (body.trimStart().startsWith('<'))
    return 'The reply is a web page, not Cloudinary JSON. Something between your PC and Cloudinary (VPN, antivirus HTTPS scanning, firewall or ISP) is blocking api.cloudinary.com. Try a mobile hotspot, or turn off the VPN / antivirus web shield.';
  if (b.includes('cloud_name')) return 'The cloud name is wrong. Copy "Cloud name" exactly from the Cloudinary dashboard.';
  if (b.includes('api_key')) return 'The API key is wrong, deleted or disabled.';
  if (b.includes('signature')) return 'The API secret does not match this API key. Re-copy the secret that belongs to the same key.';
  if (b.includes('untrusted') || b.includes('verif') || b.includes('disabled') || b.includes('suspend'))
    return 'The Cloudinary account is not active yet. Confirm the email Cloudinary sent you and check the dashboard for notices.';
  if (b.includes('permission') || b.includes('not allowed'))
    return 'This key is not allowed to upload. Use the key from the product environment API Keys page (Settings > API Keys), or create a new key that has upload access.';
  return 'Copy the reply above and send it to me.';
}

async function main() {
  show('Cloud name', env.CLOUDINARY_CLOUD_NAME);
  show('API key   ', env.CLOUDINARY_API_KEY, true);
  show('API secret', env.CLOUDINARY_API_SECRET, true);
  if (!cloudinaryReady) {
    console.error('\nFill in all three CLOUDINARY_* values in server/.env, then run this again.');
    process.exit(1);
  }

  const folder = 'taskflow/_check';
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`).digest('hex');
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(PNG)], { type: 'image/png' }), 'check.png');
  form.append('api_key', env.CLOUDINARY_API_KEY as string);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
  const text = await res.text();
  console.log(`\nCloudinary replied: HTTP ${res.status}`);
  console.log(text.slice(0, 600));

  if (!res.ok) {
    console.error(`\nWhat this means: ${explain(text)}`);
    process.exit(1);
  }
  const { public_id: publicId, secure_url: url } = JSON.parse(text) as { public_id: string; secure_url: string };
  console.log('\nTest upload OK:', url);
  await cloudinary.uploader.destroy(publicId);
  console.log('Test image removed. Your Cloudinary settings work.');
}

main().catch((err) => {
  console.error('\nCould not reach Cloudinary at all:', err?.cause?.code ?? err?.message ?? err);
  console.error('Check your internet connection, VPN and firewall, then run this again.');
  process.exit(1);
});
