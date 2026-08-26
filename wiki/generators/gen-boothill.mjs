#!/usr/bin/env node
/**
 * Generates the Boothill wiki stat pages from the GAME'S OWN DATA, so the wiki
 * cannot drift from the source of truth.
 *
 * Reads the operator/enemy/boss resources and the translation table straight
 * out of the Boothill repo, and writes:
 *   wiki/boothill/operators.md
 *   wiki/boothill/enemies.md
 *   wiki/boothill/bosses.md
 *
 * The generated pages carry a "do not edit" banner — hand edits are overwritten
 * on the next run. Re-run whenever Boothill's content changes.
 *
 * Usage:
 *   node wiki/generators/gen-boothill.mjs [--boothill <path>]
 *   BOOTHILL_REPO=../boothill node wiki/generators/gen-boothill.mjs
 *
 * Boothill is a PRIVATE repo, so this is a local/CI tool run where a checkout is
 * available — not part of the public site build. Point --boothill at a checkout.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const WIKI = join(HERE, '..');
// Portraits are published into the wiki's public dir -> served at /wiki/img/boothill/<id>.png.
// This commits game art into the PUBLIC site repo, which is intended for a wiki.
const IMG_DIR = join(WIKI, 'public/img/boothill');
const argPath = (() => {
  const i = process.argv.indexOf('--boothill');
  return i >= 0 ? process.argv[i + 1] : undefined;
})();
const BOOTHILL = argPath ?? process.env.BOOTHILL_REPO ?? join(WIKI, '../../boothill');

if (!existsSync(join(BOOTHILL, 'content'))) {
  console.error(`Boothill content not found at ${BOOTHILL}/content — pass --boothill <path>`);
  process.exit(1);
}

/** Parse the [resource] section of a Godot .tres text resource into scalars. */
function parseResource(text) {
  const out = {};
  const start = text.indexOf('[resource]');
  if (start < 0) return out;
  const body = text.slice(start + '[resource]'.length);
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('[')) break; // next section
    const m = /^([A-Za-z0-9_]+)\s*=\s*(.+)$/.exec(line);
    if (!m) continue;
    const [, key, valRaw] = m;
    let v = valRaw.trim();
    if (/^&?"(.*)"$/.test(v)) v = v.replace(/^&?"/, '').replace(/"$/, ''); // string / StringName
    else if (v === 'true' || v === 'false') v = v === 'true';
    else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
    else continue; // skip ExtResource(...), Color(...), etc.
    out[key] = v;
  }
  return out;
}

/** en-column name for a translation key, falling back to the key. */
function loadTranslations(csvPath) {
  const rows = readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const map = new Map();
  for (let i = 1; i < rows.length; i++) {
    // keys,en,... — a simple split on comma; names here contain no quoted commas.
    const cols = rows[i].split(',');
    if (cols[0]) map.set(cols[0], cols[1] ?? cols[0]);
  }
  return (key) => map.get(key) ?? key;
}

function readEntries(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ ...parseResource(readFileSync(join(dir, d.name, 'entry.tres'), 'utf8')), _dir: dir, _folder: d.name }))
    .filter((r) => r.id);
}


/** Extract the idle frame (row 0, col 0) of an entity's sprite sheet into a
 *  clean portrait PNG. Pixel art, so scaled nearest-neighbour. Returns the id on
 *  success, else null (missing/failed sprite -> the page just omits the image). */
async function extractPortrait(dir, id) {
  const png = join(dir, id, 'sprite.png');
  if (!existsSync(png)) return null;
  let cell = 64;
  const metaPath = join(dir, id, 'sprite.json');
  if (existsSync(metaPath)) {
    try {
      const m = JSON.parse(readFileSync(metaPath, 'utf8'));
      if (m.cell) cell = Number(m.cell);
    } catch { /* default cell */ }
  }
  try {
    await sharp(png)
      .extract({ left: 0, top: 0, width: cell, height: cell })
      .resize(cell * 2, cell * 2, { kernel: 'nearest' }) // 2x so it stays crisp at 2x DPR
      .png()
      .toFile(join(IMG_DIR, `${id}.png`));
    return id;
  } catch (e) {
    console.warn(`  ! could not extract portrait for ${id}: ${e.message}`);
    return null;
  }
}

