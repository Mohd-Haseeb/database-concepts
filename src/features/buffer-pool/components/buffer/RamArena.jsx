import React from 'react';
import { MemoryStick, Clock, PenTool, Hash, RefreshCcw, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RamArena.css';

export default function RamArena({ frames, clockHand, strategy }) {
    return (
        <div className="ram-arena panel">
            <div className="arena-header">
                <h3><MemoryStick size={18} /> Buffer Pool (RAM)</h3>
                <span className="metadata">{frames.length} Total Frames</span>
            </div>

            <div className="frames-container">
                {/* Clock Hand Indicator wrapper */}
                <div className="clock-hand-track">
                    {strategy === 'Clock' && (
                        <motion.div
                            className="clock-hand"
                            initial={false}
                            animate={{ left: `${(clockHand / frames.length) * 100}%` }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <Hand size={24} color="var(--accent-purple)" style={{ transform: 'rotate(180deg)' }} />
                            <span className="hand-label">Sweeping Hand</span>
                        </motion.div>
                    )}
                </div>

                {frames.map((frame, index) => {
                    const isEmpty = frame.pageId === null;
                    const statusClass = isEmpty ? 'empty' : (frame.isDirty ? 'dirty' : 'clean');

                    return (
                        <div key={`frame-${frame.frameId}`} className={`memory-frame ${statusClass}`}>
                            <div className="frame-header">
                                <span className="frame-id">Frame {frame.frameId}</span>
                                {frame.isDirty && <span className="dirty-badge">DIRTY</span>}
                            </div>

                            <div className="frame-content">
                                {isEmpty ? (
                                    <span className="empty-text">EMPTY</span>
                                ) : (
                                    <div className="page-data">
                                        <div className="page-id-display">Page {frame.pageId}</div>
                                        <div className="metadata-row">
                                            {strategy === 'LRU' || strategy === 'MRU' ? (
                                                <span title="Last Access Time"><Clock size={12} /> T:{frame.lastAccess}</span>
                                            ) : strategy === 'LFU' ? (
                                                <span title="Frequency Count" className="lfu-badge"><Hash size={12} /> Freq: {frame.frequency}</span>
                                            ) : strategy === 'Clock' ? (
                                                <span
                                                    title="Reference Bit"
                                                    className={`ref-bit-badge ${frame.refBit ? 'ref-high' : 'ref-low'}`}
                                                >
                                                    <RefreshCcw size={12} /> Ref: {frame.refBit ? '1' : '0'}
                                                </span>
                                            ) : (
                                                <span title="Insert Time"><Clock size={12} /> T:{frame.insertTime}</span>
                                            )}

                                            {frame.isPinned && <span className="pinned-badge">PINNED</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
