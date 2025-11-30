import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [deeds, setDeeds] = useState([]);
  const [owners, setOwners] = useState([]);

  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    deed: "",
    deedNumber: "",
    owner: "",
    workScope: "",
    contractValue: "",
    contractDate: "",
    notes: ""
  });

  // -------------------------------------------------------
  // تحميل البيانات
  // -------------------------------------------------------
  const loadAll = async () => {
    setLoading(true);

    const [c, d, o] = await Promise.all([
      api.get("/contracts", { params: { page, limit } }),
      api.get("/deeds?limit=500"),
      api.get("/owners?limit=500")
    ]);

    setContracts(c.data.data);
    setPages(c.data.pages);
    setTotal(c.data.total);

    setDeeds(d.data.data || []);
    setOwners(o.data.data || []);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [page, limit]);

  // -------------------------------------------------------
  // فتح إضافة
  // -------------------------------------------------------
  const openCreate = () => {
    setEditing(null);
    setForm({
      deed: "",
      deedNumber: "",
      owner: "",
      workScope: "",
      contractValue: "",
      contractDate: "",
      notes: ""
    });
    setModalOpen(true);
  };

  // -------------------------------------------------------
  // فتح تعديل
  // -------------------------------------------------------
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      deed: row.deed || "",
      deedNumber: row.deedNumber || "",
      owner: row.owner || "",
      workScope: row.workScope || "",
      contractValue: row.contractValue || "",
      contractDate: row.contractDate?.substring(0, 10) || "",
      notes: row.notes || ""
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // -------------------------------------------------------
  // حفظ
  // -------------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.patch(`/contracts/${editing._id}`, form);
      } else {
        await api.post("/contracts", form);
      }
      closeModal();
      loadAll();
    } catch (err) {
      console.error(err);
      alert("خطأ في حفظ العقد");
    }
  };

  // -------------------------------------------------------
  // حذف
  // -------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا العقد؟")) return;
    await api.delete(`/contracts/${id}`);
    loadAll();
  };

  // -------------------------------------------------------
  // اختيار صك — ضبط رقم الصك تلقائيًا
  // -------------------------------------------------------
  const handleDeedChange = (id) => {
    const d = deeds.find((x) => x._id === id);
    setForm({
      ...form,
      deed: id,
      deedNumber: d?.deedNumber || ""
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>إدارة العقود</h1>
        <p className="page-subtitle">إنشاء وتعديل وحذف العقود المرتبطة بالصكوك.</p>
      </div>

      <div className="page-toolbar">
        <button className="btn btn-primary" onClick={openCreate}>+ إضافة عقد جديد</button>
      </div>

      <div className="card">
        {loading ? <p>جاري التحميل...</p> : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>إجراءات</th>
                  <th>كود المشروع</th>
                  <th>رقم الصك</th>
                  <th>المالك</th>
                  <th>نطاق العمل</th>
                  <th>القيمة</th>
                </tr>
              </thead>

              <tbody>
                {contracts.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <button className="btn" onClick={() => openEdit(row)}>تعديل</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(row._id)}>حذف</button>
                      <a className="btn btn-secondary" href={`/deeds/${row.deed}`} target="_blank" rel="noreferrer">
                        فتح الصك
                      </a>
                    </td>
                    <td>{row.projectCode}</td>
                    <td>{row.deedNumber}</td>
                    <td>{row.ownerName || "--"}</td>
                    <td>{row.workScope}</td>
                    <td>{row.contractValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>السابق</button>
              <span>صفحة {page} من {pages}</span>
              <button className="btn" disabled={page === pages} onClick={() => setPage(page + 1)}>التالي</button>

              <select className="btn" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>الإجمالي: {total}</span>
            </div>
          </>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* MODAL */}
      {/* -------------------------------------------------- */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "تعديل العقد" : "إضافة عقد جديد"}</h2>
            </div>

            <form className="modal-body grid-2" onSubmit={handleSave}>
              
              {/* الصك */}
              <label className="form-label">
                الصك
                <select
                  className="form-input"
                  value={form.deed}
                  onChange={(e) => handleDeedChange(e.target.value)}
                >
                  <option value="">اختيار صك...</option>
                  {deeds.map((d) => (
                    <option key={d._id} value={d._id}>{d.deedNumber} — {d.ownerName}</option>
                  ))}
                </select>
              </label>

              {/* رقم الصك تلقائي */}
              <label className="form-label">
                رقم الصك
                <input className="form-input" value={form.deedNumber} disabled />
              </label>

              {/* المالك */}
              <label className="form-label">
                المالك
                <select
                  className="form-input"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                >
                  <option value="">اختيار مالك...</option>
                  {owners.map((o) => (
                    <option key={o._id} value={o._id}>{o.ownerName}</option>
                  ))}
                </select>
              </label>

              {/* نطاق العمل */}
              <label className="form-label">
                نطاق العمل
                <input
                  className="form-input"
                  value={form.workScope}
                  onChange={(e) => setForm({ ...form, workScope: e.target.value })}
                />
              </label>

              {/* قيمة العقد */}
              <label className="form-label">
                قيمة العقد
                <input
                  type="number"
                  className="form-input"
                  value={form.contractValue}
                  onChange={(e) => setForm({ ...form, contractValue: e.target.value })}
                />
              </label>

              {/* تاريخ */}
              <label className="form-label">
                تاريخ العقد
                <input
                  type="date"
                  className="form-input"
                  value={form.contractDate}
                  onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
                />
              </label>

              {/* ملاحظات */}
              <label className="form-label full">
                ملاحظات
                <textarea
                  className="form-input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>

              <div className="modal-footer">
                <button className="btn" type="button" onClick={closeModal}>إلغاء</button>
                <button className="btn btn-primary" type="submit">حفظ</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
