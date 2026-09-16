// Generates the Obsidian JSON Canvas for the TEBIN · Haskoning brainstorm from .input/brief.md.
import { writeFileSync } from 'node:fs';

const OUT = 'C:/Users/maxudl/OneDrive - TEBIN/!_astro/minder/integration-map.canvas';

const FLOW = {
  leads: '#2563EB',
  people: '#D97706',
  standards: '#7C3AED',
  local: '#059669',
  training: '#DB2777',
};

const nodes = [];
const edges = [];
const text = (id, x, y, width, height, lines, color) =>
  nodes.push({ id, type: 'text', x, y, width, height, text: lines.join('\n'), ...(color ? { color } : {}) });
const group = (id, x, y, width, height, label, color) =>
  nodes.push({ id, type: 'group', x, y, width, height, label, ...(color ? { color } : {}) });
const both = (id, fromNode, toNode, label, color, fromSide = 'right', toSide = 'left') =>
  edges.push({ id, fromNode, fromSide, fromEnd: 'arrow', toNode, toSide, toEnd: 'arrow', label, color });

// ── 1. Title and legend ─────────────────────────────────────────────
text('title', 0, 0, 1520, 240, [
  '# TEBIN · Haskoning',
  '## One network — working map',
  'What each side has · what each side wants · where the network touches · how a joint operating model can look',
]);
group('legend', 1600, 0, 800, 240, 'Five flows — one colour each');
[
  ['leads', '**Leads**\nproject opportunities'],
  ['people', '**People & competencies**'],
  ['standards', '**Standards & certification**'],
  ['local', '**Local engineering experience**'],
  ['training', '**Training & know-how**'],
].forEach(([k, t], i) => text(`legend-${k}`, 1610 + i * 158, 50, 150, 170, [t], FLOW[k]));

// ── 2. Network: two nodes, each with its own contour ────────────────
const ROW = [400, 610, 820, 1030];
const RH = 180;
group('g-tebin', 0, 320, 900, 920, 'TEBIN');
group('g-hask', 1500, 320, 900, 920, 'Haskoning group');

text('t-core', 40, 400, 400, 810, [
  '### TEBIN',
  'About 70 people',
  'Engineering strength in MEP',
  'BIM coordination and CDE at an advanced level',
  '',
  'Legal entities in Ukraine and Poland',
  '',
  'ISO 9001 · ISO 19650',
  'ISO 27001 in preparation',
]);
text('t-ua', 480, ROW[0], 380, RH, ['### Ukraine', 'Engineering base · legal entity', 'Local signing authority', 'Active projects']);
text('t-pl', 480, ROW[1], 380, RH, ['### Poland', 'Legal entity · team of 15–20, built out through year end', 'No active Polish projects yet']);
text('t-de', 480, ROW[2], 380, RH, ['### Germany', 'Main delivery market — active']);
text('t-ch', 480, ROW[3], 380, RH, ['### Switzerland', 'Direct access to Swiss contractors']);

text('h-nl', 1540, ROW[0], 380, RH, ['### Netherlands', 'Group centre']);
text('h-pl', 1540, ROW[1], 380, RH, ['### Poland', 'Local subsidiary']);
text('h-de', 1540, ROW[2], 380, RH, ['### Germany', 'Group presence']);
text('h-ch', 1540, ROW[3], 380, RH, ['### Switzerland', 'Subsidiary']);
text('h-core', 1960, 400, 400, 810, [
  '### Haskoning',
  'Dutch group',
  'Subsidiaries in several countries',
  '',
  '+ further subsidiaries — add in the room',
]);

both('e-ua-nl', 't-ua', 'h-nl', 'Ukrainian signature & market ⇄ scale & methodology', FLOW.standards);
both('e-pl-pl', 't-pl', 'h-pl', 'Joint entry into Polish work: TEBIN delivers ⇄ local brand & signature', FLOW.standards);
both('e-de-de', 't-de', 'h-de', 'German delivery capacity ⇄ shared leads', FLOW.leads);
both('e-ch-ch', 't-ch', 'h-ch', 'Swiss contractor access ⇄ shared leads', FLOW.leads);

// ── 3. Sectors: both sides active in the same three ─────────────────
group('g-sectors', 0, 1260, 2400, 220, 'Sectors — both sides active');
text('sectors-line', 40, 1330, 2320, 30, [
  'Both TEBIN and Haskoning are active in the following sectors',
]);
[
  ['mcf', '**MCF**'],
  ['ib', '**Industry and Buildings**'],
  ['av', '**Aviation**'],
].forEach(([k, t], i) => text(`sector-${k}`, 40 + i * 790, 1380, 740, 80, [t]));

