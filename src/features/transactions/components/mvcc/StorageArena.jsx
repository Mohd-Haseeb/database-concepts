import React from 'react';

import { Database, FileDigit } from 'lucide-react';
import './StorageArena.css';

export default function StorageArena({ rows, activeXids, globalXid }) {

    // Helper to determine the visual styling of a tuple based on its MVCC metadata
    const getTupleStatusClass = (row) => {
        // 1. Is it a "Ghost" tuple? (Deleted/Updated by a committed transaction)
        if (row.xmax !== null && !activeXids.has(row.xmax)) {
            return 'status-dead'; // Garbage Collectable
        }

        // 2. Is it currently being updated? (Deleted by an ACTIVE transaction)
        if (row.xmax !== null && activeXids.has(row.xmax)) {
            return 'status-updating';
        }

        // 3. Was it just inserted by an ACTIVE transaction? (Not yet committed)
        if (activeXids.has(row.xmin)) {
            return 'status-uncommitted';
        }

        // 4. Default: It's a normal, committed, active tuple
        return 'status-live';
    };

    return (
        <div className="storage-arena panel">
            <div className="arena-header">
                <h3><Database size={18} /> Physical Disk Storage (Pages)</h3>
                <div className="global-state-badge">
                    Current Global XID: <strong>{globalXid}</strong>
                </div>
            </div>

            <div className="disk-pages-container">
                {rows.map((row) => (
                    <div
                        key={row.physical_id}
                        className={`tuple-card ${getTupleStatusClass(row)}`}
                    >
                        <div className="tuple-header">
                            <span className="physical-id"><FileDigit size={14} /> Physical ID: {row.physical_id}</span>
                            <span className="logical-id">Logical Row ID: {row.logical_id}</span>
                        </div>

                        <div className="tuple-data">
                            <div className="data-field">
                                <span className="label">Balance:</span>
                                <span className="value">${row.balance}</span>
                            </div>
                        </div>

                        <div className="tuple-metadata">
                            <div className={`meta-pill xmin ${activeXids.has(row.xmin) ? 'active' : ''}`}>
                                xmin (created by): {row.xmin}
                            </div>
                            <div className={`meta-pill xmax ${row.xmax !== null ? (activeXids.has(row.xmax) ? 'active' : 'dead') : 'empty'}`}>
                                xmax (deleted by): {row.xmax !== null ? row.xmax : 'NULL'}
                            </div>
                        </div>

                        {/* Status Overlay Badge */}
                        <div className="status-badge">
                            {getTupleStatusClass(row).replace('status-', '').toUpperCase()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
