import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Disc3 } from 'lucide-react';

export default function DiskPage({ activePageId = null, rowPayload = null, phase = 'IDLE' }) {
    // We simulate memory blocks on the disk
    const pages = ['page-A', 'page-B', 'page-C', 'page-D', 'page-E', 'page-F'];

    return (
        <div className="disk-container panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>💽 Physical Disk (8KB Pages)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Clustered Data</span>
            </div>

            <div className="disk-grid">
                {pages.map(pageId => {
                    const isActive = activePageId === pageId;

                    return (
                        <motion.div
                            key={pageId}
                            className={`disk-page ${isActive ? 'active-page' : ''} ${isActive && phase === 'FETCHING_DISK_PAGE' ? 'fetching-page' : ''}`}
                            animate={{
                                borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-color)',
                                backgroundColor: isActive ? 'rgba(153, 51, 255, 0.1)' : 'var(--bg-surface-hover)',
                                scale: isActive && phase === 'FETCHING_DISK_PAGE' ? [1, 1.02, 1] : 1
                            }}
                            transition={{
                                scale: { duration: 1, repeat: phase === 'FETCHING_DISK_PAGE' ? Infinity : 0 }
                            }}
                        >
                            <div className="page-header">
                                {pageId.toUpperCase()}
                                {isActive && phase === 'FETCHING_DISK_PAGE' && (
                                    <span style={{ float: 'right', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-blue)' }}>
                                        <Disc3 size={12} className="spin-icon" /> SEEKING...
                                    </span>
                                )}
                            </div>
                            <div className="page-content" style={{ position: 'relative' }}>
                                {/* Scanning Ray Animation */}
                                {isActive && phase === 'FETCHING_DISK_PAGE' && (
                                    <div className="scan-ray" />
                                )}

                                <AnimatePresence>
                                    {isActive && rowPayload && phase === 'COMPLETE' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="payload-container"
                                        >
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                                                Extracted Tuple
                                            </div>
                                            <pre className="payload-data">
                                                {JSON.stringify(rowPayload, null, 2)}
                                            </pre>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {(!isActive || phase !== 'COMPLETE') && <div className="binary-static">10110...</div>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <style>{`
          .disk-container {
              flex: 1;
              display: flex;
              flex-direction: column;
          }

          .disk-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1rem;
              flex: 1;
          }

          .disk-page {
              border: 1px solid var(--border-color);
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              background: var(--bg-surface-hover);
          }

          .active-page {
              box-shadow: 0 0 20px rgba(153, 51, 255, 0.2);
          }

          .page-header {
              background: rgba(0,0,0,0.3);
              padding: 0.3rem;
              text-align: center;
              font-family: monospace;
              font-size: 0.75rem;
              color: var(--text-muted);
              border-bottom: 1px solid var(--border-color);
          }

          .active-page .page-header {
              color: var(--accent-purple);
              border-bottom-color: var(--accent-purple);
          }

          .page-content {
              padding: 0.5rem;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .binary-static {
              font-family: monospace;
              color: var(--text-muted);
              opacity: 0.3;
              font-size: 0.7rem;
          }

          .payload-data {
              margin: 0;
              font-size: 0.75rem;
              color: var(--accent-green);
              text-shadow: 0 0 5px rgba(0, 255, 128, 0.5);
              background: rgba(0,0,0,0.5);
              padding: 0.5rem;
              border-radius: 4px;
              border: 1px solid rgba(0, 255, 128, 0.2);
          }

          .payload-container {
              width: 100%;
              z-index: 2;
          }

          /* New Animations for Deep I/O Fetching */
          .fetching-page {
              box-shadow: 0 0 20px rgba(43, 116, 226, 0.2), inset 0 0 20px rgba(43, 116, 226, 0.1);
              border-color: var(--accent-blue) !important;
          }
          
          .fetching-page .page-header {
             border-bottom-color: var(--accent-blue);
             color: var(--accent-blue);
          }

          .spin-icon {
              animation: spin 1s linear infinite;
          }

          @keyframes spin {
              100% { transform: rotate(360deg); }
          }

          .scan-ray {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 4px;
              background: var(--accent-blue);
              box-shadow: 0 0 10px var(--accent-blue), 0 0 20px var(--accent-blue);
              opacity: 0.8;
              animation: scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              z-index: 1;
          }

          @keyframes scan {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
          }
       `}</style>
        </div>
    );
}
