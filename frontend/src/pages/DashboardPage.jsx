import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    deeds: 0,
    owners: 0,
    contracts: 0,
    payments: 0
  });

  const [latestDeeds, setLatestDeeds] = useState([]);
  const [latestOwners, setLatestOwners] = useState([]);
  const [latestContracts, setLatestContracts] = useState([]);
  const [latestPayments, setLatestPayments] = useState([]);

  const loadDashboard = async () => {
    try {
      const [deeds, owners, contracts, payments] = await Promise.all([
        api.get("/deeds?limit=5&sort=-createdAt"),
        api.get("/owners?limit=5&sort=-createdAt"),
        api.get("/contracts?limit=5&sort=-createdAt"),
        api.get("/payments?limit=5&sort=-createdAt")
      ]);

      setStats({
        deeds: deeds.data.total || deeds.data.results,
        owners: owners.data.total || owners.data.results,
        contracts: contracts.data.total || contracts.data.results,
        payments: payments.data.total || payments.data.results
      });

      setLatestDeeds(deeds.data.data);
      setLatestOwners(owners.data.data);
      setLatestContracts(contracts.data.data);
      setLatestPayments(payments.data.data);

    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>لوحة التحكم</h1>
        <p className="page-subtitle">نظرة عامة على النظام</p>
      </div>

      {/* ------------------------ */}
      {/*  🔥 إحصائيات عليا */}
      {/* ------------------------ */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>عدد الصكوك</h3>
          <p className="stat-number">{stats.deeds}</p>
        </div>

        <div className="stat-card">
          <h3>عدد الملاك</h3>
          <p className="stat-number">{stats.owners}</p>
        </div>

        <div className="stat-card">
          <h3>عدد العقود</h3>
          <p className="stat-number">{stats.contracts}</p>
        </div>

        <div className="stat-card">
          <h3>عدد المدفوعات</h3>
          <p className="stat-number">{stats.payments}</p>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* 🔥 آخر 5 صكوك / ملاك / عقود / مدفوعات */}
      {/* -------------------------------- */}
      <div className="grid-2">
        
        {/* آخر الصكوك */}
        <div className="card">
          <h3>آخر الصكوك</h3>
          <table className="data-table small">
            <thead>
              <tr>
                <th>رقم الصك</th>
                <th>الحي</th>
                <th>المساحة</th>
              </tr>
            </thead>
            <tbody>
              {latestDeeds.map((d) => (
                <tr key={d._id}>
                  <td>{d.deedNumber}</td>
                  <td>{d.district}</td>
                  <td>{d.area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* آخر الملاك */}
        <div className="card">
          <h3>آخر الملاك</h3>
          <table className="data-table small">
            <thead>
              <tr>
                <th>اسم المالك</th>
                <th>رقم الهوية</th>
                <th>جوال</th>
              </tr>
            </thead>
            <tbody>
              {latestOwners.map((o) => (
                <tr key={o._id}>
                  <td>{o.ownerName}</td>
                  <td>{o.ownerID}</td>
                  <td>{o.ownerMobile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* آخر العقود */}
        <div className="card">
          <h3>آخر العقود</h3>
          <table className="data-table small">
            <thead>
              <tr>
                <th>كود العقد</th>
                <th>الصك</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              {latestContracts.map((c) => (
                <tr key={c._id}>
                  <td>{c.projectCode}</td>
                  <td>{c.deedNumber}</td>
                  <td>{c.contractValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* آخر المدفوعات */}
        <div className="card">
          <h3>آخر المدفوعات</h3>
          <table className="data-table small">
            <thead>
              <tr>
                <th>العقد</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {latestPayments.map((p) => (
                <tr key={p._id}>
                  <td>{p.projectCode}</td>
                  <td>{p.amount}</td>
                  <td>{new Date(p.paymentDate).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
