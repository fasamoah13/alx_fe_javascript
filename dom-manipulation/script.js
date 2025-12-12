// -----------------------------
// Utilities: storage keys
// -----------------------------
const STORAGE_KEY_QUOTES = "quotes";
const STORAGE_KEY_SELECTED_CATEGORY = "selectedCategory";
const STORAGE_KEY_LAST_QUOTE = "lastViewedQuote";

// -----------------------------
// Default quotes (used if nothing in localStorage)
// -----------------------------
const defaultQuotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Mindset" }
];

// -----------------------------
// Load quotes from localStorage or fallback to defaults
// -----------------------------
let quotes = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!raw) return [...defaultQuotes];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...defaultQuotes];
  } catch (e) {
    console.warn("Failed to parse quotes from localStorage, using defaults.", e);
    return [...defaultQuotes];
  }
})();

// -----------------------------
// Save quotes to localStorage
// -----------------------------
function saveQuotesToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
}

// -----------------------------
// Populate categories dropdown dynamically
// -----------------------------
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  // Keep only "All Categories" as the first option, then add unique categories
  filter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category).filter(Boolean))].sort();

  categories.forEach(category => {
    const opt = document.createElement("option");
    opt.value = category;
    opt.textContent = category;
    filter.appendChild(opt);
  });

  // Restore last selected category (if any)
  const lastFilter = localStorage.getItem(STORAGE_KEY_SELECTED_CATEGORY);
  if (lastFilter) {
    // Only set if the option exists (defensive)
    const exists = Array.from(filter.options).some(o => o.value === lastFilter);
    filter.value = exists ? lastFilter : "all";
  } else {
    filter.value = "all";
  }
}

// -----------------------------
// Filter quotes based on selected category and persist the choice
// -----------------------------
function filterQuotes() {
  const filterValue = document.getElementById("categoryFilter").value;
  localStorage.setItem(STORAGE_KEY_SELECTED_CATEGORY, filterValue);

  // If "all", just show the instruction text
  if (filterValue === "all") {
    document.getElementById("quoteDisplay").textContent = "Showing all categories. Click 'Show New Quote'.";
    return;
  }

  // Show the first matching quote (so the user sees something immediately)
  const filtered = quotes.filter(q => q.category === filterValue);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes found for this category.";
  } else {
    const first = filtered[0];
    document.getElementById("quoteDisplay").textContent = `"${first.text}" — ${first.category}`;
  }
}

// -----------------------------
// Show a random quote (respects active filter)
// -----------------------------
function showRandomQuote() {
  const filterValue = document.getElementById("categoryFilter").value;
  const display = document.getElementById("quoteDisplay");

  let activeList = quotes;
  if (filterValue && filterValue !== "all") {
    activeList = quotes.filter(q => q.category === filterValue);
  }

  if (activeList.length === 0) {
    display.textContent = "No quotes available for this category.";
    return;
  }

  const idx = Math.floor(Math.random() * activeList.length);
  const q = activeList[idx];

  display.textContent = `"${q.text}" — ${q.category}`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem(STORAGE_KEY_LAST_QUOTE, JSON.stringify(q));
}

// -----------------------------
// Add a new quote and update storage + UI
// -----------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please fill both the quote text and the category.");
    return;
  }

  // push new quote
  quotes.push({ text, category });

  // persist changes
  saveQuotesToLocalStorage();

  // refresh categories and UI
  populateCategories();

  // clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully.");
}

// -----------------------------
// Export quotes to JSON file
// -----------------------------
function exportToJsonFile() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// -----------------------------
// Import quotes from JSON file (merge into existing quotes)
// -----------------------------
function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid file format: expected an array of quote objects.");
        return;
      }

      // Validate imported items (basic check)
      const validItems = imported.filter(item => item && typeof item.text === "string" && typeof item.category === "string");

      if (validItems.length === 0) {
        alert("No valid quotes found in the imported file.");
        return;
      }

      // Merge imported quotes into existing array
      quotes.push(...validItems);

      // Persist and update UI
      saveQuotesToLocalStorage();
      populateCategories();

      alert(`Imported ${validItems.length} quote(s) successfully.`);
    } catch (err) {
      console.error(err);
      alert("Error reading the file. Make sure it's valid JSON.");
    } finally {
      // Clear the input value so the same file can be imported again if needed
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

// -----------------------------
// Initialize page on load
// -----------------------------
function initialize() {
  populateCategories();

  // Restore last viewed quote from sessionStorage (if any)
  const last = sessionStorage.getItem(STORAGE_KEY_LAST_QUOTE);
  if (last) {
    try {
      const q = JSON.parse(last);
      if (q && q.text) {
        document.getElementById("quoteDisplay").textContent = `"${q.text}" — ${q.category}`;
      }
    } catch (e) {
      // ignore parse error
    }
  } else {
    // Show initial instruction
    document.getElementById("quoteDisplay").textContent = "Click 'Show New Quote' to begin.";
  }

  // Wire up event listeners
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

// Run initialize after DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
