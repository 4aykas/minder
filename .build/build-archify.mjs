// Builds the Archify page for the TEBIN · Haskoning brainstorm.
// Step 1 writes the architecture JSON and renders it with the Archify renderer (unmodified).
// Step 2 post-processes the output: agreed palette (light first), five flow colours,
// two-way arrows, section headings, a custom legend and sectioned cards.
import { writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SCRATCH = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const REPO_ROOT = path.join(SCRATCH, '..');
// Path to a local checkout of the Archify Claude skill (not part of this repo).
const SKILL = process.env.ARCHIFY_SKILL_PATH || path.join(process.env.USERPROFILE || process.env.HOME || '', '.claude/skills/archify');
const JSON_OUT = path.join(SCRATCH, 'integration-map.architecture.json');
const HTML_OUT = process.env.ARCHIFY_HTML_OUT || path.join(REPO_ROOT, 'integration-map.html');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ── Geometry ────────────────────────────────────────────────────────
const L = 40, R = 700, W = 360;          // left (TEBIN) and right (Haskoning) columns
const CX = 550;                          // centre line between the two contours
const NET_Y = (i) => 90 + i * 92, NET_H = 72;
const FLOW_Y = (i) => 600 + i * 96, FLOW_H = 76;
const TEBIN = 'cloud', HASK = 'security', NEUTRAL = 'external'; // renderer types, recoloured below

const components = [];
const connections = [];
const flowOf = [];                       // flow key per connection, in order
const comp = (id, type, x, y, w, h, label, sublabel, tag) =>
  components.push({ id, type, label, pos: [x, y], size: [w, h], ...(sublabel ? { sublabel } : {}), ...(tag ? { tag } : {}) });
const link = (from, to, label, flow) => {
  connections.push({ from, to, label, fromSide: 'right', toSide: 'left', route: 'straight' });
  flowOf.push(flow);
};

// Network
comp('t-head', TEBIN, L, NET_Y(0), W, NET_H, 'TEBIN', 'about 70 people · MEP-led engineering');
comp('h-head', HASK, R, NET_Y(0), W, NET_H, 'Haskoning', 'Dutch group · subsidiaries in several countries');
comp('t-ua', TEBIN, L, NET_Y(1), W, NET_H, 'Ukraine', 'engineering base · legal entity', 'local signing authority · active projects');
comp('h-nl', HASK, R, NET_Y(1), W, NET_H, 'Netherlands', 'group centre');
comp('t-pl', TEBIN, L, NET_Y(2), W, NET_H, 'Poland', 'legal entity · team of 15–20, growing', 'no active Polish projects yet');
comp('h-pl', HASK, R, NET_Y(2), W, NET_H, 'Poland', 'local subsidiary');
comp('t-de', TEBIN, L, NET_Y(3), W, NET_H, 'Germany', 'main delivery market — active');
comp('h-de', HASK, R, NET_Y(3), W, NET_H, 'Germany', 'group presence');
comp('t-ch', TEBIN, L, NET_Y(4), W, NET_H, 'Switzerland', 'direct access to Swiss contractors');
comp('h-ch', HASK, R, NET_Y(4), W, NET_H, 'Switzerland', 'subsidiary', '+ further subsidiaries — add in the room');

link('t-ua', 'h-nl', 'Ukrainian signature ⇄ scale & methodology', 'standards');
link('t-pl', 'h-pl', 'TEBIN delivers ⇄ local brand & signature', 'standards');
link('t-de', 'h-de', 'German delivery capacity ⇄ shared leads', 'leads');
link('t-ch', 'h-ch', 'Swiss contractor access ⇄ shared leads', 'leads');

// Five flows, mirrored
const flows = [
  ['leads', 'project opportunities, both ways',
    ['Germany · Switzerland · Ukraine', 'active main market · Swiss contractors · Ukrainian relations'],
    ['Shared leads across subsidiaries', 'Polish opportunities for joint entry']],
  ['people', 'MEP discipline leads ⇄ senior mentors',
    ['MEP discipline leads & project managers', 'advanced BIM coordinators · full-time on projects', 'one of Haskoning\'s stated needs'],
    ['Senior mentors for TEBIN teams', '+ add in the room']],
  ['standards', 'Ukrainian signature ⇄ local signature',
    ['Signing authority in Ukraine', 'ISO 9001 · ISO 19650 · ISO 27001 in preparation'],
    ['Local brand & signature', 'Poland · Germany · Switzerland · quality frameworks']],
  ['local', 'Ukraine entry know-how ⇄ Polish market access',
    ['Ukrainian market & investor entry', 'German delivery across HOAI LP3–LP5'],
    ['Polish market & client relations', '+ other subsidiary markets — add in the room']],
  ['training', 'short adoption cycle ⇄ process maturity',
    ['Short adoption cycle', 'Agile & Scrum · Revit automation · Digital Twin', 'as-built laser scanning · MEP calculation incl. LiNear'],
    ['Training material & methodology', 'established corporate processes']],
];
flows.forEach(([key, label, t, h], i) => {
  comp(`f-${key}-t`, TEBIN, L, FLOW_Y(i), W, FLOW_H, ...t);
  comp(`f-${key}-h`, HASK, R, FLOW_Y(i), W, FLOW_H, ...h);
  link(`f-${key}-t`, `f-${key}-h`, label, key);
});

// Local certification model
comp('cert-line', NEUTRAL, L, 1140, 1020, 56, 'TEBIN prepares the work → the local entity signs and carries the responsibility');
[
  ['ua', TEBIN, 'Ukraine', 'TEBIN signs', 'partner brings scale & methodology'],
  ['de', NEUTRAL, 'Germany', 'local party signs', 'TEBIN prepares the work'],
  ['pl', NEUTRAL, 'Poland', 'local party signs', 'TEBIN prepares the work'],
  ['ch', NEUTRAL, 'Switzerland', 'local party signs', 'TEBIN prepares the work'],
  ['other', NEUTRAL, 'Other markets', 'local party signs', 'TEBIN prepares the work'],
].forEach(([k, type, label, sub, tag], i) => comp(`cert-${k}`, type, L + i * 210, 1226, 190, 72, label, sub, tag));

const arch = {
  schema_version: 1,
  diagram_type: 'architecture',
  meta: {
    title: 'TEBIN · Haskoning — one network',
    subtitle: 'What each side has · what each side wants · where the network touches · how a joint operating model can look',
  },
  components,
  boundaries: [
    { kind: 'region', label: 'TEBIN', wraps: components.filter((c) => c.id.startsWith('t-') || c.id.endsWith('-t')).map((c) => c.id) },
    { kind: 'security-group', label: 'Haskoning group', wraps: components.filter((c) => c.id.startsWith('h-') || c.id.endsWith('-h')).map((c) => c.id) },
  ],
  connections,
  cards: [],
};
writeFileSync(JSON_OUT, JSON.stringify(arch, null, 2));
execFileSync('node', [`${SKILL}/bin/archify.mjs`, 'render', 'architecture', JSON_OUT, HTML_OUT], { stdio: 'inherit' });

// ── Post-processing ─────────────────────────────────────────────────
let html = readFileSync(HTML_OUT, 'utf8').replace(/\r\n/g, '\n');
const must = (re, label) => { if (!re.test(html)) throw new Error(`post-process: pattern not found — ${label}`); };
const sub = (re, fn, label) => { must(re, label); html = html.replace(re, fn); };

const SANS = "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Noto Sans Mono CJK SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', monospace";

const LIGHT = `
      --bg: #F4F3EE;
      --grid: #E9E7E0;
      --text: #292929;
      --text-muted: #5E5E5E;
      --text-dim: #8C8C8C;
      --text-faint: #666666;
      --panel: #FCFBF8;
      --panel-border: #E0DDD3;
      --lane-fill: rgba(41, 41, 41, 0.02);
      --lane-stroke: #D6D3CA;
      --arrow: #8C8C8C;
      --arrow-emphasis: #292929;
      --mask: #FCFBF8;
      --cloud-fill: rgba(218, 41, 28, 0.06);
      --cloud-stroke: #DA291C;
      --security-fill: rgba(0, 46, 79, 0.06);
      --security-stroke: #002E4F;
      --external-fill: rgba(41, 41, 41, 0.03);
      --external-stroke: #9A968C;
      --frontend-fill: rgba(41, 41, 41, 0.03);
      --frontend-stroke: #292929;
      --backend-fill: rgba(41, 41, 41, 0.03);
      --backend-stroke: #5E5E5E;
      --database-fill: rgba(41, 41, 41, 0.03);
      --database-stroke: #5E5E5E;
      --messagebus-fill: rgba(41, 41, 41, 0.03);
      --messagebus-stroke: #5E5E5E;
      --tebin-zone: rgba(218, 41, 28, 0.025);
      --hask-zone: rgba(0, 46, 79, 0.025);
      --flow-leads: #009EAB;
      --flow-people: #8A5300;
      --flow-standards: #206087;
      --flow-local: #3F6449;
      --flow-training: #7A6958;
      --toolbar-bg: rgba(252, 251, 248, 0.92);
      --toolbar-border: #D6D3CA;
      --toolbar-text: #292929;
      --toolbar-hover: #FCFBF8;
      --toolbar-menu-bg: #FCFBF8;`;

const DARK = `
      --bg: #1B1E24;
      --grid: #262A32;
      --text: #EDEDEA;
      --text-muted: #B9B9B4;
      --text-dim: #7E828A;
      --text-faint: #A5A8AE;
      --panel: #242830;
      --panel-border: #343944;
      --lane-fill: rgba(237, 237, 234, 0.02);
      --lane-stroke: #3A3F4A;
      --arrow: #7E828A;
      --arrow-emphasis: #EDEDEA;
      --mask: #242830;
      --cloud-fill: rgba(234, 99, 89, 0.10);
      --cloud-stroke: #EA6359;
      --security-fill: rgba(132, 195, 211, 0.10);
      --security-stroke: #84C3D3;
      --external-fill: rgba(237, 237, 234, 0.04);
      --external-stroke: #6F747D;
      --frontend-fill: rgba(237, 237, 234, 0.04);
      --frontend-stroke: #EDEDEA;
      --backend-fill: rgba(237, 237, 234, 0.04);
      --backend-stroke: #B9B9B4;
      --database-fill: rgba(237, 237, 234, 0.04);
      --database-stroke: #B9B9B4;
      --messagebus-fill: rgba(237, 237, 234, 0.04);
      --messagebus-stroke: #B9B9B4;
      --tebin-zone: rgba(234, 99, 89, 0.04);
      --hask-zone: rgba(132, 195, 211, 0.04);
      --flow-leads: #2BB8C4;
      --flow-people: #F0B429;
      --flow-standards: #8FB8DE;
      --flow-local: #5FCF8E;
      --flow-training: #C7B093;
      --toolbar-bg: rgba(36, 40, 48, 0.85);
      --toolbar-border: #3A3F4A;
      --toolbar-text: #EDEDEA;
      --toolbar-hover: #2C313A;
      --toolbar-menu-bg: #242830;`;

// Theme blocks: light is the default, dark only on request
sub(/:root,\s*\[data-theme="dark"\] \{[\s\S]*?\n    \}\n\n    \[data-theme="light"\] \{[\s\S]*?\n    \}/,
  () => `:root,\n    [data-theme="light"] {${LIGHT}\n    }\n\n    [data-theme="dark"] {${DARK}\n    }`, 'theme blocks');
sub(/(:root, \[data-theme="dark"\], \[data-theme="light"\] \{)[\s\S]*?\n      \}/, (_, head) => `${head}${LIGHT}\n        --bg: #ffffff;\n        --grid: transparent;\n      }`, 'print vars');
sub(/<html lang="en" data-theme="dark">/, () => '<html lang="en" data-theme="light">', 'html theme attr');
sub(/window\.matchMedia\('\(prefers-color-scheme: light\)'\)\.matches \? 'light' : 'dark'/g, () => "'light'", 'initial theme');
sub(/apply\(e\.matches \? 'light' : 'dark'\);/, () => 'return;', 'OS theme follow');

// Neutral system type, no webfont request
sub(/  <!-- Async font load[\s\S]*?<\/noscript>\n/, () => '', 'font links');
html = html.split(MONO).join(SANS);

// Header, title, footer
sub(/<title>[^<]*<\/title>/, () => '<title>TEBIN · Haskoning network</title>', 'title');
sub(/\s*<div class="pulse-dot"><\/div>/, () => '', 'pulse dot');
sub(/Architecture diagram &bull; Built with Archify/, () => 'Working map for discussion &bull; Built with Archify', 'footer');

// Flow markers (two-way) and flow-coloured connections
const FLOWS = ['leads', 'people', 'standards', 'local', 'training'];
const FLOW_NAMES = { leads: 'Leads', people: 'People & competencies', standards: 'Standards & certification', local: 'Local engineering experience', training: 'Training & know-how' };
sub(/        <\/defs>/, () => FLOWS.map((f) => `          <marker id="flow-${f}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" class="m-flow-${f}" />
          </marker>`).join('\n') + '\n        </defs>', 'defs');

let pathIdx = 0;
sub(/(<!-- Connection paths[^>]*-->)([\s\S]*?)(<!-- Components -->)/, (_, a, body, b) => a + body.replace(/<path d="([^"]+)" class="a-default" stroke-width="[^"]+" marker-end="url\(#arrowhead\)"\/>/g, (m, d) => {
  const f = flowOf[pathIdx++];
  return `<path d="${d}" class="a-flow-${f}" stroke-width="2" marker-start="url(#flow-${f})" marker-end="url(#flow-${f})"/>`;
}) + b, 'connection paths');
if (pathIdx !== connections.length) throw new Error(`recoloured ${pathIdx} of ${connections.length} connections`);

