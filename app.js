/* my_schedule — standalone PWA, no build step, no external libraries.
   Data is stored entirely on-device via localStorage. */

(function () {
  "use strict";

  var STORAGE_KEY = "my_schedule_tasks_v1";
  var CONFIG_KEY = "my_schedule_sync_config_v1";
  var SHEET_TAB = "Sheet1";
  var SHEET_HEADERS = ["ID_แผนงาน", "ชื่องาน", "กลุ่ม", "ลำดับสำคัญ", "สถานะงาน", "ความคืบหน้า", "เริ่มตามแผน", "สิ้นสุดตามแผน"];

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
    cloud: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H7a4.5 4.5 0 0 1-1-8.89A6 6 0 0 1 17.5 8.5 4 4 0 0 1 17.5 19z"/></svg>',
    cloudOff: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H7a4.5 4.5 0 0 1-1-8.89A6 6 0 0 1 17.5 8.5 4 4 0 0 1 17.5 19z"/><path d="M3 3l18 18"/></svg>',
    sync: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.3M3 12a9 9 0 0 1 15.5-6.3M3 3v6h6M21 21v-6h-6"/></svg>',
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
      { id: uid(), name: "ประชุมทบทวนแผนการผลิต", group: "งานประจำ", priority: 1, status: "กำลังดำเนินการ", progress: 40, start: localDT(t, 9), end: localDT(t, 10) },
      { id: uid(), name: "นำเสนอแนวทางใช้ AI ลดเวลาทำงาน", group: "งานพัฒนา", priority: 2, status: "ทำเสร็จแล้ว", progress: 100, start: localDT(t, 13), end: localDT(t, 14) },
      { id: uid(), name: "ตรวจสอบเอกสารส่งลูกค้า", group: "งานบริหาร", priority: 1, status: "กำลังดำเนินการ", progress: 65, start: localDT(tmr, 10), end: localDT(tmr, 11) },
      { id: uid(), name: "สรุปยอดขายประจำเดือน", group: "งานรายงาน", priority: 3, status: "กำลังดำเนินการ", progress: 20, start: localDT(soon, 14), end: localDT(soon, 15) },
      { id: uid(), name: "แก้ปัญหาสายการผลิตหยุดกะทันหัน", group: "งานแก้ปัญหา", priority: 1, status: "กำลังดำเนินการ", progress: 50, start: localDT(past, 8), end: localDT(past, 9) },
      { id: uid(), name: "อัปเดตแผนโปรเจกต์ระบบใหม่", group: "Project", priority: 2, status: "กำลังดำเนินการ", progress: 30, start: localDT(soon, 9), end: localDT(soon, 12) },
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
      if (raw) { state.tasks = JSON.parse(raw); return; }
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

  /* ---------------- Google Sheets sync ---------------- */
  var tokenClient = null;

  function taskToRow(t) { return [t.id, t.name, t.group, t.priority, t.status, t.progress, t.start, t.end]; }
  function rowToTask(r) {
    return {
      id: r[0] || uid(),
      name: r[1] || "",
      group: r[2] || GROUPS[0].key,
      priority: Number(r[3]) || 1,
      status: r[4] || "กำลังดำเนินการ",
      progress: Number(r[5]) || 0,
      start: r[6] || localDT(todayKey(), 9),
      end: r[7] || localDT(todayKey(), 10),
    };
  }

  function sheetsFetch(path, opts) {
    opts = opts || {};
    var headers = { Authorization: "Bearer " + state.sync.accessToken, "Content-Type": "application/json" };
    for (var k in (opts.headers || {})) headers[k] = opts.headers[k];
    opts.headers = headers;
    return fetch("https://sheets.googleapis.com/v4/spreadsheets/" + state.sync.spreadsheetId + path, opts).then(function (res) {
      if (!res.ok) {
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
        scope: "https://www.googleapis.com/auth/spreadsheets",
        callback: function (resp) {
          if (resp && resp.access_token) {
            state.sync.accessToken = resp.access_token;
            state.sync.signedIn = true;
            state.sync.lastError = "";
            pullFromSheet();
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
    render();
  }

  function pullFromSheet() {
    state.sync.syncing = true; render();
    sheetsFetch("/values/" + encodeURIComponent(SHEET_TAB + "!A:H"))
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

  function taskRowHTML(t, showDate) {
    var sColor = statusColor(t.status), gColor = groupColor(t.group);
    var cancelled = t.status === "ยกเลิก";
    return (
      '<button class="ms-taskrow" data-action="open-task" data-id="' + t.id + '">' +
        '<span class="ms-taskrow-dot" style="background:' + gColor + '"></span>' +
        '<div class="ms-taskrow-body">' +
          '<div class="ms-taskrow-name' + (cancelled ? " cancelled" : "") + '">' + esc(t.name) + "</div>" +
          '<div class="ms-taskrow-meta">' +
            (showDate ? '<span class="ms-taskrow-date">' + displayDate(t.start.slice(0, 10)) + " · " + timeOf(t.start) + "</span>" : "") +
            '<span class="ms-taskrow-tag" style="color:' + sColor + ";border-color:" + sColor + "55;background:" + sColor + '14">' + esc(t.status) + "</span>" +
          "</div>" +
          dotProgress(t.progress, sColor, cancelled) +
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
    var todayTasks = state.tasks.filter(function (x) { return x.start.slice(0, 10) === t; }).sort(byStart);
    var tomorrowTasks = state.tasks.filter(function (x) { return x.start.slice(0, 10) === tmr; }).sort(byStart);
    var overdue = state.tasks.filter(function (x) { return x.status === "กำลังดำเนินการ" && new Date(x.end) < nowD; }).sort(byStart);

    var html = '<div class="ms-grid">';
    html += panelHTML("งานวันนี้", todayTasks.length, null, statusGroupedListHTML(todayTasks));
    html += panelHTML("งานพรุ่งนี้", tomorrowTasks.length, null, statusGroupedListHTML(tomorrowTasks));
    html += panelHTML("งานค้าง", overdue.length, "#E5484D", overdue.length === 0 ? '<div class="ms-empty">ไม่มีงานค้าง</div>' : overdue.map(function (tk) { return taskRowHTML(tk, true); }).join(""));

    GROUPS.forEach(function (g) {
      var list = state.tasks.filter(function (x) { return x.group === g.key; }).sort(byStart);
      var body = list.length === 0 ? '<div class="ms-empty">ยังไม่มีงานในหมวดนี้</div>' : list.map(function (tk) { return taskRowHTML(tk, true); }).join("");
      html += panelHTML(g.key, list.length, g.color, body);
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
              '<div class="ms-taskrow-name' + (cancelled ? " cancelled" : "") + '">' + esc(t.name) + "</div>" +
              '<div class="ms-taskrow-meta">' +
                '<span class="ms-taskrow-tag" style="color:' + groupColor(t.group) + ";border-color:" + groupColor(t.group) + "55;background:" + groupColor(t.group) + '14">' + esc(t.group) + "</span>" +
                '<span class="ms-taskrow-tag" style="color:' + statusColor(t.status) + ";border-color:" + statusColor(t.status) + "55;background:" + statusColor(t.status) + '14">' + esc(t.status) + "</span>" +
              "</div>" +
              dotProgress(t.progress, statusColor(t.status), cancelled) +
            "</div>" +
          "</button>";
      });
    }
    html += "</div></div>";
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

  /* ---------------- modal ---------------- */
  function emptyDraft(prefillDate) {
    var dk = prefillDate || todayKey();
    return { id: null, name: "", group: GROUPS[0].key, priority: 1, status: "กำลังดำเนินการ", progress: 50, start: localDT(dk, 9), end: localDT(dk, 10) };
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
      ? '<label class="ms-field"><span class="ms-label" id="progress-label">ความคืบหน้า — ' + d.progress + '%</span><input class="ms-range" type="range" min="0" max="100" step="5" value="' + d.progress + '" data-action="set-progress" /></label>'
      : "";

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
            '<label class="ms-field"><span class="ms-label">ชื่องาน *</span><input class="ms-input" type="text" data-field="name" value="' + esc(d.name) + '" placeholder="เช่น ประชุมทบทวนแผนการผลิต" /></label>' +
            '<div class="ms-field"><span class="ms-label">กลุ่ม *</span><div class="ms-pillrow">' + groupPills + "</div></div>" +
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
            '<div class="ms-settings-help">คัดลอกจากลิงก์ชีต: docs.google.com/spreadsheets/d/<b>SPREADSHEET_ID</b>/edit — ข้อมูลจะถูกเก็บในแท็บที่ชื่อ “Sheet1” ของไฟล์นั้น</div>' +
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

  /* ---------------- main render ---------------- */
  function render() {
    var app = document.getElementById("app");
    var tabs = [
      { key: "home", label: "หน้าหลัก", icon: ICONS.home },
      { key: "day", label: "รายวัน", icon: ICONS.day },
      { key: "month", label: "รายเดือน", icon: ICONS.month },
      { key: "year", label: "รายปี", icon: ICONS.year },
    ];
    var tabsHTML = tabs.map(function (tb) {
      return '<button class="ms-tab' + (state.view === tb.key ? " active" : "") + '" data-action="set-view" data-view="' + tb.key + '">' + tb.icon + " " + tb.label + "</button>";
    }).join("");

    var body = "";
    if (state.view === "home") body = renderHome();
    else if (state.view === "day") body = renderDay();
    else if (state.view === "month") body = renderMonth();
    else if (state.view === "year") body = renderYear();

    var syncBtnClass = "ms-icon-btn ms-sync-btn" + (state.sync.signedIn ? " connected" : "") + (state.sync.syncing ? " spinning" : "");
    var syncIcon = state.sync.syncing ? ICONS.sync : (state.sync.signedIn ? ICONS.cloud : ICONS.cloudOff);

    app.innerHTML =
      '<div class="ms-root">' +
        '<div class="ms-header">' +
          '<div class="ms-title-wrap"><span class="ms-title">my_schedule</span><span class="ms-subtitle">วางแผนงานรายวัน รายเดือน รายปี</span></div>' +
          '<div class="ms-header-actions">' +
            '<button class="' + syncBtnClass + '" data-action="open-settings" title="ซิงก์กับ Google Sheets">' + syncIcon + "</button>" +
            '<button class="ms-add-btn" data-action="add-task">' + ICONS.plus + " เพิ่มงาน</button>" +
          "</div>" +
        "</div>" +
        '<div class="ms-tabs">' + tabsHTML + "</div>" +
        body +
      "</div>";

    renderModal();
    document.getElementById("modal-root-2").innerHTML = state.settingsOpen ? renderSettingsModal() : "";
  }

  /* ---------------- actions ---------------- */
  function openNew(prefillDate) {
    state.modal = { isNew: true, draft: emptyDraft(prefillDate), confirmDel: false, error: "" };
    render();
  }
  function openEdit(task) {
    state.modal = { isNew: false, draft: JSON.parse(JSON.stringify(task)), confirmDel: false, error: "" };
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

  /* ---------------- event delegation ---------------- */
  function findTask(id) { for (var i = 0; i < state.tasks.length; i++) if (state.tasks[i].id === id) return state.tasks[i]; return null; }

  document.addEventListener("click", function (e) {
    if (e.target.id === "settings-overlay") { state.settingsOpen = false; render(); return; }
    if (e.target.classList && e.target.classList.contains("ms-modal-overlay")) { closeModal(); return; }

    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");

    switch (action) {
      case "open-settings": state.settingsOpen = true; render(); break;
      case "settings-close": state.settingsOpen = false; render(); break;
      case "sheets-connect":
        saveConfig();
        if (!hasSyncConfig()) { state.sync.lastError = "กรุณากรอก Client ID และ Spreadsheet ID ให้ครบ"; render(); break; }
        signIn(true);
        break;
      case "sheets-signout": signOut(); break;

      case "set-view": state.view = el.getAttribute("data-view"); render(); break;
      case "add-task": openNew(state.view === "day" ? state.dateKey : undefined); break;
      case "open-task": { var t = findTask(el.getAttribute("data-id")); if (t) openEdit(t); break; }

      case "day-prev": state.dateKey = addDays(state.dateKey, -1); render(); break;
      case "day-next": state.dateKey = addDays(state.dateKey, 1); render(); break;
      case "day-today": state.dateKey = todayKey(); render(); break;

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

      case "set-group": state.modal.draft.group = el.getAttribute("data-value"); render(); break;
      case "set-status": state.modal.draft.status = el.getAttribute("data-value"); if (state.modal.draft.status === "ทำเสร็จแล้ว") state.modal.draft.progress = 100; render(); break;
      case "priority-minus": state.modal.draft.priority = Math.max(1, state.modal.draft.priority - 1); render(); break;
      case "priority-plus": state.modal.draft.priority = Math.min(5, state.modal.draft.priority + 1); render(); break;
      case "delete-ask": state.modal.confirmDel = true; render(); break;
      case "delete-cancel": state.modal.confirmDel = false; render(); break;
      case "delete-confirm": deleteModal(); break;
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
    if (!state.modal) return;
    var field = el.getAttribute("data-field");
    if (field) { state.modal.draft[field] = el.value; if (state.modal.error) { state.modal.error = ""; } return; }
    var action = el.getAttribute("data-action");
    if (action === "set-progress") {
      state.modal.draft.progress = Number(el.value);
      var lbl = document.getElementById("progress-label");
      if (lbl) lbl.textContent = "ความคืบหน้า — " + state.modal.draft.progress + "%";
    } else if (action === "day-pick") { state.dateKey = el.value; render(); }
  });

  /* ---------------- init ---------------- */
  loadConfig();
  loadTasks();
  render();
  if (hasSyncConfig()) {
    window.addEventListener("load", function () {
      setTimeout(function () { signIn(false); }, 300);
    });
  }
})();
