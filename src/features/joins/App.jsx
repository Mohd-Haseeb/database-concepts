import React, { useState, useEffect } from 'react';
import './index.css';
import JoinsTab from './components/joins/JoinsTab';
import IndexesTab from './components/indexing/IndexesTab';

// --- SHARED EXPANDED ALGORITHMIC MOCK DATA ---
export const usersColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Dept' }
];

export const usersData = [
  { id: 1, name: 'Alice', department: 'Engineering' },
  { id: 2, name: 'Bob', department: 'Sales' },
  { id: 3, name: 'Charlie', department: 'Engineering' },
  { id: 4, name: 'Diana', department: 'Marketing' },
  { id: 6, name: 'Fiona', department: 'HR' },
  { id: 7, name: 'George', department: 'Sales' },
  { id: 8, name: 'Hannah', department: 'Engineering' },
  { id: 10, name: 'Ian', department: 'Marketing' },
  { id: 11, name: 'Julia', department: 'Finance' },
  { id: 12, name: 'Kevin', department: 'IT' }
];

export const ordersColumns = [
  { key: 'order_id', label: 'Order ID' },
  { key: 'user_id', label: 'User ID' },
  { key: 'product', label: 'Product' }
];

export const ordersData = [
  { order_id: 101, user_id: 1, product: 'Laptop' },
  { order_id: 102, user_id: 2, product: 'Phone' },
  { order_id: 103, user_id: 1, product: 'Monitor' },
  { order_id: 104, user_id: 99, product: 'Ghost Desk' },
  { order_id: 105, user_id: 3, product: 'Keyboard' },
  { order_id: 106, user_id: 3, product: 'Mouse' },
  { order_id: 107, user_id: 4, product: 'Tablet' },
  { order_id: 108, user_id: 5, product: 'Missing Chair' },
  { order_id: 109, user_id: 7, product: 'Server Rack' },
  { order_id: 110, user_id: 8, product: 'Headphones' },
  { order_id: 111, user_id: 10, product: 'Webcam' },
  { order_id: 112, user_id: 1, product: 'USB Hub' },
  { order_id: 113, user_id: 11, product: 'Coffee Maker' },
  { order_id: 114, user_id: 12, product: 'Standing Desk' }
];

export const resultColumns = [
  { key: 'u_id', label: 'User.ID' },
  { key: 'u_name', label: 'Name' },
  { key: 'o_id', label: 'Order.ID' },
  { key: 'o_product', label: 'Product' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('JOINS'); // 'JOINS' or 'INDEXES'
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="app-container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        {/* Top Level Navigation - Segmented Control Style */}
        <nav className="top-nav" style={{
          display: 'flex',
          background: 'var(--bg-deep)',
          padding: '0.35rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--inner-glow)'
        }}>
          <button
            className={activeTab === 'JOINS' ? 'active-tab' : 'inactive-tab'}
            onClick={() => setActiveTab('JOINS')}
            style={{
              borderRadius: '8px',
              padding: '0.5rem 1.2rem',
              border: 'none',
              background: activeTab === 'JOINS' ? 'var(--bg-surface)' : 'transparent',
              boxShadow: activeTab === 'JOINS' ? 'var(--shadow-sm)' : 'none',
              color: activeTab === 'JOINS' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            🔀 Table Joins
          </button>
          <button
            className={activeTab === 'INDEXES' ? 'active-tab' : 'inactive-tab'}
            onClick={() => setActiveTab('INDEXES')}
            style={{
              borderRadius: '8px',
              padding: '0.5rem 1.2rem',
              border: 'none',
              background: activeTab === 'INDEXES' ? 'var(--bg-surface)' : 'transparent',
              boxShadow: activeTab === 'INDEXES' ? 'var(--shadow-sm)' : 'none',
              color: activeTab === 'INDEXES' ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            🌲 B+ Tree Indexes
          </button>
        </nav>
      </div>

      {/* Route out to the specific visualizer module */}
      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'JOINS' ? <JoinsTab /> : <IndexesTab />}
      </div>

    </div>
  );
}
