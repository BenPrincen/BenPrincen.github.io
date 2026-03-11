const STORAGE_KEY = "spending-tracker-entries";
const CATEGORIES = [
  "Groceries",
  "Dining",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Travel",
  "Other",
];

const state = {
  entries: loadEntries(),
};

const modeButtons = document.querySelectorAll(".mode-button");
const modePanels = {
  entry: document.getElementById("entry-mode"),
  summary: document.getElementById("summary-mode"),
};
const spendingForm = document.getElementById("spending-form");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const spentAtInput = document.getElementById("spent-at");
const statusMessage = document.getElementById("status-message");
const recentEntries = document.getElementById("recent-entries");
const monthlyTotal = document.getElementById("monthly-total");
const monthlyCount = document.getElementById("monthly-count");
const topCategory = document.getElementById("top-category");
const chart = document.getElementById("chart");
const exportJsonButton = document.getElementById("export-json");
const exportCsvButton = document.getElementById("export-csv");
const importFileInput = document.getElementById("import-file");
const clearAllButton = document.getElementById("clear-all");

spentAtInput.value = todayForInput();
bindEvents();
render();

function bindEvents() {
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  spendingForm.addEventListener("submit", handleSubmit);
  exportJsonButton.addEventListener("click", () => exportEntries("json"));
  exportCsvButton.addEventListener("click", () => exportEntries("csv"));
  importFileInput.addEventListener("change", handleImport);
  clearAllButton.addEventListener("click", clearEntries);
}

function handleSubmit(event) {
  event.preventDefault();

  const amount = Number.parseFloat(amountInput.value);
  const category = normalizeCategory(categoryInput.value.trim());
  const spentAt = spentAtInput.value;

  if (!Number.isFinite(amount) || amount <= 0 || !category || !spentAt) {
    setStatus("Enter a valid amount, category, and date.", "error");
    return;
  }

  state.entries.unshift({
    id: crypto.randomUUID(),
    amount: Number(amount.toFixed(2)),
    category,
    spentAt,
    createdAt: new Date().toISOString(),
  });

  persistEntries();
  spendingForm.reset();
  spentAtInput.value = todayForInput();
  setStatus(`Saved ${formatCurrency(amount)} to ${category}.`);
  render();
}

function setMode(mode) {
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  Object.entries(modePanels).forEach(([key, panel]) => {
    panel.classList.toggle("hidden", key !== mode);
  });
}

function render() {
  renderEntries();
  renderSummary();
}

function renderEntries() {
  if (!state.entries.length) {
    recentEntries.className = "entries-list empty-state";
    recentEntries.textContent = "No spending has been logged yet.";
    return;
  }

  recentEntries.className = "entries-list";
  recentEntries.innerHTML = state.entries
    .slice(0, 8)
    .map(
      (entry) => `
        <article class="entry-card">
          <div class="entry-meta">
            <strong>${escapeHtml(entry.category)}</strong>
            <span>${formatDate(entry.spentAt)}</span>
          </div>
          <span class="entry-amount">${formatCurrency(entry.amount)}</span>
        </article>
      `
    )
    .join("");
}

