import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function DeedsPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDeed, setSelectedDeed] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deeds", { params: { page, limit } });
      const payload = res.data?.data || {};
      setRows(payload.docs || []);
      setPages(payload.pages || 1);
      setTotal(payload.total || 0);
    } catch (err) {
      console.error("Error loading deeds", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const openDetails = (row) => {
    setSelectedDeed(row);
  };

  const closeModal = () => {
    setSelectedDeed(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>إدارة الصكوك</h1>
        <p className="page-subtitle">عرض بيانات الصكوك بشكل كامل.</p>
      </div>

      <div className="card">
        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>إجراءات</th>
                  <th>رقم الصك</th>
                  <th>المدينة</th>
                  <th>الحي</th>
                  <th>المساحة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => openDetails(row)}
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                    <td>{row.deedNumber}</td>
                    <td>{row.city}</td>
                    <td>{row.district}</td>
                    <td>{row.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                className="btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                السابق
              </button>
              <span>
                صفحة {page} من {pages}
              </span>
              <button
                className="btn"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                التالي
              </button>
            </div>
          </>
        )}
      </div>

      {/* -------- Modal عرض التفاصيل -------- */}
      {selectedDeed && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تفاصيل الصك رقم: {selectedDeed.deedNumber}</h2>
            </div>

            <div className="modal-body">
              {Object.entries(selectedDeed)
                .filter(([key]) => !["_id", "__v", "contracts"].includes(key))
                .map(([key, value]) => (
                  <div className="detail-row" key={key}>
                    <strong>{key}:</strong>
                    <span>{value ?? "—"}</span>
                  </div>
                ))}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={closeModal}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