let labelIdx = 0;
sub(/(<!-- Connection labels -->)([\s\S]*?)(<!-- Legend -->)/, (_, a, body, b) => a + body.replace(/class="t-[a-z]+" font-size="8" text-anchor="middle">/g, () => {
  labelIdx++;
  return 'class="t-primary" font-size="9.5" font-weight="500" text-anchor="middle">';
}) + b, 'connection labels');
if (labelIdx !== connections.length) throw new Error(`restyled ${labelIdx} of ${connections.length} labels`);

// Component tags (third line) are 7px in the renderer — too small for a room
sub(/(<!-- Components -->)([\s\S]*?)(<!-- Connection labels -->)/, (_, a, body, b) => a + body.replace(/font-size="7"/g, 'font-size="8.5"') + b, 'component tags');

// Section headings inside the SVG + custom legend
const vbH = Number(html.match(/<svg viewBox="0 0 (\d+) (\d+)"/)[2]);
const legend = [];
let legendY = vbH - 40;
let lx = L;
for (const [cls, text] of [['c-cloud', 'TEBIN'], ['c-security', 'Haskoning'], ['c-external', 'Market fact']]) {
  legend.push(`        <rect x="${lx}" y="${legendY - 9}" width="16" height="11" rx="2" class="${cls}" stroke-width="1.2"/>`,
    `        <text x="${lx + 22}" y="${legendY}" class="t-muted" font-size="10">${text}</text>`);
  lx += 22 + text.length * 6 + 26;
}
legendY = vbH - 16;
lx = L;
for (const f of FLOWS) {
  legend.push(`        <path d="M ${lx + 2} ${legendY - 4} L ${lx + 50} ${legendY - 4}" class="a-flow-${f}" stroke-width="2" marker-start="url(#flow-${f})" marker-end="url(#flow-${f})"/>`,
    `        <text x="${lx + 58}" y="${legendY}" class="t-muted" font-size="10">${esc(FLOW_NAMES[f])}</text>`);
  lx += 58 + FLOW_NAMES[f].length * 5.6 + 22;
}
const heading = (y, text, note) => `        <text x="${CX}" y="${y}" class="t-section" font-size="14" font-weight="600" text-anchor="middle">${esc(text)}</text>` +
  (note ? `\n        <text x="${CX}" y="${y + 17}" class="t-section-note" font-size="10" text-anchor="middle">${esc(note)}</text>` : '');
