import React, { useState } from 'react';
import NestedLoopVisualizer from '../NestedLoopVisualizer';
import HashJoinVisualizer from '../HashJoinVisualizer';
import MergeJoinVisualizer from '../MergeJoinVisualizer';

export default function JoinsTab() {
    const [algorithm, setAlgorithm] = useState('NESTED_LOOP');
    const [joinType, setJoinType] = useState('INNER');
    const [speed, setSpeed] = useState(600); // ms per tick

    return (
        <div className="tab-content" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="status-badge" style={{ alignSelf: 'flex-start', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                Algorithm:
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="algo-select"
                >
                    <option value="NESTED_LOOP">Nested Loop</option>
                    <option value="HASH_JOIN">Hash Join</option>
                    <option value="MERGE_JOIN">Merge Join</option>
                </select>
            </div>

            {algorithm === 'NESTED_LOOP' && <NestedLoopVisualizer key="nl" joinType={joinType} setJoinType={setJoinType} speed={speed} setSpeed={setSpeed} />}
            {algorithm === 'HASH_JOIN' && <HashJoinVisualizer key="hj" joinType={joinType} setJoinType={setJoinType} speed={speed} setSpeed={setSpeed} />}
            {algorithm === 'MERGE_JOIN' && <MergeJoinVisualizer key="mj" joinType={joinType} setJoinType={setJoinType} speed={speed} setSpeed={setSpeed} />}
        </div>
    );
}
