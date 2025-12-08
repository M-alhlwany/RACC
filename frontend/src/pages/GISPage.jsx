import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/apiClient";
import "./gis.css";

export default function GISPage() {
  const [parcel, setParcel] = useState("");
  const [plan, setPlan] = useState("");
  const [planSuggestions, setPlanSuggestions] = useState([]);
  const [resultData, setResultData] = useState(null);

  const mapRef = useRef(null); // <<— مهم جداً
  const layerRef = useRef(null);

  // ============================
  // 1️⃣ إنشاء الخريطة مرة واحدة
  // ============================
  useEffect(() => {
    // إذا الخريطة موجودة، لا تنشئها مرة أخرى
    if (mapRef.current) return;

    // لو Leaflet خزّن خريطة قديمة على نفس الـ div امسحها
    const existing = document.getElementById("map");
    if (existing && existing._leaflet_id) {
      existing._leaflet_id = null;
    }

    const map = L.map("map").setView([21.54, 39.17], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    mapRef.current = map;
  }, []);

  // ==================================================
  // 2️⃣ تحميل المقترحات عند كتابة رقم المخطط
  // ==================================================
  const loadPlanSuggestions = async (value) => {
    setPlan(value);
    if (value.length < 2) return setPlanSuggestions([]);

    try {
      const res = await api.get("/plans/search", { params: { p: value } });
      setPlanSuggestions(res.data.planNamesArray || []);
    } catch (err) {
      console.error("Plan Search Error:", err);
    }
  };

  // ==================================================
  // 3️⃣ البحث عن parcel + plan
  // ==================================================
  const handleSearch = async () => {
    if (!parcel || !plan) {
      alert("يرجى إدخال رقم القطعة والمخطط");
      return;
    }

    try {
      const res = await api.get("/gis/parcel-plan", {
        params: { parcel, plan },
      });

      setResultData(res.data);

      // إزالة طبقة سابقة إن وجدت
      if (layerRef.current) {
        mapRef.current.removeLayer(layerRef.current);
      }

      const geo = L.geoJSON(res.data, { style: { color: "red", weight: 2 } });
      geo.addTo(mapRef.current);
      layerRef.current = geo;

      mapRef.current.fitBounds(geo.getBounds());
    } catch (err) {
      console.error(err);
      alert("لا توجد بيانات مطابقة");
    }
  };

  return (
    <div className="gis-page">
      <div className="page-header">
        <h1>GIS – البحث عن المواقع</h1>
        <p>إبحث برقم القطعة + المخطط معاً</p>
      </div>

      <div className="gis-tools card">
        <div className="search-row">

          <input
            type="text"
            placeholder="رقم القطعة"
            value={parcel}
            onChange={(e) => setParcel(e.target.value)}
          />

          {/* رقم المخطط + قائمة منسدلة */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="رقم المخطط"
              value={plan}
              onChange={(e) => loadPlanSuggestions(e.target.value)}
            />

            {planSuggestions.length > 0 && (
              <div className="dropdown-list">
                {planSuggestions.map((p) => (
                  <div
                    key={p}
                    className="dropdown-item"
                    onClick={() => {
                      setPlan(p);
                      setPlanSuggestions([]);
                    }}
                  >
                    مخطط {p}
                  </div>
                ))}
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

      {resultData && (
        <div className="card">
          <h2>البيانات التفصيلية</h2>
          {Object.entries(resultData.features[0].properties).map(([k, v]) => (
            <div className="detail-row" key={k}>
              <strong>{k}</strong>: {String(v)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
