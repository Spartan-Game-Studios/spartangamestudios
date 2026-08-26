#!/usr/bin/env node
/**
 * Generates the Boothill wiki stat pages from the GAME'S OWN DATA, so the wiki
 * cannot drift from the source of truth.
 *
 * Reads the operator/enemy/boss/item resources, the synergy card table, and the
 * translation table straight out of the Boothill repo, and writes:
 *   wiki/boothill/operators.md
 *   wiki/boothill/enemies.md
 *   wiki/boothill/bosses.md    (mini-bosses vs. showdown bosses)
 *   wiki/boothill/weapons.md   (items with no `kind` — the primary weapons)
 *   wiki/boothill/items.md     (kind = PASSIVE — the charms/passives)
 *   wiki/boothill/synergies.md (the synergy cards)
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
// Portraits/icons are published into the wiki's public dir -> served at
// /wiki/img/boothill/<id>.png. This commits game art into the PUBLIC site repo,
// which is intended for a wiki.
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
    else continue; // skip ExtResource(...), Color(...), arrays, etc.
    out[key] = v;
  }
  return out;
}

/**
 * RFC-4180 CSV parse. The translation table has quoted fields with embedded
 * commas and newlines (descriptions), so a naive split-on-comma corrupts them.
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } // escaped quote
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** en-column value for a translation key, falling back to the key itself. */
function loadTranslations(csvPath) {
  const rows = parseCSV(readFileSync(csvPath, 'utf8'));
  const map = new Map();
  for (let i = 1; i < rows.length; i++) {
    const [k, en] = rows[i];
    if (k) map.set(k, en ?? k);
  }
  return (key) => map.get(key) ?? key;
}

/** All entry.tres resources under a content dir (skips dirs without one). */
function readEntries(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'entry.tres')))
    .map((d) => {
      const raw = readFileSync(join(dir, d.name, 'entry.tres'), 'utf8');
      return { ...parseResource(raw), _raw: raw, _dir: dir, _folder: d.name };
    })
    .filter((r) => r.id);
}

/** Parse the multi-line `stat_grants = [{...}, ...]` array out of raw resource text. */
function statGrants(raw) {
  const m = /stat_grants\s*=\s*\[([\s\S]*?)\]/.exec(raw);
  if (!m) return [];
  const grants = [];
  const re = /\{([^}]*)\}/g;
  let g;
  while ((g = re.exec(m[1]))) {
    const body = g[1];
    const key = /"key"\s*:\s*&?"([^"]+)"/.exec(body)?.[1];
    if (!key) continue;
    const op = Number(/"op"\s*:\s*(\d+)/.exec(body)?.[1] ?? 0);
    const per = Number(/"per_level"\s*:\s*(-?\d+(?:\.\d+)?)/.exec(body)?.[1] ?? 0);
    grants.push({ key, op, per });
  }
  return grants;
}

/** Parse the CARDS dict out of src/systems/synergy_cards.gd. */
function readSynergies(gdPath) {
  if (!existsSync(gdPath)) return [];
  const text = readFileSync(gdPath, 'utf8');
  const block = /const CARDS[^{]*\{([\s\S]*?)\n\}/.exec(text)?.[1] ?? '';
  const re =
    /&"([^"]+)"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+)"[^}]*?"desc"\s*:\s*"([^"]+)"[^}]*?"icon"\s*:\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(block))) {
    out.push({ id: m[1], nameKey: m[2], descKey: m[3], icon: m[4] });
  }
  return out;
}

/** Extract the idle frame (row 0, col 0) of a sprite SHEET into a clean portrait
 *  PNG. Pixel art, so scaled nearest-neighbour. Returns basename on success. */
async function extractPortrait(dir, folder) {
  const png = join(dir, folder, 'sprite.png');
  if (!existsSync(png)) return null;
  let cell = 64;
  const metaPath = join(dir, folder, 'sprite.json');
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
      .toFile(join(IMG_DIR, `${folder}.png`));
    return folder;
  } catch (e) {
    console.warn(`  ! could not extract portrait for ${folder}: ${e.message}`);
    return null;
  }
}

