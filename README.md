# Lesson PPT Generator

AI-powered lesson plan to PPT generator for Zhejiang primary school math (Grade 1, 2024 new textbook).

## Features

- 📄 **Upload lesson plan** (Word/TXT) → AI parses and analyzes
- 🎯 **Overview editing** — Review and edit AI-generated teaching overview
- 🤖 **Agent Team** — Parallel agents for content/visual/animation/layout
- 📱 **HTML Preview** — Real-time preview with single-page editing
- 📄 **PPT Export** — Generate fully editable .pptx files

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 28 + Vite |
| Frontend | React 18 + TypeScript |
| Backend (Main) | Node.js (Electron main process) |
| PPT Builder | Python + python-pptx |
| LLM | OpenAI API / Local Ollama |

## Project Structure

```
├── electron/           # Electron main & preload
│   ├── main.ts
│   └── preload.ts
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── types/          # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── python/             # Python worker
│   ├── ppt_builder.py  # PPT generation
│   └── agents/         # Python agents
├── resources/          # Static assets
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Install Python dependencies
pip install -r python/requirements.txt

# Start development
npm run dev

# Build for Windows
npm run build:win
```

## Agents

| Agent | Role |
|-------|------|
| ParserAgent | Parse lesson plan format, extract fields |
| CompletenessAgent | Check missing info, suggest defaults |
| OverviewAgent | Generate teaching overview |
| ContentAgent | Plan slide content |
| VisualAgent | Plan visual assets |
| AnimAgent | Design animations |
| LayoutAgent | Design slide layout |
| ReviewAgent | Review and coordinate |

## License

MIT
