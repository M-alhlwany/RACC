import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/apiClient";
import PLANS from "../data/plans.json"; // ← ملف المخططات المحلي
import "./gis.css";

export default function GISPage() {
  const [parcel, setParcel] = useState("");
  const [plan, setPlan] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({ sub: "", district: "" });

  const [uniqueSubs, setUniqueSubs] = useState([]);
  const [uniqueDistricts, setUniqueDistricts] = useState([]);

  const [filteredPlans, setFilteredPlans] = useState([]);

  const mapRef = useRef(null);
  const layerRef = useRef(null);

  /* ============================================================
     1️⃣ إنشاء الخريطة مرة واحدة فقط
  ============================================================ */
  useEffect(() => {
    if (mapRef.current) return;

    const existing = document.getElementById("map");
    if (existing && existing._leaflet_id) existing._leaflet_id = null;

    const map = L.map("map").setView([21.54, 39.17], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    mapRef.current = map;
  }, []);

  /* ============================================================
     2️⃣ Auto Suggest عند كتابة رقم المخطط
  ============================================================ */
  const handlePlanInput = (value) => {
    setPlan(value);

    if (value.length < 2) return setSuggestions([]);

    const results = PLANS.filter((p) =>
      p.properties.PLANNUMBER?.toString().includes(value)
    );

    // تجهيز شكل العرض كما النظام القديم
    const suggestionsFormatted = results.map((p) => ({
      objectid: p.properties.OBJECTID,
      sub: p.properties.SUBMUNICIPALITY,
      district: p.properties.DISTRICT,
      planNo: p.properties.PLANNUMBER,
      part: p.properties.PLANPARTNO,
      display: `مخطط ${p.properties.PLANNUMBER} / ${p.properties.PLANPARTNO} – ${p.properties.SUBMUNICIPALITY} – حي ${p.properties.DISTRICT}`,
    }));

    setSuggestions(suggestionsFormatted);

    // قائمة البلديات
    setUniqueSubs([
      ...new Set(results.map((p) => p.properties.SUBMUNICIPALITY)),
    ]);

    // قائمة الأحياء
    setUniqueDistricts([
      ...new Set(results.map((p) => p.properties.DISTRICT)),
    ]);

    setFilteredPlans(suggestionsFormatted);
  };

  /* ============================================================
     3️⃣ تطبيق الفلاتر
  ============================================================ */
  useEffect(() => {
    let list = suggestions;

    if (filters.sub) list = list.filter((p) => p.sub === filters.sub);
    if (filters.district) list = list.filter((p) => p.district === filters.district);

    setFilteredPlans(list);
  }, [filters, suggestions]);

  /* ============================================================
     4️⃣ اختيار مخطط من القائمة
  ============================================================ */
  const handlePlanSelect = (p) => {
    setPlan(p.planNo);
    setSuggestions([]);
    setFilteredPlans([]);

    console.log("Selected plan:", p);
  };

  /* ============================================================
     5️⃣ تنفيذ البحث الحقيقي (Momra API)
  ============================================================ */
  const handleSearch = async () => {
    if (!parcel || !plan) {
      alert("يرجى إدخال رقم القطعة والمخطط");
      return;
    }

    try {
      const res = await api.get("/gis/parcel-plan", {
        params: { parcel, plan },
      });

      const geo = res.data;

      if (layerRef.current) mapRef.current.removeLayer(layerRef.current);

      const layer = L.geoJSON(geo, { style: { color: "blue", weight: 2 } }).addTo(
        mapRef.current
      );

      layerRef.current = layer;
      mapRef.current.fitBounds(layer.getBounds());
    } catch (err) {
      console.error(err);
      alert("لا توجد بيانات متطابقة");
    }
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="gis-page">
      <div className="page-header">
        <h1>GIS – البحث عن المواقع</h1>
        <p>إبحث برقم القطعة + رقم المخطط معاً</p>
      </div>

      <div className="gis-tools card">
        <div className="search-row">

          <input
            type="text"
            placeholder="رقم القطعة"
            value={parcel}
            onChange={(e) => setParcel(e.target.value)}
          />

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="رقم المخطط"
              value={plan}
              onChange={(e) => handlePlanInput(e.target.value)}
            />

            {/* ============================
                قائمة المقترحات + الفلاتر
            ============================ */}
            {filteredPlans.length > 0 && (
              <div className="suggest-box">

                {/* الفلاتر */}
                <div className="filters">
                  <select onChange={(e) => setFilters({ ...filters, sub: e.target.value })}>
                    <option value="">كل البلديات الفرعية</option>
                    {uniqueSubs.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    onChange={(e) =>
                      setFilters({ ...filters, district: e.target.value })
                    }
                  >
                    <option value="">كل الأحياء</option>
                    {uniqueDistricts.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* النتائج */}
                <div className="results">
                  {filteredPlans.map((p) => (
                    <div
                      key={p.objectid}
                      className="suggest-item"
                      onClick={() => handlePlanSelect(p)}
                    >
                      {p.display}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleSearch}>
            🔍 بحث
          </button>
        </div>
      </div>

      <div className="map-container">
        <div id="map"></div>
      </div>
    </div>
  );
}
