import React from 'react';
import { Terminal, Download, Edit3, Trash2 } from 'lucide-react';
import './ClientPanel.css';

export default function ClientPanel({ strategy, setStrategy, onRead, onWrite, onFlush }) {
    // Helper to generate a random page ID between 1 and 20
    const getRandomPage = () => Math.floor(Math.random() * 20) + 1;

    return (
        <div className="client-panel panel glass-effect">
            <div className="arena-header" style={{ justifyContent: 'space-between' }}>
                <h3><Terminal size={18} /> Client Query Execution</h3>
                <div className="strategy-selector">
                    <label>Eviction: </label>
                    <select value={strategy} onChange={e => setStrategy(e.target.value)}>
                        <option value="LRU">LRU (Least Recently Used)</option>
                        <option value="FIFO">FIFO (First In First Out)</option>
                        <option value="MRU">MRU (Most Recently Used)</option>
                        <option value="LFU">LFU (Least Frequently Used)</option>
                        <option value="Clock">Clock Sweep</option>
                    </select>
                </div>
            </div>

            <div className="button-grid">
                <button className="btn btn-primary" onClick={() => onRead(getRandomPage())}>
                    <Download size={16} /> Read Random Page
                </button>
                <button className="btn btn-secondary" onClick={() => onWrite(getRandomPage())}>
                    <Edit3 size={16} /> Write Random Page
                </button>
            </div>

            <div className="button-grid" style={{ marginTop: '1rem' }}>
                <button className="btn btn-danger" onClick={onFlush}>
                    <Trash2 size={16} /> FLUSH ALL DIRTY PAGES (Checkpoint)
                </button>
            </div>

            <div className="educational-note">
                <p><strong>Read:</strong> Fetches a page into the Buffer Pool. Updates LRU timer.</p>
                <p><strong>Write:</strong> Marks the page as <em>Dirty</em>. Dirty pages MUST be flushed to disk before eviction.</p>
            </div>
        </div>
    );
}
