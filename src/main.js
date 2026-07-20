import 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';

const mockUnits = [
const units = [
  { id:'unit-01', title:'Unit 1', label:'Foundations of Distributed Systems', status:'Ready', weight:'18%', focus:['Clock synchronization','Message ordering','Failure models'], questions:['Explain Lamport logical clocks with a neat event-order diagram.','Compare synchronous and asynchronous distributed systems in tabular form.','Derive why partial ordering is sufficient for causality tracking.'] },
  { id:'unit-02', title:'Unit 2', label:'Consensus & Replication', status:'Priority', weight:'24%', focus:['Paxos phases','Raft leader election','Quorum safety'], questions:['Draw and explain the two phases of Paxos consensus.','List the safety properties preserved by majority quorum replication.','Differentiate strong consistency from eventual consistency with examples.'] },
  { id:'unit-03', title:'Unit 3', label:'Transactions & Recovery', status:'Ready', weight:'21%', focus:['ACID','2PC','Write-ahead logging'], questions:['Explain two-phase commit with coordinator and participant states.','Construct a recovery table for immediate update logging.','Write short notes on checkpointing and shadow paging.'] },
  { id:'unit-04', title:'Unit 4', label:'Security & Access Control', status:'Review', weight:'17%', focus:['RBAC','Capabilities','Threat models'], questions:['Prepare an exam-ready table comparing DAC, MAC, and RBAC.','Explain replay attacks and nonce-based prevention.','Design a simple capability model for course resource access.'] }
];
const mockTableRows = [['Concept','Definition','Exam Trigger'],['Logical Clock','Counter-based ordering of distributed events','Happened-before relation'],['Vector Clock','Process-wise timestamp vector','Concurrent event detection'],['Quorum','Minimum agreeing replica set','Read/write intersection proof'],['Write-Ahead Log','Persistent redo/undo record before data write','Crash recovery sequence']];
const mockAsciiDiagram = `CLIENT REQUEST\n      │\n      ▼\n[ INGESTION PIPELINE ] ──► [ UNIT CLASSIFIER ]\n      │                          │\n      ▼                          ▼\n[ PDF/PPTX TEXT MAP ]      [ OUTCOME TAGS ]\n      └──────────────► [ EXAM MODULE FORGE ]\n                              │\n                              ▼\n                    TABLES • DIAGRAMS • QUESTIONS`;

function aiProviderPreview() {
  return { provider: 'configured-in-drawer', mode: 'live-client' };
}

const appState = {
  isProcessing: false,
  statusMessage: 'Drag PDF / PPTX files here',
  extractedText: '',
  units: mockUnits,
  tableRows: mockTableRows,
  asciiDiagram: mockAsciiDiagram
};
let activeUnit = appState.units[1];
let uploadCountText = '04 files';
let uploadCountActive = false;
let selectedFiles = [];
const provider = aiProviderPreview();
let savedApiKey = localStorage.getItem('unitforge_api_key') || '';
const root = document.getElementById('root');
const escapeAttr = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

async function extractTextFromFiles(files) {
  const pdfjsLib = globalThis.pdfjsLib;
  if (!pdfjsLib?.getDocument) {
    throw new Error('PDF parser failed to load. Check CDN/network access and try again.');
  }
  if (pdfjsLib?.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const chunks = [];
  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pages = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => item.str).join(' '));
      }
      chunks.push(`FILE: ${file.name}\n${pages.join('\n')}`);
    } else if (file.name.toLowerCase().endsWith('.pptx')) {
      chunks.push(`PPTX PLACEHOLDER: ${file.name}`);
    }
  }
  return chunks.join('\n\n');
}

function parseStrictJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function generateStudyModules() {
  const apiKey = localStorage.getItem('unitforge_api_key');
  if (!apiKey) {
    alert('Please enter your API key in settings.');
    document.querySelector('.settings-drawer')?.classList.add('open');
    return;
  }
  if (!selectedFiles.length) {
    alert('Please upload PDF or PPTX files first.');
    return;
  }

  appState.isProcessing = true;
  appState.statusMessage = 'Extracting text...';
  render();
  try {
    appState.extractedText = await extractTextFromFiles(selectedFiles);
    appState.statusMessage = 'AI Forging Units... (This may take 30-60 seconds)';
    render();

    const systemPrompt = `You are UnitForge, an exam-preparation module generator. Return ONLY STRICT JSON matching this exact structure, with no markdown, comments, or prose:
{
  "units": [ { "id": "unit-01", "title": "Unit 1", "label": "string", "status": "Ready", "weight": "20%", "focus": ["string", "string"], "questions": ["string"] } ],
  "tableRows": [ ["Header1", "Header2", "Header3"], ["Data", "Data", "Data"] ],
  "asciiDiagram": "string representing an ASCII diagram"
}
Create 4 to 6 unit-wise exam modules, include written-exam questions, and keep tableRows three columns wide.`;
    const userPrompt = `Course material extracted from uploaded files:\n\n${appState.extractedText.slice(0, 60000)}`;

    // ============================================
    // AI PROVIDER - SWAP HERE FOR SUBMISSION
    // Current: Gemini gemini-2.0-flash
    // Change to: OpenAI gpt-5.6-terra
    // ============================================
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });
    if (!response.ok) throw new Error(`AI provider request failed with ${response.status}`);
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI provider returned an empty response.');
    const generated = parseStrictJson(text);
    appState.units = generated.units;
    appState.tableRows = generated.tableRows;
    appState.asciiDiagram = generated.asciiDiagram;
    activeUnit = appState.units[0];
    appState.statusMessage = 'Done';
  } catch (error) {
    console.error('UnitForge generation failed', error);
    appState.statusMessage = 'Generation failed. Check console and API key.';
    alert(error.message);
  } finally {
    appState.isProcessing = false;
    render();
  }
}

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
let uploadCountText = '04 files';
let uploadCountActive = false;
const provider = aiProviderPreview();
const root = document.getElementById('root');
function render() {
  root.innerHTML = `<div class="dot-matrix" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div><svg class="cursor-tracer" aria-hidden="true" viewBox="0 0 80 80"><circle class="cursor-ring" cx="40" cy="40" r="25"></circle><circle class="cursor-dot" cx="40" cy="40" r="4"></circle></svg>
  <input type="file" id="hiddenFileInput" multiple accept=".pdf,.pptx" style="display: none;">
  <nav class="top-nav"><div class="brand"><span>UnitForge</span><small>AI exam module foundry</small></div><div class="nav-links"><a href="#ingest">Ingest</a><a href="#units">Units</a><a href="#output">Output</a></div><button class="icon-btn" aria-label="Settings">⚙</button></nav>
  <aside class="settings-drawer"><button class="drawer-close">×</button><div class="drawer-icon">⌘</div><h2>Settings</h2><label>API key<input id="apiKeyInput" type="password" placeholder="Paste key for local session" value="${escapeAttr(savedApiKey)}" /></label><p class="mono">Provider status: ${provider.mode}</p></aside>
  <main><section class="hero panel"><p class="eyebrow">TACTILE TECH-NOIR / UNIT-WISE PREP</p><h1>Forge course files into structured exam-ready units.</h1><p>Upload PDF or PPTX material, split it into logical units, and render high-density notes, questions, tables, and diagrams for written replication.</p></section>
  <section id="ingest" class="ingest-grid"><div class="dropzone" style="cursor: pointer;"><div class="upload-icon ${appState.isProcessing ? 'spinner' : ''}">${appState.isProcessing ? '' : '⇧'}</div><h2>Ingestion Zone</h2><p class="ingest-status">${appState.statusMessage}</p><button class="process-btn" type="button" ${appState.isProcessing ? 'disabled' : ''}>${appState.isProcessing ? 'Processing' : 'Process Materials'}</button></div><div class="panel stat"><span class="mono">QUEUE</span><strong class="queue-count ${uploadCountActive ? 'is-active' : ''}">${uploadCountText}</strong><p>Lecture decks, reference PDFs, previous question bank, and syllabus outline.</p></div></section>
  <section id="units" class="workspace"><aside class="unit-list"><h2>Unit-Wise Dashboard</h2>${appState.units.map(unit => `<button data-unit="${unit.id}" class="unit-card ${activeUnit.id === unit.id ? 'active' : ''}"><span>${unit.title}</span><strong>${unit.label}</strong><em>${unit.status} / ${unit.weight}</em><b>›</b></button>`).join('')}</aside>
  <section id="output" class="output panel"><div class="output-head"><div class="file-icon">▤</div><div><p class="eyebrow">Structured Output Display</p><h2>${activeUnit.title}: ${activeUnit.label}</h2></div></div><h3>Unit-Wise Exam Questions</h3><ol>${activeUnit.questions.map(q => `<li>${q}</li>`).join('')}</ol><h3>Structured Tables</h3><div class="data-table">${appState.tableRows.flatMap((row, r) => row.map(cell => `<div class="${r === 0 ? 'th' : ''}">${cell}</div>`)).join('')}</div><h3>Text-Based Diagram</h3><pre class="ascii-diagram">${appState.asciiDiagram}</pre><h3>Revision Focus</h3><div class="focus-grid">${activeUnit.focus.map(item => `<span>${item}</span>`).join('')}</div><div class="learning-tools"><article><h3>Socratic Tutor</h3><p>Ask: “What assumption makes this proof work?” and reveal guided prompts unit by unit.</p></article><article><h3>Exam Simulation</h3><p>Timed long-answer prompts, marks split, and answer skeletons for written practice.</p></article><article><h3>Weakness Tracker</h3><p>Tracks missed concepts, repeat errors, and unit-level confidence decay.</p></article><article><h3>Focus Mode</h3><p>Locks the view to one unit, one table, and one diagram for distraction-free revision.</p></article></div></section></section></main><footer><span>◈</span> Built for demo mode with populated mock educational output.</footer>`;
  <aside class="settings-drawer"><button class="drawer-close">×</button><div class="drawer-icon">⌘</div><h2>Settings</h2><label>API key<input type="password" placeholder="Paste key for local session" /></label><p class="mono">Provider status: ${provider.mode}</p></aside>
  <main><section class="hero panel"><p class="eyebrow">TACTILE TECH-NOIR / UNIT-WISE PREP</p><h1>Forge course files into structured exam-ready units.</h1><p>Upload PDF or PPTX material, split it into logical units, and render high-density notes, questions, tables, and diagrams for written replication.</p></section>
  <section id="ingest" class="ingest-grid"><div class="dropzone" style="cursor: pointer;"><div class="upload-icon">⇧</div><h2>Ingestion Zone</h2><p>Drag PDF / PPTX files here</p><button type="button">Process Materials</button></div><div class="panel stat"><span class="mono">QUEUE</span><strong class="queue-count ${uploadCountActive ? 'is-active' : ''}">${uploadCountText}</strong><p>Lecture decks, reference PDFs, previous question bank, and syllabus outline.</p></div></section>
  <section id="units" class="workspace"><aside class="unit-list"><h2>Unit-Wise Dashboard</h2>${units.map(unit => `<button data-unit="${unit.id}" class="unit-card ${activeUnit.id === unit.id ? 'active' : ''}"><span>${unit.title}</span><strong>${unit.label}</strong><em>${unit.status} / ${unit.weight}</em><b>›</b></button>`).join('')}</aside>
  <section id="output" class="output panel"><div class="output-head"><div class="file-icon">▤</div><div><p class="eyebrow">Structured Output Display</p><h2>${activeUnit.title}: ${activeUnit.label}</h2></div></div><h3>Unit-Wise Exam Questions</h3><ol>${activeUnit.questions.map(q => `<li>${q}</li>`).join('')}</ol><h3>Structured Tables</h3><div class="data-table">${tableRows.flatMap((row, r) => row.map(cell => `<div class="${r === 0 ? 'th' : ''}">${cell}</div>`)).join('')}</div><h3>Text-Based Diagram</h3><pre class="ascii-diagram">${asciiDiagram}</pre><h3>Revision Focus</h3><div class="focus-grid">${activeUnit.focus.map(item => `<span>${item}</span>`).join('')}</div><div class="learning-tools"><article><h3>Socratic Tutor</h3><p>Ask: “What assumption makes this proof work?” and reveal guided prompts unit by unit.</p></article><article><h3>Exam Simulation</h3><p>Timed long-answer prompts, marks split, and answer skeletons for written practice.</p></article><article><h3>Weakness Tracker</h3><p>Tracks missed concepts, repeat errors, and unit-level confidence decay.</p></article><article><h3>Focus Mode</h3><p>Locks the view to one unit, one table, and one diagram for distraction-free revision.</p></article></div></section></section></main><footer><span>◈</span> Built for demo mode with populated mock educational output.</footer>`;
  bind();
}
function bind() {
  document.querySelector('.icon-btn').onclick = () => document.querySelector('.settings-drawer').classList.add('open');
  document.querySelector('.drawer-close').onclick = () => document.querySelector('.settings-drawer').classList.remove('open');
  const apiKeyInput = document.querySelector('#apiKeyInput');
  apiKeyInput.value = savedApiKey;
  apiKeyInput.addEventListener('input', event => {
    savedApiKey = event.target.value.trim();
    localStorage.setItem('unitforge_api_key', savedApiKey);
  });
  document.querySelectorAll('.unit-card').forEach(btn => btn.onclick = () => { activeUnit = appState.units.find(unit => unit.id === btn.dataset.unit); render(); });
  const ingestionZone = document.querySelector('.dropzone');
  const hiddenFileInput = document.querySelector('#hiddenFileInput');
  const processButton = document.querySelector('.process-btn');
  ingestionZone.addEventListener('click', event => {
    if (event.target.closest('.process-btn')) return;
    hiddenFileInput.click();
  });
  processButton.addEventListener('click', event => {
    event.stopPropagation();
    generateStudyModules();
  });
  hiddenFileInput.addEventListener('change', event => {
    selectedFiles = Array.from(event.target.files);
  document.querySelectorAll('.unit-card').forEach(btn => btn.onclick = () => { activeUnit = units.find(unit => unit.id === btn.dataset.unit); render(); });
  const ingestionZone = document.querySelector('.dropzone');
  const hiddenFileInput = document.querySelector('#hiddenFileInput');
  ingestionZone.addEventListener('click', () => hiddenFileInput.click());
  hiddenFileInput.addEventListener('change', event => {
    const fileCount = event.target.files.length;
    uploadCountText = `${String(fileCount).padStart(2, '0')} files uploaded`;
    uploadCountActive = true;
    document.querySelector('.queue-count').textContent = uploadCountText;
    document.querySelector('.queue-count').classList.add('is-active');
    console.log('UnitForge ingestion payload metrics', { fileCount, acceptedTypes: ['.pdf', '.pptx'] });
  });
}
window.addEventListener('scroll', () => document.querySelector('.top-nav')?.classList.toggle('nav-compact', window.scrollY > 36));
window.addEventListener('mousemove', event => { const cursor = document.querySelector('.cursor-tracer'); if (cursor) cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`; });
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let matrixX = 0;
let matrixY = 0;
window.addEventListener('mousemove', event => { mouseX = event.clientX; mouseY = event.clientY; }, { passive: true });
function animateDotMatrix() {
  const targetX = (mouseX - window.innerWidth / 2) * 0.04;
  const targetY = (mouseY - window.innerHeight / 2) * 0.04;
  matrixX += (targetX - matrixX) * 0.08;
  matrixY += (targetY - matrixY) * 0.08;
  document.querySelector('.dot-matrix')?.style.setProperty('transform', `translate3d(${matrixX}px, ${matrixY}px, 0)`);
  requestAnimationFrame(animateDotMatrix);
}
render();
requestAnimationFrame(animateDotMatrix);
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