sub(/        <!-- Legend -->[\s\S]*?      <\/svg>/, () => `        <!-- Section headings -->
${heading(122, 'Where the network touches')}
${heading(566, 'What moves across the network')}
${heading(1110, 'Local certification model', 'one line through every market')}

        <!-- Legend -->
${legend.join('\n')}
      </svg>`, 'legend');
if (lx > 1130) throw new Error(`legend too wide: ${lx}`);

// Sectioned cards below the diagram
const card = (dot, title, items) => `        <div class="card">
          <div class="card-header"><div class="card-dot ${dot}"></div><h3>${esc(title)}</h3></div>
          <ul>
${items.map((it) => `            <li${it.startsWith('+ ') ? ' class="placeholder"' : ''}>${it.startsWith('**') ? `<strong>${esc(it.slice(2))}</strong>` : esc(it)}</li>`).join('\n')}
          </ul>
        </div>`;
const section = (title, cards, cls = '') => `    <section class="section">
      <h2 class="section-title">${esc(title)}</h2>
      <div class="cards ${cls}">
${cards.join('\n')}
      </div>
    </section>`;

const sections = [
  section('What each side is looking for', [
    card('d-tebin', 'TEBIN is looking for', [
      '**Joint entry into Polish work with the Polish subsidiary or its partners — TEBIN delivers, the local side carries brand and signature',
      'Training material and methodology',
      'Process maturity',
      'Mentoring from senior people',
      'Shared leads across subsidiaries',
    ]),
    card('d-hask', 'Haskoning is looking for', [
      'Discipline lead roles on projects',
      '+ add in the room',
      '+ add in the room',
      '+ add in the room',
      '+ add in the room',
    ]),
  ], 'cards-two'),
  section('How a joint operating model can look', [
    card('d-neutral', 'Delivery models', [
      'Embedded in the client team — several German cases today, close to how group subsidiaries already work together',
      'Discipline ownership — full responsibility for a discipline package; the direction of travel, dependent on local signature',
    ]),
    card('d-people', 'People · competencies', ['Disciplines, seniority, languages', 'Roles and counts from the competency matrix']),
    card('d-training', 'People · development', ['Inbound: learning material, methodology, mentoring from senior people']),
    card('d-standards', 'People · mobility & certification', ['Who can work formally in which market', 'Decides which leads can actually be taken']),
    card('d-neutral', 'Language & cooperation', [
      'English across project staff — level varies, room to improve',
      'No native Polish speakers yet · hiring in Poland within a year',
      'Exchange of experience, training and full-time allocation to projects — not rotation between offices',
    ]),
    card('d-neutral', 'IT & security', [
      'No local servers: Microsoft 365 and Azure',
      'Cloudflare at the edge · Zero Trust — access by identity, not network location',
      'Works inside a partner\'s access standards and adapts the tooling',
      'Tailscale mesh for distributed teams — under consideration',
      'ISO 27001 in preparation',
    ]),
    card('d-training', 'Digital roadmap', [
      'MCP servers for Revit and CAD applications',
      'Validators for document workflow and issued drawing packages',
      'ISO 19650 validation · ISO 9001 quality control',
      'The bridge between a short adoption cycle and corporate maturity',
    ]),
  ]),
  section('Track record — TEBIN\'s own portfolio', [
    card('d-neutral', 'Data centres', ['Delivered: Africa, the Netherlands', 'In progress: Germany, Switzerland']),
    card('d-neutral', 'Germany', ['Residential portfolio, delivered independently', 'Standby and uninterruptible power incl. diesel generation — ongoing', 'DIS, HOAI LP3–LP5', 'Reconstruction projects']),
    card('d-neutral', 'As-built & scanning', ['Laser scanning with a Polish partner', 'Current: Amazon facility, Rostock', 'For operating assets: reconstruction, document recovery']),
    card('d-neutral', 'Switzerland', ['HVAC modernisation for an MSD contractor', 'Digital Twin for MEP']),
    card('d-neutral', 'Poland', ['Several projects delivered', 'No active projects at present', 'Full list to follow']),
    card('d-neutral', 'Ukraine', ['Active projects', 'Investment projects: design and process support for an international client entering the market']),
  ]),
  section('Open questions — raised by TEBIN', [
    card('d-neutral', 'Security', ['Whose access standards apply on joint projects?']),
    card('d-neutral', 'Data location', ['Where does project data live?']),
    card('d-neutral', 'Licence overlap', ['Which software licences overlap across both sides?']),
    card('d-neutral', 'Standards ownership', ['Who owns the standards on a joint project?']),
    card('d-neutral', 'English level', ['Varies across project staff — improvement planned']),
    card('d-neutral', 'Polish speakers', ['None native yet — ambassadors needed']),
  ]),
];
sub(/    <!-- Info Cards -->\s*<div class="cards">\s*<\/div>/, () => sections.join('\n\n'), 'cards');

