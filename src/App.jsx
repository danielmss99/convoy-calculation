import { useState, useMemo, useEffect, useRef } from "react";

var VEHICLES = [
  { id: "m1165a1", name: "M1165A1", cat: "HMMWV", len: 194, spd: 50, rng: 300, crew: 4, drv: "4x4", desc: "Special Purpose" },
  { id: "m1151", name: "M1151", cat: "HMMWV", len: 194, spd: 50, rng: 300, crew: 4, drv: "4x4", desc: "Armament Carrier" },
  { id: "m1152", name: "M1152", cat: "HMMWV", len: 194, spd: 50, rng: 300, crew: 4, drv: "4x4", desc: "Troop/Cargo" },
  { id: "m997", name: "M997", cat: "HMMWV", len: 197, spd: 50, rng: 275, crew: 2, drv: "4x4", desc: "Ambulance" },
  { id: "m1280", name: "M1280", cat: "JLTV", len: 211, spd: 68, rng: 310, crew: 4, drv: "4x4", desc: "JLTV GP" },
  { id: "m1279", name: "M1279", cat: "JLTV", len: 211, spd: 68, rng: 310, crew: 2, drv: "4x4", desc: "JLTV Utility" },
  { id: "m1078", name: "M1078", cat: "FMTV", len: 294, spd: 55, rng: 300, crew: 3, drv: "4x4", desc: "LMTV 2.5-Ton" },
  { id: "m1083", name: "M1083", cat: "FMTV", len: 342, spd: 55, rng: 300, crew: 3, drv: "6x6", desc: "MTV 5-Ton" },
  { id: "m1084", name: "M1084", cat: "FMTV", len: 384, spd: 55, rng: 300, crew: 3, drv: "6x6", desc: "MTV LWB" },
  { id: "m1089", name: "M1089", cat: "FMTV", len: 360, spd: 55, rng: 300, crew: 3, drv: "6x6", desc: "MTV Wrecker" },
  { id: "m1090", name: "M1090", cat: "FMTV", len: 330, spd: 55, rng: 300, crew: 2, drv: "6x6", desc: "Dump Truck" },
  { id: "m1148", name: "M1148", cat: "FMTV", len: 396, spd: 55, rng: 300, crew: 2, drv: "6x6", desc: "LHS" },
  { id: "m977", name: "M977", cat: "HEMTT", len: 401, spd: 62, rng: 300, crew: 2, drv: "8x8", desc: "HEMTT Cargo" },
  { id: "m978", name: "M978", cat: "HEMTT", len: 401, spd: 62, rng: 300, crew: 2, drv: "8x8", desc: "Fuel Tanker" },
  { id: "m984", name: "M984", cat: "HEMTT", len: 394, spd: 62, rng: 300, crew: 2, drv: "8x8", desc: "HEMTT Wrecker" },
  { id: "m1120", name: "M1120", cat: "HEMTT", len: 408, spd: 62, rng: 300, crew: 2, drv: "8x8", desc: "HEMTT LHS" },
  { id: "m1075", name: "M1075", cat: "Heavy", len: 414, spd: 55, rng: 300, crew: 2, drv: "10x10", desc: "PLS" },
  { id: "m1070", name: "M1070", cat: "Heavy", len: 364, spd: 45, rng: 300, crew: 2, drv: "8x8", desc: "HET" },
  { id: "transit", name: "Transit Van", cat: "GSA", len: 143, spd: 75, rng: 350, crew: 3, drv: "FWD", desc: "GSA Van" },
  { id: "pickup", name: "Pickup", cat: "GSA", len: 232, spd: 75, rng: 400, crew: 3, drv: "4x4", desc: "GSA Pickup" },
];

var TRAILERS = [
  { id: "none", name: "No Trailer", len: 0 },
  { id: "m1102", name: "M1102", len: 108 }, { id: "m1082", name: "M1082", len: 192 },
  { id: "m1095", name: "M1095", len: 222 }, { id: "m1076", name: "M1076", len: 300 },
  { id: "m989a1", name: "M989A1", len: 264 }, { id: "m1048", name: "M1048 Water", len: 168 },
  { id: "m1000", name: "M1000 HET", len: 612 },
];

var CATS = ["All", "HMMWV", "JLTV", "FMTV", "HEMTT", "Heavy", "GSA"];
function roundUp(v, d) { if (!v || isNaN(v)) return 0; return Math.ceil(v * Math.pow(10, d)) / Math.pow(10, d); }
function milTime(m) { var t = ((m % 1440) + 1440) % 1440; return String(Math.floor(t / 60)).padStart(2, "0") + String(Math.round(t % 60)).padStart(2, "0"); }
function colTime(m) { var t = ((m % 1440) + 1440) % 1440; return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(Math.round(t % 60)).padStart(2, "0"); }
function fmtDur(m) { if (m <= 0) return "0m"; var h = Math.floor(m / 60); var mn = Math.round(m % 60); return h ? h + "h " + mn + "m" : mn + "m"; }

