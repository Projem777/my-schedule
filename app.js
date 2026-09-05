/* my_schedule — standalone PWA, no build step, no external libraries.
   Data is stored entirely on-device via localStorage. */

(function () {
  "use strict";

  var STORAGE_KEY = "my_schedule_tasks_v1";
  var FIVES_STORAGE_KEY = "my_schedule_5s_v1";
  var CONFIG_KEY = "my_schedule_sync_config_v1";
  var SHEET_TAB = "Sheet1";
  var SHEET_HEADERS = ["ID_แผนงาน", "ชื่องาน", "กลุ่ม", "ลำดับสำคัญ", "สถานะงาน", "ความคืบหน้า", "เริ่มตามแผน", "สิ้นสุดตามแผน", "โครงการอ้างอิง", "รูปภาพ"];

  var GROUPS = [
    { key: "งานประจำ", color: "#F5A623" },
    { key: "งานบริหาร", color: "#E5484D" },
    { key: "งานรายงาน", color: "#C9A227" },
    { key: "งานพัฒนา", color: "#2AA876" },
    { key: "งานแก้ปัญหา", color: "#8B5CF6" },
    { key: "Project", color: "#3B82F6" },
  ];
  var STATUSES = [
    { key: "กำลังดำเนินการ", color: "#F5A623" },
    { key: "ทำเสร็จแล้ว", color: "#2AA876" },
    { key: "ยกเลิก", color: "#9CA3AF" },
  ];
  var WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  var WEEKDAY_FULL = { "อา": "อาทิตย์", "จ": "จันทร์", "อ": "อังคาร", "พ": "พุธ", "พฤ": "พฤหัสบดี", "ศ": "ศุกร์", "ส": "เสาร์" };
  var MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  var MONTHS_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  var ICONS = {
    plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    chevronLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    chevronRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    trash: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
    minus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    home: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
    day: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><circle cx="12" cy="15" r="2.4" fill="currentColor" stroke="none"/></svg>',
    month: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
    year: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="8" rx="1.5"/><rect x="13" y="4" width="8" height="8" rx="1.5"/><rect x="3" y="14" width="8" height="8" rx="1.5"/><rect x="13" y="14" width="8" height="8" rx="1.5"/></svg>',
    week: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M13 4v16M18 4v16"/></svg>',
    checklist: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 13 2 2 4-4"/></svg>',
    cloud: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H7a4.5 4.5 0 0 1-1-8.89A6 6 0 0 1 17.5 8.5 4 4 0 0 1 17.5 19z"/></svg>',
    cloudOff: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H7a4.5 4.5 0 0 1-1-8.89A6 6 0 0 1 17.5 8.5 4 4 0 0 1 17.5 19z"/><path d="M3 3l18 18"/></svg>',
    sync: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.3M3 12a9 9 0 0 1 15.5-6.3M3 3v6h6M21 21v-6h-6"/></svg>',
    camera: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    pdf: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9 15l3 3 3-3"/></svg>',
  };

  /* ---------------- helpers ---------------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function dateKeyOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayKey() { return dateKeyOf(new Date()); }
  function addDays(key, n) {
    var p = key.split("-").map(Number);
    var dt = new Date(p[0], p[1] - 1, p[2] + n);
    return dateKeyOf(dt);
  }
  function localDT(dateKey, hour) { return dateKey + "T" + pad(hour) + ":00"; }
  function addHoursToDT(dtStr, hours) {
    var d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    d.setHours(d.getHours() + hours);
    return dateKeyOf(d) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function mondayOf(dateKey) {
    var p = dateKey.split("-").map(Number);
    var d = new Date(p[0], p[1] - 1, p[2]);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return dateKeyOf(d);
  }
  var WEEK_START_HOUR = 6, WEEK_END_HOUR = 22;
  function timeFraction(dtStr) {
    var hh = Number(dtStr.slice(11, 13)), mm = Number(dtStr.slice(14, 16));
    var total = hh + mm / 60;
    var clamped = Math.max(WEEK_START_HOUR, Math.min(WEEK_END_HOUR, total));
    return (clamped - WEEK_START_HOUR) / (WEEK_END_HOUR - WEEK_START_HOUR);
  }
  function displayDate(dateKey) { var p = dateKey.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function weekdayLabel(dateKey) { var p = dateKey.split("-").map(Number); return WEEKDAYS[new Date(p[0], p[1] - 1, p[2]).getDay()]; }
  function timeOf(dt) { return dt ? dt.slice(11, 16) : ""; }
  function groupColor(key) { for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === key) return GROUPS[i].color; return "#9CA3AF"; }
  function statusColor(key) { for (var i = 0; i < STATUSES.length; i++) if (STATUSES[i].key === key) return STATUSES[i].color; return "#9CA3AF"; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }

  function getCalendarCells(year, month) {
    var first = new Date(year, month, 1);
    var startWeekday = first.getDay();
    var start = new Date(year, month, 1 - startWeekday);
    var cells = [];
    for (var i = 0; i < 42; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({ dateKey: dateKeyOf(d), day: d.getDate(), inMonth: d.getMonth() === month });
    }
    return cells;
  }

  function seedTasks() {
    var t = todayKey(), tmr = addDays(t, 1), soon = addDays(t, 3), past = addDays(t, -2);
    return [
      { id: uid(), name: "ประชุมทบทวนแผนการผลิต", group: "งานประจำ", priority: 1, status: "กำลังดำเนินการ", start: localDT(t, 9), end: localDT(t, 10), project: "อัปเดตแผนโปรเจกต์ระบบใหม่" },
      { id: uid(), name: "นำเสนอแนวทางใช้ AI ลดเวลาทำงาน", group: "งานพัฒนา", priority: 2, status: "ทำเสร็จแล้ว", start: localDT(t, 13), end: localDT(t, 14), project: "" },
      { id: uid(), name: "ตรวจสอบเอกสารส่งลูกค้า", group: "งานบริหาร", priority: 1, status: "กำลังดำเนินการ", start: localDT(tmr, 10), end: localDT(tmr, 11), project: "" },
      { id: uid(), name: "สรุปยอดขายประจำเดือน", group: "งานรายงาน", priority: 3, status: "กำลังดำเนินการ", start: localDT(soon, 14), end: localDT(soon, 15), project: "" },
      { id: uid(), name: "แก้ปัญหาสายการผลิตหยุดกะทันหัน", group: "งานแก้ปัญหา", priority: 1, status: "กำลังดำเนินการ", start: localDT(past, 8), end: localDT(past, 9), project: "" },
      { id: uid(), name: "อัปเดตแผนโปรเจกต์ระบบใหม่", group: "Project", priority: 2, status: "กำลังดำเนินการ", start: localDT(soon, 9), end: localDT(soon, 12), project: "" },
    ];
  }

  /* ---------------- state ---------------- */
  var now = new Date();
  var state = {
    tasks: [],
    view: "home",
    dateKey: todayKey(),
    monthCursor: { year: now.getFullYear(), month: now.getMonth() },
    year: now.getFullYear(),
    modal: null, // { isNew, draft, confirmDel, error }
    settingsOpen: false,
    report: null, // { from, to } when the PDF export modal is open
    groupFilter: {}, // { [groupName]: "all" | "done" | "notdone" }
    weekCursor: null, // Monday date-key for the week view; set during init
    fiveS: [],
    fivesModal: null, // { isNew, draft, confirmDel, error }
    sync: {
      clientId: "",
      spreadsheetId: "",
      signedIn: false,
      syncing: false,
      lastError: "",
      lastSyncedAt: null,
      accessToken: "",
    },
  };

  function loadConfig() {
    try {
      var raw = localStorage.getItem(CONFIG_KEY);
      if (raw) {
        var cfg = JSON.parse(raw);
        state.sync.clientId = cfg.clientId || "";
        state.sync.spreadsheetId = cfg.spreadsheetId || "";
      }
    } catch (e) {}
  }
  function saveConfig() {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ clientId: state.sync.clientId, spreadsheetId: state.sync.spreadsheetId }));
    } catch (e) {}
  }
  function hasSyncConfig() { return !!(state.sync.clientId && state.sync.spreadsheetId); }

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state.tasks = JSON.parse(raw).map(function (t) {
          if (!t.photos) { t.photos = t.photo ? [t.photo] : []; }
          delete t.photo;
          return t;
        });
        return;
      }
    } catch (e) {}
    state.tasks = seedTasks();
    saveTasksCache();
  }
  function saveTasksCache() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks)); } catch (e) {}
  }
  // Called after any local mutation: always caches on-device, and pushes to
  // Google Sheets too when signed in so other devices pick it up.
  function persistTasks() {
    saveTasksCache();
    if (state.sync.signedIn) pushToSheet();
  }

  function loadFiveS() {
    try {
      var raw = localStorage.getItem(FIVES_STORAGE_KEY);
      if (raw) { state.fiveS = JSON.parse(raw); return; }
    } catch (e) {}
    state.fiveS = [];
  }
  function saveFiveS() {
    try { localStorage.setItem(FIVES_STORAGE_KEY, JSON.stringify(state.fiveS)); } catch (e) {}
  }
  function emptyFiveSDraft() {
    return {
      id: null,
      itemName: "",
      problemDesc: "",
      runNo: "",
      foundDate: todayKey(),
      foundTime: pad(new Date().getHours()) + ":" + pad(new Date().getMinutes()),
      location: "",
      department: "",
      division: "",
      responsible: "",
      beforePhoto: "",
      afterPhoto: "",
      actions: [{ detail: "", dueDate: "", percent: 0 }],
      percentVsTotal: 0,
      dueDate: "",
      successPercent: 0,
      followUps: [
        { label: "ตรวจสอบพื้นที่ย้อนหลังแก้ไข 1 เดือน", date: "", photo: "" },
        { label: "ตรวจสอบพื้นที่ย้อนหลังแก้ไข 2 เดือน", date: "", photo: "" },
        { label: "ตรวจสอบพื้นที่ย้อนหลังแก้ไข 3 เดือน", date: "", photo: "" },
      ],
    };
  }
  function daysRemaining(dueDateKey) {
    if (!dueDateKey) return null;
    var p = dueDateKey.split("-").map(Number);
    var due = new Date(p[0], p[1] - 1, p[2]);
    var t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((due - t) / 86400000);
  }

  /* ---------------- Google Sheets sync ---------------- */
  var tokenClient = null;

  function computeProgress(t) {
    if (t.status === "ทำเสร็จแล้ว") return 100;
    if (t.status === "ยกเลิก") return 0;
    var s = new Date(t.start).getTime(), e = new Date(t.end).getTime(), n = Date.now();
    if (!isFinite(s) || !isFinite(e) || e <= s) return 0;
    if (n <= s) return 0;
    if (n >= e) return 100;
    return Math.round(((n - s) / (e - s)) * 100);
  }

  function onlyDriveRefs(list) { return (list || []).filter(function (p) { return p && p.indexOf("drive:") === 0; }); }
  function taskToRow(t) { return [t.id, t.name, t.group, t.priority, t.status, computeProgress(t), t.start, t.end, t.project || "", onlyDriveRefs(t.photos).join("|")]; }
  function rowToTask(r) {
    return {
      id: r[0] || uid(),
      name: r[1] || "",
      group: r[2] || GROUPS[0].key,
      priority: Number(r[3]) || 1,
      status: r[4] || "กำลังดำเนินการ",
      start: r[6] || localDT(todayKey(), 9),
      end: r[7] || localDT(todayKey(), 10),
      project: r[8] || "",
      photos: (r[9] || "").split("|").filter(Boolean),
    };
  }

  var PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' fill='%23E3E6F0'/></svg>";
  var driveImageCache = {};
  var drivePending = {};

  function uploadPhotoToDrive(dataUrl, filename) {
    return fetch(dataUrl).then(function (res) { return res.blob(); }).then(function (blob) {
      var metadata = { name: filename, mimeType: blob.type || "image/jpeg" };
      var form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", blob);
      return fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
        method: "POST",
        headers: { Authorization: "Bearer " + state.sync.accessToken },
        body: form,
      }).then(function (r) {
        if (!r.ok) throw new Error("Drive upload failed");
        return r.json();
      }).then(function (json) { return json.id; });
    });
  }

  function resolveDrivePhoto(fileId) {
    if (driveImageCache[fileId]) return driveImageCache[fileId];
    if (!drivePending[fileId] && state.sync.accessToken) {
      drivePending[fileId] = true;
      fetch("https://www.googleapis.com/drive/v3/files/" + fileId + "?alt=media", {
        headers: { Authorization: "Bearer " + state.sync.accessToken },
      }).then(function (r) {
        if (!r.ok) throw new Error("Drive fetch failed");
        return r.blob();
      }).then(function (blob) {
        driveImageCache[fileId] = URL.createObjectURL(blob);
        delete drivePending[fileId];
        render();
      }).catch(function () { delete drivePending[fileId]; });
    }
    return null;
  }

  function photoSrc(value) {
    if (!value) return "";
    if (value.indexOf("drive:") === 0) {
      var url = resolveDrivePhoto(value.slice(6));
      return url || PLACEHOLDER_IMG;
    }
    return value;
  }

  function sheetsFetch(path, opts) {
    opts = opts || {};
    var headers = { Authorization: "Bearer " + state.sync.accessToken, "Content-Type": "application/json" };
    for (var k in (opts.headers || {})) headers[k] = opts.headers[k];
    opts.headers = headers;
    return fetch("https://sheets.googleapis.com/v4/spreadsheets/" + state.sync.spreadsheetId + path, opts).then(function (res) {
      if (!res.ok) {
        if (res.status === 401) {
          clearToken();
          state.sync.accessToken = "";
          state.sync.signedIn = false;
        }
        return res.json().catch(function () { return {}; }).then(function (e) {
          throw new Error((e.error && e.error.message) || res.statusText || "Sheets API error");
        });
      }
      return res.status === 204 ? {} : res.json();
    });
  }


  function ensureTokenClient(callback) {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      state.sync.lastError = "โหลด Google Sign-In ไม่สำเร็จ (ตรวจสอบอินเทอร์เน็ต)";
      render();
      return null;
    }
    if (!tokenClient || tokenClient._clientId !== state.sync.clientId) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: state.sync.clientId,
        scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",
        callback: function (resp) {
          if (resp && resp.access_token) {
            state.sync.accessToken = resp.access_token;
            state.sync.signedIn = true;
            state.sync.lastError = "";
            saveToken(resp.access_token, resp.expires_in);
            pullFromSheet();
            pullFiveSFromSheet();
          } else {
            state.sync.lastError = "เข้าสู่ระบบไม่สำเร็จ";
            render();
          }
        },
        error_callback: function () {
          state.sync.lastError = "เข้าสู่ระบบไม่สำเร็จ หรือถูกยกเลิก";
          render();
        },
      });
      tokenClient._clientId = state.sync.clientId;
    }
    return tokenClient;
  }

  var TOKEN_KEY = "my_schedule_token_v1";

  function saveToken(token, expiresInSec) {
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({ token: token, expiresAt: Date.now() + (Number(expiresInSec) || 3300) * 1000 }));
    } catch (e) {}
  }
  function loadToken() {
    try {
      var raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.token && data.expiresAt > Date.now() + 30000) return data;
    } catch (e) {}
    return null;
  }
  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
  }

  function signIn(interactive) {
    if (!hasSyncConfig()) { state.settingsOpen = true; render(); return; }
    var tc = ensureTokenClient();
    if (!tc) return;
    tc.requestAccessToken({ prompt: interactive ? "consent" : "" });
  }

  function signOut() {
    if (state.sync.accessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      window.google.accounts.oauth2.revoke(state.sync.accessToken, function () {});
    }
    state.sync.accessToken = "";
    state.sync.signedIn = false;
    clearToken();
    render();
  }

  function pullFromSheet() {
    state.sync.syncing = true; render();
    sheetsFetch("/values/" + encodeURIComponent(SHEET_TAB + "!A:J"))
      .then(function (data) {
        var rows = (data.values || []).slice();
        if (rows.length && rows[0][0] === SHEET_HEADERS[0]) rows = rows.slice(1);
        rows = rows.filter(function (r) { return r && r[0]; });
        if (rows.length > 0) {
          state.tasks = rows.map(rowToTask);
          saveTasksCache();
        } else if (state.tasks.length > 0) {
          return pushToSheet(); // sheet is empty, seed it with what we have locally
        }
        state.sync.syncing = false;
        state.sync.lastError = "";
        state.sync.lastSyncedAt = new Date();
        render();
      })
      .catch(function (err) {
        state.sync.syncing = false;
        state.sync.lastError = String((err && err.message) || err);
        render();
      });
  }

  function pushToSheet() {
    if (!state.sync.signedIn) return;
    state.sync.syncing = true; render();
    var values = [SHEET_HEADERS].concat(state.tasks.map(taskToRow));
    return sheetsFetch("/values/" + encodeURIComponent(SHEET_TAB) + ":clear", { method: "POST", body: "{}" })
      .then(function () {
        return sheetsFetch("/values/" + encodeURIComponent(SHEET_TAB + "!A1") + "?valueInputOption=RAW", {
          method: "PUT",
          body: JSON.stringify({ range: SHEET_TAB + "!A1", majorDimension: "ROWS", values: values }),
        });
      })
      .then(function () {
        state.sync.syncing = false;
        state.sync.lastError = "";
        state.sync.lastSyncedAt = new Date();
        render();
      })
      .catch(function (err) {
        state.sync.syncing = false;
        state.sync.lastError = String((err && err.message) || err);
        render();
      });
  }

  var FIVES_SHEET_TAB = "FiveS";
  var FIVES_SHEET_HEADERS = ["ID", "รายการ/สภาพปัญหา", "สภาพปัญหา", "RunNo", "วันที่พบ", "เวลาที่พบ", "สถานที่พบ", "หน่วยงาน", "ฝ่าย", "ผู้รับผิดชอบ", "รูปก่อน", "รูปหลัง", "แนวทางแก้ไข(JSON)", "%เทียบพื้นที่", "กำหนดเสร็จ", "%สำเร็จ", "ติดตามผล(JSON)"];

  function fiveSToRow(r) {
    return [
      r.id, r.itemName, r.problemDesc, r.runNo, r.foundDate, r.foundTime, r.location, r.department, r.division, r.responsible,
      onlyDriveRefs([r.beforePhoto])[0] || "", onlyDriveRefs([r.afterPhoto])[0] || "",
      JSON.stringify(r.actions || []),
      r.percentVsTotal, r.dueDate, r.successPercent,
      JSON.stringify((r.followUps || []).map(function (f) { return { label: f.label, date: f.date, photo: onlyDriveRefs([f.photo])[0] || "" }; })),
    ];
  }
  function rowToFiveS(row) {
    var actions = []; try { actions = JSON.parse(row[12] || "[]"); } catch (e) {}
    var fus = []; try { fus = JSON.parse(row[16] || "[]"); } catch (e) {}
    while (fus.length < 3) fus.push({ label: "ตรวจสอบพื้นที่ย้อนหลังแก้ไข " + (fus.length + 1) + " เดือน", date: "", photo: "" });
    return {
      id: row[0] || uid(), itemName: row[1] || "", problemDesc: row[2] || "", runNo: row[3] || "",
      foundDate: row[4] || todayKey(), foundTime: row[5] || "", location: row[6] || "", department: row[7] || "",
      division: row[8] || "", responsible: row[9] || "", beforePhoto: row[10] || "", afterPhoto: row[11] || "",
      actions: actions.length ? actions : [{ detail: "", dueDate: "", percent: 0 }],
      percentVsTotal: Number(row[13]) || 0, dueDate: row[14] || "", successPercent: Number(row[15]) || 0,
      followUps: fus,
    };
  }

  function ensureFiveSTab() {
    return sheetsFetch("?fields=sheets.properties.title").then(function (meta) {
      var exists = (meta.sheets || []).some(function (s) { return s.properties && s.properties.title === FIVES_SHEET_TAB; });
      if (exists) return;
      return sheetsFetch(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: [{ addSheet: { properties: { title: FIVES_SHEET_TAB } } }] }) });
    });
  }

  function pullFiveSFromSheet() {
    return sheetsFetch("/values/" + encodeURIComponent(FIVES_SHEET_TAB + "!A:Q"))
      .then(function (data) {
        var rows = (data.values || []).slice();
        if (rows.length && rows[0][0] === "ID") rows = rows.slice(1);
        rows = rows.filter(function (r) { return r && r[0]; });
        if (rows.length > 0) { state.fiveS = rows.map(rowToFiveS); saveFiveS(); render(); }
        else if (state.fiveS.length > 0) { return pushFiveSToSheet(); }
      })
      .catch(function () { /* FiveS tab probably doesn't exist yet on this sheet */ });
  }

  function pushFiveSToSheet() {
    if (!state.sync.signedIn) return;
    return ensureFiveSTab().then(function () {
      var values = [FIVES_SHEET_HEADERS].concat(state.fiveS.map(fiveSToRow));
      return sheetsFetch("/values/" + encodeURIComponent(FIVES_SHEET_TAB) + ":clear", { method: "POST", body: "{}" })
        .then(function () {
          return sheetsFetch("/values/" + encodeURIComponent(FIVES_SHEET_TAB + "!A1") + "?valueInputOption=RAW", {
            method: "PUT",
            body: JSON.stringify({ range: FIVES_SHEET_TAB + "!A1", majorDimension: "ROWS", values: values }),
          });
        });
    }).catch(function () { /* best-effort; local copy is already saved */ });
  }

  function persistFiveS() {
    saveFiveS();
    if (state.sync.signedIn) pushFiveSToSheet();
  }

  function tasksByDate() {
    var map = {};
    state.tasks.forEach(function (t) {
      var k = t.start.slice(0, 10);
      (map[k] = map[k] || []).push(t);
    });
    return map;
  }

  /* ---------------- rendering: pieces ---------------- */
  function dotProgress(value, color, dim) {
    var v = dim ? 0 : value;
    var filled = Math.max(0, Math.min(8, Math.round((v / 100) * 8)));
    var html = '<div class="ms-dotprogress">';
    for (var i = 0; i < 8; i++) {
      var cls = "ms-dot" + (dim ? " dim" : "");
      var style = (i < filled && !dim) ? ' style="background:' + color + '"' : "";
      html += '<span class="' + cls + '"' + style + '></span>';
    }
    return html + "</div>";
  }

  function photoBadge(t) {
    if (!t.photos || !t.photos.length) return "";
    return "📷" + (t.photos.length > 1 ? "×" + t.photos.length : "") + " ";
  }

  function taskRowHTML(t, showDate) {
    var sColor = statusColor(t.status), gColor = groupColor(t.group);
    var cancelled = t.status === "ยกเลิก";
    return (
      '<button class="ms-taskrow" data-action="open-task" data-id="' + t.id + '">' +
        '<span class="ms-taskrow-dot" style="background:' + gColor + '"></span>' +
        '<div class="ms-taskrow-body">' +
          '<div class="ms-taskrow-name' + (cancelled ? " cancelled" : "") + '">' + photoBadge(t) + esc(t.name) + "</div>" +
          '<div class="ms-taskrow-meta">' +
            (showDate ? '<span class="ms-taskrow-date">' + displayDate(t.start.slice(0, 10)) + " · " + timeOf(t.start) + "</span>" : "") +
            '<span class="ms-taskrow-tag" style="color:' + sColor + ";border-color:" + sColor + "55;background:" + sColor + '14">' + esc(t.status) + "</span>" +
            (t.project ? '<span class="ms-taskrow-tag" style="color:#3B82F6;border-color:#3B82F655;background:#3B82F614">📁 ' + esc(t.project) + "</span>" : "") +
          "</div>" +
          dotProgress(computeProgress(t), sColor, cancelled) +
        "</div>" +
      "</button>"
    );
  }

  function statusGroupedListHTML(tasks) {
    if (tasks.length === 0) return '<div class="ms-empty">ไม่มีงาน</div>';
    var order = ["กำลังดำเนินการ", "ทำเสร็จแล้ว", "ยกเลิก"];
    var html = "";
    order.forEach(function (st) {
      var list = tasks.filter(function (t) { return t.status === st; });
      if (list.length === 0) return;
      html += '<div class="ms-status-group"><div class="ms-status-group-label" style="color:' + statusColor(st) + '">' + esc(st) + "</div>";
      list.forEach(function (t) { html += taskRowHTML(t, false); });
      html += "</div>";
    });
    return html;
  }

  function panelHTML(title, count, colorDot, bodyHTML) {
    return (
      '<div class="ms-panel">' +
        '<div class="ms-panel-head">' +
          '<span class="ms-panel-dot" style="background:' + (colorDot || "var(--primary)") + '"></span>' +
          '<span class="ms-panel-title">' + esc(title) + "</span>" +
          '<span class="ms-panel-count">' + count + "</span>" +
        "</div>" +
        '<div class="ms-panel-list">' + bodyHTML + "</div>" +
      "</div>"
    );
  }

  function panelWithFilterHTML(title, count, colorDot, bodyHTML, filter) {
    return (
      '<div class="ms-panel">' +
        '<div class="ms-panel-head">' +
          '<span class="ms-panel-dot" style="background:' + (colorDot || "var(--primary)") + '"></span>' +
          '<span class="ms-panel-title">' + esc(title) + "</span>" +
          '<select class="ms-panel-filter" data-action="group-filter" data-group="' + esc(title) + '">' +
            '<option value="all"' + (filter === "all" ? " selected" : "") + ">ทั้งหมด</option>" +
            '<option value="notdone"' + (filter === "notdone" ? " selected" : "") + ">ยังไม่เสร็จ</option>" +
            '<option value="done"' + (filter === "done" ? " selected" : "") + ">เสร็จแล้ว</option>" +
          "</select>" +
          '<span class="ms-panel-count">' + count + "</span>" +
        "</div>" +
        '<div class="ms-panel-list">' + bodyHTML + "</div>" +
      "</div>"
    );
  }

  function donutHTML(title, data) {
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    var body;
    if (total === 0) {
      body = '<div class="ms-empty">ยังไม่มีข้อมูล</div>';
    } else {
      var gradParts = [], acc = 0;
      data.forEach(function (d) {
        var start = (acc / total) * 360;
        acc += d.value;
        var end = (acc / total) * 360;
        gradParts.push(d.color + " " + start.toFixed(1) + "deg " + end.toFixed(1) + "deg");
      });
      var legend = data.map(function (d) {
        return '<div class="ms-donut-legend-item"><span class="ms-donut-legend-dot" style="background:' + d.color + '"></span><span class="ms-donut-legend-label">' + esc(d.name) + '</span><span class="ms-donut-legend-value">' + d.value + "</span></div>";
      }).join("");
      body =
        '<div class="ms-donut-wrap">' +
          '<div class="ms-donut" style="background:conic-gradient(' + gradParts.join(",") + ')"></div>' +
          '<div class="ms-donut-legend">' + legend + "</div>" +
        "</div>";
    }
    return '<div class="ms-panel ms-panel-chart"><div class="ms-panel-head"><span class="ms-panel-title">' + esc(title) + "</span></div>" + body + "</div>";
  }

  /* ---------------- views ---------------- */
  function renderHome() {
    var t = todayKey(), tmr = addDays(t, 1), nowD = new Date();
    var byStart = function (a, b) { return a.start.localeCompare(b.start); };
    var notProject = function (x) { return x.group !== "Project"; };
    var todayTasks = state.tasks.filter(function (x) { return x.start.slice(0, 10) === t; }).filter(notProject).sort(byStart);
    var tomorrowTasks = state.tasks.filter(function (x) { return x.start.slice(0, 10) === tmr; }).filter(notProject).sort(byStart);
    var overdue = state.tasks.filter(function (x) { return x.status === "กำลังดำเนินการ" && new Date(x.end) < nowD; }).filter(notProject).sort(byStart);

    var html = '<div class="ms-grid">';
    html += panelHTML("งานวันนี้", todayTasks.length, null, statusGroupedListHTML(todayTasks));
    html += panelHTML("งานพรุ่งนี้", tomorrowTasks.length, null, statusGroupedListHTML(tomorrowTasks));
    html += panelHTML("งานค้าง", overdue.length, "#E5484D", overdue.length === 0 ? '<div class="ms-empty">ไม่มีงานค้าง</div>' : overdue.map(function (tk) { return taskRowHTML(tk, true); }).join(""));

    GROUPS.forEach(function (g) {
      var filter = state.groupFilter[g.key] || "all";
      var list = state.tasks.filter(function (x) { return x.group === g.key; });
      if (filter === "done") list = list.filter(function (x) { return x.status === "ทำเสร็จแล้ว"; });
      else if (filter === "notdone") list = list.filter(function (x) { return x.status !== "ทำเสร็จแล้ว"; });
      list = list.sort(byStart);
      var body = list.length === 0 ? '<div class="ms-empty">ไม่มีงานตามเงื่อนไขนี้</div>' : list.map(function (tk) { return taskRowHTML(tk, true); }).join("");
      html += panelWithFilterHTML(g.key, list.length, g.color, body, filter);
    });

    var groupData = GROUPS.map(function (g) { return { name: g.key, color: g.color, value: state.tasks.filter(function (x) { return x.group === g.key && x.status !== "ยกเลิก"; }).length }; }).filter(function (d) { return d.value > 0; });
    var statusData = STATUSES.map(function (s) { return { name: s.key, color: s.color, value: state.tasks.filter(function (x) { return x.status === s.key; }).length }; }).filter(function (d) { return d.value > 0; });
    html += donutHTML("สรุป (กลุ่ม)", groupData);
    html += donutHTML("สรุป (สถานะงาน)", statusData);
    html += "</div>";
    return html;
  }

  function renderDay() {
    var dk = state.dateKey;
    var list = (tasksByDate()[dk] || []).slice().sort(function (a, b) { return a.start.localeCompare(b.start); });
    var p = dk.split("-");
    var html =
      '<div class="ms-day">' +
        '<div class="ms-day-nav">' +
          '<button class="ms-icon-btn" data-action="day-prev">' + ICONS.chevronLeft + "</button>" +
          '<div class="ms-day-title">' +
            '<div class="ms-day-weekday">วัน' + WEEKDAY_FULL[weekdayLabel(dk)] + "</div>" +
            '<div class="ms-day-date">' + p[2] + " " + MONTHS[Number(p[1]) - 1] + " " + p[0] + "</div>" +
          "</div>" +
          '<button class="ms-icon-btn" data-action="day-next">' + ICONS.chevronRight + "</button>" +
          '<input class="ms-input ms-day-picker" type="date" value="' + dk + '" data-action="day-pick" />' +
          '<button class="ms-btn ms-btn-ghost" data-action="day-today">วันนี้</button>' +
        "</div>" +
        '<div class="ms-day-list">';

    if (list.length === 0) {
      html += '<div class="ms-empty-lg">ไม่มีงานในวันนี้ — กด “+ เพิ่มงาน” เพื่อวางแผนงานใหม่</div>';
    } else {
      list.forEach(function (t) {
        var cancelled = t.status === "ยกเลิก";
        html +=
          '<button class="ms-day-item" data-action="open-task" data-id="' + t.id + '">' +
            '<div class="ms-day-item-time">' + timeOf(t.start) + "<span>–" + timeOf(t.end) + "</span></div>" +
            '<div class="ms-day-item-bar" style="background:' + groupColor(t.group) + '"></div>' +
            '<div class="ms-day-item-body">' +
              '<div class="ms-taskrow-name' + (cancelled ? " cancelled" : "") + '">' + photoBadge(t) + esc(t.name) + "</div>" +
              '<div class="ms-taskrow-meta">' +
                '<span class="ms-taskrow-tag" style="color:' + groupColor(t.group) + ";border-color:" + groupColor(t.group) + "55;background:" + groupColor(t.group) + '14">' + esc(t.group) + "</span>" +
                '<span class="ms-taskrow-tag" style="color:' + statusColor(t.status) + ";border-color:" + statusColor(t.status) + "55;background:" + statusColor(t.status) + '14">' + esc(t.status) + "</span>" +
                (t.project ? '<span class="ms-taskrow-tag" style="color:#3B82F6;border-color:#3B82F655;background:#3B82F614">📁 ' + esc(t.project) + "</span>" : "") +
              "</div>" +
              dotProgress(computeProgress(t), statusColor(t.status), cancelled) +
            "</div>" +
          "</button>";
      });
    }
    html += "</div></div>";
    return html;
  }

  function renderWeek() {
    var weekStart = state.weekCursor || mondayOf(todayKey());
    var days = [];
    for (var i = 0; i < 7; i++) days.push(addDays(weekStart, i));
    var tbd = tasksByDate();
    var t = todayKey();
    var hourRows = [];
    for (var h = WEEK_START_HOUR; h <= WEEK_END_HOUR; h++) hourRows.push(h);

    var html =
      '<div class="ms-week">' +
        '<div class="ms-month-nav">' +
          '<button class="ms-icon-btn" data-action="week-prev">' + ICONS.chevronLeft + "</button>" +
          '<div class="ms-month-title">' + displayDate(days[0]) + " – " + displayDate(days[6]) + "</div>" +
          '<button class="ms-icon-btn" data-action="week-next">' + ICONS.chevronRight + "</button>" +
          '<button class="ms-btn ms-btn-ghost" data-action="week-today">สัปดาห์นี้</button>' +
        "</div>" +
        '<div class="ms-week-grid-wrap"><div class="ms-week-grid">' +
          '<div class="ms-week-col ms-week-col-time"><div class="ms-week-col-head">&nbsp;</div>' +
            hourRows.map(function (h) { return '<div class="ms-week-hour-label">' + pad(h) + ":00</div>"; }).join("") +
          "</div>";

    days.forEach(function (dk) {
      var list = (tbd[dk] || []).filter(function (x) { return x.group !== "Project"; }).sort(function (a, b) { return a.start.localeCompare(b.start); });
      var blocksHTML = list.map(function (tk) {
        var top = timeFraction(tk.start) * 100;
        var bottom = timeFraction(tk.end) * 100;
        var height = Math.max(bottom - top, 2.2);
        var gColor = groupColor(tk.group);
        return (
          '<button class="ms-week-block" data-action="open-task" data-id="' + tk.id + '" style="top:' + top.toFixed(2) + "%;height:" + height.toFixed(2) + "%;border-left-color:" + gColor + ";background:" + gColor + '1c">' +
            '<span class="ms-week-block-time">' + timeOf(tk.start) + "</span>" +
            '<span class="ms-week-block-name">' + esc(tk.name) + "</span>" +
          "</button>"
        );
      }).join("");
      var p = dk.split("-").map(Number);
      var wd = WEEKDAYS[new Date(p[0], p[1] - 1, p[2]).getDay()];
      html +=
        '<div class="ms-week-col' + (dk === t ? " today" : "") + '">' +
          '<div class="ms-week-col-head">' + wd + " " + p[2] + "</div>" +
          '<div class="ms-week-col-body">' +
            hourRows.map(function () { return '<div class="ms-week-hour-row"></div>'; }).join("") +
            blocksHTML +
          "</div>" +
        "</div>";
    });

    html += "</div></div></div>";
    return html;
  }

  function renderMonth() {
    var y = state.monthCursor.year, m = state.monthCursor.month;
    var cells = getCalendarCells(y, m);
    var tbd = tasksByDate();
    var t = todayKey();

    var html =
      '<div class="ms-month">' +
        '<div class="ms-month-nav">' +
          '<button class="ms-icon-btn" data-action="month-prev">' + ICONS.chevronLeft + "</button>" +
          '<div class="ms-month-title">' + MONTHS[m] + " " + y + "</div>" +
          '<button class="ms-icon-btn" data-action="month-next">' + ICONS.chevronRight + "</button>" +
          '<button class="ms-btn ms-btn-ghost" data-action="month-today">วันนี้</button>' +
        "</div>" +
        '<div class="ms-month-weekdays">' + WEEKDAYS.map(function (w) { return "<div>" + w + "</div>"; }).join("") + "</div>" +
        '<div class="ms-month-grid">';

    cells.forEach(function (c) {
      var dayTasks = tbd[c.dateKey] || [];
      var dots = dayTasks.slice(0, 4).map(function (tk) { return '<span class="ms-mini-dot" style="background:' + groupColor(tk.group) + '"></span>'; }).join("");
      var more = dayTasks.length > 4 ? '<span class="ms-mini-more">+' + (dayTasks.length - 4) + "</span>" : "";
      html +=
        '<button class="ms-month-cell' + (c.inMonth ? "" : " out") + (c.dateKey === t ? " today" : "") + '" data-action="month-pick" data-date="' + c.dateKey + '">' +
          '<span class="ms-month-cell-num">' + c.day + "</span>" +
          '<span class="ms-month-cell-dots">' + dots + more + "</span>" +
        "</button>";
    });
    html += "</div></div>";
    return html;
  }

  function renderMiniMonth(year, month, tbd) {
    var cells = getCalendarCells(year, month);
    var t = todayKey();
    var html = '<div class="ms-minimonth"><div class="ms-minimonth-title">' + MONTHS_SHORT[month] + '</div><div class="ms-minimonth-grid">';
    cells.forEach(function (c) {
      var count = (tbd[c.dateKey] || []).length;
      var intensity = Math.min(4, count);
      var style = (count > 0 && c.inMonth) ? ' style="background:rgba(76,95,213,' + (0.15 + intensity * 0.18).toFixed(2) + ')"' : "";
      html += '<button class="ms-minimonth-cell' + (c.inMonth ? "" : " out") + (c.dateKey === t ? " today" : "") + '"' + style + ' data-action="month-pick" data-date="' + c.dateKey + '" title="' + c.dateKey + " · " + count + ' งาน"></button>';
    });
    html += "</div></div>";
    return html;
  }

  function renderYear() {
    var y = state.year;
    var tbd = tasksByDate();
    var yearTasks = state.tasks.filter(function (t) { return t.start.slice(0, 4) === String(y); });
    var done = yearTasks.filter(function (t) { return t.status === "ทำเสร็จแล้ว"; }).length;
    var inProgress = yearTasks.filter(function (t) { return t.status === "กำลังดำเนินการ"; }).length;
    var cancelled = yearTasks.filter(function (t) { return t.status === "ยกเลิก"; }).length;

    var html =
      '<div class="ms-year">' +
        '<div class="ms-month-nav">' +
          '<button class="ms-icon-btn" data-action="year-prev">' + ICONS.chevronLeft + "</button>" +
          '<div class="ms-month-title">ปี ' + y + "</div>" +
          '<button class="ms-icon-btn" data-action="year-next">' + ICONS.chevronRight + "</button>" +
          '<button class="ms-btn ms-btn-ghost" data-action="year-today">ปีนี้</button>' +
        "</div>" +
        '<div class="ms-year-stats">' +
          '<div class="ms-year-stat"><span class="ms-year-stat-num">' + yearTasks.length + "</span><span>งานทั้งหมด</span></div>" +
          '<div class="ms-year-stat" style="color:#2AA876"><span class="ms-year-stat-num">' + done + "</span><span>เสร็จแล้ว</span></div>" +
          '<div class="ms-year-stat" style="color:#F5A623"><span class="ms-year-stat-num">' + inProgress + "</span><span>กำลังทำ</span></div>" +
          '<div class="ms-year-stat" style="color:#9CA3AF"><span class="ms-year-stat-num">' + cancelled + "</span><span>ยกเลิก</span></div>" +
        "</div>" +
        '<div class="ms-year-grid">';

    for (var m = 0; m < 12; m++) html += renderMiniMonth(y, m, tbd);
    html += "</div></div>";
    return html;
  }

  function fiveSMiniDonut(percent, size) {
    size = size || 40;
    var color = percent >= 100 ? "#2AA876" : percent >= 50 ? "#F5A623" : "#E5484D";
    return (
      '<div class="ms-5s-donut" style="width:' + size + "px;height:" + size + "px;background:conic-gradient(" + color + " " + (percent * 3.6).toFixed(1) + "deg, #E9EAF0 0)\">" +
        '<div class="ms-5s-donut-inner"><span>' + Math.round(percent) + "%</span></div>" +
      "</div>"
    );
  }

  function renderFiveS() {
    var list = state.fiveS.slice().sort(function (a, b) { return (b.foundDate || "").localeCompare(a.foundDate || ""); });
    var html = '<div class="ms-5s">' +
      '<div class="ms-5s-toolbar"><button class="ms-btn ms-btn-primary" data-action="5s-add">' + ICONS.plus + " เพิ่มรายการ 5ส</button></div>";

    if (list.length === 0) {
      html += '<div class="ms-empty-lg">ยังไม่มีรายการตรวจ 5ส — กด “เพิ่มรายการ 5ส” เพื่อเริ่มบันทึก</div>';
    } else {
      html += '<div class="ms-5s-grid">';
      list.forEach(function (r) {
        var dr = daysRemaining(r.dueDate);
        html +=
          '<button class="ms-5s-card" data-action="5s-open" data-id="' + r.id + '">' +
            '<div class="ms-5s-card-photos">' +
              (r.beforePhoto ? '<img src="' + photoSrc(r.beforePhoto) + '" alt="ก่อนทำ" />' : '<div class="ms-5s-photo-placeholder">ก่อนทำ</div>') +
              (r.afterPhoto ? '<img src="' + photoSrc(r.afterPhoto) + '" alt="หลังทำ" />' : '<div class="ms-5s-photo-placeholder">หลังทำ</div>') +
            "</div>" +
            '<div class="ms-5s-card-body">' +
              '<div class="ms-5s-card-title">' + esc(r.itemName || "(ไม่มีชื่อรายการ)") + "</div>" +
              '<div class="ms-5s-card-meta">' + esc(r.location || "-") + " · " + (r.foundDate ? displayDate(r.foundDate) : "-") + "</div>" +
              (dr !== null ? '<div class="ms-5s-card-due' + (dr < 0 ? " overdue" : "") + '">' + (dr < 0 ? "เลยกำหนด " + Math.abs(dr) + " วัน" : "เหลือ " + dr + " วัน") + "</div>" : "") +
            "</div>" +
            fiveSMiniDonut(r.successPercent || 0, 46) +
          "</button>";
      });
      html += "</div>";
    }
    html += "</div>";
    return html;
  }

  /* ---------------- modal ---------------- */
  function emptyDraft(prefillDate) {
    var dk = prefillDate || todayKey();
    return { id: null, name: "", group: GROUPS[0].key, priority: 1, status: "กำลังดำเนินการ", start: localDT(dk, 8), end: localDT(dk, 10), project: "", photos: [] };
  }

  function fiveSPhotoSlot(fieldName, label, photoUrl) {
    return (
      '<div class="ms-5s-photoslot">' +
        '<span class="ms-label">' + esc(label) + "</span>" +
        (photoUrl
          ? '<div class="ms-photo-thumb ms-5s-photo-thumb"><img src="' + photoSrc(photoUrl) + '" alt="" /><button type="button" class="ms-icon-btn ms-photo-thumb-remove" data-action="5s-remove-photo" data-field="' + fieldName + '">' + ICONS.x + "</button></div>"
          : '<label class="ms-photo-add">' + ICONS.camera + "<span>ถ่ายรูป</span>" +
            '<input type="file" accept="image/*" data-action="5s-pick-photo" data-field="' + fieldName + '" style="display:none" /></label>'
        ) +
      "</div>"
    );
  }

  function renderFiveSModal() {
    var m = state.fivesModal;
    var d = m.draft, isNew = m.isNew;
    var dr = daysRemaining(d.dueDate);

    var actionsRows = d.actions.map(function (a, i) {
      return (
        '<div class="ms-5s-action-row">' +
          '<input class="ms-input" type="text" placeholder="รายละเอียดแนวทางแก้ไข" data-5s-action="detail" data-index="' + i + '" value="' + esc(a.detail) + '" />' +
          '<input class="ms-input ms-5s-action-date" type="date" data-5s-action="dueDate" data-index="' + i + '" value="' + (a.dueDate || "") + '" />' +
          '<input class="ms-input ms-5s-action-pct" type="number" min="0" max="100" data-5s-action="percent" data-index="' + i + '" value="' + a.percent + '" />' +
          (d.actions.length > 1 ? '<button type="button" class="ms-icon-btn" data-action="5s-remove-action" data-index="' + i + '">' + ICONS.x + "</button>" : "") +
        "</div>"
      );
    }).join("");

    var followUpsHTML = d.followUps.map(function (f, i) {
      return (
        '<div class="ms-5s-followup">' +
          '<input class="ms-input ms-5s-followup-label" type="text" data-5s-followup="label" data-index="' + i + '" value="' + esc(f.label) + '" />' +
          '<input class="ms-input" type="date" data-5s-followup="date" data-index="' + i + '" value="' + (f.date || "") + '" />' +
          fiveSPhotoSlot("followUps." + i, "รูปติดตามผล", f.photo) +
        "</div>"
      );
    }).join("");

    var footLeft;
    if (isNew) {
      footLeft = "";
    } else if (m.confirmDel) {
      footLeft = '<div class="ms-confirm-del"><span>ยืนยันการลบ?</span><button class="ms-btn ms-btn-danger" data-action="5s-delete-confirm">ลบ</button><button class="ms-btn ms-btn-ghost" data-action="5s-delete-cancel">ยกเลิก</button></div>';
    } else {
      footLeft = '<button class="ms-btn ms-btn-danger-ghost" data-action="5s-delete-ask">' + ICONS.trash + " ลบรายการ</button>";
    }

    return (
      '<div class="ms-modal-overlay" id="5s-overlay">' +
        '<div class="ms-modal ms-modal-wide">' +
          '<div class="ms-modal-head"><span>' + (isNew ? "เพิ่มรายการตรวจ 5ส" : "แก้ไขรายการ 5ส") + '</span><button class="ms-icon-btn" data-action="5s-close">' + ICONS.x + "</button></div>" +
          '<div class="ms-modal-body">' +
            '<label class="ms-field"><span class="ms-label">1. รายการ/สภาพปัญหา *</span><input class="ms-input" type="text" data-5s-field="itemName" value="' + esc(d.itemName) + '" placeholder="เช่น มีวัชพืชขึ้นบนหลังคา" /></label>' +
            '<label class="ms-field"><span class="ms-label">สภาพปัญหา</span><input class="ms-input" type="text" data-5s-field="problemDesc" value="' + esc(d.problemDesc) + '" /></label>' +
            '<div class="ms-field-row">' +
              '<label class="ms-field"><span class="ms-label">Run No.</span><input class="ms-input" type="text" data-5s-field="runNo" value="' + esc(d.runNo) + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">วันที่พบ</span><input class="ms-input" type="date" data-5s-field="foundDate" value="' + d.foundDate + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">เวลาที่พบ</span><input class="ms-input" type="time" data-5s-field="foundTime" value="' + d.foundTime + '" /></label>' +
            "</div>" +
            '<div class="ms-field-row">' +
              '<label class="ms-field"><span class="ms-label">สถานที่พบ</span><input class="ms-input" type="text" data-5s-field="location" value="' + esc(d.location) + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">หน่วยงาน</span><input class="ms-input" type="text" data-5s-field="department" value="' + esc(d.department) + '" /></label>' +
            "</div>" +
            '<div class="ms-field-row">' +
              '<label class="ms-field"><span class="ms-label">ฝ่าย</span><input class="ms-input" type="text" data-5s-field="division" value="' + esc(d.division) + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">พื้นที่ผู้รับผิดชอบ</span><input class="ms-input" type="text" data-5s-field="responsible" value="' + esc(d.responsible) + '" /></label>' +
            "</div>" +

            '<div class="ms-field-row">' +
              fiveSPhotoSlot("beforePhoto", "2. สภาพก่อนแก้ไข", d.beforePhoto) +
              fiveSPhotoSlot("afterPhoto", "3. สภาพหลังแก้ไข", d.afterPhoto) +
            "</div>" +

            '<div class="ms-field"><span class="ms-label">รายละเอียดแนวทางการแก้ไข (ที่เกิดขึ้น)</span>' +
              '<div class="ms-5s-actions">' + actionsRows + "</div>" +
              '<button type="button" class="ms-btn ms-btn-ghost" data-action="5s-add-action">' + ICONS.plus + " เพิ่มแนวทาง</button>" +
            "</div>" +

            '<div class="ms-field-row">' +
              '<label class="ms-field"><span class="ms-label">% ความสำเร็จเทียบกับพื้นที่ทั้งหมด</span><input class="ms-input" type="number" min="0" max="100" data-5s-field="percentVsTotal" value="' + d.percentVsTotal + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">กำหนดเสร็จ</span><input class="ms-input" type="date" data-5s-field="dueDate" value="' + d.dueDate + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">สถานะความสำเร็จ (%)</span><input class="ms-input" type="number" min="0" max="100" data-5s-field="successPercent" value="' + d.successPercent + '" /></label>' +
            "</div>" +
            (dr !== null ? '<div class="ms-progress-note">' + (dr < 0 ? "เลยกำหนดมาแล้ว " + Math.abs(dr) + " วัน" : "เหลือเวลาอีก " + dr + " วัน") + "</div>" : "") +

            '<div class="ms-field"><span class="ms-label">ตรวจสอบพื้นที่ย้อนหลัง (สูงสุด 3 ครั้ง)</span>' +
              '<div class="ms-5s-followups">' + followUpsHTML + "</div>" +
            "</div>" +
          "</div>" +
          '<div class="ms-modal-foot">' + footLeft +
            '<div class="ms-modal-foot-right">' +
              (!isNew ? '<button class="ms-btn ms-btn-ghost" data-action="5s-download">' + ICONS.pdf + " PDF</button>" : "") +
              '<button class="ms-btn ms-btn-ghost" data-action="5s-close">ยกเลิก</button>' +
              '<button class="ms-btn ms-btn-primary" data-action="5s-save">บันทึก</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function buildFiveSPrintArea(r) {
    var dr = daysRemaining(r.dueDate);
    var actionsRows = r.actions.filter(function (a) { return a.detail; }).map(function (a) {
      return "<tr><td>" + esc(a.detail) + "</td><td>" + (a.dueDate ? displayDate(a.dueDate) : "-") + "</td><td>" + a.percent + "%</td></tr>";
    }).join("");
    var followUpsHTML = r.followUps.filter(function (f) { return f.photo; }).map(function (f) {
      return '<div class="fs-followup"><h4>' + esc(f.label) + (f.date ? " (" + displayDate(f.date) + ")" : "") + "</h4><img src=\"" + photoSrc(f.photo) + "\" /></div>";
    }).join("");

    var printArea = document.getElementById("print-area");
    if (!printArea) return;
    printArea.innerHTML =
      '<div class="fs-report">' +
        "<h1>รายงานปัญหาพื้นที่ (5ส)</h1>" +
        '<table class="fs-info">' +
          "<tr><td><b>1. รายการ/สภาพปัญหา:</b> " + esc(r.itemName) + "</td><td><b>Run No.:</b> " + esc(r.runNo) + "</td></tr>" +
          "<tr><td colspan=\"2\"><b>สภาพปัญหา:</b> " + esc(r.problemDesc) + "</td></tr>" +
          "<tr><td><b>วันที่พบ:</b> " + (r.foundDate ? displayDate(r.foundDate) : "-") + " &nbsp; <b>เวลาที่พบ:</b> " + esc(r.foundTime) + "</td><td><b>สถานที่พบ:</b> " + esc(r.location) + "</td></tr>" +
          "<tr><td><b>หน่วยงาน:</b> " + esc(r.department) + "</td><td><b>ฝ่าย:</b> " + esc(r.division) + "</td></tr>" +
          "<tr><td colspan=\"2\"><b>พื้นที่ผู้รับผิดชอบ:</b> " + esc(r.responsible) + "</td></tr>" +
        "</table>" +
        '<div class="fs-photos-row">' +
          '<div class="fs-photo-col"><h3>2. สภาพก่อนแก้ไข</h3>' + (r.beforePhoto ? '<img src="' + photoSrc(r.beforePhoto) + '" />' : "<p>—</p>") + "</div>" +
          '<div class="fs-photo-col"><h3>3. สภาพหลังแก้ไข</h3>' + (r.afterPhoto ? '<img src="' + photoSrc(r.afterPhoto) + '" />' : "<p>—</p>") + "</div>" +
          '<div class="fs-actions-col"><h3>รายละเอียดแนวทางการแก้ไข</h3><table><thead><tr><th>รายละเอียด</th><th>กำหนดเสร็จ</th><th>%</th></tr></thead><tbody>' + (actionsRows || "<tr><td colspan=\"3\">—</td></tr>") + "</tbody></table></div>" +
        "</div>" +
        '<table class="fs-status">' +
          "<tr><td><b>% เทียบพื้นที่ทั้งหมด:</b> " + r.percentVsTotal + "%</td>" +
          "<td><b>กำหนดเสร็จ:</b> " + (r.dueDate ? displayDate(r.dueDate) : "-") + (dr !== null ? " (" + (dr < 0 ? "เลย " + Math.abs(dr) + " วัน" : "เหลือ " + dr + " วัน") + ")" : "") + "</td>" +
          "<td><b>สถานะความสำเร็จ:</b> " + r.successPercent + "%</td></tr>" +
        "</table>" +
        (followUpsHTML ? '<h3>การติดตามผล</h3><div class="fs-followups-row">' + followUpsHTML + "</div>" : "") +
      "</div>";
  }

  function renderModal() {
    var root = document.getElementById("modal-root");
    if (!state.modal) { root.innerHTML = ""; return; }
    var d = state.modal.draft, isNew = state.modal.isNew;

    var groupPills = GROUPS.map(function (g) {
      var active = d.group === g.key;
      var style = active ? "background:" + g.color + ";border-color:" + g.color + ";color:#fff" : "border-color:" + g.color + "55;color:" + g.color;
      return '<button type="button" class="ms-pill" style="' + style + '" data-action="set-group" data-value="' + esc(g.key) + '">' + esc(g.key) + "</button>";
    }).join("");

    var statusPills = STATUSES.map(function (s) {
      var active = d.status === s.key;
      var style = active ? "background:" + s.color + ";border-color:" + s.color + ";color:#fff" : "border-color:" + s.color + "55;color:" + s.color;
      return '<button type="button" class="ms-pill" style="' + style + '" data-action="set-status" data-value="' + esc(s.key) + '">' + esc(s.key) + "</button>";
    }).join("");

    var progressField = d.status === "กำลังดำเนินการ"
      ? '<div class="ms-field"><span class="ms-label">ความคืบหน้า (คำนวณจากเวลาอัตโนมัติ)</span>' + dotProgress(computeProgress(d), statusColor(d.status), false) + '<div class="ms-progress-note">' + computeProgress(d) + '% ของช่วงเวลาที่วางแผนไว้ผ่านไปแล้ว</div></div>'
      : "";

    var nameOptions = [];
    var seenNames = {};
    state.tasks.forEach(function (t) {
      if (t.name && !seenNames[t.name]) { seenNames[t.name] = true; nameOptions.push(t.name); }
    });
    var nameDatalist = '<datalist id="task-name-list">' + nameOptions.map(function (n) { return '<option value="' + esc(n) + '"></option>'; }).join("") + "</datalist>";

    var projectNames = [];
    var seenProj = {};
    state.tasks.forEach(function (t) {
      if (t.group === "Project" && t.name && !seenProj[t.name]) { seenProj[t.name] = true; projectNames.push(t.name); }
    });
    var projectField = d.group !== "Project"
      ? '<label class="ms-field"><span class="ms-label">โครงการอ้างอิง (ถ้ามี)</span><select class="ms-input" data-field="project">' +
          '<option value="">— ไม่ระบุ —</option>' +
          projectNames.map(function (p) { return '<option value="' + esc(p) + '"' + (d.project === p ? " selected" : "") + ">" + esc(p) + "</option>"; }).join("") +
          (d.project && projectNames.indexOf(d.project) === -1 ? '<option value="' + esc(d.project) + '" selected>' + esc(d.project) + "</option>" : "") +
        "</select></label>"
      : "";

    var photos = d.photos || [];
    var thumbs = photos.map(function (src, i) {
      return '<div class="ms-photo-thumb"><img src="' + photoSrc(src) + '" alt="" /><button type="button" class="ms-icon-btn ms-photo-thumb-remove" data-action="remove-photo" data-index="' + i + '">' + ICONS.x + "</button></div>";
    }).join("");
    var photoField =
      '<div class="ms-field"><span class="ms-label">รูปประกอบ (' + photos.length + '/6)</span>' +
        '<div class="ms-photo-grid">' + thumbs +
          (photos.length < 6
            ? '<label class="ms-photo-add">' + ICONS.camera + '<span>เพิ่มรูป</span><input type="file" accept="image/*" multiple data-action="pick-photo" style="display:none" /></label>'
            : "") +
        "</div>" +
      "</div>";

    var footLeft;
    if (isNew) {
      footLeft = "";
    } else if (state.modal.confirmDel) {
      footLeft = '<div class="ms-confirm-del"><span>ยืนยันการลบ?</span><button class="ms-btn ms-btn-danger" data-action="delete-confirm">ลบ</button><button class="ms-btn ms-btn-ghost" data-action="delete-cancel">ยกเลิก</button></div>';
    } else {
      footLeft = '<button class="ms-btn ms-btn-danger-ghost" data-action="delete-ask">' + ICONS.trash + " ลบงาน</button>";
    }

    root.innerHTML =
      '<div class="ms-modal-overlay">' +
        '<div class="ms-modal">' +
          '<div class="ms-modal-head"><span>' + (isNew ? "เพิ่มงานใหม่" : "แก้ไขงาน") + '</span><button class="ms-icon-btn" data-action="close">' + ICONS.x + "</button></div>" +
          '<div class="ms-modal-body">' +
            '<label class="ms-field"><span class="ms-label">ชื่องาน *</span><input class="ms-input" type="text" list="task-name-list" data-field="name" value="' + esc(d.name) + '" placeholder="เช่น ประชุมทบทวนแผนการผลิต" />' + nameDatalist + "</label>" +
            '<div class="ms-field"><span class="ms-label">กลุ่ม *</span><div class="ms-pillrow">' + groupPills + "</div></div>" +
            projectField +
            '<label class="ms-field"><span class="ms-label">ลำดับความสำคัญ *</span><div class="ms-stepper">' +
              '<button type="button" class="ms-icon-btn" data-action="priority-minus">' + ICONS.minus + "</button>" +
              '<span class="ms-stepper-value">' + d.priority + "</span>" +
              '<button type="button" class="ms-icon-btn" data-action="priority-plus">' + ICONS.plus + "</button>" +
            "</div></label>" +
            '<div class="ms-field-row">' +
              '<label class="ms-field"><span class="ms-label">เริ่มตามแผน *</span><input class="ms-input" type="datetime-local" data-field="start" value="' + d.start + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">สิ้นสุดตามแผน *</span><input class="ms-input" type="datetime-local" data-field="end" value="' + d.end + '" /></label>' +
            "</div>" +
            '<div class="ms-field"><span class="ms-label">สถานะงาน *</span><div class="ms-pillrow">' + statusPills + "</div></div>" +
            progressField +
            photoField +
            (state.modal.error ? '<div class="ms-form-error">' + esc(state.modal.error) + "</div>" : "") +
          "</div>" +
          '<div class="ms-modal-foot">' + footLeft +
            '<div class="ms-modal-foot-right"><button class="ms-btn ms-btn-ghost" data-action="close">ยกเลิก</button><button class="ms-btn ms-btn-primary" data-action="save">บันทึก</button></div>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function renderSettingsModal() {
    var s = state.sync;
    var statusLine;
    if (!hasSyncConfig()) {
      statusLine = '<div class="ms-empty">ยังไม่ได้ตั้งค่า — กรอก Client ID และ Spreadsheet ID ด้านล่าง</div>';
    } else if (s.syncing) {
      statusLine = '<div class="ms-sync-status">' + ICONS.sync + " กำลังซิงก์...</div>";
    } else if (s.lastError) {
      statusLine = '<div class="ms-sync-status ms-sync-error">' + ICONS.cloudOff + " " + esc(s.lastError) + "</div>";
    } else if (s.signedIn) {
      statusLine = '<div class="ms-sync-status ms-sync-ok">' + ICONS.cloud + " เชื่อมต่อแล้ว" + (s.lastSyncedAt ? " · ซิงก์ล่าสุด " + s.lastSyncedAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "") + "</div>";
    } else {
      statusLine = '<div class="ms-sync-status">' + ICONS.cloudOff + " ยังไม่ได้เข้าสู่ระบบ</div>";
    }

    return (
      '<div class="ms-modal-overlay" id="settings-overlay">' +
        '<div class="ms-modal">' +
          '<div class="ms-modal-head"><span>ซิงก์กับ Google Sheets</span><button class="ms-icon-btn" data-action="settings-close">' + ICONS.x + "</button></div>" +
          '<div class="ms-modal-body">' +
            statusLine +
            '<label class="ms-field"><span class="ms-label">Client ID</span><input class="ms-input" type="text" data-config="clientId" value="' + esc(s.clientId) + '" placeholder="xxxxxxxx.apps.googleusercontent.com" /></label>' +
            '<label class="ms-field"><span class="ms-label">Spreadsheet ID</span><input class="ms-input" type="text" data-config="spreadsheetId" value="' + esc(s.spreadsheetId) + '" placeholder="เช่น 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" /></label>' +
            '<div class="ms-settings-help">คัดลอกจากลิงก์ชีต: docs.google.com/spreadsheets/d/<b>SPREADSHEET_ID</b>/edit — งานเก็บในแท็บ “Sheet1” และรายการ 5ส เก็บในแท็บ “FiveS” (สร้างให้อัตโนมัติ) ส่วนรูปภาพจะอัปโหลดขึ้น Google Drive ของคุณเพื่อดูได้ทุกอุปกรณ์</div>' +
          "</div>" +
          '<div class="ms-modal-foot">' +
            (s.signedIn ? '<button class="ms-btn ms-btn-ghost" data-action="sheets-signout">ออกจากระบบ</button>' : '<span></span>') +
            '<div class="ms-modal-foot-right">' +
              '<button class="ms-btn ms-btn-ghost" data-action="settings-close">ปิด</button>' +
              '<button class="ms-btn ms-btn-primary" data-action="sheets-connect">' + (s.signedIn ? "ซิงก์ตอนนี้" : "เชื่อมต่อ / เข้าสู่ระบบ") + "</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function tasksInRange(from, to) {
    return state.tasks
      .filter(function (t) { var dk = t.start.slice(0, 10); return dk >= from && dk <= to; })
      .sort(function (a, b) { return a.start.localeCompare(b.start); });
  }

  function groupByDate(list) {
    var grouped = {};
    list.forEach(function (t) { var dk = t.start.slice(0, 10); (grouped[dk] = grouped[dk] || []).push(t); });
    return grouped;
  }

  function renderReportModal() {
    var r = state.report;
    var grouped = groupByDate(tasksInRange(r.from, r.to));
    var dateKeys = Object.keys(grouped).sort();

    var previewHTML = dateKeys.length === 0
      ? '<div class="ms-empty">ไม่มีงานในช่วงวันที่ที่เลือก</div>'
      : dateKeys.map(function (dk) {
          var rows = grouped[dk].map(function (t) {
            return '<div class="ms-report-row"><span class="ms-report-time">' + timeOf(t.start) + "–" + timeOf(t.end) + "</span><span class=\"ms-report-name\">" + esc(t.name) + '</span><span class="ms-report-tag" style="color:' + statusColor(t.status) + '">' + esc(t.status) + "</span></div>";
          }).join("");
          return '<div class="ms-report-day"><div class="ms-report-day-title">' + displayDate(dk) + "</div>" + rows + "</div>";
        }).join("");

    return (
      '<div class="ms-modal-overlay" id="report-overlay">' +
        '<div class="ms-modal">' +
          '<div class="ms-modal-head"><span>ดาวน์โหลด PDF สรุปแผนงาน</span><button class="ms-icon-btn" data-action="report-close">' + ICONS.x + "</button></div>" +
          '<div class="ms-modal-body">' +
            '<div class="ms-field-row">' +
              '<label class="ms-field"><span class="ms-label">จากวันที่</span><input class="ms-input" type="date" data-report="from" value="' + r.from + '" /></label>' +
              '<label class="ms-field"><span class="ms-label">ถึงวันที่</span><input class="ms-input" type="date" data-report="to" value="' + r.to + '" /></label>' +
            "</div>" +
            '<div class="ms-report-preview">' + previewHTML + "</div>" +
          "</div>" +
          '<div class="ms-modal-foot"><span></span><div class="ms-modal-foot-right">' +
            '<button class="ms-btn ms-btn-ghost" data-action="report-close">ปิด</button>' +
            '<button class="ms-btn ms-btn-primary" data-action="report-download">' + ICONS.pdf + " ดาวน์โหลด PDF</button>" +
          "</div></div>" +
        "</div>" +
      "</div>"
    );
  }

  function buildPrintArea() {
    var r = state.report;
    var grouped = groupByDate(tasksInRange(r.from, r.to));
    var dateKeys = Object.keys(grouped).sort();
    var body = dateKeys.length === 0
      ? "<p>ไม่มีงานในช่วงวันที่ที่เลือก</p>"
      : dateKeys.map(function (dk) {
          var rows = grouped[dk].map(function (t) {
            return "<tr><td>" + timeOf(t.start) + "–" + timeOf(t.end) + "</td><td>" + esc(t.name) + "</td><td>" + esc(t.group) + "</td><td>" + esc(t.status) + "</td></tr>";
          }).join("");
          return "<h3>" + displayDate(dk) + " (วัน" + WEEKDAY_FULL[weekdayLabel(dk)] + ")</h3>" +
            "<table><thead><tr><th>เวลา</th><th>ชื่องาน</th><th>กลุ่ม</th><th>สถานะ</th></tr></thead><tbody>" + rows + "</tbody></table>";
        }).join("");

    var printArea = document.getElementById("print-area");
    if (!printArea) return;
    printArea.innerHTML =
      "<h1>my_schedule — สรุปแผนงาน</h1>" +
      '<p class="ms-print-meta">ช่วงวันที่ ' + displayDate(r.from) + " – " + displayDate(r.to) + " · พิมพ์เมื่อ " + new Date().toLocaleString("th-TH") + "</p>" +
      body;
  }

  /* ---------------- main render ---------------- */
  function render() {
    var app = document.getElementById("app");
    var tabs = [
      { key: "home", label: "หน้าหลัก", icon: ICONS.home },
      { key: "day", label: "รายวัน", icon: ICONS.day },
      { key: "week", label: "รายสัปดาห์", icon: ICONS.week },
      { key: "month", label: "รายเดือน", icon: ICONS.month },
      { key: "year", label: "รายปี", icon: ICONS.year },
      { key: "5s", label: "ตรวจ 5ส", icon: ICONS.checklist },
    ];
    var tabsHTML = tabs.map(function (tb) {
      return '<button class="ms-tab' + (state.view === tb.key ? " active" : "") + '" data-action="set-view" data-view="' + tb.key + '">' + tb.icon + " " + tb.label + "</button>";
    }).join("");

    var body = "";
    if (state.view === "home") body = renderHome();
    else if (state.view === "day") body = renderDay();
    else if (state.view === "week") body = renderWeek();
    else if (state.view === "month") body = renderMonth();
    else if (state.view === "year") body = renderYear();
    else if (state.view === "5s") body = renderFiveS();

    var syncBtnClass = "ms-icon-btn ms-sync-btn" + (state.sync.signedIn ? " connected" : "") + (state.sync.syncing ? " spinning" : "");
    var syncIcon = state.sync.syncing ? ICONS.sync : (state.sync.signedIn ? ICONS.cloud : ICONS.cloudOff);

    app.innerHTML =
      '<div class="ms-root">' +
        '<div class="ms-header">' +
          '<div class="ms-title-wrap"><span class="ms-title">my_schedule</span><span class="ms-subtitle">วางแผนงานรายวัน รายเดือน รายปี</span></div>' +
          '<div class="ms-header-actions">' +
            '<button class="ms-icon-btn" data-action="open-report" title="ดาวน์โหลด PDF สรุปแผนงาน">' + ICONS.pdf + "</button>" +
            '<button class="' + syncBtnClass + '" data-action="open-settings" title="ซิงก์กับ Google Sheets">' + syncIcon + "</button>" +
            (state.view === "5s"
              ? '<button class="ms-add-btn" data-action="5s-add">' + ICONS.plus + " เพิ่มรายการ 5ส</button>"
              : '<button class="ms-add-btn" data-action="add-task">' + ICONS.plus + " เพิ่มงาน</button>") +
          "</div>" +
        "</div>" +
        '<div class="ms-tabs">' + tabsHTML + "</div>" +
        body +
      "</div>";

    renderModal();
    document.getElementById("modal-root-2").innerHTML = state.settingsOpen ? renderSettingsModal() : "";
    document.getElementById("modal-root-3").innerHTML = state.report ? renderReportModal() : "";
    document.getElementById("modal-root-4").innerHTML = state.fivesModal ? renderFiveSModal() : "";
  }

  /* ---------------- actions ---------------- */
  function openNew(prefillDate) {
    state.modal = { isNew: true, draft: emptyDraft(prefillDate), confirmDel: false, error: "" };
    render();
  }
  function openEdit(task) {
    state.modal = { isNew: false, draft: JSON.parse(JSON.stringify(task)), confirmDel: false, error: "" };
    (task.photos || []).forEach(function (p) { if (p && p.indexOf("drive:") === 0) resolveDrivePhoto(p.slice(6)); });
    render();
  }
  function closeModal() { state.modal = null; render(); }

  function saveModal() {
    var d = state.modal.draft;
    if (!d.name || !d.name.trim()) { state.modal.error = "กรุณาใส่ชื่องาน"; render(); return; }
    if (d.end < d.start) { state.modal.error = "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม"; render(); return; }
    if (state.modal.isNew) {
      d.id = uid();
      state.tasks.push(d);
    } else {
      state.tasks = state.tasks.map(function (t) { return t.id === d.id ? d : t; });
    }
    persistTasks();
    state.modal = null;
    render();
  }
  function deleteModal() {
    var id = state.modal.draft.id;
    state.tasks = state.tasks.filter(function (t) { return t.id !== id; });
    persistTasks();
    state.modal = null;
    render();
  }

  function open5sNew() {
    state.fivesModal = { isNew: true, draft: emptyFiveSDraft(), confirmDel: false, error: "" };
    render();
  }
  function open5sEdit(record) {
    state.fivesModal = { isNew: false, draft: JSON.parse(JSON.stringify(record)), confirmDel: false, error: "" };
    [record.beforePhoto, record.afterPhoto].concat((record.followUps || []).map(function (f) { return f.photo; })).forEach(function (p) {
      if (p && p.indexOf("drive:") === 0) resolveDrivePhoto(p.slice(6));
    });
    render();
  }
  function close5sModal() { state.fivesModal = null; render(); }
  function save5sModal() {
    var d = state.fivesModal.draft;
    if (!d.itemName || !d.itemName.trim()) { state.fivesModal.error = "กรุณาใส่รายการ/สภาพปัญหา"; render(); return; }
    if (state.fivesModal.isNew) {
      d.id = uid();
      state.fiveS.push(d);
    } else {
      state.fiveS = state.fiveS.map(function (r) { return r.id === d.id ? d : r; });
    }
    persistFiveS();
    state.fivesModal = null;
    render();
  }
  function delete5sModal() {
    var id = state.fivesModal.draft.id;
    state.fiveS = state.fiveS.filter(function (r) { return r.id !== id; });
    persistFiveS();
    state.fivesModal = null;
    render();
  }
  function find5s(id) { for (var i = 0; i < state.fiveS.length; i++) if (state.fiveS[i].id === id) return state.fiveS[i]; return null; }

  /* ---------------- event delegation ---------------- */
  function findTask(id) { for (var i = 0; i < state.tasks.length; i++) if (state.tasks[i].id === id) return state.tasks[i]; return null; }

  document.addEventListener("click", function (e) {
    if (e.target.id === "report-overlay") { state.report = null; render(); return; }
    if (e.target.id === "settings-overlay") { state.settingsOpen = false; render(); return; }
    if (e.target.id === "5s-overlay") { state.fivesModal = null; render(); return; }
    if (e.target.classList && e.target.classList.contains("ms-modal-overlay")) { closeModal(); return; }

    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");

    switch (action) {
      case "open-report": state.report = { from: state.dateKey, to: state.dateKey }; render(); break;
      case "report-close": state.report = null; render(); break;
      case "report-download": buildPrintArea(); setTimeout(function () { window.print(); }, 60); break;

      case "5s-add": open5sNew(); break;
      case "5s-open": { var r5 = find5s(el.getAttribute("data-id")); if (r5) open5sEdit(r5); break; }
      case "5s-close": close5sModal(); break;
      case "5s-save": save5sModal(); break;
      case "5s-delete-ask": state.fivesModal.confirmDel = true; render(); break;
      case "5s-delete-cancel": state.fivesModal.confirmDel = false; render(); break;
      case "5s-delete-confirm": delete5sModal(); break;
      case "5s-download": buildFiveSPrintArea(state.fivesModal.draft); setTimeout(function () { window.print(); }, 60); break;
      case "5s-add-action": state.fivesModal.draft.actions.push({ detail: "", dueDate: "", percent: 0 }); render(); break;
      case "5s-remove-action": {
        var ai = Number(el.getAttribute("data-index"));
        state.fivesModal.draft.actions.splice(ai, 1);
        render(); break;
      }
      case "5s-remove-photo": {
        var pf = el.getAttribute("data-field");
        if (pf.indexOf("followUps.") === 0) { state.fivesModal.draft.followUps[Number(pf.split(".")[1])].photo = ""; }
        else { state.fivesModal.draft[pf] = ""; }
        render(); break;
      }

      case "open-settings": state.settingsOpen = true; render(); break;
      case "settings-close": state.settingsOpen = false; render(); break;
      case "sheets-connect":
        saveConfig();
        if (!hasSyncConfig()) { state.sync.lastError = "กรุณากรอก Client ID และ Spreadsheet ID ให้ครบ"; render(); break; }
        if (state.sync.signedIn) { pushToSheet(); pushFiveSToSheet(); } else { signIn(true); }
        break;
      case "sheets-signout": signOut(); break;

      case "set-view": state.view = el.getAttribute("data-view"); render(); break;
      case "add-task": openNew(state.view === "day" ? state.dateKey : undefined); break;
      case "open-task": { var t = findTask(el.getAttribute("data-id")); if (t) openEdit(t); break; }

      case "day-prev": state.dateKey = addDays(state.dateKey, -1); render(); break;
      case "day-next": state.dateKey = addDays(state.dateKey, 1); render(); break;
      case "day-today": state.dateKey = todayKey(); render(); break;

      case "week-prev": state.weekCursor = addDays(state.weekCursor || mondayOf(state.dateKey), -7); render(); break;
      case "week-next": state.weekCursor = addDays(state.weekCursor || mondayOf(state.dateKey), 7); render(); break;
      case "week-today": state.weekCursor = mondayOf(todayKey()); render(); break;

      case "month-prev": {
        var mp = state.monthCursor.month - 1, yp = state.monthCursor.year;
        if (mp < 0) { mp = 11; yp -= 1; }
        state.monthCursor = { year: yp, month: mp }; render(); break;
      }
      case "month-next": {
        var mn = state.monthCursor.month + 1, yn = state.monthCursor.year;
        if (mn > 11) { mn = 0; yn += 1; }
        state.monthCursor = { year: yn, month: mn }; render(); break;
      }
      case "month-today": {
        var n2 = new Date();
        state.monthCursor = { year: n2.getFullYear(), month: n2.getMonth() };
        state.dateKey = todayKey();
        render(); break;
      }
      case "month-pick": {
        var dk = el.getAttribute("data-date");
        if (Number(dk.slice(0, 4)) !== state.monthCursor.year || Number(dk.slice(5, 7)) - 1 !== state.monthCursor.month) {
          state.monthCursor = { year: Number(dk.slice(0, 4)), month: Number(dk.slice(5, 7)) - 1 };
        }
        state.dateKey = dk;
        state.view = "day";
        render(); break;
      }

      case "year-prev": state.year -= 1; render(); break;
      case "year-next": state.year += 1; render(); break;
      case "year-today": state.year = new Date().getFullYear(); render(); break;

      case "close":
        closeModal(); break;

      case "set-group": state.modal.draft.group = el.getAttribute("data-value"); if (state.modal.draft.group === "Project") state.modal.draft.project = ""; render(); break;
      case "set-status": state.modal.draft.status = el.getAttribute("data-value"); render(); break;
      case "priority-minus": state.modal.draft.priority = Math.max(1, state.modal.draft.priority - 1); render(); break;
      case "priority-plus": state.modal.draft.priority = Math.min(5, state.modal.draft.priority + 1); render(); break;
      case "delete-ask": state.modal.confirmDel = true; render(); break;
      case "delete-cancel": state.modal.confirmDel = false; render(); break;
      case "delete-confirm": deleteModal(); break;
      case "remove-photo": {
        var idx = Number(el.getAttribute("data-index"));
        state.modal.draft.photos.splice(idx, 1);
        render(); break;
      }
      case "save": saveModal(); break;
    }
  });

  document.addEventListener("input", function (e) {
    var el = e.target;
    var cfgField = el.getAttribute("data-config");
    if (cfgField) {
      state.sync[cfgField] = el.value.trim();
      saveConfig();
      return;
    }
    var reportField = el.getAttribute("data-report");
    if (reportField && state.report) {
      state.report[reportField] = el.value;
      render();
      return;
    }
    if (el.getAttribute("data-action") === "group-filter") {
      state.groupFilter[el.getAttribute("data-group")] = el.value;
      render();
      return;
    }

    if (state.fivesModal) {
      var d5 = state.fivesModal.draft;
      var f5 = el.getAttribute("data-5s-field");
      if (f5) {
        d5[f5] = (el.type === "number") ? Number(el.value) : el.value;
        if (state.fivesModal.error) state.fivesModal.error = "";
        return;
      }
      var actionField = el.getAttribute("data-5s-action");
      if (actionField) {
        var aIdx = Number(el.getAttribute("data-index"));
        d5.actions[aIdx][actionField] = (actionField === "percent") ? Number(el.value) : el.value;
        return;
      }
      var fuField = el.getAttribute("data-5s-followup");
      if (fuField) {
        var fIdx = Number(el.getAttribute("data-index"));
        d5.followUps[fIdx][fuField] = el.value;
        return;
      }
    }

    if (!state.modal) return;
    var field = el.getAttribute("data-field");
    if (field === "start") {
      state.modal.draft.start = el.value;
      var newEnd = addHoursToDT(el.value, 2);
      state.modal.draft.end = newEnd;
      var endInput = document.querySelector('[data-field="end"]');
      if (endInput) endInput.value = newEnd;
      if (state.modal.error) state.modal.error = "";
      return;
    }
    if (field) { state.modal.draft[field] = el.value; if (state.modal.error) { state.modal.error = ""; } return; }
    if (el.getAttribute("data-action") === "day-pick") { state.dateKey = el.value; render(); }
  });

  document.addEventListener("change", function (e) {
    var el = e.target;
    var action5s = el.getAttribute("data-action");

    if (action5s === "5s-pick-photo" && state.fivesModal) {
      var file5 = el.files && el.files[0];
      if (!file5) return;
      var field5 = el.getAttribute("data-field");
      var reader5 = new FileReader();
      reader5.onload = function () {
        var dataUrl5 = String(reader5.result);
        var d5 = state.fivesModal.draft;
        var setPhoto5 = function (value) {
          if (field5.indexOf("followUps.") === 0) { d5.followUps[Number(field5.split(".")[1])].photo = value; }
          else { d5[field5] = value; }
          render();
        };
        setPhoto5(dataUrl5);
        if (state.sync.signedIn) {
          uploadPhotoToDrive(dataUrl5, "5s_" + field5.replace(/\W+/g, "_") + "_" + Date.now() + ".jpg")
            .then(function (fileId) { setPhoto5("drive:" + fileId); })
            .catch(function () { /* keep local copy on upload failure */ });
        }
      };
      reader5.readAsDataURL(file5);
      el.value = "";
      return;
    }

    if (el.getAttribute("data-action") !== "pick-photo") return;
    var files = el.files ? Array.prototype.slice.call(el.files) : [];
    if (!files.length || !state.modal) return;
    var draft = state.modal.draft;
    var room = Math.max(0, 6 - (draft.photos ? draft.photos.length : 0));
    files.slice(0, room).forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        draft.photos = draft.photos || [];
        var slotIndex = draft.photos.length;
        draft.photos.push(String(reader.result));
        render();
        if (state.sync.signedIn) {
          uploadPhotoToDrive(String(reader.result), "task_" + Date.now() + "_" + slotIndex + ".jpg")
            .then(function (fileId) {
              if (draft.photos[slotIndex] !== undefined) { draft.photos[slotIndex] = "drive:" + fileId; render(); }
            })
            .catch(function () { /* keep local copy on upload failure */ });
        }
      };
      reader.readAsDataURL(file);
    });
    el.value = "";
  });

  /* ---------------- init ---------------- */
  loadConfig();
  loadTasks();
  loadFiveS();
  state.weekCursor = mondayOf(todayKey());
  render();
  if (hasSyncConfig()) {
    var savedToken = loadToken();
    if (savedToken) {
      state.sync.accessToken = savedToken.token;
      state.sync.signedIn = true;
      pullFromSheet();
      pullFiveSFromSheet();
    } else {
      window.addEventListener("load", function () {
        setTimeout(function () { signIn(false); }, 300);
      });
    }
  }
})();
