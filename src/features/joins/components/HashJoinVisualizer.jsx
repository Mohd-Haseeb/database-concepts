import React, { useState, useEffect, useRef } from 'react';
import Table from './Table';
import HashArena from './HashArena';
import Explain from './Explain';
import SpeedController from './SpeedController';
import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import { usersColumns, usersData, ordersColumns, ordersData, resultColumns } from '../App';

export default function HashJoinVisualizer({ joinType, setJoinType, speed, setSpeed }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState('BUILD'); // 'BUILD' or 'PROBE'

    const [outerIndex, setOuterIndex] = useState(-1);
    const [innerIndex, setInnerIndex] = useState(-1);

    // Hash Table State
    const [hashBuckets, setHashBuckets] = useState({});
    const [currentHashKey, setCurrentHashKey] = useState(null);
    const [hashingValue, setHashingValue] = useState(null);

    const [resultSet, setResultSet] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    const stateRef = useRef({
        phase: 'BUILD',
        outerIndex: -1,
        innerIndex: -1,
        resultSet: [],
        joinType: 'INNER',
        hashBuckets: {},
        matchedInnerIndices: new Set() // Needed for Right/Full
    });

    useEffect(() => {
        stateRef.current.phase = phase;
        stateRef.current.outerIndex = outerIndex;
        stateRef.current.innerIndex = innerIndex;
        stateRef.current.resultSet = resultSet;
        stateRef.current.joinType = joinType;
        stateRef.current.hashBuckets = hashBuckets;
    }, [phase, outerIndex, innerIndex, resultSet, joinType, hashBuckets]);

    // Extremely simple hash function for visual purposes (mod 4)
    const getHashBucket = (val) => val % 4;

    const stepAlgorithm = () => {
        let {
            phase: currPhase,
            outerIndex: currOuter,
            innerIndex: currInner,
            joinType: currentType,
            hashBuckets: currBuckets
        } = stateRef.current;

        if (currPhase === 'BUILD') {
            let nextInner = currInner + 1;

            if (nextInner >= ordersData.length) {
                // Build phase is complete! Move to probe phase.
                setPhase('PROBE');
                setInnerIndex(-1);
                setCurrentHashKey(null);
                setHashingValue(null);
                return;
            }

            // Hash the current inner row into a bucket
            const currentOrder = ordersData[nextInner];
            const hashStr = currentOrder.user_id; // Usually we hash the join key
            const bucketId = getHashBucket(hashStr);

            setHashingValue(hashStr);
            setCurrentHashKey(bucketId);

            const newBuckets = { ...currBuckets };
            if (!newBuckets[bucketId]) newBuckets[bucketId] = [];
            newBuckets[bucketId].push({ ...currentOrder, originalIndex: nextInner }); // Keep index for later sweeps

            setHashBuckets(newBuckets);
            setInnerIndex(nextInner);

        } else if (currPhase === 'PROBE') {
            let nextOuter = currOuter + 1;

            if (nextOuter >= usersData.length) {
                // Processing complete. Handle Right/Full sweeps
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
                setCurrentHashKey(null);
                setHashingValue(null);
                return;
            }

            const currentUser = usersData[nextOuter];
            const targetBucketId = getHashBucket(currentUser.id);

            setHashingValue(currentUser.id);
            setCurrentHashKey(targetBucketId);
            setOuterIndex(nextOuter);

            // Probe the bucket
            const itemsInBucket = currBuckets[targetBucketId] || [];
            let foundMatch = false;

            itemsInBucket.forEach(item => {
                if (currentUser.id === item.user_id) {
                    foundMatch = true;
                    stateRef.current.matchedInnerIndices.add(item.originalIndex);
                    setResultSet(prev => [...prev, {
                        u_id: currentUser.id, u_name: currentUser.name, o_id: item.order_id, o_product: item.product
                    }]);
                }
            });

            if (!foundMatch && (currentType === 'LEFT' || currentType === 'FULL OUTER')) {
                setResultSet(prev => [...prev, {
                    u_id: currentUser.id, u_name: currentUser.name, o_id: null, o_product: null
                }]);
            }
        }
    };

    useEffect(() => {
        let timerId;
        // Hash joins do a lot visually (flying to buckets), so we slightly pad the speed
        if (isPlaying && !isComplete) timerId = setInterval(stepAlgorithm, speed + 100);
        return () => clearInterval(timerId);
    }, [isPlaying, isComplete, speed]);

    const resetAnimation = () => {
        setIsPlaying(false);
        setIsComplete(false);
        setPhase('BUILD');
        setOuterIndex(-1);
        setInnerIndex(-1);
        setResultSet([]);
        setHashBuckets({});
        setCurrentHashKey(null);
        setHashingValue(null);
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
                                backgroundColor: isPlaying ? 'var(--accent-red)' : 'var(--accent-purple)',
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
                    {/* Note during Build phase we dim the Outer table, and vice-versa */}
                    <div className="panel table-panel" style={{ opacity: phase === 'BUILD' ? 0.4 : 1, transition: 'opacity 0.5s' }}>
                        <Table title="Table A: Users (Outer)" columns={usersColumns} data={usersData} activeRowIndex={outerIndex} accentColor="var(--accent-blue)" />
                    </div>
                    <div className="panel table-panel" style={{ opacity: phase === 'PROBE' ? 0.4 : 1, transition: 'opacity 0.5s' }}>
                        <Table title="Table B: Orders (Inner)" columns={ordersColumns} data={ordersData} activeRowIndex={innerIndex} accentColor="var(--accent-green)" />
                    </div>
                </section>

                <section className="execution-row gap-8">
                    <div className="panel arena-panel">
                        <HashArena
                            phase={phase}
                            activeBuckets={hashBuckets}
                            currentHashKey={currentHashKey}
                            hashingValue={hashingValue}
                        />
                    </div>
                    <div className="panel result-panel">
                        <Table title={`Result Set (${joinType})`} columns={resultColumns} data={resultSet} activeRowIndex={-1} accentColor="var(--accent-purple)" />
                    </div>
                </section>

                <Explain joinType={joinType} algo="HASH_JOIN" />
            </div>
        </main>
    );
}
