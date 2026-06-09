#!/usr/bin/env node
/**
 * Wrapper del CLI de Supabase (evita re-install de pnpm en cada comando).
 * Uso: node scripts/supabase.mjs [comando] [args...]
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Uso: node scripts/supabase.mjs <comando> [args...]');
  process.exit(1);
}

/** @returns {string[]} */
function getSupabaseCommand() {
  const jsBin = join(root, 'node_modules', 'supabase', 'dist', 'supabase.js');
  if (existsSync(jsBin)) {
    return [process.execPath, jsBin];
  }

  const winBin = join(root, 'node_modules', 'supabase', 'bin', 'supabase.exe');
  const unixBin = join(root, 'node_modules', 'supabase', 'bin', 'supabase');
  if (platform() === 'win32' && existsSync(winBin)) return [winBin];
  if (existsSync(unixBin)) return [unixBin];

  return ['supabase'];
}

const command = getSupabaseCommand();
if (command[0] === 'supabase') {
  console.error('Supabase CLI no instalado. Ejecuta: pnpm install');
  process.exit(1);
}

const result = spawnSync(command[0], [...command.slice(1), ...args], {
  stdio: 'inherit',
  cwd: root,
  shell: false,
});

process.exit(result.status ?? 1);
