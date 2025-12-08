const axios = require("axios");

const BASE =
  "https://gisapps.momra.gov.sa/Krokisurvey/proxy/proxy.ashx?https://portal.momra.gov.sa/server/rest/services/BaseMap/BasicMap/MapServer/";
const LAYER1 = "1/query?";

exports.getParcelPlan = async (req, res) => {
  try {
    const { parcel, plan } = req.query;

    if (!parcel || !plan) {
      return res.status(400).json({ error: "يجب إدخال رقم القطعة ورقم المخطط" });
    }


    const where = `PARCELNO%20LIKE%20%27%25${parcel}%25%27%20AND%20PLANNO%20LIKE%20%27${plan}%27`;
    const encodedWhere = encodeURIComponent(where);

    const url =
      BASE + LAYER1 + `f=geojson&outFields=*&where=${where}`;

    console.log("🔵 Request URL:", url);

    const response = await axios.get(url);
    const data = response.data;

    if (!data.features || data.features.length === 0) {
      return res.status(404).json({ error: "لا توجد بيانات مطابقة" });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ GIS Error:", err.message);
    res.status(500).json({
      error: "فشل جلب بيانات البحث المزدوج",
      details: err.message,
    });
  }
};




// ======================================================
// 3) جلب الهندسة GeoJSON حسب OBJECTID
// ======================================================
exports.getGeometry = async (req, res) => {
  const { objectid } = req.query;

  if (!objectid) return res.status(400).json({ error: "OBJECTID مطلوب" });

  const url =
    MOMRA_PROXY +
    PARCEL_PLAN_URL +
    `f=geojson&outFields=*&where=OBJECTID=${objectid}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "خطأ في جلب الشكل الهندسي" });
  }
};