const name = loadTranslations(join(BOOTHILL, 'assets/i18n/translations.csv'));
const operators = readEntries(join(BOOTHILL, 'content/operators')).sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99) || String(a.id).localeCompare(String(b.id)),
);
const allEnemies = readEntries(join(BOOTHILL, 'content/enemies'));
const enemies = allEnemies.filter((e) => !e.is_boss).sort((a, b) => (a.min_tier ?? 0) - (b.min_tier ?? 0));
const bosses = allEnemies.filter((e) => e.is_boss).sort((a, b) => (a.hp_mult ?? 0) - (b.hp_mult ?? 0));

// Fresh portraits each run.
rmSync(IMG_DIR, { recursive: true, force: true });
mkdirSync(IMG_DIR, { recursive: true });
const portrait = new Set();
for (const e of [...operators, ...enemies, ...bosses]) {
  const ok = await extractPortrait(e._dir, e._folder);
  if (ok) portrait.add(e.id);
}
const img = (e) => (portrait.has(e.id) ? `![${name(e.display_name)}](/img/boothill/${e._folder}.png)` : '');

const BANNER =
  '<!-- Generated by wiki/generators/gen-boothill.mjs from the Boothill repo.\n' +
  '     Do not edit by hand — changes are overwritten on the next run. -->\n';

const mult = (n) => (n == null ? '—' : `${Number(n).toFixed(2).replace(/\.00$/, '')}×`);
const num = (n) => (n == null ? '—' : String(n));

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}\n`;
}

// --- operators ---
writeFileSync(
  join(WIKI, 'boothill/operators.md'),
  BANNER +
    `# Operators\n\n` +
    `Boothill is played as an **operator** — a character with their own weapon feel and stat multipliers. ` +
    `Each tracks its own best run; those per-operator bests are what the leaderboard ranks.\n\n` +
    `There are **${operators.length}** operators.\n\n` +
    table(
      ['', 'Operator', 'Starting weapon', 'HP', 'Might', 'Featured stat'],
      operators.map((o) => [
        img(o),
        `**${name(o.display_name)}**`,
        o.starting_weapon ? `\`${o.starting_weapon}\`` : '—',
        mult(o.hp_mult),
        mult(o.might_mult),
        o.featured_stat ? `${o.featured_stat} (+${o.featured_per_level ?? 0}/lvl)` : '—',
      ]),
    ) +
    `\n_HP and Might are multipliers on the base values; a featured stat grows as the operator levels._\n`,
);

// --- enemies ---
writeFileSync(
  join(WIKI, 'boothill/enemies.md'),
  BANNER +
    `# Enemies\n\n` +
    `The ordinary threats of a run. Higher tiers unlock tougher spawns; **weight** is how often one is picked at its tier.\n\n` +
    `There are **${enemies.length}** enemy types.\n\n` +
    table(
      ['', 'Enemy', 'HP', 'Speed', 'Min tier', 'Weight'],
      enemies.map((e) => [img(e), `**${name(e.display_name)}**`, mult(e.hp_mult), mult(e.speed_mult), num(e.min_tier), num(e.weight)]),
    ),
);

// --- bosses ---
writeFileSync(
  join(WIKI, 'boothill/bosses.md'),
  BANNER +
    `# Bosses\n\n` +
    `The set-piece fights. Far more HP than a regular enemy, with their own contact damage and wax payout.\n\n` +
    `There are **${bosses.length}** bosses.\n\n` +
    table(
      ['', 'Boss', 'HP', 'Speed', 'Contact dmg', 'Wax'],
      bosses.map((b) => [img(b), `**${name(b.display_name)}**`, mult(b.hp_mult), mult(b.speed_mult), num(b.contact_damage), num(b.wax_value)]),
    ),
);

console.log(`generated: operators (${operators.length}), enemies (${enemies.length}), bosses (${bosses.length})`);
