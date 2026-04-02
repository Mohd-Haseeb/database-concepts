import React, { useState } from 'react';
import { Database, Zap, Binary, Route, Info } from 'lucide-react';
import PipelineVisualizer from './components/PipelineVisualizer';
import { QUERY_LIBRARY } from './data/queryLibrary';
import './index.css';

// Placeholder components - will be built fully later
function QueryEditor({ activeQueryId, onSelectQuery }) {
    const query = QUERY_LIBRARY.find(q => q.id === activeQueryId);
    return (
        <div className="optimizer-panel query-editor">
            <h3>1. SQL Query</h3>
            <div className="query-selector">
                <select
                    value={activeQueryId}
                    onChange={(e) => onSelectQuery(e.target.value)}
                    className="optimizer-select"
                >
                    {QUERY_LIBRARY.map(q => (
                        <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                </select>
                <p className="query-desc">{query.description}</p>
            </div>
            <div className="sql-code-block">
                <pre><code>{query.sql}</code></pre>
            </div>
        </div>
    );
}

function PipelineTabs({ activeStage, onSelectStage }) {
    return (
        <div className="pipeline-tabs">
            <button
                className={`pipeline-tab ${activeStage === 'ast' ? 'active' : ''}`}
                onClick={() => onSelectStage('ast')}
            >
                <Binary size={16} /> Parsing (AST)
            </button>
            <div className="tab-arrow">→</div>
            <button
                className={`pipeline-tab ${activeStage === 'logical' ? 'active' : ''}`}
                onClick={() => onSelectStage('logical')}
            >
                <Route size={16} /> Logical Plan
            </button>
            <div className="tab-arrow">→</div>
            <button
                className={`pipeline-tab ${activeStage === 'physical' ? 'active' : ''}`}
                onClick={() => onSelectStage('physical')}
            >
                <Zap size={16} /> Physical Plan
            </button>
        </div>
    );
}


function App() {
    const [activeQueryId, setActiveQueryId] = useState(QUERY_LIBRARY[0].id);
    const [activeStage, setActiveStage] = useState('logical'); // ast, logical, physical

    const activeQuery = QUERY_LIBRARY.find(q => q.id === activeQueryId);

    return (
        <div className="app-container" style={{ padding: '2rem' }}>

            <div className="optimizer-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Zap className="logo-icon" size={28} color="var(--accent-purple)" />
                    Query Optimizer
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Explore how a SQL query is transformed from abstract syntax down to a concrete algorithmic execution plan.
                </p>
            </div>

            <div className="optimizer-layout">
                <div className="left-column">
                    <QueryEditor
                        activeQueryId={activeQueryId}
                        onSelectQuery={(id) => {
                            setActiveQueryId(id);
                            setActiveStage('ast'); // Reset to beginning of pipeline on change
                        }}
                    />
                </div>

                <div className="right-column">
                    <PipelineTabs activeStage={activeStage} onSelectStage={setActiveStage} />
                    <PipelineVisualizer query={activeQuery} stage={activeStage} />
                </div>
            </div>

        </div>
    );
}

export default App;
