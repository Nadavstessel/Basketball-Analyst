
// === זיהוי מזהה קבוצה מה-URL ושימוש בו באחסון נתונים ===
function getTeamId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "default";
}
const teamId = getTeamId();

// מעבר בין טאבים
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');
    saveAll();
  }
  
  // ================== טאב טבלאות ניתוח ==================
  
  function createAnalysisValueCell(cell) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = "0";
    input.style.width = "50px";
    input.style.textAlign = "center";
    input.oninput = saveAll;
  
    const amounts = [1, 2, 3];
    const buttonsRow = document.createElement("div");
    buttonsRow.style.display = "flex";
    buttonsRow.style.flexWrap = "wrap";
    buttonsRow.style.justifyContent = "center";
  
    amounts.forEach(amount => {
      const plus = document.createElement("button");
      plus.className = "btn";
      plus.innerText = `+${amount}`;
      plus.onclick = () => {
        input.value = parseInt(input.value) + amount;
        saveAll();
      };
  
      const minus = document.createElement("button");
      minus.className = "btn";
      minus.innerText = `-${amount}`;
      minus.onclick = () => {
        input.value = parseInt(input.value) - amount;
        saveAll();
      };
  
      buttonsRow.appendChild(plus);
      buttonsRow.appendChild(minus);
    });
  
    cell.appendChild(input);
    cell.appendChild(buttonsRow);
  }
  
  function addTable() {
    const container = document.getElementById("tables-container");
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
  
    const table = document.createElement("table");
  
    // כותרת ראשית
    const mainHeader = table.insertRow();
    const titleCell = document.createElement("th");
    titleCell.colSpan = 2;
    titleCell.contentEditable = true;
    titleCell.innerText = "כותרת ראשית";
    titleCell.classList.add("edit-title");
    titleCell.oninput = saveAll;
    mainHeader.appendChild(titleCell);
  
    // שורת כותרות
    const headerRow = table.insertRow();
    const descTh = document.createElement("th");
    descTh.innerText = "מה נבדק";
    headerRow.appendChild(descTh);
  
    const th = document.createElement("th");
    th.contentEditable = true;
    th.innerText = "כותרת 1";
    th.classList.add("edit-title");
    th.oninput = saveAll;
    headerRow.appendChild(th);
  
    // שורה ראשונה
    addAnalysisRow(table);
  
    // כפתורי שליטה
    const controls = document.createElement("div");
    controls.className = "controls";
  
    const addColBtn = button("➕ הוסף עמודה", () => {
      titleCell.colSpan += 1;
      const th = document.createElement("th");
      th.contentEditable = true;
      th.innerText = `כותרת ${headerRow.cells.length}`;
      th.classList.add("edit-title");
      th.oninput = saveAll;
      headerRow.appendChild(th);
      for (let i = 2; i < table.rows.length; i++) {
        const cell = table.rows[i].insertCell();
        createAnalysisValueCell(cell);
      }
      saveAll();
    });
  
    const removeColBtn = button("➖ מחק עמודה", () => {
      if (headerRow.cells.length <= 1) return;
      titleCell.colSpan -= 1;
      headerRow.deleteCell(-1);
      for (let i = 2; i < table.rows.length; i++) {
        table.rows[i].deleteCell(-1);
      }
      saveAll();
    });
  
    const addRowBtn = button("➕ הוסף שורה", () => {
      addAnalysisRow(table);
      saveAll();
    });
  
    const removeRowBtn = button("➖ מחק שורה", () => {
      if (table.rows.length > 3) {
        table.deleteRow(-1);
        saveAll();
      }
    });
  
    const deleteTableBtn = button("🗑️ מחק טבלה", () => {
      wrapper.remove();
      saveAll();
    }, "btn-danger");
  
    controls.appendChild(addColBtn);
    controls.appendChild(removeColBtn);
    controls.appendChild(addRowBtn);
    controls.appendChild(removeRowBtn);
    controls.appendChild(deleteTableBtn);
  
    wrapper.appendChild(table);
    wrapper.appendChild(controls);
    container.appendChild(wrapper);
    saveAll();
  }
  
  function addAnalysisRow(table) {
    const row = table.insertRow();
    const desc = row.insertCell();
    desc.contentEditable = true;
    desc.innerText = "הזן טקסט";
    desc.classList.add("edit-title");
    desc.oninput = saveAll;
  
    for (let i = 1; i < table.rows[1].cells.length; i++) {
      const cell = row.insertCell();
      createAnalysisValueCell(cell);
    }
  }
