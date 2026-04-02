import React from 'react';
import { motion } from 'framer-motion';
import './Arena.css';

export default function MergeArena({ phase = 'SORT', leftValue = null, rightValue = null, comparisonResult = null }) {

    return (
        <div className="arena-container">
            <div className="arena-header">
                <span className="algo-badge" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)', background: 'rgba(255, 60, 60, 0.1)' }}>
                    Merge Join: {phase} Phase
                </span>
                <div className="arena-status">
                    {phase === 'SORT' ? 'Sorting both tables by Join Key...' : 'Merging with two pointers...'}
                </div>
            </div>

            <div className="merge-stage">
                <div className="pointer-boxes">

                    {/* Left Pointer */}
                    <div className={`merge-box ${comparisonResult === 'LEFT_SMALLER' ? 'dimmed' : ''}`}>
                        <div className="box-title" style={{ color: 'var(--accent-blue)' }}>Left Pointer (Users)</div>
                        <div className="box-value">
                            {leftValue !== null ? `ID: ${leftValue}` : '...'}
                        </div>
                        {comparisonResult === 'RIGHT_SMALLER' && (
                            <div className="action-hint">Waiting...</div>
                        )}
                        {comparisonResult === 'LEFT_SMALLER' && (
                            <div className="action-hint advance">Advance Left →</div>
                        )}
                    </div>

                    {/* Comparator */}
                    <div className="comparator-node merge-node">
                        <div className="node-icon" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', boxShadow: '0 0 15px rgba(255, 60, 60, 0.3)' }}>
                            {comparisonResult === 'MATCH' ? '==' : comparisonResult === 'LEFT_SMALLER' ? '<' : comparisonResult === 'RIGHT_SMALLER' ? '>' : '?'}
                        </div>
                        {comparisonResult === 'MATCH' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="match-badge"
                            >
                                MATCH!
                            </motion.div>
                        )}
                    </div>

                    {/* Right Pointer */}
                    <div className={`merge-box ${comparisonResult === 'RIGHT_SMALLER' ? 'dimmed' : ''}`}>
                        <div className="box-title" style={{ color: 'var(--accent-green)' }}>Right Pointer (Orders)</div>
                        <div className="box-value">
                            {rightValue !== null ? `User ID: ${rightValue}` : '...'}
                        </div>
                        {comparisonResult === 'LEFT_SMALLER' && (
                            <div className="action-hint">Waiting...</div>
                        )}
                        {comparisonResult === 'RIGHT_SMALLER' && (
                            <div className="action-hint advance">Advance Right →</div>
                        )}
                    </div>

                </div>
            </div>

            <style>{`
        .merge-stage {
            flex: 1;
            padding: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            /* Subtle glowing grid background */
            background-image: 
                radial-gradient(circle at center, rgba(255, 60, 60, 0.05) 0%, transparent 70%),
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 100% 100%, 20px 20px, 20px 20px;
        }

        .pointer-boxes {
            display: flex;
            align-items: center;
            gap: 2rem;
            width: 100%;
            max-width: 600px;
        }

        .merge-box {
            flex: 1;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            box-shadow: var(--shadow-sm), var(--inner-glow);
        }

        .merge-box.dimmed {
            opacity: 0.4;
            transform: scale(0.95);
            background: var(--bg-deep);
        }

        .box-title {
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .box-value {
            font-size: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-primary);
            background: var(--bg-deep);
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }

        .action-hint {
            position: absolute;
            bottom: -30px;
            left: 0;
            width: 100%;
            font-size: 0.85rem;
            color: var(--text-muted);
            font-style: italic;
        }

        .action-hint.advance {
            color: var(--accent-red);
            font-weight: bold;
            font-style: normal;
            text-shadow: 0 0 10px rgba(255, 60, 60, 0.4);
        }

        .match-badge {
            position: absolute;
            bottom: -40px;
            background: var(--accent-purple);
            color: white;
            padding: 0.35rem 1rem;
            border-radius: 16px;
            font-size: 0.85rem;
            font-weight: bold;
            box-shadow: 0 0 15px var(--accent-purple-glow);
            letter-spacing: 0.05em;
        }
      `}</style>
        </div>
    );
}
