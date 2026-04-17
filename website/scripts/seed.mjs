/**
 * Seed script — inserts complaint data from JSON files into Supabase.
 *
 * Usage:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local
 *   2. Run:  node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env from .env.local ───────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌  Missing env vars. Make sure .env.local contains:\n' +
      '    NEXT_PUBLIC_SUPABASE_URL=...\n' +
      '    SUPABASE_SERVICE_ROLE_KEY=...'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Data files ─────────────────────────────────────────────────────────
const dataDir = resolve(__dirname, '..', 'data');
const files = [
  'potholes.json',
  'water_and_drainage.json',
  'overflowing_garbage.json',
];

// ── Seed ────────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱  Starting seed...\n');

  for (const file of files) {
    const filePath = resolve(dataDir, file);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));

    // Supabase insert has a 1000-row limit per call — batch if needed
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase.from('complaints').insert(batch);

      if (error) {
        console.error(`❌  Error seeding ${file} (batch ${i}):`, error.message);
      } else {
        inserted += batch.length;
      }
    }

    console.log(`✅  ${file} — ${inserted} records seeded`);
  }

  console.log('\n🎉  Seed complete!');
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
