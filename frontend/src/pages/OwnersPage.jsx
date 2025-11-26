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
    nationalId: '',
    phone: '',
    notes: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owners', { params: { page, limit } });
      const payload = res.data?.data || {};
      let docs = payload.docs || [];

      if (search) {
        const s = search.toLowerCase();
        docs = docs.filter(
          (o) =>
            (o.ownerName && o.ownerName.toLowerCase().includes(s)) ||
            (o.nationalId && o.nationalId.toLowerCase().includes(s)) ||
            (o.phone && o.phone.toLowerCase().includes(s))
        );
      }

      const normalized = docs.map((o) => ({
        id: o._id,
        ownerName: o.ownerName,
        nationalId: o.nationalId,
        phone: o.phone,
        notes: o.notes
      }));

      setRows(normalized);
      setTotal(payload.total || normalized.length);
      setPages(payload.pages || 1);
    } catch (err) {
      console.error('Owners load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  const openCreateModal = () => {
    setEditingOwner(null);
    setForm({
      ownerName: '',
      nationalId: '',
      phone: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingOwner(row);
    setForm({
      ownerName: row.ownerName || '',
      nationalId: row.nationalId || '',
      phone: row.phone || '',
      notes: row.notes || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ownerName: form.ownerName || undefined,
        nationalId: form.nationalId || undefined,
        phone: form.phone || undefined,
        notes: form.notes || undefined
      };

      if (editingOwner) {
        await api.patch(`/owners/${editingOwner.id}`, payload);
      } else {
        await api.post('/owners', payload);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error('Save owner error', err);
      alert('حدث خطأ أثناء حفظ بيانات المالك');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('حذف هذا المالك؟')) return;
    await api.delete(`/owners/${id}`);
    loadData();
  };

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
          placeholder="بحث عن مالك أو هوية أو جوال..."
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
                  <th>ملاحظات</th>
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
                        style={{ marginInlineEnd: '4px' }}
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
                    <td>{r.notes}</td>
                    <td>{r.phone}</td>
                    <td>{r.nationalId}</td>
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
            <div className="modal-header">
              <h2>{editingOwner ? 'تعديل مالك' : 'إضافة مالك جديد'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <label className="form-label">
                  اسم المالك
                  <input
                    className="form-input"
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleFormChange}
                    placeholder="اسم المالك كما في الهوية"
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  رقم الهوية
                  <input
                    className="form-input"
                    name="nationalId"
                    value={form.nationalId}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  رقم الجوال
                  <input
                    className="form-input"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  ملاحظات
                  <textarea
                    className="form-input"
                    rows={3}
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={closeModal}
                >
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
