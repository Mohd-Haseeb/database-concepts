import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Arena.css';

export default function Arena({ algo = 'Nested Loop', currentOuterRow, currentInnerRow }) {
    return (
        <div className="arena-container">
            <div className="arena-header">
                <span className="algo-badge">{algo} Join Execution</span>
                <div className="arena-status">
                    {currentOuterRow && currentInnerRow ? 'Comparing Rows...' : 'Waiting to start...'}
                </div>
            </div>

            <div className="arena-stage">
                {/* Outer Loop Box */}
                <div className={`scan-box outer-box ${currentOuterRow ? 'active' : ''}`}>
                    <div className="box-label">Outer Loop (Users)</div>
                    <div className="data-display">
                        <AnimatePresence mode="wait">
                            {currentOuterRow ? (
                                <motion.pre
                                    key={currentOuterRow.id}
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {JSON.stringify(currentOuterRow, null, 2)}
                                </motion.pre>
                            ) : (
                                <span className="empty-text">Scanning...</span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Join Condition Validator */}
                <div className="comparator-node">
                    <motion.div
                        className="node-icon"
                        animate={{
                            scale: currentOuterRow && currentInnerRow ? [1, 1.1, 1] : 1,
                            boxShadow: currentOuterRow && currentInnerRow
                                ? "0 0 25px rgba(153, 51, 255, 0.6)"
                                : "0 0 15px rgba(153, 51, 255, 0.3)"
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        ⋈
                    </motion.div>
                    <div className="condition">ON Users.id = Orders.user_id</div>
                </div>

                {/* Inner Loop Box */}
                <div className={`scan-box inner-box ${currentInnerRow ? 'active' : ''}`}>
                    <div className="box-label">Inner Loop (Orders)</div>
                    <div className="data-display">
                        <AnimatePresence mode="wait">
                            {currentInnerRow ? (
                                <motion.pre
                                    key={currentInnerRow.order_id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {JSON.stringify(currentInnerRow, null, 2)}
                                </motion.pre>
                            ) : (
                                <span className="empty-text">Probing...</span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
