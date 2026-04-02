import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, MemoryStick, ArrowDown, Database, RefreshCcw } from 'lucide-react';

export default function ArchitectureView({
    systemState, logTail, walDisk, dataDisk,
    recoveryPhase, isFlushing, lastUpdatedRowId
}) {

    // Auto-scroll the WAL tape to the bottom so we always see the newest records
    const walTapeRef = useRef(null);
    useEffect(() => {
        if (walTapeRef.current) {
            walTapeRef.current.scrollTop = walTapeRef.current.scrollHeight;
        }
    }, [walDisk]);

    return (
        <div className="architecture-grid">

            {/* VOLATILE (RAM) - Top Half */}
            <div className="arch-layer volatile-layer">
                <div className="layer-header">
                    <h3><MemoryStick size={20} /> Volatile Buffer (RAM)</h3>
                    <span className="power-status volatile-power">Lost on Power Failure</span>
                </div>

                <div className="log-tail-container">
                    <h4>Log Tail Buffer</h4>
                    <p className="muted-text">Appends happening instantly in memory.</p>

                    <div className="log-tail-queue">
                        <AnimatePresence>
                            {logTail.length === 0 && (
                                <p className="empty-text">Log Tail is Empty</p>
                            )}
                            {logTail.map((record) => (
                                <motion.div
                                    key={`tail-${record.lsn}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, y: 50, scale: 0.8 }}
                                    className={`log-record ${record.action.toLowerCase()}`}
                                >
                                    <span className="lsn">LSN {record.lsn}</span>
                                    <span className="tx">{record.txId}</span>
                                    <span className="action">{record.action}</span>
                                    {record.target && <span className="target">{record.target}</span>}
                                    {record.newValue !== undefined && <span className="val">{record.prevValue} ➔ {record.newValue}</span>}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* The Flush Arrow */}
            <div className="flush-divider">
                <ArrowDown size={32} color="var(--border-color)" className={`flush-arrow ${isFlushing ? 'flushing-active' : ''}`} />
                {isFlushing && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flushing-badge"
                    >
                        <RefreshCcw size={12} className="spin-icon" /> Writing to Disk...
                    </motion.div>
                )}
                {!isFlushing && <span className="wal-rule">WAL Rule: Log MUST reach Disk before Commit</span>}
            </div>

            {/* PERSISTENT (DISK) - Bottom Half */}
            <div className="arch-layer persistent-layer">
                <div className="layer-header">
                    <h3><HardDrive size={20} /> Persistent Storage (Disk)</h3>
                    <span className="power-status persistent-power">Safe from Crashes</span>
                </div>

                <div className="disk-split">

                    {/* Left: WAL Tape */}
                    <div className="wal-disk-container">
                        <h4>Write-Ahead Log (WAL)</h4>
                        <div className="wal-tape" ref={walTapeRef}>

                            {/* Recovery Scanner Animation */}
                            <AnimatePresence>
                                {recoveryPhase && (
                                    <motion.div
                                        className={`recovery-scanner ${recoveryPhase.toLowerCase()}-scan`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="scanner-line"></div>
                                        <span className="scanner-label">{recoveryPhase} Sweep</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {walDisk.length === 0 && (
                                <p className="empty-text" style={{ padding: '1rem' }}>WAL is Empty</p>
                            )}
                            {walDisk.map((record) => (
                                <div key={`wal-${record.lsn}`} className={`log-record disk-record ${record.action.toLowerCase()}`}>
                                    <span className="lsn">LSN {record.lsn}</span>
                                    <span className="tx">{record.txId}</span>
                                    <span className="action">{record.action}</span>
                                    {record.target && <span className="target">{record.target}</span>}
                                    {record.newValue !== undefined && <span className="val">{record.prevValue} ➔ {record.newValue}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Actual Data Pages */}
                    <div className="data-disk-container">
                        <h4>Data Pages (Tables)</h4>
                        <p className="muted-text">Updated via Checkpoints or Recovery.</p>
                        <div className="data-pages-grid">
                            {dataDisk.map((page) => (
                                <div key={page.pageId} className="data-page-card">
                                    <div className="page-header"><Database size={14} /> {page.pageId}</div>
                                    <div className="rows-container">
                                        {page.rows.map(row => {
                                            const isFlashing = lastUpdatedRowId === `${parseInt(page.pageId.substring(1)) - 1}-${row.id}`;
                                            return (
                                                <div key={row.id} className={`row-item ${isFlashing ? 'row-flash' : ''}`}>
                                                    <span className="row-id">Row {row.id}</span>
                                                    <span className="row-val">{row.val}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