// ================== טאב סטטיסטיקה ==================

let statsData = {
    headers: ["שחקנית", "נקודות", "אסיסטים"],
    rows: [["#7 מרים", "0", "0"]]
  };
  
  function renderStatsTable() {
    const container = document.getElementById("stats-table-container");
    container.innerHTML = "";
  
    const table = document.createElement("table");
  
    // כותרות
    const headerRow = table.insertRow();
    statsData.headers.forEach((title, i) => {
      const th = document.createElement("th");
      th.contentEditable = true;
      th.innerText = title;
      th.oninput = () => {
        statsData.headers[i] = th.innerText;
        saveAll();
      };
      headerRow.appendChild(th);
    });
  
    // שורות
    statsData.rows.forEach((row, rowIndex) => {
      const tr = table.insertRow();
  
      row.forEach((val, colIndex) => {
        const cell = tr.insertCell();
  
        if (colIndex === 0) {
          cell.contentEditable = true;
          cell.innerText = val;
          cell.classList.add("edit-title");
          cell.oninput = () => {
            statsData.rows[rowIndex][0] = cell.innerText;
            saveAll();
          };
        } else {
          const input = document.createElement("input");
          input.type = "number";
          input.value = val;
  
          input.oninput = () => {
            statsData.rows[rowIndex][colIndex] = input.value;
            saveAll();
          };
  
          const plus = button("+", () => {
            input.value = parseInt(input.value) + 1;
            statsData.rows[rowIndex][colIndex] = input.value;
            saveAll();
          });
  
          const minus = button("-", () => {
            input.value = parseInt(input.value) - 1;
            statsData.rows[rowIndex][colIndex] = input.value;
            saveAll();
          });
  
          cell.appendChild(input);
          cell.appendChild(document.createElement("br"));
          cell.appendChild(plus);
          cell.appendChild(minus);
        }
      });
    });
  
    container.appendChild(table);
  }
  
  function addStatsRow() {
    const newRow = ["שחקנית חדשה"];
    for (let i = 1; i < statsData.headers.length; i++) newRow.push("0");
    statsData.rows.push(newRow);
    renderStatsTable();
    saveAll();
  }
  
  function removeStatsRow() {
    if (statsData.rows.length > 1) {
      statsData.rows.pop();
      renderStatsTable();
      saveAll();
    }
  }
  
  function addStatsColumn() {
    const title = `מדד ${statsData.headers.length}`;
    statsData.headers.push(title);
    statsData.rows.forEach(row => row.push("0"));
    renderStatsTable();
    saveAll();
  }
  
  function removeStatsColumn() {
    if (statsData.headers.length > 1) {
      statsData.headers.pop();
      statsData.rows.forEach(row => row.pop());
      renderStatsTable();
      saveAll();
    }
  }
// ================== שמירה, טעינה וכפתור עזר ==================