/** Publish a clean single-frame icon.png (items/synergies) at 2x nearest. */
async function extractIcon(srcPng, outName) {
  if (!existsSync(srcPng)) return null;
  try {
    const meta = await sharp(srcPng).metadata();
    const w = meta.width || 64;
    const h = meta.height || 64;
    await sharp(srcPng).resize(w * 2, h * 2, { kernel: 'nearest' }).png().toFile(join(IMG_DIR, `${outName}.png`));
    return outName;
  } catch (e) {
    console.warn(`  ! could not extract icon for ${outName}: ${e.message}`);
    return null;
  }
}

const name = loadTranslations(join(BOOTHILL, 'assets/i18n/translations.csv'));

// A description for an *_NAME key lives under the sibling *_DESC key; blank if absent.
const descOf = (nameKey) => {
  const k = String(nameKey).replace(/_NAME$/, '_DESC');
  const v = name(k);
  return !v || v === k ? '' : v;
};

const operators = readEntries(join(BOOTHILL, 'content/operators')).sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99) || String(a.id).localeCompare(String(b.id)),
);
const allEnemies = readEntries(join(BOOTHILL, 'content/enemies'));
const enemies = allEnemies.filter((e) => !e.is_boss).sort((a, b) => (a.min_tier ?? 0) - (b.min_tier ?? 0));
// A showdown-only boss is a full boss; the rest of the bosses are mini-bosses.
const allBosses = allEnemies.filter((e) => e.is_boss);
const byHp = (a, b) => (a.hp_mult ?? 0) - (b.hp_mult ?? 0);
const miniBosses = allBosses.filter((b) => !b.showdown_only).sort(byHp);
const showdownBosses = allBosses.filter((b) => b.showdown_only).sort(byHp);

const allItems = readEntries(join(BOOTHILL, 'content/items')).sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99) || String(a.id).localeCompare(String(b.id)),
);
// `kind`: WEAPON (0 / absent) vs PASSIVE (1). Weapons are the primary arms; the
// passives are the charms and trinkets that modify a build.
const weapons = allItems.filter((i) => (i.kind ?? 0) !== 1);
const passives = allItems.filter((i) => i.kind === 1);
const itemName = new Map(allItems.map((i) => [i.id, name(i.display_name)]));

const synergies = readSynergies(join(BOOTHILL, 'src/systems/synergy_cards.gd'));

// Fresh portraits/icons each run.
rmSync(IMG_DIR, { recursive: true, force: true });
mkdirSync(IMG_DIR, { recursive: true });
const haveImg = new Set();

for (const e of [...operators, ...enemies, ...allBosses]) {
  const ok = await extractPortrait(e._dir, e._folder);
  if (ok) haveImg.add(ok);
}
for (const it of allItems) {
  const ok = await extractIcon(join(it._dir, it._folder, 'icon.png'), it._folder);
  if (ok) haveImg.add(ok);
}
for (const s of synergies) {
  const rel = s.icon.replace(/^res:\/\//, '');
  const ok = await extractIcon(join(BOOTHILL, rel), s.id);
  if (ok) haveImg.add(ok);
}

/** Markdown image cell for a basename, or '' when the image is missing. */
const imgOf = (basename, alt) =>
  haveImg.has(basename) ? `![${cell(alt)}](/img/boothill/${basename}.png)` : '';

const BANNER =
  '<!-- Generated by wiki/generators/gen-boothill.mjs from the Boothill repo.\n' +
  '     Do not edit by hand — changes are overwritten on the next run. -->\n';

const mult = (n) => (n == null ? '—' : `${Number(n).toFixed(2).replace(/\.00$/, '')}×`);
const num = (n) => (n == null ? '—' : String(n));
const trim = (n) => String(Number(Number(n).toFixed(2)));
/** Humanise a snake_case id into Title Case (for names with no translation key). */
const titleize = (s) => String(s).split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
/** Sanitise free text for a markdown table cell (collapse newlines, escape pipes). */
const cell = (s) => String(s ?? '').replace(/\s*\r?\n\s*/g, ' ').replace(/\|/g, '\\|').trim();

/** Human-readable per-level stat grant, e.g. "+10 shield/lvl", "+15% might/lvl". */
function grantText(g) {
  const label = g.key.replace(/_/g, ' ');
  if (g.op === 1) return `+${trim(g.per * 100)}% ${label}/lvl`;
  if (g.op === 2) return `×${trim(1 + g.per)} ${label}/lvl`;
  return `+${trim(g.per)} ${label}/lvl`;
}

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
        imgOf(o._folder, name(o.display_name)),
        `**${cell(name(o.display_name))}**`,
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
      enemies.map((e) => [
        imgOf(e._folder, name(e.display_name)),
        `**${cell(name(e.display_name))}**`,
        mult(e.hp_mult),
        mult(e.speed_mult),
        num(e.min_tier),
        num(e.weight),
      ]),
    ),
);

