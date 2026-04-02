import { useState, useCallback } from 'react';

// Simulated initial data pages (Disk)
const initialRows = [
    { physical_id: 1, logical_id: 101, balance: 500, xmin: 0, xmax: null },
    { physical_id: 2, logical_id: 102, balance: 300, xmin: 0, xmax: null },
];

export function useTransactionEngine() {
    // Global State
    const [globalXid, setGlobalXid] = useState(1);
    const [activeXids, setActiveXids] = useState(new Set()); // Transactions currently in-flight
    const [rows, setRows] = useState(initialRows);

    // Connection States
    const [connA, setConnA] = useState({ state: 'IDLE', xid: null, isolation: 'READ_COMMITTED' });
    const [connB, setConnB] = useState({ state: 'IDLE', xid: null, isolation: 'READ_COMMITTED' });

    const resetEngine = useCallback(() => {
        setGlobalXid(1);
        setActiveXids(new Set());
        setRows([...initialRows]);
        setConnA({ state: 'IDLE', xid: null, isolation: 'READ_COMMITTED' });
        setConnB({ state: 'IDLE', xid: null, isolation: 'READ_COMMITTED' });
    }, []);

    // --- Core MVCC Visibility Logic (PostgreSQL style) ---
    // Can Transaction T see Tuple t?
    const isVisible = useCallback((tuple, readerXid, readerIsolation) => {
        // Rule 1: It was created by an uncommitted transaction (and not by ME)
        if (tuple.xmin !== readerXid && activeXids.has(tuple.xmin)) return false;

        // Rule 2: It was created by a transaction from the future (happened after I started)
        // (Simplified logic for visualizer: if xmin > readerXid, it's theoretically from future, 
        // but Postgres uses a more complex snapshot. We'll simplify to just checking activeXids for READ COMMITTED)
        if (readerIsolation === 'REPEATABLE_READ' && tuple.xmin > readerXid) return false;

        // Rule 3: It was DELETED by a committed transaction
        if (tuple.xmax !== null) {
            // Was the deleter committed?
            const deleterIsActive = activeXids.has(tuple.xmax);
            // If the deleter committed AND the deleter is not ME, I shouldn't see it (usually)
            if (!deleterIsActive && tuple.xmax !== readerXid) {
                // If I am Repeatable Read, and the deleter committed AFTER I started, I SHOULD still see it.
                if (readerIsolation === 'REPEATABLE_READ' && tuple.xmax > readerXid) return true;
                return false; // Otherwise, it's gone.
            }

            // If the deleter IS ME, then I deleted it, so I shouldn't see it.
            if (tuple.xmax === readerXid) return false;
        }

        return true;
    }, [activeXids]);


    // --- Transaction Commands ---

    const beginTransaction = (connId) => {
        const newXid = globalXid;
        setGlobalXid(prev => prev + 1);

        const newActive = new Set(activeXids);
        newActive.add(newXid);
        setActiveXids(newActive);

        if (connId === 'A') setConnA({ ...connA, state: 'ACTIVE', xid: newXid });
        if (connId === 'B') setConnB({ ...connB, state: 'ACTIVE', xid: newXid });
    };

    const commitTransaction = (connId) => {
        const xid = connId === 'A' ? connA.xid : connB.xid;
        if (!xid) return;

        const newActive = new Set(activeXids);
        newActive.delete(xid);
        setActiveXids(newActive);

        if (connId === 'A') setConnA({ ...connA, state: 'IDLE', xid: null });
        if (connId === 'B') setConnB({ ...connB, state: 'IDLE', xid: null });
    };

    const rollbackTransaction = (connId) => {
        // In MVCC, rolling back means we leave the garbage rows (created by xid) on disk,
        // but we remove the xid from the active list. Since that xid never formally committed,
        // the visibility rules will forever treat those rows as "invisible" to everyone else.
        // Wait, postgres *aborts* the xid. We need a way to track aborted.
        // For simplicity in the visualizer, we can just actively clear the xmax on rows we tried to delete,
        // and mark our created rows as aborted (or just physically delete them to keep UI clean).
        const xid = connId === 'A' ? connA.xid : connB.xid;
        if (!xid) return;

        const newActive = new Set(activeXids);
        newActive.delete(xid);
        setActiveXids(newActive);

        // Cleanup "Dirty" Tuples for the visualizer
        setRows(prevRows => prevRows
            .filter(r => r.xmin !== xid) // Remove tuples we inserted
            .map(r => r.xmax === xid ? { ...r, xmax: null } : r) // Un-delete tuples we tried to delete
        );

        if (connId === 'A') setConnA({ ...connA, state: 'IDLE', xid: null });
        if (connId === 'B') setConnB({ ...connB, state: 'IDLE', xid: null });
    };

    const updateRow = (connId, logicalId, newBalance) => {
        const xid = connId === 'A' ? connA.xid : connB.xid;
        if (!xid) return; // Must be in a transaction

        setRows(prevRows => {
            const newRows = [...prevRows];

            // 1. Find the currently visible physical tuple for this logical ID
            // In a real DB, we'd traverse a chain. Here we just find the one that doesn't have a *committed* xmax.
            const targetTupleIdx = newRows.findIndex(r => r.logical_id === logicalId && (r.xmax === null || activeXids.has(r.xmax)));

            if (targetTupleIdx === -1) return newRows; // Doesn't exist

            const targetTuple = newRows[targetTupleIdx];

            // 2. Check for Write-Write Conflict (Row is locked / being updated by someone else)
            if (targetTuple.xmax !== null && targetTuple.xmax !== xid && activeXids.has(targetTuple.xmax)) {
                alert(`Write-Write Conflict! Blocked by Transaction ${targetTuple.xmax}`);
                return newRows;
            }

            // 3. Perform MVCC Update: 
            // Mark old tuple as deleted by ME
            newRows[targetTupleIdx] = { ...targetTuple, xmax: xid };

            // Insert new physical tuple
            const newPhysicalId = Math.max(...newRows.map(r => r.physical_id)) + 1;
            newRows.push({
                physical_id: newPhysicalId,
                logical_id: logicalId,
                balance: newBalance,
                xmin: xid,
                xmax: null
            });

            return newRows;
        });
    };

    return {
        globalXid, activeXids, rows,
        connA, connB, setConnA, setConnB,
        isVisible,
        beginTransaction, commitTransaction, rollbackTransaction, updateRow, resetEngine
    };
}