function button(text, onclick, extraClass = "") {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = "btn " + extraClass;
    btn.onclick = onclick;
    return btn;
  }
  
  function saveAll() {
    // שמירת טבלאות ניתוח
    const tables = [];
    document.querySelectorAll("#tables-container table").forEach(table => {
      const title = table.rows[0].cells[0].innerText;
      const headers = [];
      const rows = [];
  
      for (let i = 1; i < table.rows[1].cells.length; i++) {
        headers.push(table.rows[1].cells[i].innerText);
      }
  
      for (let i = 2; i < table.rows.length; i++) {
        const row = table.rows[i];
        const desc = row.cells[0].innerText;
        const values = [];
        for (let j = 1; j < row.cells.length; j++) {
          const input = row.cells[j].querySelector("input");
          values.push(input ? input.value : "0");
        }
        rows.push({ desc, values });
      }
  
      tables.push({ title, headers, rows });
    });
  
    localStorage.setItem(`analysisTables_${teamId}`, JSON.stringify(tables));
    localStorage.setItem(`gameStats_${teamId}`, JSON.stringify(statsData));
  }
  
  function loadAll() {
    const savedAnalysis = localStorage.getItem(`analysisTables_${teamId}`);
    if (savedAnalysis) {
      const tables = JSON.parse(savedAnalysis);
      tables.forEach(data => {
        const table = document.createElement("table");
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
  
        const titleRow = table.insertRow();
        const titleCell = document.createElement("th");
        titleCell.colSpan = data.headers.length + 1;
        titleCell.contentEditable = true;
        titleCell.innerText = data.title;
        titleCell.classList.add("edit-title");
        titleCell.oninput = saveAll;
        titleRow.appendChild(titleCell);
  
        const headerRow = table.insertRow();
        const descTh = document.createElement("th");
        descTh.innerText = "מה נבדק";
        headerRow.appendChild(descTh);
        data.headers.forEach(header => {
          const th = document.createElement("th");
          th.contentEditable = true;
          th.innerText = header;
          th.classList.add("edit-title");
          th.oninput = saveAll;
          headerRow.appendChild(th);
        });
  
        data.rows.forEach(rowData => {
          const row = table.insertRow();
          const descCell = row.insertCell();
          descCell.contentEditable = true;
          descCell.innerText = rowData.desc;
          descCell.classList.add("edit-title");
          descCell.oninput = saveAll;
  
          rowData.values.forEach(val => {
            const cell = row.insertCell();
            createAnalysisValueCell(cell);
            cell.querySelector("input").value = val;
          });
        });
  
        const controls = document.createElement("div");
        controls.className = "controls";
  
        const addColBtn = button("➕ הוסף עמודה", () => {
          titleCell.colSpan += 1;
          const th = document.createElement("th");
          th.contentEditable = true;
          th.innerText = `כותרת ${headerRow.cells.length}`;
          th.classList.add("edit-title");
          th.oninput = saveAll;
          headerRow.appendChild(th);
          for (let i = 2; i < table.rows.length; i++) {
            const cell = table.rows[i].insertCell();
            createAnalysisValueCell(cell);
          }
          saveAll();
        });
  
        const removeColBtn = button("➖ מחק עמודה", () => {
          if (headerRow.cells.length <= 1) return;
          titleCell.colSpan -= 1;
          headerRow.deleteCell(-1);
          for (let i = 2; i < table.rows.length; i++) {
            table.rows[i].deleteCell(-1);
          }
          saveAll();
        });
  
        const addRowBtn = button("➕ הוסף שורה", () => {
          addAnalysisRow(table);
          saveAll();
        });
  
        const removeRowBtn = button("➖ מחק שורה", () => {
          if (table.rows.length > 3) {
            table.deleteRow(-1);
            saveAll();
          }
        });
  
        const deleteTableBtn = button("🗑️ מחק טבלה", () => {
          wrapper.remove();
          saveAll();
        }, "btn-danger");
  
        controls.appendChild(addColBtn);
        controls.appendChild(removeColBtn);
        controls.appendChild(addRowBtn);
        controls.appendChild(removeRowBtn);
        controls.appendChild(deleteTableBtn);
  
        wrapper.appendChild(table);
        wrapper.appendChild(controls);
        document.getElementById("tables-container").appendChild(wrapper);
      });
    }
  
    const savedStats = localStorage.getItem(`gameStats_${teamId}`);
    if (savedStats) {
      statsData = JSON.parse(savedStats);
    }
    renderStatsTable();
  }
  
  // טעינה ראשונית
  loadAll();
      // ================== ייצוא לאקסל ==================

