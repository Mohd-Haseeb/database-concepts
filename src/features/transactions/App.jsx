import React, { useState, useEffect } from 'react';
import { Database, ShieldAlert, GitMerge } from 'lucide-react';
import { useTransactionEngine } from './hooks/useTransactionEngine';
import StorageArena from './components/mvcc/StorageArena';
import ConnectionPanel from './components/mvcc/ConnectionPanel';
import VisibilityInspector from './components/mvcc/VisibilityInspector';
import ScenarioGuide from './components/mvcc/ScenarioGuide';
import './index.css'; // Premium styling ported from joins project

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const engine = useTransactionEngine();
  const {
    globalXid, activeXids, rows,
    connA, connB, setConnA, setConnB,
    isVisible,
    beginTransaction, commitTransaction, rollbackTransaction, updateRow
  } = engine;

  return (
    <div className="app-container" style={{ padding: '2rem' }}>

      <main className="container main-content mvcc-grid">

        {/* Top Section: Client Connections */}
        <section className="connections-row gap-8" style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <ConnectionPanel
              connId="A"
              connState={connA}
              setConnState={setConnA}
              onBegin={beginTransaction}
              onCommit={commitTransaction}
              onRollback={rollbackTransaction}
              onUpdate={updateRow}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ConnectionPanel
              connId="B"
              connState={connB}
              setConnState={setConnB}
              onBegin={beginTransaction}
              onCommit={commitTransaction}
              onRollback={rollbackTransaction}
              onUpdate={updateRow}
            />
          </div>
        </section>

        {/* Middle Section: The Disk Arena */}
        <section className="storage-row" style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1.5 }}>
            <StorageArena rows={rows} activeXids={activeXids} globalXid={globalXid} />
          </div>
          <div style={{ flex: 1 }}>
            <VisibilityInspector
              rows={rows}
              activeXids={activeXids}
              isVisible={isVisible}
              connA={connA}
              connB={connB}
            />
          </div>
        </section>

        {/* Bottom Section: Educational Scenarios */}
        <section className="scenario-row" style={{ marginTop: '2rem' }}>
          <ScenarioGuide engine={engine} />
        </section>

      </main>
    </div>
  );
}

export default App;
