#!/usr/bin/env node
/**
 * Copia .env.example → .env y, si Supabase local está corriendo,
 * rellena credenciales con `supabase status -o env`.
 *
 * Uso: node scripts/setup-env.mjs [--local]
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const forceLocal = process.argv.includes('--local');

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

const envTargets = [
  { example: '.env.example', target: '.env' },
  { example: 'apps/api/.env.example', target: 'apps/api/.env' },
  { example: 'apps/web/.env.example', target: 'apps/web/.env' },
];

/** @param {string} filePath */
function ensureFromExample(filePath) {
  const examplePath = join(root, filePath.example);
  const targetPath = join(root, filePath.target);

  if (!existsSync(examplePath)) {
    console.warn(`⚠️  No existe ${filePath.example}, omitiendo.`);
    return;
  }

  if (existsSync(targetPath)) {
    console.log(`✓ ${filePath.target} ya existe (no se sobrescribe)`);
    return;
  }

  copyFileSync(examplePath, targetPath);
  console.log(`✓ Creado ${filePath.target} desde ${filePath.example}`);
}

/** @returns {Record<string, string> | null} */
function readSupabaseStatusEnv() {
  try {
    const command = getSupabaseCommand();
    if (command[0] === 'supabase') {
      return null;
    }

    const result = spawnSync(command[0], [...command.slice(1), 'status', '-o', 'env'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.status !== 0 || !result.stdout) {
      return null;
    }

    /** @type {Record<string, string>} */
    const vars = {};
    for (const line of result.stdout.split('\n')) {
      const match = line.match(/^([A-Z_]+)="(.*)"/);
      if (match) {
        vars[match[1]] = match[2];
      }
    }

    return Object.keys(vars).length > 0 ? vars : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} filePath
 * @param {Record<string, string>} replacements
 */
function patchEnvFile(filePath, replacements) {
  const fullPath = join(root, filePath);
  if (!existsSync(fullPath)) {
    return;
  }

  let content = readFileSync(fullPath, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`^(${key}=).*`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${value}`);
    }
  }
  writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Actualizado ${filePath} con credenciales locales`);
}

console.log('\n🔧 WC2026 — Setup de variables de entorno\n');

for (const target of envTargets) {
  ensureFromExample(target);
}

const supabaseEnv = forceLocal ? readSupabaseStatusEnv() : readSupabaseStatusEnv();

if (supabaseEnv) {
  console.log('\n📡 Supabase local detectado — aplicando credenciales...\n');

  const url = supabaseEnv.API_URL ?? 'http://127.0.0.1:54321';
  const anonKey = supabaseEnv.ANON_KEY ?? '';
  const serviceKey = supabaseEnv.SERVICE_ROLE_KEY ?? '';
  const jwtSecret = supabaseEnv.JWT_SECRET ?? '';

  patchEnvFile('.env', {
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    SUPABASE_JWT_SECRET: jwtSecret,
    WEB_SUPABASE_URL: url,
    WEB_SUPABASE_ANON_KEY: anonKey,
  });

  patchEnvFile('apps/api/.env', {
    SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    SUPABASE_JWT_SECRET: jwtSecret,
  });

  patchEnvFile('apps/web/.env', {
    WEB_SUPABASE_URL: url,
    WEB_SUPABASE_ANON_KEY: anonKey,
  });

  console.log('\n✅ Listo. Supabase Studio: http://127.0.0.1:54323\n');
} else {
  console.log(`
ℹ️  Supabase local no está corriendo.

  Opción A — Local (requiere Docker Desktop):
    pnpm db:start
    node scripts/setup-env.mjs --local

  Opción B — Proyecto remoto en supabase.com:
    1. Crea un proyecto en https://supabase.com/dashboard
    2. pnpm db:login
    3. pnpm db:link -- --project-ref TU_PROJECT_REF
    4. Edita .env y apps/api/.env con las keys del dashboard
       (Settings → API → Project URL, anon key, service_role key, JWT Secret)
    5. pnpm db:migrate
`);
}
