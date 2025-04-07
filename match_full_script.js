const params = new URLSearchParams(window.location.search);
const matchId = params.get("id");
const teamId = params.get("team") || "default";

const matchNameDiv = document.getElementById("match-name");
const container = document.getElementById("tables-container");

const matches = JSON.parse(localStorage.getItem("preMatches_" + teamId) || "[]");
const match = matches.find(m => m.id === matchId);
if (match) {
  matchNameDiv.innerText = match.name;
}

const storageKey = "preMatchTables_" + teamId + "_" + matchId;
let savedTables = JSON.parse(localStorage.getItem(storageKey) || "[]");

function saveTables() {
  localStorage.setItem(storageKey, JSON.stringify(savedTables));
}

// גרירה
let dragSrcIndex = null;

function createDraggableWrapper(tIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "draggable-wrapper";
  wrapper.setAttribute("draggable", "true");
  wrapper.dataset.index = tIndex;

  wrapper.addEventListener("dragstart", (e) => {
    dragSrcIndex = +wrapper.dataset.index;
    e.dataTransfer.effectAllowed = "move";
  });

  wrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
    wrapper.classList.add("drag-over");
  });

  wrapper.addEventListener("dragleave", () => {
    wrapper.classList.remove("drag-over");
  });

  wrapper.addEventListener("drop", (e) => {
    e.preventDefault();
    wrapper.classList.remove("drag-over");
    const dropIndex = +wrapper.dataset.index;

    if (dragSrcIndex === dropIndex) return;

    const draggedTable = savedTables.splice(dragSrcIndex, 1)[0];
    savedTables.splice(dropIndex, 0, draggedTable);
    saveTables();
    renderTables();
  });

  return wrapper;
}

// הצגת כל הטבלאות
function renderTables() {
  container.innerHTML = "";
  savedTables.forEach((tableData, tIndex) => {
    const wrapper = createDraggableWrapper(tIndex);
    if (tableData.type === "analysis") {
      wrapper.appendChild(renderAnalysisTable(tableData, tIndex));
    } else if (tableData.type === "text") {
      wrapper.appendChild(renderTextTable(tableData, tIndex));
    } else {
      wrapper.appendChild(renderDrillTable(tableData, tIndex));
    }
    container.appendChild(wrapper);
  });
}

// יצירת טבלאות חדשות
function addDrillTable() {
  savedTables.push({
    type: "drill",
    title: "טבלת תרגילים",
    columns: ["מה עשו מהתרגיל", "מדד 1"],
    rows: [["תרגיל חדש", "תיאור", "0"]]
  });
  saveTables();
  renderTables();
}

function addAnalysisTable() {
  savedTables.push({
    type: "analysis",
    title: "טבלת ניתוח חדשה",
    columns: ["מדד 1", "מדד 2"],
    rows: [["קטגוריה א'", { value: "0", change: 1 }, { value: "0", change: 1 }]]
  });
  saveTables();
  renderTables();
}

function addTextTable() {
  savedTables.push({
    type: "text",
    title: "טבלת טקסט חדשה",
    columns: ["תיאור", "מדד 1"],
    rows: [["", "0"]]
  });
  saveTables();
  renderTables();
}

// טבלת תרגילים
function renderDrillTable(tableData, tIndex) {
  const container = document.createElement("div");
  const deleteBtn = createDeleteButton(tIndex);
  container.appendChild(deleteBtn);

  const table = createTableSkeleton(tableData, tIndex, true);

  tableData.rows.forEach((rowData, rowIndex) => {
    const row = table.insertRow();
    const nameCell = row.insertCell();
    nameCell.contentEditable = true;
    nameCell.innerText = rowData[0];
    nameCell.oninput = () => {
      tableData.rows[rowIndex][0] = nameCell.innerText;
      saveTables();
    };

    for (let i = 1; i < rowData.length; i++) {
      const cell = row.insertCell();
      if (i === 1) {
        const textarea = document.createElement("textarea");
        textarea.value = rowData[i];
        textarea.rows = 4;
        textarea.style.width = "300px";
        textarea.oninput = () => {
          tableData.rows[rowIndex][i] = textarea.value;
          saveTables();
        };
        cell.appendChild(textarea);
      } else {
        createNumberCell(cell, rowData, rowIndex, i, tableData);
      }
    }
  });

  container.appendChild(table);
  container.appendChild(createTableControls(tableData, tIndex, true));
  return container;
}

// טבלת טקסט
function renderTextTable(tableData, tIndex) {
  const container = document.createElement("div");
  const deleteBtn = createDeleteButton(tIndex);
  container.appendChild(deleteBtn);

  const table = createTableSkeleton(tableData, tIndex, false);

  tableData.rows.forEach((rowData, rowIndex) => {
    const row = table.insertRow();
    rowData.forEach((cellData, i) => {
      const cell = row.insertCell();
      if (i === 0) {
        const textarea = document.createElement("textarea");
        textarea.value = cellData;
        textarea.rows = 3;
        textarea.style.width = "100%";
        textarea.oninput = () => {
          tableData.rows[rowIndex][i] = textarea.value;
          saveTables();
        };
        cell.appendChild(textarea);
      } else {
        createNumberCell(cell, rowData, rowIndex, i, tableData);
      }
    });
  });

  container.appendChild(table);
  container.appendChild(createTableControls(tableData, tIndex, false));
  return container;
}