// --- bosses (mini-bosses vs. showdown bosses) ---
const bossRows = (list) =>
  table(
    ['', 'Boss', 'HP', 'Speed', 'Contact dmg', 'Wax'],
    list.map((b) => [
      imgOf(b._folder, name(b.display_name)),
      `**${cell(name(b.display_name))}**`,
      mult(b.hp_mult),
      mult(b.speed_mult),
      num(b.contact_damage),
      num(b.wax_value),
    ]),
  );
writeFileSync(
  join(WIKI, 'boothill/bosses.md'),
  BANNER +
    `# Bosses\n\n` +
    `The set-piece fights. Far more HP than a regular enemy, with their own contact damage and wax payout.\n\n` +
    `## Mini-bosses\n\n` +
    `Elite threats that break into an ordinary run. There are **${miniBosses.length}**.\n\n` +
    bossRows(miniBosses) +
    `\n## Showdown bosses\n\n` +
    `The full boss fights that cap a showdown. There are **${showdownBosses.length}**.\n\n` +
    bossRows(showdownBosses),
);

// --- weapons ---
writeFileSync(
  join(WIKI, 'boothill/weapons.md'),
  BANNER +
    `# Weapons\n\n` +
    `Your primary armament. A weapon levels up during a run and some **evolve** into a stronger form once the requirements are met.\n\n` +
    `There are **${weapons.length}** weapons.\n\n` +
    table(
      ['', 'Weapon', 'Cost', 'Max level', 'Evolves into', 'Effect'],
      weapons.map((w) => [
        imgOf(w._folder, name(w.display_name)),
        `**${cell(name(w.display_name))}**`,
        num(w.cost),
        num(w.max_level),
        w.evolves_to ? cell(itemName.get(w.evolves_to) ?? titleize(w.evolves_to)) : '—',
        cell(descOf(w.display_name)) || '—',
      ]),
    ),
);

// --- items (passives) ---
writeFileSync(
  join(WIKI, 'boothill/items.md'),
  BANNER +
    `# Items\n\n` +
    `Passive charms and trinkets. They don't fire — they raise a stat every level, shaping the build around your weapons.\n\n` +
    `There are **${passives.length}** passive items.\n\n` +
    table(
      ['', 'Item', 'Cost', 'Max level', 'Effect'],
      passives.map((p) => {
        const grants = statGrants(p._raw).map(grantText).join(', ');
        const effect = cell(descOf(p.display_name)) || grants || '—';
        return [
          imgOf(p._folder, name(p.display_name)),
          `**${cell(name(p.display_name))}**`,
          num(p.cost),
          num(p.max_level),
          effect,
        ];
      }),
    ),
);

// --- synergies ---
writeFileSync(
  join(WIKI, 'boothill/synergies.md'),
  BANNER +
    `# Synergies\n\n` +
    `Special cards unlocked when the right items are combined. Each rewrites how part of your kit behaves.\n\n` +
    `There are **${synergies.length}** synergies.\n\n` +
    table(
      ['', 'Synergy', 'Effect'],
      synergies.map((s) => [
        imgOf(s.id, name(s.nameKey)),
        `**${cell(name(s.nameKey))}**`,
        cell(name(s.descKey)) || '—',
      ]),
    ),
);

console.log(
  `generated: operators (${operators.length}), enemies (${enemies.length}), ` +
    `bosses (${miniBosses.length} mini + ${showdownBosses.length} showdown), ` +
    `weapons (${weapons.length}), items (${passives.length}), synergies (${synergies.length})`,
);