// ── 4. Local certification model: one line through every market ────
group('g-cert', 0, 1560, 2400, 360, 'Local certification model', FLOW.standards);
text('cert-line', 40, 1630, 2320, 100, [
  '### TEBIN prepares the work  →  the local entity signs and carries the responsibility',
], FLOW.standards);
[
  ['ua', '**Ukraine**\nTEBIN signs · partner brings scale and methodology', FLOW.local],
  ['de', '**Germany**\nLocal party signs'],
  ['pl', '**Poland**\nLocal party signs'],
  ['ch', '**Switzerland**\nLocal party signs'],
  ['other', '**Other markets**\nLocal party signs'],
].forEach(([k, t, c], i) => text(`cert-${k}`, 40 + i * 470, 1770, 440, 120, [t], c));

// ── 5. What moves across the network — mirrored rows ───────────────
text('flows-head', 0, 2000, 2400, 80, ['## What moves across the network']);
text('col-tebin', 0, 2100, 900, 60, ['### From TEBIN']);
text('col-hask', 1500, 2100, 900, 60, ['### From Haskoning']);

const flows = [
  ['leads', 'project opportunities, both ways',
    ['Germany — an active main market', 'Direct access to Swiss contractors', 'Working relationships in the Ukrainian market'],
    ['Shared leads across the group\'s subsidiaries', 'Polish project opportunities for joint entry']],
  ['people', 'MEP discipline leads ⇄ senior mentors',
    ['MEP discipline leads and project managers who can lead a discipline — one of Haskoning\'s stated needs', 'Advanced BIM coordinators', 'Full-time allocation to projects, not fragmented involvement'],
    ['Senior people who mentor TEBIN teams', '+ add in the room']],
  ['standards', 'Ukrainian signature ⇄ local signature in EU markets',
    ['Local signing authority in Ukraine', 'ISO 9001 · ISO 19650 certified', 'ISO 27001 in preparation'],
    ['Local brand and signature in Poland, Germany, Switzerland', 'Quality frameworks']],
  ['local', 'Ukraine entry know-how ⇄ Polish market access',
    ['Ukrainian market, norms and client relations', 'Design and supporting processes for an international client entering Ukraine', 'German delivery across HOAI LP3–LP5'],
    ['Polish market, norms and client relations', '+ other subsidiary markets — add in the room']],
  ['training', 'short adoption cycle ⇄ process maturity',
    ['Agile and Scrum in practice · short adoption cycle for new IT frameworks', 'Revit automation — scripts, plugins, family production as internal support tools', 'MEP calculation incl. LiNear · Digital Twin · as-built laser scanning'],
    ['Training material and methodology', 'Established corporate processes']],
];
flows.forEach(([k, label, left, right], i) => {
  const y = 2190 + i * 230;
  text(`f-${k}-t`, 0, y, 900, 200, left.map((l) => `- ${l}`), FLOW[k]);
  text(`f-${k}-h`, 1500, y, 900, 200, right.map((l) => `- ${l}`), FLOW[k]);
  both(`e-f-${k}`, `f-${k}-t`, `f-${k}-h`, label, FLOW[k]);
});

// ── 6. What each side is looking for — equal weight ─────────────────
text('want-tebin', 0, 3390, 1150, 320, [
  '## TEBIN is looking for',
  '- **Joint entry into Polish work** with the Polish subsidiary or its partners — TEBIN delivers, the local side carries brand and signature',
  '- Training material and methodology',
  '- Process maturity',
  '- Mentoring from senior people',
  '- Shared leads across subsidiaries',
]);
text('want-hask', 1250, 3390, 1150, 320, [
  '## Haskoning is looking for',
  '- Discipline lead roles on projects',
  '- + add in the room',
  '- + add in the room',
  '- + add in the room',
]);

// ── 7. Joint operating model ────────────────────────────────────────
group('g-model', 0, 3790, 2400, 960, 'How a joint operating model can look');
text('m-embedded', 40, 3870, 1000, 200, [
  '### Embedded in the client team',
  'Several German cases today — close to how group subsidiaries already work together',
]);
text('m-ownership', 1360, 3870, 1000, 200, [
  '### Discipline ownership',
  'Full responsibility for a discipline package',
]);
edges.push({ id: 'e-model', fromNode: 'm-embedded', fromSide: 'right', toNode: 'm-ownership', toSide: 'left', toEnd: 'arrow', label: 'direction of travel · depends on local signature', color: FLOW.standards });

text('p-competencies', 40, 4110, 560, 300, [
  '### Competencies',
  'Disciplines · seniority · languages',
  'Roles and counts from the competency matrix',
], FLOW.people);
text('p-development', 630, 4110, 560, 300, [
  '### Development',
  'Inbound: learning material, methodology, mentoring from senior people',
], FLOW.training);
text('p-mobility', 1220, 4110, 560, 300, [
  '### Mobility & certification',
  'Who can work formally in which market',
  'Decides which leads can actually be taken',
], FLOW.standards);
text('p-language', 1810, 4110, 550, 300, [
  '### Language',
  'English across project staff — level varies, room to improve',
  'No native Polish speakers · hiring in Poland within a year',
  '### Cooperation',
  'Exchange of experience, training, full-time allocation — not rotation between offices',
]);

