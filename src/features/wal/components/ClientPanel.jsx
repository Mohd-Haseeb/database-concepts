import React from 'react';
import { Play, DatabaseZap, Save, AlertTriangle, RefreshCcw, Database } from 'lucide-react';
import '../index.css';

export default function ClientPanel({
    systemState,
    activeTransactions,
    beginTransaction,
    updateRow,
    commitTransaction,
    forceFlushWal,
    checkpointDataPages,
    crashSystem,
    recoverSystem,
    recoveryPhase
}) {
    const isNormal = systemState === 'NORMAL';
    const isCrashed = systemState === 'CRASHED';
    const isRecovering = systemState === 'RECOVERING';

    const activeTxIds = Object.keys(activeTransactions).filter(txId => activeTransactions[txId].status === 'ACTIVE');

    return (
        <div className="wal-panel glass-effect">
            <div className="panel-header">
                <h3><Play size={18} /> Client Query Dispatcher</h3>
                <span className={`status-badge ${systemState.toLowerCase()}`}>
                    {systemState}
                </span>
            </div>

            {isCrashed && (
                <div className="crash-overlay">
                    <AlertTriangle size={48} color="#ef4444" />
                    <h2>SYSTEM CRASHED</h2>
                    <p>RAM is wiped. Volatile buffers are lost.</p>
                    <button className="btn btn-primary" onClick={recoverSystem}>
                        <RefreshCcw size={16} /> Run ARIES Recovery
                    </button>
                </div>
            )}

            {isRecovering && (
                <div className="crash-overlay recovering">
                    <RefreshCcw size={48} className="spin-icon" color="var(--accent-blue)" />
                    <h2>RECOVERING...</h2>
                    <p>Scanning Persistent WAL...</p>
                    <p className={recoveryPhase === 'ANALYSIS' ? 'active-phase' : 'muted-phase'}>1. Analysis Pass</p>
                    <p className={recoveryPhase === 'REDO' ? 'active-phase' : 'muted-phase'}>2. REDO Pass (Forward)</p>
                    <p className={recoveryPhase === 'UNDO' ? 'active-phase' : 'muted-phase'}>3. UNDO Pass (Backward)</p>
                </div>
            )}

            <div className={`controls-container ${!isNormal ? 'disabled' : ''}`}>
                <div className="control-group">
                    <h4>Transactions</h4>
                    <button className="btn btn-secondary" disabled={!isNormal} onClick={beginTransaction}>
                        <Play size={14} /> Begin Transaction
                    </button>

                    {activeTxIds.length > 0 && (
                        <div className="active-txns">
                            {activeTxIds.map(txId => (
                                <div key={txId} className="tx-card">
                                    <span className="tx-badge">{txId}</span>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => updateRow(txId, 0, 0, 50)} // Hardcoded +50 to P1 Row1 for simplicity
                                        title="Add 50 to P1 Row 1"
                                    >
                                        Update P1:R1
                                    </button>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => commitTransaction(txId)}
                                    >
                                        Commit
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="control-group">
                    <h4>Internal System Checkpoints</h4>
                    <button className="btn btn-outline" disabled={!isNormal} onClick={forceFlushWal}>
                        <DatabaseZap size={14} /> Force Flush Log Tail to WAL
                    </button>
                    <button className="btn btn-outline" disabled={!isNormal} onClick={checkpointDataPages}>
                        <Save size={14} /> Checkpoint (Flush Data Pages)
                    </button>
                </div>

                <div className="control-group crash-group">
                    <h4>Disaster Simulation</h4>
                    <button className="btn btn-danger crash-btn" disabled={!isNormal} onClick={crashSystem}>
                        <AlertTriangle size={14} /> PULL THE PLUG (CRASH)
                    </button>
                    <p className="educational-note">
                        Crashing will wipe the Log Tail (RAM). Only records safely written to the Persistent WAL on disk can be recovered!
                    </p>
                </div>
            </div>
        </div>
    );
}
