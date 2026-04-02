import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Table.css';

export default function Table({ title, columns, data, activeRowIndex, accentColor = 'var(--accent-blue)' }) {
    return (
        <div className="db-table-container " style={{ '--table-accent': accentColor }}>
            <div className="table-header">
                <h3 style={{ margin: 0 }}>{title}</h3>
                <span className="row-count">{data.length} rows</span>
            </div>

            <div className="table-wrapper">
                <table className="db-table">
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th key={col.key || i}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>

                    {/* We must use a motion component wrapper if we want layout animations to work perfectly in tables */}
                    <motion.tbody layout>
                        <AnimatePresence>
                            {data.length === 0 ? (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td colSpan={columns.length} className="empty-state">
                                        No data available
                                    </td>
                                </motion.tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <motion.tr
                                        // Crucial: Use a truly unique ID for layout animations so React/Framer knows which row moved where
                                        key={`row-${row.id || row.order_id || row.u_id || row.o_id || rowIndex}-${row.u_name || ''}`}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                        className={activeRowIndex === rowIndex ? 'active-row' : ''}
                                    >
                                        {columns.map((col, colIndex) => (
                                            <td key={`cell-${rowIndex}-${colIndex}`}>
                                                {row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : <span className="null-value">NULL</span>}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </motion.tbody>
                </table>
            </div>
        </div>
    );
}