function exportToExcel() {
    const wb = XLSX.utils.book_new();
  
    // טבלאות ניתוח
    const analysisSheet = [];
    document.querySelectorAll("#tables-container table").forEach((table, tIndex) => {
      const title = table.rows[0].cells[0].innerText;
      analysisSheet.push([`טבלה: ${title}`]);
  
      const headers = [];
      for (let i = 1; i < table.rows[1].cells.length; i++) {
        headers.push(table.rows[1].cells[i].innerText);
      }
      analysisSheet.push(["מה נבדק", ...headers]);
  
      for (let i = 2; i < table.rows.length; i++) {
        const row = table.rows[i];
        const desc = row.cells[0].innerText;
        const values = [];
        for (let j = 1; j < row.cells.length; j++) {
          const input = row.cells[j].querySelector("input");
          values.push(input ? parseInt(input.value) : 0);
        }
        analysisSheet.push([desc, ...values]);
      }
  
      analysisSheet.push([]); // שורת רווח בין טבלאות
    });
  
    const ws1 = XLSX.utils.aoa_to_sheet(analysisSheet);
    XLSX.utils.book_append_sheet(wb, ws1, "טבלאות ניתוח");
  
    // טאב סטטיסטיקה
    const statsSheet = [statsData.headers];
    statsData.rows.forEach(row => statsSheet.push([...row]));
  
    const ws2 = XLSX.utils.aoa_to_sheet(statsSheet);
    XLSX.utils.book_append_sheet(wb, ws2, "סטטיסטיקה");
  
    XLSX.writeFile(wb, "game_data.xlsx");
  }
  
  // ================== ייבוא מאקסל ==================
  
  function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
  
      // טאב ניתוח
      const analysisSheet = XLSX.utils.sheet_to_json(workbook.Sheets["טבלאות ניתוח"], { header: 1 });
      const parsedAnalysis = [];
  
      let currentTable = null;
      analysisSheet.forEach(row => {
        if (row.length === 0) return;
        if (row[0]?.startsWith("טבלה: ")) {
          if (currentTable) parsedAnalysis.push(currentTable);
          currentTable = {
            title: row[0].replace("טבלה: ", ""),
            headers: [],
            rows: []
          };
        } else if (currentTable && currentTable.headers.length === 0) {
          currentTable.headers = row.slice(1);
        } else if (currentTable) {
          currentTable.rows.push({
            desc: row[0],
            values: row.slice(1).map(val => val.toString())
          });
        }
      });
      if (currentTable) parsedAnalysis.push(currentTable);
      localStorage.setItem(`analysisTables_${teamId}`, JSON.stringify(parsedAnalysis));
  
      // טאב סטטיסטיקה
      const statsSheet = XLSX.utils.sheet_to_json(workbook.Sheets["סטטיסטיקה"], { header: 1 });
      statsData = {
        headers: statsSheet[0],
        rows: statsSheet.slice(1).map(row => row.map(val => val.toString()))
      };
      localStorage.setItem(`gameStats_${teamId}`, JSON.stringify(statsData));
  
      // רענון
      loadAll();
      alert("הנתונים נטענו בהצלחה מהקובץ!");
    };
  
    reader.readAsArrayBuffer(file);
  }
  const translations = {
    he: {
      "מצב משחק": "מצב משחק",
      "📊 טבלאות ניתוח": "📊 טבלאות ניתוח",
      "📈 סטטיסטיקה": "📈 סטטיסטיקה",
      "הוסף טבלה": "הוסף טבלה",
      "כותרת ראשית": "כותרת ראשית",
      "מה נבדק": "מה נבדק",
      "הזן טקסט": "הזן טקסט",
      "הוסף שורה": "➕ הוסף שורה",
      "מחק שורה": "➖ מחק שורה",
      "הוסף עמודה": "➕ הוסף עמודה",
      "מחק עמודה": "➖ מחק עמודה",
      "מחק טבלה": "🗑️ מחק טבלה",
      "שחקנית חדשה": "שחקנית חדשה",
      "ייצא לאקסל": "📤 ייצא לאקסל",
      "ייבא מאקסל": "📥 ייבא מאקסל",
    },
    en: {
      "מצב משחק": "Game Mode",
      "📊 טבלאות ניתוח": "📊 Analysis Tables",
      "📈 סטטיסטיקה": "📈 Statistics",
      "הוסף טבלה": "Add Table",
      "כותרת ראשית": "Main Title",
      "מה נבדק": "Category",
      "הזן טקסט": "Enter text",
      "הוסף שורה": "➕ Add Row",
      "מחק שורה": "➖ Remove Row",
      "הוסף עמודה": "➕ Add Column",
      "מחק עמודה": "➖ Remove Column",
      "מחק טבלה": "🗑️ Delete Table",
      "שחקנית חדשה": "New Player",
      "ייצא לאקסל": "📤 Export to Excel",
      "ייבא מאקסל": "📥 Import from Excel",
    }
  };
  
  let currentLang = localStorage.getItem("lang") || "he";
  
  function toggleLanguage() {
    currentLang = currentLang === "he" ? "en" : "he";
    localStorage.setItem("lang", currentLang);
    applyTranslations();
  }
  
  function applyTranslations() {
    document.querySelectorAll("button, h2, th").forEach(el => {
      if (!el.dataset.originalText) {
        el.dataset.originalText = el.innerText.trim(); // שמור טקסט מקורי
      }
  
      const original = el.dataset.originalText;
  
      if (currentLang === "en" && translations["he"][original]) {
        el.innerText = translations["en"][original];
      } else {
        el.innerText = original; // חזרה לעברית
      }
    });
  }
  
  
  