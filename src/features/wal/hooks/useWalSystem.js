import { useState, useCallback, useRef } from 'react';

// Defines the initial state of the actual Data Pages on Disk
const initialDataDisk = Array.from({ length: 4 }, (_, i) => ({
    pageId: `P${i + 1}`,
    rows: [
        { id: i * 2 + 1, val: 100 },
        { id: i * 2 + 2, val: 200 }
    ]
}));

export function useWalSystem() {
    // SYSTEM STATE: NORMAL | CRASHED | RECOVERING
    const [systemState, setSystemState] = useState('NORMAL');

    // Detailed recovery phases for animation: null | 'ANALYSIS' | 'REDO' | 'UNDO'
    const [recoveryPhase, setRecoveryPhase] = useState(null);

    // UI flag for simulating Disk I/O delay
    const [isFlushing, setIsFlushing] = useState(false);

    // ID of the last row updated to trigger CSS flash
    const [lastUpdatedRowId, setLastUpdatedRowId] = useState(null);

    // Currently open transactions. Key: Tx ID (e.g. "T1"). Value: { status: 'ACTIVE'|'COMMITTED' }
    const [activeTransactions, setActiveTransactions] = useState({});

    // In-Memory Log Tail: Records waiting to be flushed to disk
    const [logTail, setLogTail] = useState([]);

    // The Persistent Write-Ahead Log on Disk
    const [walDisk, setWalDisk] = useState([]);

    // The Persistent Data Pages on Disk
    const [dataDisk, setDataDisk] = useState([...initialDataDisk]);

    // A running counter to generate unique LSNs (Log Sequence Numbers)
    const lsnCounter = useRef(1);

    const logEvent = useCallback((txId, action, target, newValue, prevValue = null) => {
        if (systemState !== 'NORMAL') return;

        const record = {
            lsn: lsnCounter.current++,
            txId,
            action, // 'BEGIN', 'UPDATE', 'COMMIT', 'ABORT'
            target, // e.g. 'P1:Row1'
            newValue,
            prevValue,
            timestamp: Date.now()
        };

        setLogTail(prev => [...prev, record]);
    }, [systemState]);

    const beginTransaction = useCallback(() => {
        if (systemState !== 'NORMAL') return;
        const txId = `T${Object.keys(activeTransactions).length + 1}`;
        setActiveTransactions(prev => ({ ...prev, [txId]: { status: 'ACTIVE' } }));
        logEvent(txId, 'BEGIN', null, null);
        return txId;
    }, [activeTransactions, logEvent, systemState]);

    const updateRow = useCallback((txId, pageIdx, rowIdx, increment) => {
        if (systemState !== 'NORMAL') return;
        if (!activeTransactions[txId] || activeTransactions[txId].status !== 'ACTIVE') return;

        // Note: In a real system we would read from a Buffer Pool frame. 
        // Here we read the current value from the dataDisk for simplicity of the visualizer.
        const page = dataDisk[pageIdx];
        const row = page.rows[rowIdx];
        const targetDesc = `${page.pageId} / Row ${row.id}`;

        logEvent(txId, 'UPDATE', targetDesc, row.val + increment, row.val);

        // CRUCIAL CONCEPT: We UPDATE the Log Buffer, but we DO NOT update the Data Disk yet.
    }, [activeTransactions, dataDisk, logEvent, systemState]);

    const commitTransaction = useCallback((txId) => {
        if (systemState !== 'NORMAL') return;
        if (!activeTransactions[txId] || activeTransactions[txId].status !== 'ACTIVE') return;

        logEvent(txId, 'COMMIT', null, null);
        setActiveTransactions(prev => ({ ...prev, [txId]: { status: 'COMMITTED' } }));

        // WAL Rule: Force Flush log tail to disk *on commit* before acknowledging to client
        forceFlushWal();
    }, [activeTransactions, logEvent, systemState]);

    const triggerRowFlash = (pageIdx, rowId) => {
        setLastUpdatedRowId(`${pageIdx}-${rowId}`);
        setTimeout(() => setLastUpdatedRowId(null), 1000); // Clear flash after 1s
    };

    const forceFlushWal = useCallback(() => {
        if (systemState !== 'NORMAL') return;

        setIsFlushing(true); // Trigger UI loading bar

        setTimeout(() => {
            setWalDisk(prev => {
                setLogTail([]); // Clear RAM
                return [...prev, ...logTail]; // Append to persistent disk
            });
            setIsFlushing(false);
        }, 800); // Fake 800ms I/O delay

    }, [logTail, systemState]);

    const checkpointDataPages = useCallback(() => {
        if (systemState !== 'NORMAL') return;

        // A Checkpoint forces all dirty data pages to disk.
        // We look at the WAL for any committed updates that haven't been applied to Data Disk.
        setWalDisk(currentWal => {
            setDataDisk(currentData => {
                const newData = JSON.parse(JSON.stringify(currentData)); // Deep copy

                // Very simplified: we just replay all committed UPDATEs onto the data disk
                currentWal.forEach(record => {
                    if (record.action === 'UPDATE' && activeTransactions[record.txId]?.status === 'COMMITTED') {
                        // Apply to newData...
                        // Hacky string parser for the visualizer target format: "P1 / Row 1"
                        const match = record.target.match(/P(\d+) \/ Row (\d+)/);
                        if (match) {
                            const pIdx = parseInt(match[1]) - 1;
                            const rId = parseInt(match[2]);
                            const rIdx = newData[pIdx].rows.findIndex(r => r.id === rId);
                            if (rIdx !== -1) {
                                newData[pIdx].rows[rIdx].val = record.newValue;
                                triggerRowFlash(pIdx, rId);
                            }
                        }
                    }
                });
                return newData;
            });
            return currentWal;
        });
    }, [activeTransactions, systemState]);

    const crashSystem = useCallback(() => {
        setSystemState('CRASHED');
        setRecoveryPhase(null);
        // RAM IS WIPED
        setLogTail([]);
        setActiveTransactions({});
    }, []);

    const recoverSystem = useCallback(() => {
        setSystemState('RECOVERING');
        setRecoveryPhase('ANALYSIS');

        // ARIES/Recovery Simulation with dramatic staged delays
        const restoredTxns = {};
        const actionsToReplay = [];

        // 1. ANALYSIS PASS (Determine active/committed txns)
        setTimeout(() => {
            walDisk.forEach(record => {
                if (record.action === 'BEGIN') restoredTxns[record.txId] = { status: 'ACTIVE' };
                if (record.action === 'COMMIT') restoredTxns[record.txId] = { status: 'COMMITTED' };
                if (record.action === 'ABORT') restoredTxns[record.txId] = { status: 'ABORTED' };
            });

            // Move to REDO
            setRecoveryPhase('REDO');

            setTimeout(() => {
                // 2. REDO PASS (Sweep Forward)
                walDisk.forEach(record => {
                    if (record.action === 'UPDATE' && restoredTxns[record.txId]?.status === 'COMMITTED') {
                        actionsToReplay.push(record);
                    }
                });

                // Apply REDOs to Data Disk
                setDataDisk(currentData => {
                    const newData = JSON.parse(JSON.stringify(currentData));
                    actionsToReplay.forEach(record => {
                        const match = record.target.match(/P(\d+) \/ Row (\d+)/);
                        if (match) {
                            const pIdx = parseInt(match[1]) - 1;
                            const rId = parseInt(match[2]);
                            const rIdx = newData[pIdx].rows.findIndex(r => r.id === rId);
                            if (rIdx !== -1) {
                                newData[pIdx].rows[rIdx].val = record.newValue;
                                triggerRowFlash(pIdx, rId); // Flash row on recovery
                            }
                        }
                    });
                    return newData;
                });

                // Move to UNDO
                setRecoveryPhase('UNDO');

                setTimeout(() => {
                    // 3. UNDO PASS (Sweep Backward)
                    // For this visualizer, we just drop active Txns from the active list.

                    setActiveTransactions(restoredTxns);
                    setSystemState('NORMAL');
                    setRecoveryPhase(null);

                }, 2000); // Wait in UNDO phase

            }, 2500); // Wait in REDO phase

        }, 1500); // Wait in ANALYSIS phase

    }, [walDisk]);

    return {
        systemState,
        recoveryPhase,
        isFlushing,
        lastUpdatedRowId,
        activeTransactions,
        logTail,
        walDisk,
        dataDisk,
        beginTransaction,
        updateRow,
        commitTransaction,
        forceFlushWal,
        checkpointDataPages,
        crashSystem,
        recoverSystem
    };
}
