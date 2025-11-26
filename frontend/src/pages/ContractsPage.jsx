import { useEffect, useState } from 'react';
import api from '../api/apiClient.js';

export default function ContractsPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const [deedsOptions, setDeedsOptions] = useState([]);
  const [ownersOptions, setOwnersOptions] = useState([]);

  const [form, setForm] = useState({
    deed: '',
    owner: '',
    contractType: '',
    contractAmount: '',
    contractDate: '',
    notes: ''
  });

  const loadLookups = async () => {
    try {
      const [deedsRes, ownersRes] = await Promise.all([
        api.get('/deeds', { params: { page: 1, limit: 1000 } }),
        api.get('/owners', { params: { page: 1, limit: 1000 } })
      ]);

      const deedsDocs = deedsRes.data?.data?.docs || [];
      const ownersDocs = ownersRes.data?.data?.docs || [];

      setDeedsOptions(
        deedsDocs.map((d) => ({
          id: d._id,
          label: `${d.deedNumber || 'بدون رقم'} – ${d.city || ''} ${d.district || ''}`
        }))
      );

      setOwnersOptions(
        ownersDocs.map((o) => ({
          id: o._id,
          label: `${o.ownerName || 'بدون اسم'} – ${o.nationalId || ''}`
        }))
      );
    } catch (err) {
      console.error('Lookup load error', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts', { params: { page, limit } });
      const payload = res.data?.data || {};
      let docs = payload.docs || [];

      if (search) {
        const s = search.toLowerCase();
        docs = docs.filter(
          (c) =>
            (c.contractType && c.contractType.toLowerCase().includes(s)) ||
            (c.notes && c.notes.toLowerCase().includes(s))
        );
      }

      const normalized = docs.map((c) => ({
        id: c._id,
        contractType: c.contractType,
        amount: c.contractAmount,
        date: c.contractDate ? c.contractDate.substring(0, 10) : '',
        deedId: c.deed,
        ownerId: c.owner,
        notes: c.notes
      }));

      setRows(normalized);
      setTotal(payload.total || normalized.length);
      setPages(payload.pages || 1);
    } catch (err) {
      console.error('Contracts load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  useEffect(() => {
    loadLookups();
  }, []);

  const openCreateModal = () => {
    setEditingContract(null);
    setForm({
      deed: '',
      owner: '',
      contractType: '',
      contractAmount: '',
      contractDate: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingContract(row);
    setForm({
      deed: row.deedId || '',
      owner: row.ownerId || '',
      contractType: row.contractType || '',
      contractAmount: row.amount || '',
      contractDate: row.date || '',
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
        deed: form.deed || undefined,
        owner: form.owner || undefined,
        contractType: form.contractType || undefined,
        contractAmount: form.contractAmount ? Number(form.contractAmount) : undefined,
        contractDate: form.contractDate || undefined,
        notes: form.notes || undefined
      };

      if (editingContract) {
        await api.patch(`/contracts/${editingContract.id}`, payload);
      } else {
        await api.post('/contracts', payload);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error('Save contract error', err);
      alert('حدث خطأ أثناء حفظ العقد');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('حذف هذا العقد؟')) return;
    await api.delete(`/contracts/${id}`);
    loadData();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>إدارة العقود</h1>
        <p className="page-subtitle">عرض وإدارة العقود المرتبطة بالصكوك والملاك.</p>
      </div>

      <div className="page-toolbar">
        <button className="btn btn-primary" onClick={openCreateModal}>
          + إضافة عقد جديد
        </button>
        <input
          className="search-input"
          placeholder="بحث عن نوع عقد أو ملاحظة..."
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
                  <th>تاريخ العقد</th>
                  <th>قيمة العقد</th>
                  <th>نوع العقد</th>
                  <th>المالك (ID)</th>
                  <th>الصك (ID)</th>
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
                    <td>{r.date}</td>
                    <td>{r.amount}</td>
                    <td>{r.contractType}</td>
                    <td>{r.ownerId}</td>
                    <td>{r.deedId}</td>
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
              <h2>{editingContract ? 'تعديل عقد' : 'إضافة عقد جديد'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <label className="form-label">
                  الصك
                  <select
                    className="form-select"
                    name="deed"
                    value={form.deed}
                    onChange={handleFormChange}
                  >
                    <option value="">اختر الصك...</option>
                    {deedsOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  المالك
                  <select
                    className="form-select"
                    name="owner"
                    value={form.owner}
                    onChange={handleFormChange}
                  >
                    <option value="">اختر المالك...</option>
                    {ownersOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  نوع العقد
                  <input
                    className="form-input"
                    name="contractType"
                    value={form.contractType}
                    onChange={handleFormChange}
                    placeholder="مثل: إشراف، تصميم، رفع مساحي..."
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  قيمة العقد (ريال)
                  <input
                    className="form-input"
                    type="number"
                    name="contractAmount"
                    value={form.contractAmount}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  تاريخ العقد
                  <input
                    className="form-input"
                    type="date"
                    name="contractDate"
                    value={form.contractDate}
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
