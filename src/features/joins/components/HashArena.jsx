import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Arena.css'; // Reuse core arena styles

export default function HashArena({ phase = 'BUILD', activeBuckets = {}, currentHashKey = null, hashingValue = null }) {
    // We'll simulate 4 hash buckets for visual spread (mod 4)
    const buckets = [0, 1, 2, 3];

    return (
        <div className="arena-container">
            <div className="arena-header">
                <span className="algo-badge" style={{ color: 'var(--accent-purple)', borderColor: 'var(--border-color)', background: 'var(--bg-deep)', boxShadow: '0 0 10px rgba(153, 51, 255, 0.15), var(--inner-glow)' }}>
                    Hash Join: {phase} Phase
                </span>
                <div className="arena-status">
                    {phase === 'BUILD' ? 'Hashing Inner Table (Orders) into Buckets...' : 'Probing Outer Table (Users) against Buckets...'}
                </div>
            </div>

            <div className="hash-stage">
                {/* The Hashing Function Visualizer */}
                <div className="hashing-function">
                    <div className="hash-box">
                        <span className="label">Hash Function: </span>
                        <span className="value">{hashingValue !== null ? `hash(${hashingValue}) % 4` : 'Waiting...'}</span>
                    </div>
                    <motion.div
                        className="hash-arrow"
                        animate={{ opacity: currentHashKey !== null ? 1 : 0.2 }}
                    >
                        ↓
                    </motion.div>
                </div>

                {/* The Buckets */}
                <div className="buckets-container">
                    {buckets.map(bucketId => {
                        const isActive = currentHashKey === bucketId;
                        const bucketItems = activeBuckets[bucketId] || [];

                        return (
                            <div key={`bucket-${bucketId}`} className={`hash-bucket ${isActive ? 'active-bucket' : ''}`}>
                                <div className="bucket-label">Bucket {bucketId}</div>
                                <div className="bucket-contents">
                                    <AnimatePresence>
                                        {bucketItems.map((item, idx) => (
                                            <motion.div
                                                key={`item-${item.order_id}-${idx}`}
                                                className="bucket-item"
                                                initial={{ y: -50, opacity: 0, scale: 0.8 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            >
                                                {item.user_id} → {item.product}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        .hash-stage {
            flex: 1;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
            /* Subtle glowing grid background */
            background-image: 
                radial-gradient(circle at center, rgba(153, 51, 255, 0.05) 0%, transparent 70%),
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 100% 100%, 20px 20px, 20px 20px;
        }

        .hashing-function {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
        }

        .hash-box {
            background: var(--bg-surface);
            border: 1px solid var(--accent-purple);
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            box-shadow: 0 0 20px rgba(153, 51, 255, 0.15), var(--inner-glow);
            display: flex;
            gap: 1rem;
            font-size: 0.9rem;
        }

        .hash-box .label { color: var(--text-secondary); font-family: 'Inter', sans-serif;}
        .hash-box .value { color: var(--text-primary); font-weight: bold; }
        
        .hash-arrow {
            font-size: 1.5rem;
            color: var(--accent-purple);
            text-shadow: 0 0 10px var(--accent-purple-glow);
        }

        .buckets-container {
            display: flex;
            gap: 1.25rem;
            justify-content: center;
            flex: 1;
        }

        .hash-bucket {
            flex: 1;
            max-width: 160px;
            border: 1px solid var(--border-color);
            border-radius: 16px 16px 8px 8px;
            background: var(--bg-surface);
            display: flex;
            flex-direction: column;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm), var(--inner-glow);
        }

        .hash-bucket.active-bucket {
            border-color: var(--accent-purple);
            box-shadow: 0 8px 30px rgba(153, 51, 255, 0.15), 0 0 0 1px var(--accent-purple-glow);
            transform: translateY(-4px);
        }

        .bucket-label {
            background: var(--bg-deep);
            text-align: center;
            padding: 0.75rem;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
            letter-spacing: 0.05em;
        }

        .active-bucket .bucket-label {
             background: rgba(153, 51, 255, 0.1);
             color: var(--text-primary);
        }

        .bucket-contents {
            flex: 1;
            padding: 0.75rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            overflow-y: auto;
        }

        .bucket-item {
            background: var(--bg-deep);
            border: 1px solid var(--border-color);
            padding: 0.6rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-family: 'JetBrains Mono', monospace;
            text-align: center;
            color: var(--text-primary);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
        </div>
    );
}
