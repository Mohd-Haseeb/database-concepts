import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, FileSearch, RouteOff, Zap, Database, Hash, GitPullRequest } from 'lucide-react';
import '../index.css';

// Helper to pick an icon based on node type
const getNodeIcon = (type) => {
    switch (type) {
        case 'SelectStatement': return <FileSearch size={18} />;
        case 'Projection':
        case 'Project':
        case 'ProjectOperator': return <FileSearch size={18} />;
        case 'FromClause':
        case 'TableScan':
        case 'Scan': return <Database size={18} />;
        case 'IndexScan': return <Zap size={18} />;
        case 'WhereClause':
        case 'Filter': return <RouteOff size={18} />;
        case 'JoinClause':
        case 'Join':
        case 'HashJoin': return <GitPullRequest size={18} />;
        case 'OrderByClause':
        case 'Sort': return <RouteOff size={18} />;
        case 'GroupByClause':
        case 'Aggregate':
        case 'HashAggregate': return <Hash size={18} />;
        default: return <Network size={18} />;
    }
};

// Recursive component to draw the tree
function TreeNode({ node, level = 0 }) {
    if (!node) return null;

    return (
        <div className="tree-node-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Node Card */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`tree-node-card ${node.highlight ? 'highlighted' : ''}`}
            >
                <div className="node-header">
                    {getNodeIcon(node.type)}
                    <span className="node-label">{node.label}</span>
                </div>

                {node.details && (
                    <div className="node-details">{node.details}</div>
                )}

                {node.cost !== undefined && (
                    <div className="node-cost">
                        Cost: <span className="cost-value">{node.cost}</span>
                    </div>
                )}

                {node.note && (
                    <div className="node-note">
                        <i>{node.note}</i>
                    </div>
                )}
            </motion.div>

            {/* Children branches */}
            <div className="children-container">
                {node.children && node.children.map((child, idx) => (
                    <div key={idx} className="child-branch">
                        <div className="branch-line"></div>
                        <TreeNode node={child} level={level + 1} />
                    </div>
                ))}
            </div>

        </div>
    );
}

export default function PipelineVisualizer({ query, stage }) {
    const treeData = query.stages[stage];

    return (
        <div className="optimizer-panel pipeline-visualizer-panel">

            <div className="pipeline-header">
                <h3>2. Visualization: {stage.toUpperCase()}</h3>
                <p className="stage-description">
                    {stage === 'ast' && "The SQL string is parsed into an Abstract Syntax Tree, checking grammar and validity."}
                    {stage === 'logical' && "The AST is translated into a Logical Query Plan (relational algebra) without deciding exact algorithms."}
                    {stage === 'physical' && "The Query Optimizer assigns specific, cost-evaluated execution algorithms (e.g. Hash Join vs Nested Loop) to create the Physical Plan."}
                </p>
            </div>

            <div className="tree-canvas">
                <AnimatePresence mode="popLayout">
                    <TreeNode key={stage} node={treeData} />
                </AnimatePresence>
            </div>

        </div>
    );
}