// Extra styles (selectors start with .c-/.t-/.a-/.m- so the SVG export keeps them)
const EXTRA = `
    /* ── TEBIN · Haskoning overrides ── */
    h1 { letter-spacing: 0; text-wrap: balance; }
    .subtitle { margin-left: 0; }
    .c-region, .c-security-group { stroke-dasharray: 8 5; rx: 14px; }
    .c-region { fill: var(--tebin-zone); stroke: var(--cloud-stroke); }
    .c-security-group { fill: var(--hask-zone); stroke: var(--security-stroke); }
${FLOWS.map((f) => `    .a-flow-${f} { stroke: var(--flow-${f}); fill: none; }\n    .m-flow-${f} { fill: var(--flow-${f}); }`).join('\n')}
    .t-section { fill: var(--text); }
    .t-section-note { fill: var(--text-muted); }
    .section { margin-top: 2.5rem; }
    .section-title { font-size: 1.05rem; font-weight: 600; text-wrap: balance; }
    .section .cards { margin-top: 0.875rem; }
    .cards-two { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .card ul { font-size: 0.8125rem; line-height: 1.45; }
    .card li { margin-bottom: 0.45rem; }
    .card li strong { color: var(--text); font-weight: 600; }
    .card li.placeholder { color: var(--text-muted); font-style: italic; }
    .card-dot { flex: none; }
    .card-dot.d-tebin { background: var(--cloud-stroke); }
    .card-dot.d-hask { background: var(--security-stroke); }
    .card-dot.d-neutral { background: var(--external-stroke); }
${FLOWS.map((f) => `    .card-dot.d-${f} { background: var(--flow-${f}); }`).join('\n')}
  `;
sub(/  <\/style>/, () => `${EXTRA}</style>`, 'style end');

writeFileSync(HTML_OUT, html);
console.log(`post-processed: ${connections.length} flows, ${components.length} components`);
