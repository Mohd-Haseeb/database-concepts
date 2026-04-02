import React from 'react';
import { motion } from 'framer-motion';
import '../Arena.css';

export default function BTreeArena({
    activeNodePath = [], // e.g., ['root', 'internal-left', 'leaf-2']
    searchQuery = null,
    phase = 'IDLE' // 'IDLE', 'SEARCHING', 'RESOLVING_LEAF', 'FETCHING_DISK_PAGE', 'COMPLETE'
}) {

    // Hardcoded B+ Tree Structure (Degree 3-ish for visual simplicity)
    // Indexing on User ID (1-12)
    const treeConfig = {
        root: { id: 'root', keys: [5, 9] },
        internal: [
            { id: 'int-1', keys: [3] },
            { id: 'int-2', keys: [7] },
            { id: 'int-3', keys: [11] }
        ],
        leaves: [
            { id: 'leaf-1', keys: [{ id: 1 }, { id: 2 }], pageRef: 'page-A' },
            { id: 'leaf-2', keys: [{ id: 3 }, { id: 4 }], pageRef: 'page-B' },
            { id: 'leaf-3', keys: [{ id: 6 }, { id: 7 }], pageRef: 'page-C' },
            { id: 'leaf-4', keys: [{ id: 8 }], pageRef: 'page-D' },
            { id: 'leaf-5', keys: [{ id: 10 }, { id: 11 }], pageRef: 'page-E' },
            { id: 'leaf-6', keys: [{ id: 12 }], pageRef: 'page-F' }
        ]
    };

    const renderNode = (node, type) => {
        const isActive = activeNodePath.includes(node.id);

        return (
            <motion.div
                key={node.id}
                className={`btree-node ${type}-node ${isActive ? 'active-node' : ''}`}
                animate={{
                    scale: isActive ? 1.1 : 1,
                    borderColor: isActive ? 'var(--accent-blue)' : 'var(--border-color)',
                    boxShadow: isActive ? '0 0 20px rgba(43, 116, 226, 0.4)' : 'none'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {/* Render the keys within the node block */}
                {node.keys.map((keyObj, i) => {
                    const val = typeof keyObj === 'object' ? keyObj.id : keyObj;
                    const isTargetHit = (phase === 'RESOLVING_LEAF' || phase === 'FETCHING_DISK_PAGE' || phase === 'COMPLETE') && val === searchQuery;

                    return (
                        <React.Fragment key={i}>
                            <div className={`node-cell ${isTargetHit ? 'target-hit' : ''}`}>
                                {val}
                            </div>
                            {/* Render separators block for child pointers (internal/root nodes only) */}
                            {i < node.keys.length - 1 && type !== 'leaf' && <div className="node-divider" />}
                        </React.Fragment>
                    );
                })}
            </motion.div>
        );
    };

    return (
        <div className="arena-container btree-container">
            <div className="arena-header">
                <span className="algo-badge" style={{ color: 'var(--accent-green)', borderColor: 'var(--border-color)', background: 'var(--bg-deep)', boxShadow: '0 0 10px rgba(0, 204, 102, 0.15), var(--inner-glow)' }}>
                    B+ Tree Index
                </span>
                <div className="arena-status">
                    {phase === 'IDLE' && 'Waiting for query...'}
                    {phase === 'SEARCHING' && `Traversing B-Tree for ID = ${searchQuery}...`}
                    {phase === 'RESOLVING_LEAF' && `Leaf hit! Resolving Physical Row ID...`}
                    {phase === 'FETCHING_DISK_PAGE' && `Requesting 8KB Page from Disk...`}
                    {phase === 'COMPLETE' && `Query Complete. Payload Retrieved.`}
                </div>
            </div>

            <div className="btree-stage">

                {/* Level 1: Root */}
                <div className="tree-level root-level">
                    {renderNode(treeConfig.root, 'root')}
                </div>

                {/* Connective Lines (Visual Only, CSS driven for simplicity) */}
                <div className="tree-connectors level-1-connectors">
                    <div className="line left" />
                    <div className="line center" />
                    <div className="line right" />
                </div>

                {/* Level 2: Internal Nodes */}
                <div className="tree-level internal-level">
                    {treeConfig.internal.map(node => renderNode(node, 'internal'))}
                </div>

                {/* Level 3: Leaf Nodes (Doubly Linked) */}
                <div className="tree-level leaf-level">
                    {treeConfig.leaves.map((node, i) => (
                        <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
                            {renderNode(node, 'leaf')}
                            {i < treeConfig.leaves.length - 1 && (
                                <div className="doubly-linked-arrow">↔</div>
                            )}
                        </div>
                    ))}
                </div>

            </div>

            <style>{`
        .btree-container {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            /* Subtle glowing grid background */
            background-image: 
                radial-gradient(circle at center, rgba(0, 204, 102, 0.05) 0%, transparent 80%),
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 100% 100%, 20px 20px, 20px 20px;
        }

        .btree-stage {
            flex: 1;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-around;
            gap: 2rem;
        }

        .tree-level {
            display: flex;
            gap: 3rem;
            justify-content: center;
            width: 100%;
        }

        .btree-node {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            display: flex;
            align-items: center;
            padding: 0.25rem;
            box-shadow: var(--shadow-sm), var(--inner-glow);
            position: relative;
            z-index: 2;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .node-cell {
            padding: 0.5rem 1rem;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            color: var(--text-primary);
            font-size: 0.9rem;
        }

        .node-divider {
            width: 1px;
            height: 100%;
            background: var(--border-color);
        }

        .active-node {
            background: var(--bg-deep);
            border-color: var(--accent-blue);
            box-shadow: 0 0 25px rgba(43, 116, 226, 0.2), 0 0 0 1px var(--accent-blue-glow);
            transform: translateY(-2px);
        }

        .target-hit {
            background: var(--accent-green);
            color: var(--bg-deep);
            border-radius: 6px;
            font-weight: bold;
            box-shadow: 0 0 20px var(--accent-green-glow);
        }

        .leaf-node {
            border-bottom: 3px solid var(--accent-purple); 
        }

        .doubly-linked-arrow {
            color: var(--text-muted);
            font-size: 1.2rem;
            margin: 0 0.5rem;
        }

        /* Abstract structural lines */
        .tree-connectors {
            display: flex;
            width: 60%;
            justify-content: space-between;
            height: 30px;
            position: relative;
            margin-top: -2rem;
            margin-bottom: -2rem;
            opacity: 0.3;
            z-index: 1;
        }

        .tree-connectors .line {
            width: 2px;
            height: 100%;
            background: var(--border-color);
        }

        .tree-connectors .left { transform: rotate(45deg); }
        .tree-connectors .right { transform: rotate(-45deg); }
      `}</style>
        </div>
    );
}
