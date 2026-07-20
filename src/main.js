const units = [
  { id:'unit-01', title:'Unit 1', label:'Foundations of Distributed Systems', status:'Ready', weight:'18%', focus:['Clock synchronization','Message ordering','Failure models'], questions:['Explain Lamport logical clocks with a neat event-order diagram.','Compare synchronous and asynchronous distributed systems in tabular form.','Derive why partial ordering is sufficient for causality tracking.'] },
  { id:'unit-02', title:'Unit 2', label:'Consensus & Replication', status:'Priority', weight:'24%', focus:['Paxos phases','Raft leader election','Quorum safety'], questions:['Draw and explain the two phases of Paxos consensus.','List the safety properties preserved by majority quorum replication.','Differentiate strong consistency from eventual consistency with examples.'] },
  { id:'unit-03', title:'Unit 3', label:'Transactions & Recovery', status:'Ready', weight:'21%', focus:['ACID','2PC','Write-ahead logging'], questions:['Explain two-phase commit with coordinator and participant states.','Construct a recovery table for immediate update logging.','Write short notes on checkpointing and shadow paging.'] },
  { id:'unit-04', title:'Unit 4', label:'Security & Access Control', status:'Review', weight:'17%', focus:['RBAC','Capabilities','Threat models'], questions:['Prepare an exam-ready table comparing DAC, MAC, and RBAC.','Explain replay attacks and nonce-based prevention.','Design a simple capability model for course resource access.'] }
];
const tableRows = [['Concept','Definition','Exam Trigger'],['Logical Clock','Counter-based ordering of distributed events','Happened-before relation'],['Vector Clock','Process-wise timestamp vector','Concurrent event detection'],['Quorum','Minimum agreeing replica set','Read/write intersection proof'],['Write-Ahead Log','Persistent redo/undo record before data write','Crash recovery sequence']];
const asciiDiagram = `CLIENT REQUEST\n      │\n      ▼\n[ INGESTION PIPELINE ] ──► [ UNIT CLASSIFIER ]\n      │                          │\n      ▼                          ▼\n[ PDF/PPTX TEXT MAP ]      [ OUTCOME TAGS ]\n      └──────────────► [ EXAM MODULE FORGE ]\n                              │\n                              ▼\n                    TABLES • DIAGRAMS • QUESTIONS`;

function aiProviderPreview() {
  // ============================================
  // AI PROVIDER - SWAP HERE FOR SUBMISSION
  // Current: Gemini gemini-2.0-flash
  // Change to: OpenAI gpt-5.6-terra
  // ============================================
  return { provider: 'configured-in-drawer', mode: 'demo-mock' };
}

let activeUnit = units[1];
const provider = aiProviderPreview();
const root = document.getElementById('root');
function render() {
  root.innerHTML = `<div class="grain" aria-hidden="true"></div><svg class="cursor-tracer" aria-hidden="true" viewBox="0 0 80 80"><circle class="cursor-ring" cx="40" cy="40" r="25"></circle><circle class="cursor-dot" cx="40" cy="40" r="4"></circle></svg>
  <nav class="top-nav"><div class="brand"><span>UnitForge</span><small>AI exam module foundry</small></div><div class="nav-links"><a href="#ingest">Ingest</a><a href="#units">Units</a><a href="#output">Output</a></div><button class="icon-btn" aria-label="Settings">⚙</button></nav>
  <aside class="settings-drawer"><button class="drawer-close">×</button><div class="drawer-icon">⌘</div><h2>Settings</h2><label>API key<input type="password" placeholder="Paste key for local session" /></label><p class="mono">Provider status: ${provider.mode}</p></aside>
  <main><section class="hero panel"><p class="eyebrow">TACTILE TECH-NOIR / UNIT-WISE PREP</p><h1>Forge course files into structured exam-ready units.</h1><p>Upload PDF or PPTX material, split it into logical units, and render high-density notes, questions, tables, and diagrams for written replication.</p></section>
  <section id="ingest" class="ingest-grid"><div class="dropzone"><div class="upload-icon">⇧</div><h2>Ingestion Zone</h2><p>Drag PDF / PPTX files here</p><button>Process Materials</button></div><div class="panel stat"><span class="mono">QUEUE</span><strong>04 files</strong><p>Lecture decks, reference PDFs, previous question bank, and syllabus outline.</p></div></section>
  <section id="units" class="workspace"><aside class="unit-list"><h2>Unit-Wise Dashboard</h2>${units.map(unit => `<button data-unit="${unit.id}" class="unit-card ${activeUnit.id === unit.id ? 'active' : ''}"><span>${unit.title}</span><strong>${unit.label}</strong><em>${unit.status} / ${unit.weight}</em><b>›</b></button>`).join('')}</aside>
  <section id="output" class="output panel"><div class="output-head"><div class="file-icon">▤</div><div><p class="eyebrow">Structured Output Display</p><h2>${activeUnit.title}: ${activeUnit.label}</h2></div></div><h3>Unit-Wise Exam Questions</h3><ol>${activeUnit.questions.map(q => `<li>${q}</li>`).join('')}</ol><h3>Structured Tables</h3><div class="data-table">${tableRows.flatMap((row, r) => row.map(cell => `<div class="${r === 0 ? 'th' : ''}">${cell}</div>`)).join('')}</div><h3>Text-Based Diagram</h3><pre class="ascii-diagram">${asciiDiagram}</pre><h3>Revision Focus</h3><div class="focus-grid">${activeUnit.focus.map(item => `<span>${item}</span>`).join('')}</div></section></section></main><footer><span>◈</span> Built for demo mode with populated mock educational output.</footer>`;
  bind();
}
function bind() { document.querySelector('.icon-btn').onclick = () => document.querySelector('.settings-drawer').classList.add('open'); document.querySelector('.drawer-close').onclick = () => document.querySelector('.settings-drawer').classList.remove('open'); document.querySelectorAll('.unit-card').forEach(btn => btn.onclick = () => { activeUnit = units.find(unit => unit.id === btn.dataset.unit); render(); }); }
window.addEventListener('scroll', () => document.querySelector('.top-nav')?.classList.toggle('nav-compact', window.scrollY > 36));
window.addEventListener('mousemove', event => { const cursor = document.querySelector('.cursor-tracer'); if (cursor) cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`; });
render();
