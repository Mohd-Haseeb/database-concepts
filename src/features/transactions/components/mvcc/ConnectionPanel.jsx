import React, { useState } from 'react';
import { Terminal, Copy, CheckCircle2, XCircle } from 'lucide-react';
import './ConnectionPanel.css';

export default function ConnectionPanel({
    connId, // 'A' or 'B'
    connState, // { state: 'IDLE'|'ACTIVE', xid: number, isolation: string }
    setConnState, // Function to update connection state
    onBegin,
    onCommit,
    onRollback,
    onUpdate
}) {
    const isIdel = connState.state === 'IDLE';

    const handleIsolationChange = (e) => {
        setConnState(prev => ({ ...prev, isolation: e.target.value }));
    };

    return (
        <div className={`connection-panel panel ${connId === 'A' ? 'theme-blue' : 'theme-green'} ${!isIdel ? 'active-conn' : ''}`}>

            <div className="conn-header">
                <h3><Terminal size={18} /> Connection {connId}</h3>
                <div className={`status-led ${connState.state.toLowerCase()}`} />
            </div>

            <div className="conn-meta">
                <div className="meta-row">
                    <span className="label">Status:</span>
                    <span className={`value status-text ${connState.state.toLowerCase()}`}>
                        {connState.state} {connState.xid ? `(XID: ${connState.xid})` : ''}
                    </span>
                </div>
                <div className="meta-row">
                    <span className="label">Isolation Level:</span>
                    <select
                        className="isolation-select"
                        value={connState.isolation}
                        onChange={handleIsolationChange}
                        disabled={!isIdel}
                    >
                        <option value="READ_COMMITTED">Read Committed</option>
                        <option value="REPEATABLE_READ">Repeatable Read</option>
                    </select>
                </div>
            </div>

            <div className="command-palette">

                {/* Transaction Controls */}
                <div className="control-group">
                    <button
                        className="cmd-btn begin"
                        disabled={!isIdel}
                        onClick={() => onBegin(connId)}
                    >
                        BEGIN
                    </button>
                    <button
                        className="cmd-btn commit"
                        disabled={isIdel}
                        onClick={() => onCommit(connId)}
                    >
                        <CheckCircle2 size={16} /> COMMIT
                    </button>
                    <button
                        className="cmd-btn rollback"
                        disabled={isIdel}
                        onClick={() => onRollback(connId)}
                    >
                        <XCircle size={16} /> ROLLBACK
                    </button>
                </div>

                {/* DML Operations */}
                <div className="control-group">
                    <button
                        className="cmd-btn dml"
                        disabled={isIdel}
                        onClick={() => onUpdate(connId, 101, Math.floor(Math.random() * 1000))}
                    >
                        <Copy size={16} /> UPDATE users SET balance = ? WHERE id = 101;
                    </button>
                    <button
                        className="cmd-btn dml"
                        disabled={isIdel}
                        onClick={() => onUpdate(connId, 102, Math.floor(Math.random() * 1000))}
                    >
                        <Copy size={16} /> UPDATE users SET balance = ? WHERE id = 102;
                    </button>
                </div>

            </div>

        </div>
    );
}