function renderSummary() {
  const currentMonthEntries = getCurrentMonthEntries(state.entries);
  const total = currentMonthEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalsByCategory = currentMonthEntries.reduce((groups, entry) => {
    const key = entry.category.trim();
    groups[key] = (groups[key] || 0) + entry.amount;
    return groups;
  }, {});

  const categoryRows = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]);

  monthlyTotal.textContent = formatCurrency(total);
  monthlyCount.textContent = String(currentMonthEntries.length);
  topCategory.textContent = categoryRows.length
    ? `${categoryRows[0][0]} (${formatCurrency(categoryRows[0][1])})`
    : "None yet";

  if (!categoryRows.length) {
    chart.className = "chart empty-state";
    chart.textContent = "Add spending in the current month to see the chart.";
    return;
  }

  const topAmount = categoryRows[0][1];
  chart.className = "chart";
  chart.innerHTML = categoryRows
    .map(([category, amount]) => {
      const width = Math.max((amount / topAmount) * 100, 5);
      return `
        <div class="chart-row">
          <div class="chart-labels">
            <span>${escapeHtml(category)}</span>
            <span>${formatCurrency(amount)}</span>
          </div>
          <div class="chart-track">
            <div class="chart-bar" style="width: ${width}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function exportEntries(format) {
  if (!state.entries.length) {
    setStatus("There are no entries to export yet.", "error");
    return;
  }

  const content =
    format === "json" ? JSON.stringify(state.entries, null, 2) : convertToCsv(state.entries);
  const blob = new Blob([content], {
    type: format === "json" ? "application/json" : "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);

  downloadLink.href = url;
  downloadLink.download = `spending-${timestamp}.${format}`;
  downloadLink.click();
  URL.revokeObjectURL(url);
  setStatus(`Exported entries as ${format.toUpperCase()}.`);
}

async function handleImport(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const importedEntries = normalizeImportedEntries(
      file.name.endsWith(".csv") ? parseCsv(text) : JSON.parse(text)
    );

    state.entries = importedEntries
      .concat(state.entries)
      .reduce((uniqueEntries, entry) => {
        if (!uniqueEntries.some((saved) => saved.id === entry.id)) {
          uniqueEntries.push(entry);
        }
        return uniqueEntries;
      }, [])
      .sort((a, b) => new Date(b.spentAt) - new Date(a.spentAt));

    persistEntries();
    render();
    setStatus(`Imported ${importedEntries.length} entries from ${file.name}.`);
  } catch (error) {
    setStatus(`Import failed: ${error.message}`, "error");
  } finally {
    importFileInput.value = "";
  }
}

function clearEntries() {
  if (!state.entries.length) {
    setStatus("There are no entries to clear.", "error");
    return;
  }

  const confirmed = window.confirm("Delete all saved spending entries?");
  if (!confirmed) {
    return;
  }

  state.entries = [];
  persistEntries();
  render();
  setStatus("All entries cleared.");
}

function loadEntries() {
  try {
    const rawEntries = localStorage.getItem(STORAGE_KEY);
    if (!rawEntries) {
      return [];
    }

    return normalizeImportedEntries(JSON.parse(rawEntries));
  } catch (error) {
    console.error("Failed to load entries", error);
    return [];
  }
}

function persistEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
}

function normalizeImportedEntries(value) {
  if (!Array.isArray(value)) {
    throw new Error("Expected a list of entries.");
  }

  return value
    .map((entry) => {
      const amount = Number.parseFloat(entry.amount);
      const category = normalizeCategory(String(entry.category || "").trim());
      const spentAt = String(entry.spentAt || "").trim();

      if (!Number.isFinite(amount) || amount <= 0 || !category || !isIsoDate(spentAt)) {
        return null;
      }

      return {
        id: String(entry.id || crypto.randomUUID()),
        amount: Number(amount.toFixed(2)),
        category,
        spentAt,
        createdAt: entry.createdAt || new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  if (!headerLine) {
    return [];
  }

  const headers = headerLine.split(",").map((header) => header.trim());

  return lines
    .filter(Boolean)
    .map((line) => {
      const columns = splitCsvLine(line);
      const entry = {};

      headers.forEach((header, index) => {
        entry[header] = columns[index] || "";
      });

      return entry;
    });
}

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (const character of line) {
    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function convertToCsv(entries) {
  const headers = ["id", "amount", "category", "spentAt", "createdAt"];
  const rows = entries.map((entry) =>
    headers
      .map((header) => `"${String(entry[header] ?? "").replaceAll('"', '""')}"`)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function getCurrentMonthEntries(entries) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return entries.filter((entry) => {
    const entryDate = new Date(`${entry.spentAt}T00:00:00`);
    return (
      entryDate.getFullYear() === currentYear &&
      entryDate.getMonth() === currentMonth
    );
  });
}

function todayForInput() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

function normalizeCategory(value) {
  if (!value) {
    return "";
  }

  return CATEGORIES.includes(value) ? value : "Other";
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function setStatus(message, state = "success") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}
