import React from 'react';
import { DatabaseZap } from 'lucide-react';
import { useWalSystem } from './hooks/useWalSystem';
import ClientPanel from './components/ClientPanel';
import ArchitectureView from './components/ArchitectureView';
import './index.css';

function App() {
    const walSystem = useWalSystem();

    return (
        <div className="app-container" style={{ padding: '2rem' }}>

            <div className="wal-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <DatabaseZap className="logo-icon" size={28} color="#f59e0b" />
                    WAL & Crash Recovery
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Explore Write-Ahead Logging. Changes hit the in-memory Log Tail, flush to the WAL Disk on commit, and act as a lifeline when the system crashes.
                </p>
            </div>

            <div className="wal-layout">
                <ClientPanel {...walSystem} />
                <ArchitectureView {...walSystem} />
            </div>

        </div>
    );
}

export default App;
