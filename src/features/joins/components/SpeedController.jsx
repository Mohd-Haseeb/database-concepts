import React from 'react';
import { Snail, Footprints, Rocket } from 'lucide-react';

export default function SpeedController({ speed, setSpeed, isPlaying }) {
    // Define our preset speeds (ms per tick)
    const presets = [
        { label: 'Slow', value: 1500, icon: <Snail size={14} /> },
        { label: 'Normal', value: 800, icon: <Footprints size={14} /> },
        { label: 'Fast', value: 300, icon: <Rocket size={14} /> }
    ];

    return (
        <div className="speed-controller" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Animation Speed
            </label>
            <div style={{
                display: 'flex',
                background: 'var(--bg-deep)',
                padding: '0.35rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--inner-glow)'
            }}>
                {presets.map(preset => (
                    <button
                        key={preset.value}
                        className={speed === preset.value ? 'active-tab' : 'inactive-tab'}
                        onClick={() => setSpeed(preset.value)}
                        disabled={isPlaying}
                        style={{
                            flex: 1,
                            padding: '0.4rem',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: speed === preset.value ? 'var(--bg-surface)' : 'transparent',
                            boxShadow: speed === preset.value ? 'var(--shadow-sm)' : 'none',
                            color: speed === preset.value ? 'var(--text-primary)' : 'var(--text-muted)'
                        }}
                    >
                        {preset.icon} {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
