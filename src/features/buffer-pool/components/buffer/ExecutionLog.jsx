import React from 'react';
import { Activity, Clock } from 'lucide-react';
import './ExecutionLog.css';

export default function ExecutionLog({ logs }) {
    return (
        <div className="execution-log panel glass-effect">
            <div className="arena-header">
                <h3><Activity size={18} /> Buffer Pool Manager Log</h3>
            </div>

            <div className="log-container">
                {logs.length === 0 ? (
                    <div className="empty-log">Awaiting client requests...</div>
                ) : (
                    [...logs].reverse().map((log, i) => (
                        <div key={log.id} className={`log-entry type-${log.type} ${i === 0 ? 'new-entry' : ''}`}>
                            <Clock size={12} className="log-icon" />
                            <span className="log-msg">{log.msg}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