// טבלת ניתוח
function renderAnalysisTable(tableData, tIndex) {
  const container = document.createElement("div");
  const deleteBtn = createDeleteButton(tIndex);
  container.appendChild(deleteBtn);

  const table = createTableSkeleton(tableData, tIndex, true, true);

  tableData.rows.forEach((rowData, rowIndex) => {
    const row = table.insertRow();
    const labelCell = row.insertCell();
    labelCell.contentEditable = true;
    labelCell.innerText = rowData[0];
    labelCell.oninput = () => {
      tableData.rows[rowIndex][0] = labelCell.innerText;
      saveTables();
    };

    for (let i = 1; i <= tableData.columns.length; i++) {
      if (!rowData[i]) rowData[i] = { value: "0", change: 1 };

      const cell = row.insertCell();
      const block = document.createElement("div");
      block.className = "cell-block";

      const valInput = document.createElement("input");
      valInput.type = "number";
      valInput.value = rowData[i].value;
      valInput.oninput = () => {
        rowData[i].value = valInput.value;
        saveTables();
      };

      const changeInput = document.createElement("input");
      changeInput.type = "number";
      changeInput.value = rowData[i].change;
      changeInput.style.width = "60px";
      changeInput.oninput = () => {
        rowData[i].change = parseInt(changeInput.value) || 1;
        saveTables();
      };

      const plus = document.createElement("button");
      plus.innerText = "+";
      plus.onclick = () => {
        valInput.value = parseInt(valInput.value) + parseInt(changeInput.value || 1);
        rowData[i].value = valInput.value;
        saveTables();
      };

      const minus = document.createElement("button");
      minus.innerText = "-";
      minus.onclick = () => {
        valInput.value = parseInt(valInput.value) - parseInt(changeInput.value || 1);
        rowData[i].value = valInput.value;
        saveTables();
      };

      const controls = document.createElement("div");
      controls.className = "change-controls";
      controls.appendChild(plus);
      controls.appendChild(minus);

      block.appendChild(valInput);
      block.appendChild(controls);
      block.appendChild(changeInput);
      cell.appendChild(block);
    }
  });

  container.appendChild(table);
  container.appendChild(createTableControls(tableData, tIndex, true));
  return container;
}

// פונקציות עזר
function createDeleteButton(tIndex) {
  const btn = document.createElement("button");
  btn.innerText = "🗑️ מחק טבלה";
  btn.className = "btn";
  btn.onclick = () => {
    savedTables.splice(tIndex, 1);
    saveTables();
    renderTables();
  };
  return btn;
}

function createNumberCell(cell, rowData, rowIndex, i, tableData) {
  const input = document.createElement("input");
  input.type = "number";
  input.value = rowData[i];
  input.oninput = () => {
    rowData[i] = input.value;
    saveTables();
  };

  const plus = document.createElement("button");
  plus.innerText = "+";
  plus.onclick = () => {
    input.value = parseInt(input.value) + 1;
    rowData[i] = input.value;
    saveTables();
  };

  const minus = document.createElement("button");
  minus.innerText = "-";
  minus.onclick = () => {
    input.value = parseInt(input.value) - 1;
    rowData[i] = input.value;
    saveTables();
  };

  const controls = document.createElement("div");
  controls.className = "change-controls";
  controls.appendChild(plus);
  controls.appendChild(minus);

  cell.appendChild(input);
  cell.appendChild(controls);
}

function createTableSkeleton(tableData, tIndex, hasFirstCol, isAnalysis = false) {
  const table = document.createElement("table");

  const titleRow = table.insertRow();
  const titleCell = document.createElement("th");
  titleCell.colSpan = (hasFirstCol ? 1 : 0) + tableData.columns.length;
  titleCell.contentEditable = true;
  titleCell.innerText = tableData.title;
  titleCell.oninput = () => {
    tableData.title = titleCell.innerText;
    saveTables();
  };
  titleRow.appendChild(titleCell);

  const headerRow = table.insertRow();
  if (hasFirstCol) {
    const th = document.createElement("th");
    th.innerText = isAnalysis ? "שם מדד" : "שם תרגיל";
    headerRow.appendChild(th);
  }
  tableData.columns.forEach((col, i) => {
    const th = document.createElement("th");
    th.contentEditable = true;
    th.innerText = col;
    th.oninput = () => {
      tableData.columns[i] = th.innerText;
      saveTables();
    };
    headerRow.appendChild(th);
  });

  return table;
}

function createTableControls(tableData, tIndex, hasFirstCol) {
  const group = document.createElement("div");
  group.className = "btn-controls-local";

  const addRow = document.createElement("button");
  addRow.innerText = "➕ הוסף שורה";
  addRow.className = "btn";
  addRow.onclick = () => {
    const newRow = hasFirstCol ? ["חדש"] : [""];
    tableData.columns.forEach(() => newRow.push("0"));
    tableData.rows.push(newRow);
    saveTables();
    renderTables();
  };

  const delRow = document.createElement("button");
  delRow.innerText = "➖ מחק שורה";
  delRow.className = "btn";
  delRow.onclick = () => {
    if (tableData.rows.length > 1) {
      tableData.rows.pop();
      saveTables();
      renderTables();
    }
  };

  const addCol = document.createElement("button");
  addCol.innerText = "➕ הוסף עמודה";
  addCol.className = "btn";
  addCol.onclick = () => {
    tableData.columns.push("עמודה " + (tableData.columns.length + 1));
    tableData.rows.forEach(r => r.push("0"));
    saveTables();
    renderTables();
  };

  const delCol = document.createElement("button");
  delCol.innerText = "➖ מחק עמודה";
  delCol.className = "btn";
  delCol.onclick = () => {
    if (tableData.columns.length > 1) {
      tableData.columns.pop();
      tableData.rows.forEach(r => r.pop());
      saveTables();
      renderTables();
    }
  };

  group.append(addRow, delRow, addCol, delCol);
  return group;
}

renderTables();
