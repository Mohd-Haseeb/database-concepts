import React, { useState, useEffect } from 'react';
import { Database, MemoryStick } from 'lucide-react';
import { useBufferPool } from './hooks/useBufferPool';
import DiskArena from './components/buffer/DiskArena';
import RamArena from './components/buffer/RamArena';
import ClientPanel from './components/buffer/ClientPanel';
import ExecutionLog from './components/buffer/ExecutionLog';
import './index.css';

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

  const {
    strategy, setStrategy,
    disk, frames, logs, clockHand,
    requestPage, flushAllDirtyPages
  } = useBufferPool();

  // The most recently requested page, useful for visual highlights
  const lastRequestedPage = logs.length > 0 ?
    parseInt(logs[logs.length - 1].msg.match(/Page (\d+)/)?.[1]) : null;

  return (
    <div className="app-container" style={{ padding: '2rem' }}>

      <main className="container main-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>

        {/* Left Column: Controls & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ClientPanel
            strategy={strategy}
            setStrategy={setStrategy}
            onRead={(pageId) => requestPage(pageId, false)}
            onWrite={(pageId) => requestPage(pageId, true)}
            onFlush={flushAllDirtyPages}
          />
          <ExecutionLog logs={logs} />
        </div>

        {/* Right Column: Visualization Arenas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* The limited physical memory */}
          <RamArena frames={frames} clockHand={clockHand} strategy={strategy} />

          {/* The vast secondary storage */}
          <DiskArena disk={disk} activePage={lastRequestedPage} />
        </div>

      </main>
    </div>
  );
}

export default App;