var grn = "#8bc34a", grd = "#2e7d32", dm = "#5a7a5e", tx = "#c8d6c2", yl = "#ffd54f", og = "#ffb74d", cy = "#4fc3f7", rd = "#ef9a9a";
var bg = "#080c0a", pn = "#0c1510", cd = "#101d16", bd = "#1c3028";
var yi = { padding: "5px 7px", background: "#1a1800", border: "1px solid #4a4400", borderRadius: 3, color: yl, fontFamily: "'Courier New',monospace", fontSize: 13, fontWeight: 700, boxSizing: "border-box" };
var si = { ...yi, background: "#070d09", border: "1px solid " + bd, color: tx, fontSize: 10 };

export default function App() {
  var [lines, setLines] = useState([]);
  var [rateOvr, setRateOvr] = useState("");
  var [cps, setCps] = useState([
    { l: "SP to CP1", d: 0 }, { l: "CP1 to CP2", d: 0 }, { l: "CP2 to CP3", d: 0 },
    { l: "CP3 to CP4", d: 0 }, { l: "CP4 to CP5", d: 0 }, { l: "CP5 to CP6", d: 0 }, { l: "CP6 to RP", d: 0 }
  ]);
  var [brks, setBrks] = useState([0, 0, 0, 0, 0, 0, 0]);
  var [gap, setGap] = useState(0);
  var [tGap, setTGap] = useState(0);
  var [spTime, setSpTime] = useState("07:00");
  var [tab, setTab] = useState("map");
  var [vCat, setVCat] = useState("All");
  // Map
  var [spAddr, setSpAddr] = useState("");
  var [rpAddr, setRpAddr] = useState("");
  var [wpList, setWpList] = useState([]);
  var [routeData, setRouteData] = useState(null);
  var [directions, setDirections] = useState([]);
  var [loading, setLoading] = useState(false);
  var [mapErr, setMapErr] = useState("");
  var [ready, setReady] = useState(false);
  var mapDiv = useRef(null);
  var mapObj = useRef(null);
  var routeCtrl = useRef(null);
  // DD1265
  var [convNum, setConvNum] = useState("");
  var [uic, setUic] = useState("");
  var [formOrg, setFormOrg] = useState("");
  var [formStn, setFormStn] = useState("");
  var [formCdr, setFormCdr] = useState("");
  var [formOff, setFormOff] = useState("");
  var [formEnl, setFormEnl] = useState("");
  var [formRoute, setFormRoute] = useState("");

  // Load Leaflet + Routing Machine
  useEffect(function () {
    if (window.L && window.L.Routing) { setReady(true); return; }
    var loaded = { css1: false, js1: false, css2: false, js2: false };
    function check() { if (loaded.js1 && loaded.js2) setReady(true); }
    var c1 = document.createElement("link"); c1.rel = "stylesheet";
    c1.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(c1);
    var c2 = document.createElement("link"); c2.rel = "stylesheet";
    c2.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.css";
    document.head.appendChild(c2);
    var s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s1.onload = function () {
      loaded.js1 = true;
      var s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet-routing-machine/3.2.12/leaflet-routing-machine.min.js";
      s2.onload = function () { loaded.js2 = true; check(); };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  }, []);

  // Init map
  useEffect(function () {
    if (!ready || !mapDiv.current || mapObj.current) return;
    var m = window.L.map(mapDiv.current).setView([31.5, -98], 7);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap", maxZoom: 18
    }).addTo(m);
    mapObj.current = m;
    setTimeout(function () { m.invalidateSize(); }, 300);
  }, [ready, tab]);

  useEffect(function () {
    if (tab === "map" && mapObj.current) setTimeout(function () { mapObj.current.invalidateSize(); }, 150);
  }, [tab]);

  // Route calculation
  function doRoute() {
    if (!ready || !mapObj.current) { setMapErr("Map not ready"); return; }
    if (!spAddr.trim() || !rpAddr.trim()) { setMapErr("Enter SP and RP addresses"); return; }
    setMapErr("");
    setLoading(true);
    setDirections([]);
    setRouteData(null);
    var L = window.L;
    var map = mapObj.current;
    if (routeCtrl.current) { map.removeControl(routeCtrl.current); routeCtrl.current = null; }
    var waypoints = [L.Routing.waypoint(null, spAddr)];
    wpList.forEach(function (w) { if (w.trim()) waypoints.push(L.Routing.waypoint(null, w)); });
    waypoints.push(L.Routing.waypoint(null, rpAddr));
    try {
      var ctrl = L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
        geocoder: null,
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: "#8bc34a", weight: 6, opacity: 0.85 }] },
        createMarker: function (i, wp, n) {
          var col = i === 0 ? "#4caf50" : i === n - 1 ? "#f44336" : "#ff9800";
          var labels = ["SP"];
          for (var k = 0; k < n - 2; k++) labels.push("CP" + (k + 1));
          labels.push("RP");
          return L.circleMarker(wp.latLng, { radius: 10, fillColor: col, color: "#fff", weight: 3, fillOpacity: 0.9 })
            .bindPopup(labels[i]);
        }
      }).addTo(map);
      ctrl.on("routesfound", function (e) {
        var route = e.routes[0];
        var totalMi = (route.summary.totalDistance * 0.000621371);
        var dirs = [];
        var legLabels = ["SP"];
        wpList.forEach(function (_, k) { legLabels.push("CP" + (k + 1)); });
        legLabels.push("RP");
        // Extract turn-by-turn
        if (route.instructions) {
          route.instructions.forEach(function (inst) {
            dirs.push({ text: inst.text, dist: (inst.distance * 0.000621371).toFixed(1), road: inst.road || "" });
          });
        }
        // Extract leg distances
        var legs = [];
        if (route.waypointIndices && route.instructions) {
          var wpIdx = route.waypointIndices;
          for (var i = 0; i < wpIdx.length - 1; i++) {
            var legDist = 0;
            for (var j = wpIdx[i]; j < wpIdx[i + 1]; j++) {
              if (route.instructions[j]) legDist += route.instructions[j].distance;
            }
            legs.push({ from: legLabels[i], to: legLabels[i + 1], mi: parseFloat((legDist * 0.000621371).toFixed(1)) });
          }
        }
        if (legs.length === 0) {
          legs.push({ from: "SP", to: "RP", mi: parseFloat(totalMi.toFixed(1)) });
        }
        setRouteData({ totalMi: totalMi.toFixed(1), legs: legs });
        setDirections(dirs);
        // Auto-fill checkpoints
        var nc = cps.map(function (c) { return { l: c.l, d: 0 }; });
        legs.forEach(function (lg, idx) {
          if (idx < nc.length) nc[idx] = { l: lg.from + " to " + lg.to, d: lg.mi };
        });
        setCps(nc);
        setFormRoute(legLabels.join(" -> "));
        setLoading(false);
      });
      ctrl.on("routingerror", function (e) {
        setMapErr("Routing error: " + (e.error ? e.error.message : "Check addresses"));
        setLoading(false);
      });
      routeCtrl.current = ctrl;
    } catch (err) {
      setMapErr("Error: " + err.message);
      setLoading(false);
    }
  }

  // Calculations
  var calc = useMemo(function () {
    var lt = lines.map(function (ln) {
      var v = VEHICLES.find(function (x) { return x.id === ln.vid; });
      var t = TRAILERS.find(function (x) { return x.id === ln.tid; });
      var total = (v ? v.len : 0) + (t ? t.len : 0);
      var cnt = parseInt(ln.n) || 0;
      return { cnt: cnt, tot: cnt * total, v: v };
    });
    var slow = Infinity; lt.forEach(function (x) { if (x.cnt > 0 && x.v && x.v.spd < slow) slow = x.v.spd; });
    var aRate = slow === Infinity ? 55 : slow;
    var rate = rateOvr ? parseFloat(rateOvr) : aRate;
    var tLen = lt.reduce(function (s, x) { return s + (x.tot > 0 ? x.tot : 0); }, 0);
    var pm = lt.reduce(function (s, x) { return s + x.cnt; }, 0);
    var aIn = pm > 0 ? roundUp(tLen / pm, 1) : 0;
    var aYd = aIn > 0 ? roundUp(aIn / 36, 1) : 0;
    var den = gap + aYd; var vpm = den > 0 ? roundUp(1760 / den, 1) : 0;
    var ptC = (vpm * rate) > 0 ? roundUp((pm * 60) / (vpm * rate), 1) : 0;
    var pt = ptC + tGap;
    var legs = cps.map(function (cp) { var d = parseFloat(cp.d) || 0; if (d <= 0) return { d: 0, raw: 0, r: 0 }; return { d: d, raw: (d * 60) / rate, r: roundUp((d * 60) / rate, 1) }; });
    var tDist = cps.reduce(function (s, cp) { return s + (parseFloat(cp.d) || 0); }, 0);
    var tTrav = legs.reduce(function (s, l) { return s + l.r; }, 0);
    var spP = spTime.split(":"); var spM = (parseInt(spP[0]) || 0) * 60 + (parseInt(spP[1]) || 0);
    var sch = [{ lbl: "SP", eta: spM, brk: 0, pt: pt, etd: spM + pt }];
    var cn = ["CP1", "CP2", "CP3", "CP4", "CP5", "CP6", "RP"];
    var lE = spM, lB = 0;
    for (var i = 0; i < legs.length; i++) { if (legs[i].d <= 0) continue; var a = lE + lB + legs[i].r; var b = brks[i] || 0; sch.push({ lbl: cn[i], eta: a, brk: b, pt: pt, etd: a + b + pt }); lE = a; lB = b; }
    var tCrew = 0, osCnt = 0;
    lt.forEach(function (x) { if (x.cnt > 0 && x.v) { tCrew += x.cnt * x.v.crew; if (x.v.len > 300) osCnt += x.cnt; } });
    return { lt: lt, tLen: tLen, pm: pm, aIn: aIn, aYd: aYd, vpm: vpm, pt: pt, legs: legs, tDist: tDist, tTrav: tTrav, sch: sch, rate: rate, aRate: aRate, tCrew: tCrew, osCnt: osCnt };
  }, [lines, rateOvr, cps, brks, gap, tGap, spTime]);

  function addV(vid) {
    var i = lines.findIndex(function (l) { return l.vid === vid && l.tid === "none"; });
    if (i >= 0) setLines(lines.map(function (l, j) { return j === i ? { ...l, n: parseInt(l.n) + 1 } : l; }));
    else setLines([].concat(lines, [{ n: 1, vid: vid, tid: "none" }]));
  }

  var vDesc = lines.filter(function (l) { return parseInt(l.n) > 0; }).map(function (l) { var v = VEHICLES.find(function (x) { return x.id === l.vid; }); return l.n + " X " + (v ? v.name : "?") + " " + (v ? v.desc.toUpperCase() : ""); }).join("\n");
  var depDTG = useMemo(function () { var d = new Date(); var m = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; return String(d.getDate()).padStart(2, "0") + milTime(calc.sch[0].eta) + m[d.getMonth()] + String(d.getFullYear()).slice(2); }, [calc.sch]);
  var arrDTG = useMemo(function () { var d = new Date(); var m = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; var last = calc.sch[calc.sch.length - 1]; return String(d.getDate()).padStart(2, "0") + milTime(last.etd) + m[d.getMonth()] + String(d.getFullYear()).slice(2); }, [calc.sch]);

  function printDD() {
    var rows = ""; calc.sch.forEach(function (s) { rows += "<tr><td style='border:1px solid #000;padding:3px;font-weight:bold'>" + s.lbl + "</td><td style='border:1px solid #000;padding:3px;text-align:center'>" + milTime(s.eta) + "</td><td style='border:1px solid #000;padding:3px;text-align:center'>" + (s.brk > 0 ? s.brk + " MIN" : "-") + "</td><td style='border:1px solid #000;padding:3px;text-align:center'>" + milTime(s.etd) + "</td></tr>"; });
    var w = window.open("", "_blank"); if (!w) return;
    w.document.write("<html><head><title>DD 1265</title><style>body{font-family:'Courier New',monospace;font-size:9pt}table{width:100%;border-collapse:collapse}td{border:1px solid #000;padding:3px;vertical-align:top}.l{font-size:7pt;color:#555}.v{font-size:9pt;font-weight:bold}.h{background:#ddd;text-align:center;font-weight:bold}</style></head><body><table>");
    w.document.write("<tr><td colspan=4 style='text-align:center;font-weight:bold;font-size:12pt;border:2px solid #000;padding:6px'>REQUEST FOR CONVOY CLEARANCE</td></tr>");
    w.document.write("<tr><td colspan=2><div class=l>1. CONVOY #</div><div class=v>" + convNum + "</div></td><td><div class=l>2. UIC</div><div class=v>" + uic + "</div></td><td><div class=l>3. DATE</div><div class=v>" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "</div></td></tr>");
    w.document.write("<tr><td colspan=4 class=h>SECTION I - GENERAL</td></tr>");
    w.document.write("<tr><td colspan=2><div class=l>4. ORG</div><div class=v>" + formOrg + "</div></td><td colspan=2><div class=l>5. STN</div><div class=v>" + formStn + "</div></td></tr>");
    w.document.write("<tr><td colspan=2><div class=l>6. CDR</div><div class=v>" + formCdr + "</div></td><td><div class=l>7a. OFF</div><div class=v>" + formOff + "</div></td><td><div class=l>7b. ENL</div><div class=v>" + formEnl + "</div></td></tr>");
    w.document.write("<tr><td><div class=l>8. ORIGIN</div><div class=v>" + spAddr + "</div></td><td><div class=l>9. DEST</div><div class=v>" + rpAddr + "</div></td><td><div class=l>10a/b</div><div class=v>" + depDTG + " / " + arrDTG + "</div></td><td><div class=l>11. RATE</div><div class=v>" + calc.rate + " MPH</div></td></tr>");
    w.document.write("<tr><td colspan=4 class=h>SECTION II</td></tr>");
    w.document.write("<tr><td colspan=4><div class=l>12. VEHICLES</div><div class=v style='white-space:pre-wrap;min-height:40px'>" + vDesc + "</div></td></tr>");
    w.document.write("<tr><td colspan=2><div class=l>13. TOTAL</div><div class=v>" + calc.pm + "</div></td><td colspan=2><div class=l>14. OVERSIZE</div><div class=v>" + calc.osCnt + "</div></td></tr>");
    w.document.write("<tr><td colspan=4 class=h>SECTION III</td></tr>");
    w.document.write("<tr><td colspan=4><div class=l>17. ROUTING</div><div class=v>" + formRoute + "</div></td></tr>");
    w.document.write("<tr><td style='font-weight:bold;text-align:center'>LOC</td><td style='font-weight:bold;text-align:center'>ETA</td><td style='font-weight:bold;text-align:center'>BRK</td><td style='font-weight:bold;text-align:center'>ETD</td></tr>");
    w.document.write(rows + "</table></body></html>");
    w.document.close(); setTimeout(function () { w.focus(); w.print(); }, 500);
  }

  var fV = vCat === "All" ? VEHICLES : VEHICLES.filter(function (v) { return v.cat === vCat; });

  return (
    <div style={{ fontFamily: "'Courier New',monospace", background: bg, color: tx, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#0f1a14", borderBottom: "2px solid " + bd, padding: "8px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 3, background: grd, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>C</div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: grn, letterSpacing: 2 }}>CONVOY MOVEMENT CALCULATOR</div></div>
        {[["VEH", calc.pm, grn], ["RATE", calc.rate, yl], ["VPM", calc.vpm, og], ["PASS", calc.pt + "m", cy]].map(function (s, i) {
          return <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 7, color: dm }}>{s[0]}</div><div style={{ fontSize: 12, fontWeight: 700, color: s[2] }}>{s[1]}</div></div>;
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid " + bd, background: pn, overflowX: "auto" }}>
        {[["map", "MAP"], ["convoy", "CONVOY"], ["route", "ROUTE"], ["schedule", "ETA/ETD"], ["results", "RESULTS"], ["dd1265", "DD 1265"]].map(function (t) {
          return <button key={t[0]} onClick={function () { setTab(t[0]); }} style={{ padding: "9px 14px", background: tab === t[0] ? "#1a2e24" : "transparent", border: "none", borderBottom: tab === t[0] ? "2px solid " + grn : "2px solid transparent", cursor: "pointer", fontSize: 10, fontWeight: 700, color: tab === t[0] ? grn : dm, fontFamily: "inherit" }}>{t[1]}</button>;
        })}
      </div>

      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

        {/* ═══ MAP ═══ */}
        {tab === "map" && <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 16px", background: pn, borderBottom: "1px solid " + bd }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginBottom: wpList.length > 0 ? 8 : 0 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 8, color: grn, fontWeight: 700, marginBottom: 3 }}>START POINT (SP)</div>
                <input value={spAddr} onChange={function (e) { setSpAddr(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") doRoute(); }} placeholder="e.g. Brownwood, TX" style={{ ...yi, width: "100%", fontSize: 12 }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 8, color: rd, fontWeight: 700, marginBottom: 3 }}>RELEASE POINT (RP)</div>
                <input value={rpAddr} onChange={function (e) { setRpAddr(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") doRoute(); }} placeholder="e.g. Abilene, TX" style={{ ...yi, width: "100%", fontSize: 12, borderColor: "#4a2200", background: "#1a0e00" }} />
              </div>
              <button onClick={doRoute} disabled={loading} style={{ padding: "8px 20px", background: loading ? "#333" : grd, border: "none", borderRadius: 4, color: "#fff", cursor: loading ? "wait" : "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, minHeight: 34 }}>{loading ? "ROUTING..." : "GET ROUTE"}</button>
            </div>
            {wpList.map(function (w, i) {
              return <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: og, fontWeight: 700, width: 30 }}>{"CP" + (i + 1)}</span>
                <input value={w} onChange={function (e) { setWpList(wpList.map(function (a, j) { return j === i ? e.target.value : a; })); }} onKeyDown={function (e) { if (e.key === "Enter") doRoute(); }} placeholder={"Checkpoint " + (i + 1)} style={{ ...si, flex: 1 }} />
                <button onClick={function () { setWpList(wpList.filter(function (_, j) { return j !== i; })); }} style={{ background: "none", border: "none", color: "#5a3a3a", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>X</button>
              </div>;
            })}
            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
              <button onClick={function () { if (wpList.length < 5) setWpList([].concat(wpList, [""])); }} style={{ padding: "4px 12px", background: "transparent", border: "1px solid " + bd, borderRadius: 3, color: og, cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 700 }}>+ CHECKPOINT</button>
              {mapErr && <span style={{ fontSize: 10, color: rd, fontWeight: 700 }}>{mapErr}</span>}
            </div>
          </div>
          {/* Route info */}
          {routeData && <div style={{ padding: "8px 16px", background: "#0a1510", borderBottom: "1px solid " + bd, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 7, color: dm }}>ROAD DIST</div><div style={{ fontSize: 14, fontWeight: 700, color: cy }}>{routeData.totalMi} mi</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 7, color: dm }}>{"@ " + calc.rate + " MPH"}</div><div style={{ fontSize: 14, fontWeight: 700, color: yl }}>{fmtDur(calc.tTrav)}</div></div>
            {routeData.legs.map(function (lg, i) {
              return <div key={i} style={{ background: cd, border: "1px solid " + bd, borderRadius: 4, padding: "3px 8px", borderLeft: "3px solid " + cy }}>
                <div style={{ fontSize: 8, color: dm }}>{lg.from + " -> " + lg.to}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: cy }}>{lg.mi} mi</div>
              </div>;
            })}
          </div>}
          {/* Directions panel */}
          {directions.length > 0 && <div style={{ maxHeight: 150, overflow: "auto", padding: "8px 16px", background: "#0d1510", borderBottom: "1px solid " + bd, fontSize: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: grn, marginBottom: 4, letterSpacing: 1 }}>TURN-BY-TURN DIRECTIONS</div>
            {directions.map(function (d, i) {
              if (!d.text || d.text === "Waypoint") return null;
              return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2, color: tx }}>
                <span style={{ color: dm, minWidth: 20, textAlign: "right" }}>{i + 1}.</span>
                <span style={{ flex: 1 }}>{d.text}</span>
                {parseFloat(d.dist) > 0 && <span style={{ color: cy, fontWeight: 700, whiteSpace: "nowrap" }}>{d.dist} mi</span>}
              </div>;
            })}
          </div>}
          {/* Map */}
          <div style={{ flex: 1, minHeight: 350, position: "relative" }}>
            <div ref={mapDiv} style={{ width: "100%", height: "100%", minHeight: 350, background: "#0a1510" }} />
            {!ready && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: dm }}>Loading map and routing engine...</div>}
          </div>
        </div>}

        {/* ═══ CONVOY ═══ */}
        {tab === "convoy" && <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid " + bd, display: "flex", flexDirection: "column", background: pn, overflow: "hidden" }}>
            <div style={{ padding: "8px 10px", borderBottom: "1px solid " + bd }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: grn, marginBottom: 6 }}>SELECT VEHICLES</div>
              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{CATS.map(function (c) { return <button key={c} onClick={function () { setVCat(c); }} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", background: vCat === c ? grd : "#0a1510", color: vCat === c ? "#fff" : dm, border: "1px solid " + (vCat === c ? grn : bd) }}>{c}</button>; })}</div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 6 }}>{fV.map(function (v) {
              var n = lines.filter(function (l) { return l.vid === v.id; }).reduce(function (s, l) { return s + (parseInt(l.n) || 0); }, 0);
              return <div key={v.id} onClick={function () { addV(v.id); }} style={{ background: cd, border: "1px solid " + (n > 0 ? grn : bd), borderRadius: 5, padding: "6px 8px", marginBottom: 4, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: 11, fontWeight: 700 }}>{v.name}</div><div style={{ fontSize: 9, color: dm }}>{v.desc}</div></div>{n > 0 && <span style={{ background: grd, color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{"x" + n}</span>}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, fontSize: 9 }}>
                  <span>{(v.len / 12).toFixed(1)}ft</span><span style={{ color: yl }}>{v.spd}mph</span><span>{v.drv}</span><span>{v.crew}crew</span>
                </div>
              </div>;
            })}</div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: grn, letterSpacing: 2, marginBottom: 8 }}>CONVOY MANIFEST</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, padding: "8px 12px", background: "#0a1510", borderRadius: 6, border: "1px solid " + bd }}>
              <span style={{ fontSize: 9, color: dm }}>AUTO RATE:</span><span style={{ fontSize: 16, fontWeight: 700, color: yl }}>{calc.aRate}mph</span>
              <span style={{ fontSize: 9, color: dm }}>Override:</span><input type="number" value={rateOvr} placeholder="auto" onChange={function (e) { setRateOvr(e.target.value); }} style={{ ...yi, width: 56, textAlign: "center", fontSize: 11 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: grn, marginLeft: "auto" }}>{"EFF: " + calc.rate + "mph"}</span>
            </div>
            {lines.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: dm }}>Click vehicles on left</div> :
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}><thead><tr style={{ background: "#0a1510", color: dm, fontSize: 9 }}><th style={{ padding: 6, textAlign: "left" }}>#</th><th style={{ padding: 6, textAlign: "left" }}>VEHICLE</th><th style={{ padding: 6, textAlign: "left" }}>TRAILER</th><th style={{ padding: 6 }}>SPD</th><th style={{ padding: 6 }}>TOT</th><th></th></tr></thead><tbody>{lines.map(function (ln, i) {
                var r = calc.lt[i]; var v = VEHICLES.find(function (x) { return x.id === ln.vid; }); var sl = v && v.spd === calc.aRate && parseInt(ln.n) > 0;
                return <tr key={i} style={{ borderTop: "1px solid " + bd, background: sl ? "#1a1a0a" : cd }}>
                  <td style={{ padding: 5 }}><input type="number" value={ln.n} onChange={function (e) { setLines(lines.map(function (l, j) { return j === i ? { ...l, n: e.target.value } : l; })); }} style={{ ...yi, width: 36, textAlign: "center", padding: 3 }} /></td>
                  <td style={{ padding: 5 }}><select value={ln.vid} onChange={function (e) { setLines(lines.map(function (l, j) { return j === i ? { ...l, vid: e.target.value } : l; })); }} style={{ ...si, width: "100%" }}>{VEHICLES.map(function (v) { return <option key={v.id} value={v.id}>{v.name + " (" + v.spd + ")"}</option>; })}</select></td>
                  <td style={{ padding: 5 }}><select value={ln.tid} onChange={function (e) { setLines(lines.map(function (l, j) { return j === i ? { ...l, tid: e.target.value } : l; })); }} style={{ ...si, width: "100%" }}>{TRAILERS.map(function (t) { return <option key={t.id} value={t.id}>{t.name}</option>; })}</select></td>
                  <td style={{ padding: 5, fontWeight: 700, color: sl ? rd : tx, textAlign: "center" }}>{v ? v.spd : 0}</td>
                  <td style={{ padding: 5, fontWeight: 700, textAlign: "center" }}>{r ? r.tot : 0}</td>
                  <td style={{ padding: 5 }}><button onClick={function () { setLines(lines.filter(function (_, j) { return j !== i; })); }} style={{ background: "none", border: "none", color: "#5a3a3a", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>X</button></td>
                </tr>;
              })}</tbody></table>}
            {lines.length > 0 && <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 6 }}>
              <Bx l="TOT LEN" v={calc.tLen + "in"} c={grn} /><Bx l="PM" v={calc.pm} c={grn} /><Bx l="AVG(yd)" v={calc.aYd} c={cy} />
              <div><div style={{ fontSize: 7, color: dm, marginBottom: 2 }}>GAP(yd)</div><input type="number" value={gap} onChange={function (e) { setGap(parseFloat(e.target.value) || 0); }} style={{ ...yi, width: 56 }} /></div>
              <Bx l="VPM" v={calc.vpm} c={yl} />
              <div><div style={{ fontSize: 7, color: dm, marginBottom: 2 }}>T.GAP</div><input type="number" value={tGap} onChange={function (e) { setTGap(parseFloat(e.target.value) || 0); }} style={{ ...yi, width: 56 }} /></div>
              <Bx l="PASS" v={calc.pt + "m"} c={og} />
            </div>}
          </div>
        </div>}

        {/* ═══ ROUTE ═══ */}
        {tab === "route" && <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: grn, letterSpacing: 2, marginBottom: 12 }}>ROAD MOVEMENT TABLE</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, maxWidth: 600 }}>
            <thead><tr style={{ background: "#0a1510", color: dm, fontSize: 9 }}><th style={{ padding: 6, textAlign: "left" }}>LEG</th><th style={{ padding: 6 }}>DIST</th><th style={{ padding: 6 }}>RAW</th><th style={{ padding: 6 }}>ROUNDED</th></tr></thead>
            <tbody>{cps.map(function (cp, i) {
              return <tr key={i} style={{ borderTop: "1px solid " + bd, background: cd }}><td style={{ padding: 5, fontWeight: 700 }}>{cp.l}</td><td style={{ padding: 5 }}><input type="number" step="0.1" value={cp.d || ""} placeholder="0" onChange={function (e) { setCps(cps.map(function (c, j) { return j === i ? { l: c.l, d: parseFloat(e.target.value) || 0 } : c; })); }} style={{ ...yi, width: 80 }} /></td><td style={{ padding: 5, color: dm }}>{calc.legs[i] ? calc.legs[i].raw.toFixed(2) : "-"}</td><td style={{ padding: 5, fontWeight: 700, color: grn }}>{calc.legs[i] && calc.legs[i].r > 0 ? calc.legs[i].r : "-"}</td></tr>;
            })}<tr style={{ borderTop: "2px solid " + bd, fontWeight: 700 }}><td style={{ padding: 5 }}>TOTAL</td><td style={{ padding: 5, color: cy }}>{calc.tDist.toFixed(1)}mi</td><td></td><td style={{ padding: 5, color: grn }}>{fmtDur(calc.tTrav)}</td></tr></tbody>
          </table>
        </div>}

        {/* ═══ SCHEDULE ═══ */}
        {tab === "schedule" && <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: grn, letterSpacing: 2, marginBottom: 12 }}>ETA / ETD SCHEDULE</div>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 8, color: dm, marginBottom: 3 }}>SP TIME</div><input type="time" value={spTime} onChange={function (e) { setSpTime(e.target.value); }} style={{ ...yi, width: 100 }} /></div>
            <Bx l="PASS" v={calc.pt + "m"} c={og} /><Bx l="RATE" v={calc.rate + "mph"} c={yl} />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, maxWidth: 650 }}>
            <thead><tr style={{ background: "#0a1510", color: dm, fontSize: 9 }}><th style={{ padding: 6, textAlign: "left" }}>PT</th><th style={{ padding: 6 }}>ETA</th><th style={{ padding: 6 }}>+BRK</th><th style={{ padding: 6 }}>+PASS</th><th style={{ padding: 6 }}>=ETD</th></tr></thead>
            <tbody>{calc.sch.map(function (s, i) {
              var ci = ["CP1", "CP2", "CP3", "CP4", "CP5", "CP6", "RP"].indexOf(s.lbl);
              return <tr key={i} style={{ borderTop: "1px solid " + bd, background: s.lbl === "RP" ? "#1a2e14" : cd }}>
                <td style={{ padding: 5, fontWeight: 700, color: s.lbl === "SP" ? grn : s.lbl === "RP" ? rd : tx }}>{s.lbl}</td>
                <td style={{ padding: 5, fontWeight: 700, color: cy, fontSize: 14 }}>{colTime(s.eta)}</td>
                <td style={{ padding: 5 }}>{s.lbl === "SP" ? "-" : <input type="number" value={brks[ci] || 0} onChange={function (e) { setBrks(brks.map(function (b, j) { return j === ci ? (parseFloat(e.target.value) || 0) : b; })); }} style={{ ...yi, width: 56, background: "#1a1400", textAlign: "center" }} />}</td>
                <td style={{ padding: 5, color: og }}>{calc.pt}m</td>
                <td style={{ padding: 5, fontWeight: 700, color: yl, fontSize: 14 }}>{colTime(s.etd)}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>}

        {/* ═══ RESULTS ═══ */}
        {tab === "results" && <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: grn, letterSpacing: 2, marginBottom: 12 }}>SUMMARY</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
            {[["Rate", calc.rate + " mph", yl], ["Vehicles", calc.pm, grn], ["Distance", calc.tDist.toFixed(1) + "mi", cy], ["Travel", fmtDur(calc.tTrav), cy], ["VPM", calc.vpm, yl], ["Pass Time", calc.pt + "m", og], ["Crew", calc.tCrew, tx], ["Oversize", calc.osCnt, rd]].map(function (r, i) {
              return <div key={i} style={{ background: cd, border: "1px solid " + bd, borderRadius: 6, padding: "8px 12px", borderLeft: "3px solid " + r[2] }}><div style={{ fontSize: 8, color: dm, marginBottom: 3 }}>{r[0]}</div><div style={{ fontSize: 15, fontWeight: 700, color: r[2] }}>{r[1]}</div></div>;
            })}
          </div>
        </div>}

        {/* ═══ DD 1265 ═══ */}
        {tab === "dd1265" && <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: grn, letterSpacing: 2, marginBottom: 4 }}>DD FORM 1265</div>
          <button onClick={printDD} style={{ padding: "10px 24px", background: grd, border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>PRINT / SAVE AS PDF</button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[["1. Convoy #", convNum, setConvNum], ["2. UIC", uic, setUic], ["4. Organization", formOrg, setFormOrg], ["5. Station", formStn, setFormStn], ["6. CDR", formCdr, setFormCdr], ["7a. Officers", formOff, setFormOff], ["7b. Enlisted", formEnl, setFormEnl], ["17. Routing", formRoute, setFormRoute]].map(function (f, i) {
              return <div key={i}><div style={{ fontSize: 8, color: dm, marginBottom: 2 }}>{f[0]}</div><input value={f[1]} onChange={function (e) { f[2](e.target.value); }} style={{ ...yi, width: "100%", fontSize: 11 }} /></div>;
            })}
          </div>
          <div style={{ fontSize: 10, color: dm }}>{"DEP: " + depDTG + " | ARR: " + arrDTG + " | Rate: " + calc.rate + " MPH | Total: " + calc.pm + " veh"}</div>
          {/* ETA/ETD Preview */}
          <div style={{ marginTop: 16, padding: 16, background: "#fff", color: "#000", borderRadius: 6, fontSize: 9, maxWidth: 700 }}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 12, borderBottom: "2px solid #000", paddingBottom: 4, marginBottom: 6 }}>DD FORM 1265 - BLOCK 18</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#eee" }}><th style={{ border: "1px solid #000", padding: 2 }}>LOC</th><th style={{ border: "1px solid #000", padding: 2 }}>ETA</th><th style={{ border: "1px solid #000", padding: 2 }}>BRK</th><th style={{ border: "1px solid #000", padding: 2 }}>ETD</th></tr></thead>
              <tbody>{calc.sch.map(function (s, i) { return <tr key={i}><td style={{ border: "1px solid #000", padding: 2, fontWeight: "bold" }}>{s.lbl}</td><td style={{ border: "1px solid #000", padding: 2, textAlign: "center" }}>{milTime(s.eta)}</td><td style={{ border: "1px solid #000", padding: 2, textAlign: "center" }}>{s.brk > 0 ? s.brk + "m" : "-"}</td><td style={{ border: "1px solid #000", padding: 2, textAlign: "center" }}>{milTime(s.etd)}</td></tr>; })}</tbody>
            </table>
          </div>
        </div>}
      </div>
    </div>
  );
}

function Bx(props) {
  return <div style={{ background: "#0a1410", border: "1px solid #1c3028", borderRadius: 4, padding: "5px 9px", borderLeft: "3px solid " + props.c }}>
    <div style={{ fontSize: 7, color: "#5a7a5e", letterSpacing: 1, marginBottom: 1 }}>{props.l}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color: props.c }}>{props.v}</div>
  </div>;
}
