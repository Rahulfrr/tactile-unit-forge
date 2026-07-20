# ◈ UnitForge ◈

> **AI-Powered Course Material Foundry** – Transform unstructured lecture slides, syllabus outlines, and massive course PDFs into exam-ready structured study modules instantly.

UnitForge uses localized parsing infrastructure paired with the OpenAI API to systematically forge academic documents into highly structured layouts: unit-by-unit focus lists, long-form test questions, strict comparison tables, and text-based architectural layout diagrams built for written test replication.

---

## ⚡ Features

*   **Tactile Tech-Noir Interface:** Immersive UI featuring responsive dot-matrix canvas grids and real-time interactive cursor tracers.
*   **Asynchronous Client Ingestion:** Fast local PDF extraction powered by `PDF.js` worker threads directly inside the browser.
*   **Strict JSON Schemas:** Utilizes OpenAI Structured Outputs (`json_schema`) to guarantee formatting conformity without raw prose spill.
*   **Exam-Ready Outputs:** Instantly generates revision focuses, high-density 3-column comparative tables, and text-based ASCII diagrams optimized for memory retention and manual replication.

---

## 🛠️ Architecture & Core Stack

*   **Frontend Runtime:** Vanilla JavaScript (ES6+) with optimized DOM reconciliation mechanics
*   **Build Utility:** Vite
*   **Document Processing Engine:** PDF.js (v3.11.174 via secure CDN worker architecture)
*   **Inference Layer:** OpenAI API Engine via strict structured `gpt-4o-mini` pathways

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   A valid OpenAI API Key (Obtainable from the OpenAI Developer Dashboard)

### Installation Sequence

1. Clone the repository locally:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/UnitForge.git](https://github.com/YOUR_USERNAME/UnitForge.git)
   cd UnitForge
Install development dependencies:

Bash
npm install
Initialize your local configuration file:

Bash
cp .env.example .env
Open the .env file and paste your secret key behind the VITE_OPENAI_API_KEY= field.

Fire up the local development loop:

Bash
npm run dev
Open your browser and navigate to http://localhost:5173.

📋 API Implementation Context
The engine interfaces with OpenAI Chat Completions using strict structural configurations to return zero-prose JSON data mapping out course parameters:

JSON
{
  "type": "object",
  "properties": {
    "units": { "type": "array", "items": { "type": "object" } },
    "tableRows": { "type": "array", "items": { "type": "array", "items": { "type": "string" } } },
    "asciiDiagram": { "type": "string" }
  },
  "required": ["units", "tableRows", "asciiDiagram"],
  "additionalProperties": false
}
⚖️ License
Distributed under the MIT License. See LICENSE for more information.
