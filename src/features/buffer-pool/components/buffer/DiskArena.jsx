import React from 'react';
import { Database, HardDrive } from 'lucide-react';
import './DiskArena.css';

export default function DiskArena({ disk, activePage }) {
    return (
        <div className="disk-arena panel">
            <div className="arena-header">
                <h3><HardDrive size={18} /> Secondary Storage (Disk)</h3>
                <span className="metadata">{disk.length} Total Pages</span>
            </div>

            <div className="disk-grid">
                {disk.map((page) => (
                    <div
                        key={`disk-page-${page.pageId}`}
                        className={`disk-page ${activePage === page.pageId ? 'active-target' : ''}`}
                    >
                        <span className="page-id">Page {page.pageId}</span>
                        <Database size={14} className="disk-icon" />
                    </div>
                ))}
            </div>
        </div>
    );
}
