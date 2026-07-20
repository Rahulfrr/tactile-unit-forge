Markdown
# ◈ UnitForge ◈

> **AI-Powered Course Material Foundry** – Transform unstructured lecture slides, syllabus outlines, and massive course PDFs into exam-ready structured study modules instantly.

UnitForge uses localized parsing infrastructure paired with the Gemini API to systematically forge academic documents into highly structured layouts: unit-by-unit focus lists, long-form test questions, strict comparison tables, and text-based architectural layout diagrams built for written test replication.

---

## ⚡ Features

*   **Tactile Tech-Noir Interface:** Immersive UI featuring responsive dot-matrix canvas grids and real-time interactive cursor tracers.
*   **Asynchronous Client Ingestion:** Fast local PDF extraction powered by `PDF.js` worker threads directly inside the browser.
*   **Structured Schema Foundry:** Utilizes Gemini deterministic `responseSchema` constraints to output perfect, zero-prose academic JSON.
*   **Exam-Ready Outputs:** Instantly generates revision focuses, high-density 3-column comparative tables, and text-based ASCII diagrams optimized for memory retention and manual replication.

---

## 🛠️ Architecture & Core Stack

*   **Frontend Runtime:** Vanilla JavaScript (ES6+) with optimized DOM reconciliation mechanics
*   **Build Utility:** Vite
*   **Document Processing Engine:** PDF.js (v3.11.174 via secure CDN worker architecture)
*   **Inference Layer:** Google Gemini API Engine via deterministic `v1beta/models/gemini-2.5-flash` pathways

---

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   A valid Google Gemini API Key (Obtainable from Google AI Studio)

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
Open the .env file and paste your secret key behind the VITE_GEMINI_API_KEY= field.

Fire up the local development loop:

Bash
npm run dev
Open your browser and navigate to http://localhost:5173.

📋 API Implementation Context
The backend execution pipeline constructs explicit JSON schemas inside the network fetch loop to ensure the model responds with perfectly structured content:

JSON
{
  "type": "OBJECT",
  "properties": {
    "units": { "type": "ARRAY", "items": { "type": "OBJECT" } },
    "tableRows": { "type": "ARRAY", "items": { "type": "ARRAY", "items": { "type": "STRING" } } },
    "asciiDiagram": { "type": "STRING" }
  }
}
⚖️ License
Distributed under the MIT License. See LICENSE for more information.


---

## 📤 3. Pushing the Documentation to GitHub

Once you've saved these files, open your terminal to stage and push everything up to your repository:

```bash
# Verify the files are recognized
git status

# Stage the changes safely
git add .env.example .gitignore README.md src/main.js

# Commit your changes
git commit -m "docs: add README.md and .env structure configuration"

# Push to your remote repository
git push origin main
