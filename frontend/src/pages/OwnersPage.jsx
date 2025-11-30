import { useEffect, useState } from 'react';
import api from '../api/apiClient.js';

export default function OwnersPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [form, setForm] = useState({
    ownerName: '',
    ownerID: '',
    ownerMobile: '',
    ownerEmail: '',
    hasAgent: false,
    agentID: ''
  });

  // -----------------------------------------------------
  // تحميل البيانات من API
  // -----------------------------------------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owners', { params: { page, limit } });

      // الريسبونس الصحيح:
      const payload = res.data?.data?.owners || [];

      let docs = payload;

      // فلترة حسب البحث
      if (search) {
        const s = search.toLowerCase();
        docs = docs.filter(
          (o) =>
            o.ownerName?.toLowerCase().includes(s) ||
            o.ownerID?.toString().includes(s) ||
            o.ownerMobile?.toString().includes(s)
        );
      }

      // تجهيز بيانات الجدول
      const normalized = docs.map((o) => ({
        id: o._id,
        ownerName: o.ownerName,
        ownerID: o.ownerID,
        ownerMobile: o.ownerMobile,
        ownerEmail: o.ownerEmail,
        hasAgent: o.hasAgent,
        agentID: o.agentID
      }));

      setRows(normalized);
      setTotal(res.data.results || normalized.length);
      setPages(Math.ceil((res.data.results || 1) / limit));

    } catch (err) {
      console.error('Owners load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, search]);

  // -----------------------------------------------------
  // Modal فتح
  // -----------------------------------------------------
  const openCreateModal = () => {
    setEditingOwner(null);
    setForm({
      ownerName: '',
      ownerID: '',
      ownerMobile: '',
      ownerEmail: '',
      hasAgent: false,
      agentID: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingOwner(row);
    setForm({
      ownerName: row.ownerName,
      ownerID: row.ownerID,
      ownerMobile: row.ownerMobile,
      ownerEmail: row.ownerEmail || '',
      hasAgent: row.hasAgent || false,
      agentID: row.agentID || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // -----------------------------------------------------
  // حفظ بيانات مالك جديد أو تعديل مالك
  // -----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...form };

      if (editingOwner) {
        await api.patch(`/owners/${editingOwner.id}`, dataToSend);
      } else {
        await api.post('/owners', dataToSend);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error('Save owner error', err);
      alert('حدث خطأ أثناء حفظ بيانات المالك');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل تريد حذف هذا المالك ؟')) {
      await api.delete(`/owners/${id}`);
      loadData();
    }
  };

  // -----------------------------------------------------
  // الواجهة
  // -----------------------------------------------------
  return (
    <div className="page">
      <div className="page-header">
        <h1>إدارة الملاك</h1>
        <p className="page-subtitle">عرض وإدارة بيانات الملاك من MongoDB.</p>
      </div>

      <div className="page-toolbar">
        <button className="btn btn-primary" onClick={openCreateModal}>
          + إضافة مالك جديد
        </button>

        <input
          className="search-input"
          placeholder="بحث عن مالك / هوية / جوال..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                  <th>البريد</th>
                  <th>الجوال</th>
                  <th>رقم الهوية</th>
                  <th>اسم المالك</th>
                  <th>ID</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        className="btn"
                        onClick={() => openEditModal(r)}
                      >
                        تعديل
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(r.id)}
                      >
                        حذف
                      </button>
                    </td>

                    <td>{r.ownerEmail}</td>
                    <td>{r.ownerMobile}</td>
                    <td>{r.ownerID}</td>
                    <td>{r.ownerName}</td>
                    <td>{r.id}</td>
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

              <span>صفحة {page} من {pages}</span>

              <button
                className="btn"
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
              >
                التالي
              </button>

              <select
                className="btn"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>إجمالي: {total}</span>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingOwner ? 'تعديل مالك' : 'إضافة مالك جديد'}</h2>

            <form onSubmit={handleSubmit}>

              <div className="form-row">
                <label>
                  اسم المالك
                  <input
                    name="ownerName"
                    value={form.ownerName}
                    onChange={(e) =>
                      setForm({ ...form, ownerName: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  رقم الهوية
                  <input
                    name="ownerID"
                    value={form.ownerID}
                    onChange={(e) =>
                      setForm({ ...form, ownerID: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  الجوال
                  <input
                    name="ownerMobile"
                    value={form.ownerMobile}
                    onChange={(e) =>
                      setForm({ ...form, ownerMobile: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  البريد الإلكتروني
                  <input
                    name="ownerEmail"
                    value={form.ownerEmail}
                    onChange={(e) =>
                      setForm({ ...form, ownerEmail: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={closeModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  حفظ
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
