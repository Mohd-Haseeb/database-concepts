import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './VisibilityInspector.css';

export default function VisibilityInspector({ rows, activeXids, isVisible, connA, connB }) {

    // Group physical pages by their generic logical ID (e.g., all versions of user 101)
    const logicalGroups = {};
    rows.forEach(r => {
        if (!logicalGroups[r.logical_id]) logicalGroups[r.logical_id] = [];
        logicalGroups[r.logical_id].push(r);
    });

    const renderVisibilityCell = (tuple, connState) => {
        if (connState.state === 'IDLE') return <td className="vis-cell empty">-</td>;

        const visible = isVisible(tuple, connState.xid, connState.isolation);
        return (
            <td className={`vis-cell ${visible ? 'can-see' : 'cannot-see'}`}>
                {visible ? <><Eye size={14} /> Visible</> : <><EyeOff size={14} /> Hidden</>}
            </td>
        );
    };

    return (
        <div className="visibility-inspector panel">
            <h3>Tuple Visibility Matrix</h3>
            <p className="helper-text">
                Based on Postgres MVCC rules. <code>Read Committed</code> only sees rows committed before the query started.
            </p>

            <table className="vis-table">
                <thead>
                    <tr>
                        <th>Logical Row</th>
                        <th>Physical Version (xmin, xmax)</th>
                        <th className="th-conn-a">Conn A sees?</th>
                        <th className="th-conn-b">Conn B sees?</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(logicalGroups).map(([logicalId, versions]) => (
                        <React.Fragment key={logicalId}>
                            {versions.map((v, idx) => (
                                <tr key={v.physical_id}>
                                    {idx === 0 && (
                                        <td rowSpan={versions.length} className="logical-group-td">
                                            User ID {logicalId}
                                        </td>
                                    )}
                                    <td className="version-td">
                                        V{v.physical_id}
                                        <span className="tiny-meta"> [in:{v.xmin} out:{v.xmax || 'null'}]</span>
                                    </td>
                                    {renderVisibilityCell(v, connA)}
                                    {renderVisibilityCell(v, connB)}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
