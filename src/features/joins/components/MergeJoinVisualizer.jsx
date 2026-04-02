import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import Table from './Table';
import MergeArena from './MergeArena';
import Explain from './Explain';
import SpeedController from './SpeedController';
// We need fresh, unsorted copies to demonstrate the sort phase properly
import { usersColumns, usersData, ordersColumns, ordersData, resultColumns } from '../App';

export default function MergeJoinVisualizer({ joinType, setJoinType, speed, setSpeed }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState('SORT'); // 'SORT' or 'MERGE'

    // Sorted data states
    const [sortedUsers, setSortedUsers] = useState([...usersData]);
    const [sortedOrders, setSortedOrders] = useState([...ordersData]);

    const [outerIndex, setOuterIndex] = useState(-1);
    const [innerIndex, setInnerIndex] = useState(-1);
    const [comparisonResult, setComparisonResult] = useState(null); // 'LEFT_SMALLER', 'RIGHT_SMALLER', 'MATCH'

    const [resultSet, setResultSet] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const stateRef = useRef({
        phase: 'SORT',
        outerIndex: -1,
        innerIndex: -1,
        resultSet: [],
        joinType: 'INNER',
        sortedUsers: [...usersData],
        sortedOrders: [...ordersData],
        comparisonResult: null,
        matchedOuter: false
    });

    useEffect(() => {
        stateRef.current.phase = phase;
        stateRef.current.outerIndex = outerIndex;
        stateRef.current.innerIndex = innerIndex;
        stateRef.current.resultSet = resultSet;
        stateRef.current.joinType = joinType;
        stateRef.current.sortedUsers = sortedUsers;
        stateRef.current.sortedOrders = sortedOrders;
        stateRef.current.comparisonResult = comparisonResult;
    }, [phase, outerIndex, innerIndex, resultSet, joinType, sortedUsers, sortedOrders, comparisonResult]);


    const stepAlgorithm = () => {
        let {
            phase: currPhase,
            outerIndex: currOuter,
            innerIndex: currInner,
            joinType: currentType,
            sortedUsers: currentUsers,
            sortedOrders: currentOrders
        } = stateRef.current;

        // --- PHASE 1: SORT ---
        if (currPhase === 'SORT') {
            const newlySortedUsers = [...currentUsers].sort((a, b) => a.id - b.id);
            const newlySortedOrders = [...currentOrders].sort((a, b) => a.user_id - b.user_id);

            setSortedUsers(newlySortedUsers);
            setSortedOrders(newlySortedOrders);
            setPhase('MERGE');

            // Setup initial pointers for the next tick
            setOuterIndex(0);
            setInnerIndex(0);
            return;
        }

        // --- PHASE 2: MERGE ---
        if (currPhase === 'MERGE') {

            // Handle Completion
            if (currOuter >= currentUsers.length && currInner >= currentOrders.length) {
                setIsPlaying(false);
                setIsComplete(true);
                setOuterIndex(-1);
                setInnerIndex(-1);
                setComparisonResult(null);
                return;
            }

            const leftRow = currOuter < currentUsers.length ? currentUsers[currOuter] : null;
            const rightRow = currInner < currentOrders.length ? currentOrders[currInner] : null;

            // If one side is exhausted, we must sweep the rest (for Outer Joins)
            if (!leftRow) {
                setComparisonResult('RIGHT_SMALLER');
                if (currentType === 'RIGHT' || currentType === 'FULL OUTER') {
                    setResultSet(prev => [...prev, { u_id: null, u_name: null, o_id: rightRow.order_id, o_product: rightRow.product }]);
                }
                setInnerIndex(currInner + 1);
                return;
            }

            if (!rightRow) {
                setComparisonResult('LEFT_SMALLER');
                if (currentType === 'LEFT' || currentType === 'FULL OUTER') {
                    if (!stateRef.current.matchedOuter) {
                        setResultSet(prev => [...prev, { u_id: leftRow.id, u_name: leftRow.name, o_id: null, o_product: null }]);
                    }
                }
                setOuterIndex(currOuter + 1);
                stateRef.current.matchedOuter = false;
                return;
            }

            // Both rows exist, compare join keys
            const leftKey = leftRow.id;
            const rightKey = rightRow.user_id;

            if (leftKey === rightKey) {
                setComparisonResult('MATCH');
                stateRef.current.matchedOuter = true;

                setResultSet(prev => [...prev, {
                    u_id: leftRow.id, u_name: leftRow.name, o_id: rightRow.order_id, o_product: rightRow.product
                }]);

                // In a true merge join, if we have duplicate keys, we must hold the left pointer
                // and advance the right pointer until the block of duplicates is exhausted.
                // For simplicity in this visualizer, we assume 1:N cardinality (unique users)
                // so we advance right.
                setInnerIndex(currInner + 1);

            } else if (leftKey < rightKey) {
                setComparisonResult('LEFT_SMALLER');

                // Left is smaller, and we didn't match it. Emit NULL if LEFT JOIN
                if (!stateRef.current.matchedOuter && (currentType === 'LEFT' || currentType === 'FULL OUTER')) {
                    setResultSet(prev => [...prev, { u_id: leftRow.id, u_name: leftRow.name, o_id: null, o_product: null }]);
                }

                setOuterIndex(currOuter + 1);
                stateRef.current.matchedOuter = false;

            } else {
                setComparisonResult('RIGHT_SMALLER');

                // Right is smaller, emit NULL if RIGHT JOIN
                if (currentType === 'RIGHT' || currentType === 'FULL OUTER') {
                    setResultSet(prev => [...prev, { u_id: null, u_name: null, o_id: rightRow.order_id, o_product: rightRow.product }]);
                }

                setInnerIndex(currInner + 1);
            }
        }
    };

    useEffect(() => {
        let timerId;
        // The sort phase takes a bit longer visually, so we pad it based on the current speed
        const intervalTime = phase === 'SORT' ? speed + 600 : speed;

        if (isPlaying && !isComplete) timerId = setInterval(stepAlgorithm, intervalTime);
        return () => clearInterval(timerId);
    }, [isPlaying, isComplete, phase, speed]);

    const resetAnimation = () => {
        setIsPlaying(false);
        setIsComplete(false);
        setPhase('SORT');
        setOuterIndex(-1);
        setInnerIndex(-1);
        setResultSet([]);
        setComparisonResult(null);
        stateRef.current.matchedOuter = false;
        // Reset data to unsorted states
        setSortedUsers([...usersData]);
        setSortedOrders([...ordersData]);
    };

    return (
        <main className="container main-content">
            <div className="dashboard-grid">
                <section className="panel controller-panel">
                    <h2>Join Controller</h2>
                    <div className="join-selectors gap-4" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Segmented Control */}
                        <div style={{
                            display: 'flex',
                            background: 'var(--bg-deep)',
                            padding: '0.35rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--inner-glow)'
                        }}>
                            {['INNER', 'LEFT', 'RIGHT', 'FULL OUTER'].map((type) => (
                                <button
                                    key={type}
                                    className={joinType === type ? 'active-tab' : 'inactive-tab'}
                                    onClick={() => { setJoinType(type); resetAnimation(); }}
                                    disabled={isPlaying}
                                    style={{
                                        flex: 1,
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        border: 'none',
                                        background: joinType === type ? 'var(--bg-surface)' : 'transparent',
                                        boxShadow: joinType === type ? 'var(--shadow-sm)' : 'none',
                                        color: joinType === type ? 'var(--text-primary)' : 'var(--text-muted)'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <SpeedController speed={speed} setSpeed={setSpeed} isPlaying={isPlaying} />

                    <div className="playback-controls" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <button
                            className="play-btn"
                            onClick={() => {
                                if (isComplete) { resetAnimation(); setTimeout(() => setIsPlaying(true), 50); }
                                else { setIsPlaying(!isPlaying); }
                            }}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                fontSize: '1rem',
                                backgroundColor: isPlaying ? 'var(--accent-red)' : 'var(--accent-green)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                borderRadius: '12px'
                            }}
                        >
                            {isPlaying ? <><Pause size={18} /> Pause</> : isComplete ? <><RotateCcw size={18} /> Restart</> : <><Play size={18} /> Start Animation</>}
                        </button>
                        <button onClick={resetAnimation} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
                            <Square size={18} /> Reset
                        </button>
                    </div>
                </section>

                <section className="tables-row gap-8">
                    <div className="panel table-panel">
                        <Table
                            title={phase === 'SORT' ? "Table A: Users (Unsorted)" : "Table A: Users (Sorted)"}
                            columns={usersColumns}
                            data={sortedUsers}
                            activeRowIndex={outerIndex}
                            accentColor="var(--accent-blue)"
                        />
                    </div>
                    <div className="panel table-panel">
                        <Table
                            title={phase === 'SORT' ? "Table B: Orders (Unsorted)" : "Table B: Orders (Sorted)"}
                            columns={ordersColumns}
                            data={sortedOrders}
                            activeRowIndex={innerIndex}
                            accentColor="var(--accent-green)"
                        />
                    </div>
                </section>

                <section className="execution-row gap-8">
                    <div className="panel arena-panel">
                        <MergeArena
                            phase={phase}
                            leftValue={outerIndex >= 0 && outerIndex < sortedUsers.length ? sortedUsers[outerIndex].id : null}
                            rightValue={innerIndex >= 0 && innerIndex < sortedOrders.length ? sortedOrders[innerIndex].user_id : null}
                            comparisonResult={comparisonResult}
                        />
                    </div>
                    <div className="panel result-panel">
                        <Table title={`Result Set (${joinType})`} columns={resultColumns} data={resultSet} activeRowIndex={-1} accentColor="var(--accent-purple)" />
                    </div>
                </section>

                <Explain joinType={joinType} algo="MERGE_JOIN" />
            </div>
        </main>
    );
}
