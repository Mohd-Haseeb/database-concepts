# Database Visualizer - Project Context

> **Note to AI Agents/Assistants:** Please read this file when starting a new session to understand the project architecture, tech stack, and design guidelines.

## Project Overview
This repository (`database/visualizer`) is a unified educational platform containing interactive visualizations of internal database operations. It merged several isolated React projects into one application.

## Tech Stack
- **Framework**: React 19 + Vite 4 (Downgraded Vite to support Node 17)
- **Routing**: React Router DOM v7
- **Styling**: Vanilla CSS (No Tailwind). 
- **Icons**: `lucide-react`
- **Animations**: `framer-motion`

## Architecture
- **Global Layout**: Handled by `src/App.jsx`. It provides a global navigation bar (`/buffer-pool`, `/joins`, `/transactions`, `/optimizer`).
- **Feature Modules**: Located in `src/features/`. Each feature module acts as its own self-contained React app.
  - `src/features/buffer-pool/`: Visualizes RAM/Disk page swapping (LRU eviction).
  - `src/features/joins/`: Visualizes Nested Loop, Hash, and Merge joins.
  - `src/features/transactions/`: Visualizes MVCC, isolation levels, and concurrent transactions.
  - `src/features/optimizer/`: (In Progress) Visualizes query parsing and execution plans.

## Design Guidelines & Aesthetics
- **Theme**: Dark mode by default, heavily relying on `src/App.css` global tokens.
- **Colors**:
  - Backgrounds: `--bg-dark`, `--bg-surface`, `--bg-deep`
  - Accents: `--accent-blue`, `--accent-purple`
  - Text: `--text-primary`, `--text-muted`
- **Component Rules**: 
  - Use `framer-motion` for smooth micro-animations when state changes (e.g., highlighting a moving disk page, or a highlighted tree node).
  - Do not use generic colors; stick to the sleek dark mode palettes and gradients defined in `App.css`.

## Roadmap
1. [x] Buffer Pool Manager
2. [x] Join Algorithms
3. [x] MVCC Transactions
4. [ ] Query Optimizer & Execution Plans
5. [ ] Write-Ahead Logging & Recovery
