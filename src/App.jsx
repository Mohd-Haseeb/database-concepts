import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BufferPoolApp from './features/buffer-pool/App';
import JoinsApp from './features/joins/App';
import TransactionsApp from './features/transactions/App';
import OptimizerApp from './features/optimizer/App';
import WalApp from './features/wal/App';
import './App.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Database Visualizer</h1>
            <p>Select a visualizer to get started:</p>
            <div className="card-grid">
                <Link to="/buffer-pool" className="nav-card">
                    <h2>Buffer Pool</h2>
                    <p>Visualize disk pages and RAM buffer management.</p>
                </Link>
                <Link to="/joins" className="nav-card">
                    <h2>Joins</h2>
                    <p>Explore Nested Loop, Hash, and Merge Joins algorithms.</p>
                </Link>
                <Link to="/transactions" className="nav-card">
                    <h2>Transactions & MVCC</h2>
                    <p>Understand concurrency and transaction isolation.</p>
                </Link>
                <Link to="/optimizer" className="nav-card">
                    <h2>Query Optimizer</h2>
                    <p>Watch SQL parse into ASTs and Physical Execution plans.</p>
                </Link>
                <Link to="/wal" className="nav-card">
                    <h2>WAL & Recovery</h2>
                    <p>Visualize Write-Ahead Logging acting as the database lifeline.</p>
                </Link>
            </div>
        </div>
    );
}

function Layout({ children }) {
    return (
        <div className="app-layout">
            <nav className="global-nav">
                <div className="nav-brand">
                    <Link to="/">DB Visualizer</Link>
                </div>
                <div className="nav-links">
                    <Link to="/buffer-pool">Buffer Pool</Link>
                    <Link to="/joins">Joins</Link>
                    <Link to="/transactions">Transactions</Link>
                    <Link to="/optimizer">Optimizer</Link>
                    <Link to="/wal">WAL</Link>
                </div>
            </nav>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/buffer-pool/*" element={<BufferPoolApp />} />
                    <Route path="/joins/*" element={<JoinsApp />} />
                    <Route path="/transactions/*" element={<TransactionsApp />} />
                    <Route path="/optimizer/*" element={<OptimizerApp />} />
                    <Route path="/wal/*" element={<WalApp />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
