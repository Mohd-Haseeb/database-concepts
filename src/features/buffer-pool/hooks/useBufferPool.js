import { useState, useCallback, useRef } from 'react';

// Initialize a larger mock disk (e.g., 20 pages)
const initialDisk = Array.from({ length: 20 }, (_, i) => ({
    pageId: i + 1,
    data: `Page ${i + 1} Data`
}));

// Initialize a constrained Buffer Pool (e.g., exactly 4 frames of memory)
const BUFFER_SIZE = 4;
const initialFrames = Array.from({ length: BUFFER_SIZE }, (_, i) => ({
    frameId: i,
    pageId: null, // Empty frame
    isDirty: false,
    insertTime: 0,
    lastAccess: 0,
    isPinned: false,
    refBit: false, // For Clock Sweep
    frequency: 0   // For LFU
}));

export function useBufferPool() {
    const [strategy, setStrategy] = useState('LRU'); // LRU, FIFO, MRU
    const [disk, setDisk] = useState([...initialDisk]);
    const [frames, setFrames] = useState([...initialFrames]);
    const [logs, setLogs] = useState([]);

    // Clock Hand state for visualized 'Clock Sweep'
    const [clockHand, setClockHand] = useState(0);

    // We need a stable ticker to track "time" for the LRU algorithm
    const logicalClock = useRef(1);

    const logEvent = (msg, type = 'info') => {
        setLogs(prev => [...prev.slice(-10), { id: Date.now() + Math.random(), msg, type }]);
    };

    const getVictimFrame = (currentFrames, activeStrategy) => {
        let victim = null;
        let targetTime = activeStrategy === 'MRU' ? -Infinity : Infinity;

        for (const frame of currentFrames) {
            // Find empty frames first, they are the best victims
            if (frame.pageId === null) return frame;

            if (!frame.isPinned) {
                if (activeStrategy === 'LRU') {
                    if (frame.lastAccess < targetTime) {
                        targetTime = frame.lastAccess;
                        victim = frame;
                    }
                } else if (activeStrategy === 'MRU') {
                    if (frame.lastAccess > targetTime) {
                        targetTime = frame.lastAccess;
                        victim = frame;
                    }
                } else if (activeStrategy === 'FIFO') {
                    if (frame.insertTime < targetTime) {
                        targetTime = frame.insertTime;
                        victim = frame;
                    }
                } else if (activeStrategy === 'LFU') {
                    if (frame.frequency < targetTime) {
                        targetTime = frame.frequency;
                        victim = frame;
                    }
                }
            }
        }
        return victim;
    };

    const requestPage = useCallback((requestedPageId, isWrite = false) => {
        setFrames(prevFrames => {
            const newFrames = [...prevFrames];
            const clockTick = logicalClock.current++;

            // 1. Is it already in the Buffer Pool? (Buffer Hit)
            const existingFrameIdx = newFrames.findIndex(f => f.pageId === requestedPageId);

            if (existingFrameIdx !== -1) {
                logEvent(`Buffer Hit! Page ${requestedPageId} is already in Frame ${existingFrameIdx}.`, 'success');
                // Update LRU clock, Clock refBit, and LFU frequency
                newFrames[existingFrameIdx] = {
                    ...newFrames[existingFrameIdx],
                    lastAccess: clockTick,
                    isDirty: isWrite ? true : newFrames[existingFrameIdx].isDirty,
                    refBit: true,
                    frequency: newFrames[existingFrameIdx].frequency + 1
                };
                return newFrames;
            }

            // 2. Buffer Miss. We must fetch from Disk and place in a Frame.
            logEvent(`Buffer Miss! Page ${requestedPageId} not in memory. Requesting Disk I/O.`, 'warning');

            // Find an empty frame if available immediately
            const emptyFrame = newFrames.find(f => f.pageId === null);
            let targetFrameIndex;

            if (emptyFrame) {
                targetFrameIndex = emptyFrame.frameId;
                logEvent(`Found Empty Frame ${targetFrameIndex}. No eviction needed.`, 'info');
                // If using Clock, we don't advance the hand on empty frame placement, but we could.
            } else {
                // 3. Eviction Logic
                if (strategy === 'Clock') {
                    // Clock Sweep Algorithm
                    let currentHand = clockHand;
                    let sweptFramesCount = 0;
                    let foundVictim = false;

                    // We sweep until we find a frame with refBit === false. 
                    // We cap at BUFFER_SIZE * 2 to avoid infinite pin loops, though for now frames aren't pinned.
                    while (!foundVictim && sweptFramesCount <= BUFFER_SIZE * 2) {
                        const inspectingFrame = newFrames[currentHand];
                        if (!inspectingFrame.isPinned) {
                            if (inspectingFrame.refBit === false) {
                                // Found our victim!
                                foundVictim = true;
                                targetFrameIndex = currentHand;

                                const evictionMsg = `Clock Sweep found Frame ${targetFrameIndex} with RefBit=0. Evicting Page ${inspectingFrame.pageId}.`;
                                if (inspectingFrame.isDirty) {
                                    logEvent(`${evictionMsg} PAGE IS DIRTY: Flushing writes back to Disk first!`, 'error');
                                } else {
                                    logEvent(`${evictionMsg} Page is Clean.`, 'info');
                                }

                                // Advance hand for next search
                                setClockHand((currentHand + 1) % BUFFER_SIZE);
                                break;
                            } else {
                                // Ref bit is true, give it a second chance and set to false.
                                logEvent(`Clock Hand sweeping past Frame ${currentHand}. Resetting RefBit to 0.`, 'info');
                                newFrames[currentHand] = { ...inspectingFrame, refBit: false };
                            }
                        }
                        currentHand = (currentHand + 1) % BUFFER_SIZE;
                        sweptFramesCount++;
                    }

                    if (!foundVictim) {
                        logEvent(`CRITICAL: Buffer Pool Full! All frames might be pinned.`, 'error');
                        return newFrames;
                    }

                } else {
                    // LRU, MRU, FIFO, LFU
                    const victimFrame = getVictimFrame(newFrames, strategy);

                    if (!victimFrame) {
                        logEvent(`CRITICAL: Buffer Pool Full! All frames are pinned. Cannot fetch Page ${requestedPageId}.`, 'error');
                        return newFrames;
                    }

                    targetFrameIndex = victimFrame.frameId;
                    const evictionMsg = `Evicting Page ${victimFrame.pageId} (${strategy}) from Frame ${targetFrameIndex}.`;
                    if (victimFrame.isDirty) {
                        logEvent(`${evictionMsg} PAGE IS DIRTY: Flushing writes back to Disk first!`, 'error');
                    } else {
                        logEvent(`${evictionMsg} Page is Clean, dropping instantly.`, 'info');
                    }
                }
            }

            // 4. Load New Page into Target Frame
            newFrames[targetFrameIndex] = {
                frameId: targetFrameIndex,
                pageId: requestedPageId,
                isDirty: isWrite,
                insertTime: clockTick,
                lastAccess: clockTick,
                isPinned: false,
                refBit: true, // Just loaded, inherently referenced
                frequency: 1  // Accessed once upon load
            };

            logEvent(`Loaded Page ${requestedPageId} from Disk into Frame ${targetFrameIndex}.`, 'success');

            return newFrames;
        });
    }, [strategy]);

    // Helper to abruptly flush all dirty pages to simulate a Checkpoint
    const flushAllDirtyPages = useCallback(() => {
        setFrames(prevFrames => {
            const newFrames = prevFrames.map(f => {
                if (f.isDirty) {
                    logEvent(`Checkpoint: Flushing Dirty Page ${f.pageId} to Disk.`, 'info');
                    return { ...f, isDirty: false };
                }
                return f;
            });
            return newFrames;
        });
    }, []);

    const clearLogs = () => setLogs([]);

    return {
        strategy, setStrategy,
        disk, frames, logs, clockHand,
        requestPage, flushAllDirtyPages, clearLogs
    };
}
