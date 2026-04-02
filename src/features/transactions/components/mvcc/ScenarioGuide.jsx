import React, { useState } from 'react';
import { PlayCircle, FastForward, RotateCcw, Info } from 'lucide-react';
import './ScenarioGuide.css';

export default function ScenarioGuide({ engine }) {
    const [activeScenarioId, setActiveScenarioId] = useState('FREEPLAY');
    const [currentStep, setCurrentStep] = useState(0);

    const SCENARIOS = {
        FREEPLAY: {
            id: 'FREEPLAY',
            name: 'Freeplay Mode',
            description: 'Manually execute transactions using the connection panels above.',
            steps: []
        },
        LOST_UPDATE: {
            id: 'LOST_UPDATE',
            name: 'Lost Update Prevention (Row Locks)',
            description: 'Shows how two concurrent updates to the same row are handled. Conn B will be blocked by Conn A to prevent a lost update.',
            steps: [
                { text: "Wait for it: We will reset the database back to clean state.", action: () => engine.resetEngine() },
                { text: "Connection A begins a transaction.", action: () => engine.beginTransaction('A') },
                { text: "Connection B begins a transaction concurrently.", action: () => engine.beginTransaction('B') },
                { text: "Connection A updates Logical Row 101 to $600.", action: () => engine.updateRow('A', 101, 600) },
                { text: "Connection B tries to update Row 101 to $400. (Notice the Write-Write Block!)", action: () => engine.updateRow('B', 101, 400) },
                { text: "Connection A commits its transaction. The lock is released.", action: () => engine.commitTransaction('A') },
            ]
        },
        NON_REPEATABLE_READ: {
            id: 'NON_REPEATABLE_READ',
            name: 'Non-Repeatable Read (Isolation Levels)',
            description: 'Demonstrates how different Isolation Levels affect visibility of rows changed by other transactions.',
            steps: [
                { text: "Reset Database (Conn A = READ COMMITTED).", action: () => { engine.resetEngine(); engine.setConnA(c => ({ ...c, isolation: 'READ_COMMITTED' })); } },
                { text: "Connection A & B both begin transactions.", action: () => { engine.beginTransaction('A'); engine.beginTransaction('B'); } },
                { text: "Connection B updates Row 102 to $999.", action: () => engine.updateRow('B', 102, 999) },
                { text: "Connection B commits.", action: () => engine.commitTransaction('B') },
                { text: "Look at the Inspector! Conn A (READ COMMITTED) now sees the new $999 value. This is a Non-Repeatable Read!", action: () => { } },
                { text: "Let's fix it! Reset DB (Conn A = REPEATABLE READ).", action: () => { engine.resetEngine(); engine.setConnA(c => ({ ...c, isolation: 'REPEATABLE_READ' })); } },
                { text: "Connection A & B both begin transactions again.", action: () => { engine.beginTransaction('A'); engine.beginTransaction('B'); } },
                { text: "Connection B updates Row 102 to $999 and commits.", action: () => { engine.updateRow('B', 102, 999); engine.commitTransaction('B'); } },
                { text: "Look at the Inspector! Conn A STILL sees the old $300 value! Repeatable Read achieved via MVCC snapshots!", action: () => { } },
            ]
        }
    };

    const activeScenario = SCENARIOS[activeScenarioId];

    const handleScenarioChange = (e) => {
        setActiveScenarioId(e.target.value);
        setCurrentStep(0);
        engine.resetEngine();
    };

    const executeNextStep = () => {
        if (currentStep < activeScenario.steps.length) {
            const step = activeScenario.steps[currentStep];
            step.action();
            setCurrentStep(prev => prev + 1);
        }
    };

    const resetScenario = () => {
        engine.resetEngine();
        setCurrentStep(0);
    };

    return (
        <div className="scenario-guide panel glass-effect">
            <div className="scenario-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlayCircle size={20} className="text-accent-blue" />
                    <h3 style={{ margin: 0 }}>Guided Execution Engine</h3>
                </div>
                <select
                    className="scenario-select"
                    value={activeScenarioId}
                    onChange={handleScenarioChange}
                >
                    {Object.values(SCENARIOS).map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="scenario-body">
                <p className="scenario-description">
                    <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    {activeScenario.description}
                </p>

                {activeScenarioId !== 'FREEPLAY' && (
                    <div className="scenario-stepper">
                        <div className="steps-list">
                            {activeScenario.steps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`step-item ${idx === currentStep ? 'active-step' : ''} ${idx < currentStep ? 'completed-step' : ''}`}
                                >
                                    <div className="step-number">{idx + 1}</div>
                                    <div className="step-text">{step.text}</div>
                                </div>
                            ))}
                        </div>

                        <div className="scenario-controls">
                            <button
                                className="btn btn-primary"
                                onClick={executeNextStep}
                                disabled={currentStep >= activeScenario.steps.length}
                            >
                                <FastForward size={16} />
                                {currentStep >= activeScenario.steps.length ? 'Scenario Complete' : 'Execute Next Step'}
                            </button>
                            <button className="btn btn-secondary" onClick={resetScenario}>
                                <RotateCcw size={16} /> Reset
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
