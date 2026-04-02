import React, { useState, useEffect, useRef } from 'react';
import Table from './Table';
import Arena from './Arena';
import Explain from './Explain';
import SpeedController from './SpeedController';
import { Play, Pause, RotateCcw, Square, Zap } from 'lucide-react';
import { usersColumns, usersData, ordersColumns, ordersData, resultColumns } from '../App';

export default function NestedLoopVisualizer({ joinType, setJoinType, speed, setSpeed }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [useIndex, setUseIndex] = useState(false); // Enable Index Nested Loop Join

    const [outerIndex, setOuterIndex] = useState(-1);
    const [innerIndex, setInnerIndex] = useState(-1);
    const [resultSet, setResultSet] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const stateRef = useRef({
        outerIndex: -1,
        innerIndex: -1,
        resultSet: [],
        joinType: 'INNER',
        useIndex: false,
        hasMatchedCurrentOuter: false,
        matchedInnerIndices: new Set()
    });

    useEffect(() => {
        stateRef.current.outerIndex = outerIndex;
        stateRef.current.innerIndex = innerIndex;
        stateRef.current.resultSet = resultSet;
        stateRef.current.joinType = joinType;
        stateRef.current.useIndex = useIndex;
    }, [outerIndex, innerIndex, resultSet, joinType, useIndex]);


    const stepAlgorithm = () => {
        let {
            outerIndex: currOuter,
            innerIndex: currInner,
            joinType: currentType,
            useIndex: isIndexed
        } = stateRef.current;

        let nextOuter = currOuter;
        let nextInner = currInner;

        if (nextOuter < usersData.length) {

            // Initialization Step
            if (currOuter === -1) {
                nextOuter = 0;

                if (isIndexed) {
                    // INDEX JUMP: Find the *first* match immediately for the new outer row
                    const targetId = usersData[0].id;
                    const matchIdx = ordersData.findIndex(o => o.user_id === targetId);
                    nextInner = matchIdx !== -1 ? matchIdx : ordersData.length;
                } else {
                    nextInner = 0;
                }

                stateRef.current.hasMatchedCurrentOuter = false;
            } else {
                // Standard Advance
                if (isIndexed) {
                    // INDEX JUMP: Can we find *another* match after the current one?
                    const targetId = usersData[nextOuter].id;
                    const nextMatchIdx = ordersData.findIndex((o, idx) => o.user_id === targetId && idx > currInner);
                    nextInner = nextMatchIdx !== -1 ? nextMatchIdx : ordersData.length;
                } else {
                    nextInner++;
                }
            }

            // Inner Loop Exhausted for current Outer Row
            if (nextInner >= ordersData.length) {
                if (!stateRef.current.hasMatchedCurrentOuter && (currentType === 'LEFT' || currentType === 'FULL OUTER')) {
                    const currentUser = usersData[currOuter];
                    setResultSet(prev => [...prev, {
                        u_id: currentUser.id, u_name: currentUser.name, o_id: null, o_product: null
                    }]);
                }
                nextOuter++;
                stateRef.current.hasMatchedCurrentOuter = false;

                // Set inner index for the *next* outer row
                if (nextOuter < usersData.length) {
                    if (isIndexed) {
                        const targetId = usersData[nextOuter].id;
                        const matchIdx = ordersData.findIndex(o => o.user_id === targetId);
                        nextInner = matchIdx !== -1 ? matchIdx : ordersData.length; // Jump to match or exhausted string
                    } else {
                        nextInner = 0;
                    }
                }
            }

            // Outer Loop Exhausted (Completion and Right/Full Sweeps)
            if (nextOuter >= usersData.length) {
                if (currentType === 'RIGHT' || currentType === 'FULL OUTER') {
                    let newResults = [];
                    ordersData.forEach((order, index) => {
                        if (!stateRef.current.matchedInnerIndices.has(index)) {
                            newResults.push({ u_id: null, u_name: null, o_id: order.order_id, o_product: order.product });
                        }
                    });
                    if (newResults.length > 0) setResultSet(prev => [...prev, ...newResults]);
                }
                setIsPlaying(false);
                setIsComplete(true);
                setOuterIndex(-1);
                setInnerIndex(-1);
                return;
            }

            const currentUser = usersData[nextOuter];
            const currentOrder = ordersData[nextInner];

            if (currentUser && currentOrder) {
                if (currentUser.id === currentOrder.user_id) {
                    stateRef.current.hasMatchedCurrentOuter = true;
                    stateRef.current.matchedInnerIndices.add(nextInner);

                    // Small delay effect to let React render the jump before emitting the result
                    setResultSet(prev => [...prev, {
                        u_id: currentUser.id, u_name: currentUser.name, o_id: currentOrder.order_id, o_product: currentOrder.product
                    }]);
                }
            }

            setOuterIndex(nextOuter);
            setInnerIndex(nextInner);
        }
    };

    useEffect(() => {
        let timerId;
        if (isPlaying && !isComplete) timerId = setInterval(stepAlgorithm, speed);
        return () => clearInterval(timerId);
    }, [isPlaying, isComplete, speed]);

    const resetAnimation = () => {
        setIsPlaying(false);
        setIsComplete(false);
        setOuterIndex(-1);
        setInnerIndex(-1);
        setResultSet([]);
        stateRef.current.hasMatchedCurrentOuter = false;
        stateRef.current.matchedInnerIndices.clear();
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', background: 'var(--bg-deep)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--inner-glow)' }}>
                            <input
                                type="checkbox"
                                id="indexToggle"
                                checked={useIndex}
                                onChange={(e) => { setUseIndex(e.target.checked); resetAnimation(); }}
                                disabled={isPlaying}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }}
                            />
                            <label htmlFor="indexToggle" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Zap size={16} color="var(--accent-blue)" /> Use B+ Tree Index on Inner Table (Orders)
                            </label>
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
                                backgroundColor: isPlaying ? 'var(--accent-red)' : 'var(--accent-blue)',
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
                        <Table title="Table A: Users" columns={usersColumns} data={usersData} activeRowIndex={outerIndex} accentColor="var(--accent-blue)" />
                    </div>
                    <div className="panel table-panel">
                        <Table title="Table B: Orders" columns={ordersColumns} data={ordersData} activeRowIndex={innerIndex} accentColor="var(--accent-green)" />
                    </div>
                </section>

                <section className="execution-row gap-8">
                    <div className="panel arena-panel">
                        <Arena algo="Nested Loop" currentOuterRow={outerIndex >= 0 ? usersData[outerIndex] : null} currentInnerRow={innerIndex >= 0 ? ordersData[innerIndex] : null} />
                    </div>
                    <div className="panel result-panel">
                        <Table title={`Result Set (${joinType})`} columns={resultColumns} data={resultSet} activeRowIndex={-1} accentColor="var(--accent-purple)" />
                    </div>
                </section>

                <Explain joinType={joinType} algo="NESTED_LOOP" isIndexed={useIndex} />
            </div>
        </main>
    );
}
