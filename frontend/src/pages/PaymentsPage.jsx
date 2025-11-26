import { useEffect, useState } from 'react';
import api from '../api/apiClient.js';

export default function PaymentsPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [contractsOptions, setContractsOptions] = useState([]);

  const [form, setForm] = useState({
    contract: '',
    amount: '',
    date: '',
    note: ''
  });

  const loadLookups = async () => {
    try {
      const [contractsRes, deedsRes, ownersRes] = await Promise.all([
        api.get('/contracts', { params: { page: 1, limit: 1000 } }),
        api.get('/deeds', { params: { page: 1, limit: 1000 } }),
        api.get('/owners', { params: { page: 1, limit: 1000 } })
      ]);

      const contractsDocs = contractsRes.data?.data?.docs || [];
      const deedsDocs = deedsRes.data?.data?.docs || [];
      const ownersDocs = ownersRes.data?.data?.docs || [];

      const deedsMap = new Map(deedsDocs.map((d) => [d._id, d]));
      const ownersMap = new Map(ownersDocs.map((o) => [o._id, o]));

      const options = contractsDocs.map((c) => {
        const owner = ownersMap.get(c.owner);
        const deed = deedsMap.get(c.deed);
        const contractType = c.contractType || 'بدون نوع';
        const ownerName = owner?.ownerName || 'بدون اسم';
        const deedNumber = deed?.deedNumber || 'بدون رقم';
        return {
          id: c._id,
          label: `${contractType} – ${ownerName} – ${deedNumber}`
        };
      });

      setContractsOptions(options);
    } catch (err) {
      console.error('Lookup load error (payments)', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments', { params: { page, limit } });
      const payload = res.data?.data || {};
      let docs = payload.docs || [];

      if (search) {
        const s = search.toLowerCase();
        docs = docs.filter(
          (p) =>
            (p.note && p.note.toLowerCase().includes(s)) ||
            (String(p.amount || '') && String(p.amount || '').includes(s))
        );
      }

      const normalized = docs.map((p) => ({
        id: p._id,
        contractId: p.contract,
        amount: p.amount,
        date: p.date ? p.date.substring(0, 10) : '',
        note: p.note
      }));

      setRows(normalized);
      setTotal(payload.total || normalized.length);
      setPages(payload.pages || 1);
    } catch (err) {
      console.error('Payments load error', err);
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
    setEditingPayment(null);
    setForm({
      contract: '',
      amount: '',
      date: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingPayment(row);
    setForm({
      contract: row.contractId || '',
      amount: row.amount || '',
      date: row.date || '',
      note: row.note || ''
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
        contract: form.contract || undefined,
        amount: form.amount ? Number(form.amount) : undefined,
        date: form.date || undefined,
        note: form.note || undefined
      };

      if (editingPayment) {
        await api.patch(`/payments/${editingPayment.id}`, payload);
      } else {
        await api.post('/payments', payload);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error('Save payment error', err);
      alert('حدث خطأ أثناء حفظ الدفعة');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('حذف هذه الدفعة؟')) return;
    await api.delete(`/payments/${id}`);
    loadData();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>إدارة المدفوعات</h1>
        <p className="page-subtitle">عرض وتتبع المدفوعات المرتبطة بالعقود.</p>
      </div>

      <div className="page-toolbar">
        <button className="btn btn-primary" onClick={openCreateModal}>
          + إضافة دفعة جديدة
        </button>
        <input
          className="search-input"
          placeholder="بحث عن مبلغ أو ملاحظة..."
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
                  <th>ملاحظة</th>
                  <th>تاريخ الدفع</th>
                  <th>المبلغ</th>
                  <th>العقد (ID)</th>
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
                    <td>{r.note}</td>
                    <td>{r.date}</td>
                    <td>{r.amount}</td>
                    <td>{r.contractId}</td>
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
              <h2>{editingPayment ? 'تعديل دفعة' : 'إضافة دفعة جديدة'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <label className="form-label">
                  العقد
                  <select
                    className="form-select"
                    name="contract"
                    value={form.contract}
                    onChange={handleFormChange}
                  >
                    <option value="">اختر العقد...</option>
                    {contractsOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  مبلغ الدفعة (ريال)
                  <input
                    className="form-input"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleFormChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label className="form-label">
                  تاريخ الدفع
                  <input
                    className="form-input"
                    type="date"
                    name="date"
                    value={form.date}
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
                    name="note"
                    value={form.note}
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
