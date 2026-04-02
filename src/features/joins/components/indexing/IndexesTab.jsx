import React, { useState, useEffect, useRef } from 'react';
import BTreeArena from './BTreeArena';
import DiskPage from './DiskPage';
import SpeedController from '../SpeedController';
import Explain from '../Explain';
import { Play, Pause, RotateCcw, Square, Search } from 'lucide-react';
import { usersData } from '../../App';

export default function IndexesTab() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(800);
    const [searchTarget, setSearchTarget] = useState(8); // Default search for ID 8

    // State Machine variables
    const [phase, setPhase] = useState('IDLE'); // IDLE, SEARCHING, RESOLVING_LEAF, FETCHING_DISK_PAGE, COMPLETE
    const [activeNodePath, setActiveNodePath] = useState([]);
    const [activePageId, setActivePageId] = useState(null);
    const [resolvedRow, setResolvedRow] = useState(null);

    const stateRef = useRef({
        phase: 'IDLE',
        currentDepth: 0,
        searchTarget: 8
    });

    useEffect(() => {
        stateRef.current.phase = phase;
        stateRef.current.searchTarget = searchTarget;
    }, [phase, searchTarget]);

    // Hardcoded Traversal Logic mapping searchTarget to the exact animation path
    const getSearchPath = (targetId) => {
        // Tree ranges:
        // Root splits at 5, 9
        // Internal 1 (keys<5): Leaf 1 (1,2) -> Page A | Leaf 2 (3,4) -> Page B
        // Internal 2 (5<=keys<9): Leaf 3 (6,7) -> Page C | Leaf 4 (8) -> Page D
        // Internal 3 (keys>=9): Leaf 5 (10,11) -> Page E | Leaf 6 (12) -> Page F

        let path = ['root'];
        let page = '';

        if (targetId < 5) {
            path.push('int-1');
            if (targetId <= 2) { path.push('leaf-1'); page = 'page-A'; }
            else { path.push('leaf-2'); page = 'page-B'; }
        } else if (targetId < 9) {
            path.push('int-2');
            if (targetId <= 7) { path.push('leaf-3'); page = 'page-C'; }
            else { path.push('leaf-4'); page = 'page-D'; }
        } else {
            path.push('int-3');
            if (targetId <= 11) { path.push('leaf-5'); page = 'page-E'; }
            else { path.push('leaf-6'); page = 'page-F'; }
        }

        return { nodePath: path, pageId: page };
    };

    const stepAlgorithm = () => {
        let { phase: currPhase, currentDepth, searchTarget: target } = stateRef.current;
        const { nodePath, pageId } = getSearchPath(target);

        if (currPhase === 'IDLE' || currPhase === 'SEARCHING') {
            if (currentDepth === 0 && currPhase === 'IDLE') {
                setPhase('SEARCHING');
            }

            // Advance the depth
            const nodesToLightUp = nodePath.slice(0, currentDepth + 1);
            setActiveNodePath(nodesToLightUp);

            if (currentDepth === 2) {
                // We hit the leaf node!
                setPhase('RESOLVING_LEAF');
                stateRef.current.currentDepth = 3;
            } else {
                stateRef.current.currentDepth++;
            }
        }
        else if (currPhase === 'RESOLVING_LEAF') {
            // Found the pointer, now we must fetch the page from disk (simulating I/O delay)
            setActivePageId(pageId);
            setPhase('FETCHING_DISK_PAGE');
        }
        else if (currPhase === 'FETCHING_DISK_PAGE') {
            // Disk fetch complete, show the extracted row
            const record = usersData.find(u => u.id === target);
            setResolvedRow(record || { error: 'Record not found' });
            setPhase('COMPLETE');
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        let timerId;
        if (isPlaying && phase !== 'COMPLETE') {
            timerId = setInterval(stepAlgorithm, speed);
        }
        return () => clearInterval(timerId);
    }, [isPlaying, phase, speed]);

    const resetAnimation = () => {
        setIsPlaying(false);
        setPhase('IDLE');
        setActiveNodePath([]);
        setActivePageId(null);
        setResolvedRow(null);
        stateRef.current.phase = 'IDLE';
        stateRef.current.currentDepth = 0;
    };

    const handleStart = () => {
        if (phase === 'COMPLETE') resetAnimation();
        setTimeout(() => setIsPlaying(true), 50);
    };

    return (
        <div className="tab-content" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div className="dashboard-grid">
                <section className="panel controller-panel">
                    <h2>Query Engine Setup</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Search Query
                            </label>
                            <div style={{
                                marginTop: '0.5rem',
                                background: 'var(--bg-deep)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                fontFamily: 'monospace',
                                boxShadow: 'var(--inner-glow)',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: 'var(--accent-purple)', marginRight: '8px' }}>SELECT</span> *
                                <span style={{ color: 'var(--accent-purple)', margin: '0 8px' }}>FROM</span> Users
                                <span style={{ color: 'var(--accent-purple)', margin: '0 8px' }}>WHERE</span> id =
                                <select
                                    value={searchTarget}
                                    onChange={(e) => { setSearchTarget(Number(e.target.value)); resetAnimation(); }}
                                    disabled={isPlaying}
                                    style={{
                                        marginLeft: '10px',
                                        background: 'var(--bg-surface)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-highlight)',
                                        padding: '0.3rem 0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        fontFamily: 'monospace',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    {[1, 2, 3, 4, 6, 7, 8, 10, 11, 12].map(id => (
                                        <option key={id} value={id}>{id}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <SpeedController speed={speed} setSpeed={setSpeed} isPlaying={isPlaying} />

                        <div className="playback-controls" style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="play-btn"
                                onClick={isPlaying ? () => setIsPlaying(false) : handleStart}
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
                                {isPlaying ? <><Pause size={18} /> Pause</> : phase === 'COMPLETE' ? <><RotateCcw size={18} /> Restart</> : <><Play size={18} /> Execute Query</>}
                            </button>
                            <button onClick={resetAnimation} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
                                <Square size={18} /> Reset
                            </button>
                        </div>
                    </div>
                </section>

                {/* Tree and Disk side-by-side on large screens, stacked on small */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div className="panel" style={{ flex: '2 1 600px', padding: 0 }}>
                        <BTreeArena
                            activeNodePath={activeNodePath}
                            searchQuery={searchTarget}
                            phase={phase}
                        />
                    </div>

                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
                        <DiskPage activePageId={activePageId} rowPayload={resolvedRow} phase={phase} />
                    </div>
                </div>

                <Explain algo="BTREE_SEARCH" />
            </div>
        </div>
    );
}
