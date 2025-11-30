import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function DeedsPage() {
  const [rows, setRows] = useState([]);
  const [owners, setOwners] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    deedNumber: "",
    deedDate: "",
    source: "",
    area: "",
    ownerName: "",
    owner: "",
    pieceNumber: "",
    planNumber: "",
    district: "",
    municipality: "",
    street: "",
    city: "jeddah",
    propertyStatus: "",
    buildingType: "",
    buildingSystem: "",
    floorsCount: "",
    northBoundary: "",
    eastBoundary: "",
    southBoundary: "",
    westBoundary: "",
    districtCorrection: ""
  });

  // ---------------------------------------
  // تحميل الملاك للقائمة المنسدلة
  // ---------------------------------------
  const loadOwners = async () => {
    const res = await api.get("/owners?limit=500");
    setOwners(res.data.data || []);
  };

  // ---------------------------------------
  // تحميل الصكوك
  // ---------------------------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/deeds", { params: { page, limit } });

      setRows(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error("Error loading deeds", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    loadOwners();
  }, [page, limit]);

  // ---------------------------------------
  // فتح نموذج إضافة
  // ---------------------------------------
  const openCreate = () => {
    setEditing(null);
    setForm({
      deedNumber: "",
      deedDate: "",
      source: "",
      area: "",
      ownerName: "",
      owner: "",
      pieceNumber: "",
      planNumber: "",
      district: "",
      municipality: "",
      street: "",
      city: "jeddah",
      propertyStatus: "",
      buildingType: "",
      buildingSystem: "",
      floorsCount: "",
      northBoundary: "",
      eastBoundary: "",
      southBoundary: "",
      westBoundary: "",
      districtCorrection: ""
    });
    setModalOpen(true);
  };

  // ---------------------------------------
  // فتح تعديل
  // ---------------------------------------
  const openEdit = (row) => {
    setEditing(row);

    setForm({
      deedNumber: row.deedNumber || "",
      deedDate: row.deedDate || "",
      source: row.source || "",
      area: row.area || "",
      ownerName: row.ownerName || "",
      owner: row.owner || "",
      pieceNumber: row.pieceNumber || "",
      planNumber: row.planNumber || "",
      district: row.district || "",
      municipality: row.municipality || "",
      street: row.street || "",
      city: row.city || "jeddah",
      propertyStatus: row.propertyStatus || "",
      buildingType: row.buildingType || "",
      buildingSystem: row.buildingSystem || "",
      floorsCount: row.floorsCount || "",
      northBoundary: row.northBoundary || "",
      eastBoundary: row.eastBoundary || "",
      southBoundary: row.southBoundary || "",
      westBoundary: row.westBoundary || "",
      districtCorrection: row.districtCorrection || ""
    });

    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ---------------------------------------
  // حفظ (إضافة أو تعديل)
  // ---------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.patch(`/deeds/${editing._id}`, form);
      } else {
        await api.post("/deeds", form);
      }

      closeModal();
      loadData();
    } catch (err) {
      console.error("Error saving deed:", err);
      alert("حدث خطأ أثناء حفظ الصك");
    }
  };

  // ---------------------------------------
  // حذف
  // ---------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا الصك؟")) return;
    await api.delete(`/deeds/${id}`);
    loadData();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>إدارة الصكوك</h1>
        <p className="page-subtitle">عرض وإضافة وتعديل الصكوك مع جميع بياناتها.</p>
      </div>

      <div className="page-toolbar">
        <button className="btn btn-primary" onClick={openCreate}>
          + إضافة صك جديد
        </button>
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
                  <th>المالك</th>
                  <th>الحي</th>
                  <th>المساحة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <button
                        className="btn"
                        onClick={() => openEdit(row)}
                        style={{ marginInlineEnd: "5px" }}
                      >
                        تعديل
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(row._id)}
                      >
                        حذف
                      </button>
                    </td>
                    <td>{row.deedNumber}</td>
                    <td>{row.ownerName}</td>
                    <td>{row.district}</td>
                    <td>{row.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button className="btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                السابق
              </button>

              <span>
                صفحة {page} من {pages}
              </span>

              <button className="btn" disabled={page === pages} onClick={() => setPage(page + 1)}>
                التالي
              </button>

              <select className="btn" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span>الإجمالي: {total}</span>
            </div>
          </>
        )}
      </div>

      {/* ========== Modal (Add/Edit) ========== */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? "تعديل الصك" : "إضافة صك جديد"}</h2>
            </div>

            <form className="modal-body grid-2" onSubmit={handleSave}>
              {Object.keys(form).map((key) => {
                if (key === "owner") {
                  return (
                    <label className="form-label" key={key}>
                      المالك
                      <select
                        className="form-input"
                        name="owner"
                        value={form.owner}
                        onChange={(e) => setForm({ ...form, owner: e.target.value })}
                      >
                        <option value="">اختيار مالك…</option>
                        {owners.map((o) => (
                          <option key={o._id} value={o._id}>
                            {o.ownerName}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                return (
                  <label className="form-label" key={key}>
                    {key}
                    <input
                      className="form-input"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </label>
                );
              })}

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