import { useEffect, useState } from 'react';
import api from '../api/apiClient.js';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    deeds: 0,
    owners: 0,
    contracts: 0,
    payments: 0
  });

  const loadStats = async () => {
    try {
      const [d, o, c, p] = await Promise.all([
        api.get('/deeds'),
        api.get('/owners'),
        api.get('/contracts'),
        api.get('/payments')
      ]);

      setStats({
        deeds: d.data?.data?.total || d.data?.data?.docs?.length || 0,
        owners: o.data?.data?.total || o.data?.data?.docs?.length || 0,
        contracts: c.data?.data?.total || c.data?.data?.docs?.length || 0,
        payments: p.data?.data?.total || p.data?.data?.docs?.length || 0
      });
    } catch (err) {
      console.error('Dashboard stats error', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">
          نظرة عامة على الصكوك والملاك والعقود والمدفوعات.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">إجمالي الصكوك</div>
          <div className="stat-value">{stats.deeds}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">إجمالي الملاك</div>
          <div className="stat-value">{stats.owners}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">إجمالي العقود</div>
          <div className="stat-value">{stats.contracts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">إجمالي المدفوعات</div>
          <div className="stat-value">{stats.payments}</div>
        </div>
      </div>
    </div>
  );
}