text('m-it', 40, 4450, 1140, 260, [
  '### IT & security',
  '- No local servers: Microsoft 365 and Azure',
  '- Cloudflare at the edge · Zero Trust — access by identity, not network location',
  '- Works inside a partner\'s access standards and adapts the tooling',
  '- Tailscale mesh for distributed teams — under consideration',
  '- ISO 27001 in preparation',
]);
text('m-roadmap', 1220, 4450, 1140, 260, [
  '### Digital roadmap',
  '- MCP servers for Revit and CAD applications',
  '- Validators for document workflow and issued drawing packages',
  '- ISO 19650 validation · ISO 9001 quality control',
]);
both('e-roadmap', 'm-it', 'm-roadmap', 'short adoption cycle ⇄ corporate maturity', FLOW.training);

// ── 8. Track record — TEBIN's own portfolio ─────────────────────────
group('g-track', 0, 4830, 2400, 420, 'Track record — TEBIN\'s own portfolio');
[
  ['dc', ['### Data centres', 'Delivered: Africa, Netherlands', 'In progress: Germany, Switzerland']],
  ['de', ['### Germany', '- Residential portfolio, delivered independently', '- Standby and uninterruptible power incl. diesel generation — ongoing', '- DIS, HOAI LP3–LP5', '- Reconstruction']],
  ['scan', ['### As-built & scanning', '- Laser scanning with a Polish partner', '- Current: Amazon facility, Rostock', '- For operating assets: reconstruction, document recovery']],
  ['ch', ['### Switzerland', '- HVAC modernisation for an MSD contractor', '- Digital Twin for MEP']],
  ['pl', ['### Poland', '- Several projects delivered', '- No active projects at present', '- Full list to follow']],
  ['ua', ['### Ukraine', '- Active projects', '- Investment projects: design and process support for an international client entering the market']],
].forEach(([k, t], i) => text(`r-${k}`, 40 + i * 391, 4910, 363, 310, t));

// ── 9. Open questions — raised by TEBIN ─────────────────────────────
group('g-open', 0, 5330, 2400, 300, 'Open questions — on the board because TEBIN raised them', '3');
[
  ['security', '### Security\nWhose access standards apply on joint projects?'],
  ['data', '### Data location\nWhere does project data live?'],
  ['licences', '### Licence overlap\nWhich software licences overlap across both sides?'],
  ['standards', '### Standards ownership\nWho owns the standards on a joint project?'],
  ['english', '### English level\nVaries across project staff — improvement planned'],
  ['polish', '### Polish speakers\nNone native yet — ambassadors needed'],
].forEach(([k, t], i) => text(`q-${k}`, 40 + i * 391, 5410, 363, 190, [t]));

// ── Off the board: working notes, kept outside the frame ────────────
group('g-parking', 2600, 0, 760, 1380, 'OFF THE BOARD — check before anything moves left', '1');
text('x-confirm', 2640, 60, 680, 420, [
  '### [confirm] items from the brief — kept off',
  '- Germany standby power partner: "Guilder"?',
  '- Rostock scanning partner: "Cadgima"?',
  '- Client of the Swiss Digital Twin for MEP',
  '- Polish projects, incl. Michelin — and the full list',
  '- Further countries for the network map',
]);
text('x-held', 2640, 510, 680, 380, [
  '### Held back — needs a decision',
  '- Ukraine: "supporting the country rather than margin" touches both the margin rule and the war-narrative rule',
  '- The brief names only the topics under Open questions; the question wording on those cards is a draft',
]);
text('x-rules', 2640, 920, 680, 430, [
  '### Never on the board',
  '- Rates, margins, pricing',
  '- Headcount economics',
  '- Individual names — including TEBIN\'s own relationship owners — until further notice',
  '- Any claim of independence in words',
  '- The war as narrative — structural fact only',
  '',
  '**Session open:** format (live drawing or presented) · participants · length',
]);

writeFileSync(OUT, JSON.stringify({ nodes, edges }, null, '\t') + '\n');

// Sanity: overlap between sibling text nodes (not groups), and edge targets exist.
const ids = new Set(nodes.map((n) => n.id));
for (const e of edges) if (!ids.has(e.fromNode) || !ids.has(e.toNode)) throw new Error(`dangling edge ${e.id}`);
const texts = nodes.filter((n) => n.type === 'text');
const hit = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
let overlaps = 0;
for (let i = 0; i < texts.length; i++)
  for (let j = i + 1; j < texts.length; j++)
    if (hit(texts[i], texts[j])) { overlaps++; console.log('overlap', texts[i].id, texts[j].id); }
const groups = nodes.filter((n) => n.type === 'group');
for (const t of texts) {
  const parents = groups.filter((g) => hit(t, g));
  for (const g of parents) {
    const inside = t.x >= g.x && t.y >= g.y && t.x + t.width <= g.x + g.width && t.y + t.height <= g.y + g.height;
    if (!inside) { overlaps++; console.log('straddles group', t.id, g.id); }
  }
}
console.log(`nodes=${nodes.length} edges=${edges.length} problems=${overlaps}`);
