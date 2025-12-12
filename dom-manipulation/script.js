// ---------------------------------------------
// LOAD QUOTES (FROM LOCAL STORAGE OR DEFAULT)
// ---------------------------------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Mindset" }
];

// ---------------------------------------------
// SAVE QUOTES
// ---------------------------------------------
function saveQuotesToLocalStorage() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------------------------------------------
// POPULATE CATEGORY DROPDOWN
// ---------------------------------------------
function populateCategories() {
  const filter = document.getElementById("categoryFilter");

  // clear old options except "All"
  filter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const opt = document.createElement("option");
    opt.value = category;
    opt.textContent = category;
    filter.appendChild(opt);
  });

  // Restore last selected category
  const lastFilter = localStorage.getItem("selectedCategory");
  if (lastFilter) {
    filter.value = lastFilter;
    filterQuotes();
  }
}

// ---------------------------------------------
// FILTER QUOTES BY CATEGORY
// ---------------------------------------------
function filterQuotes() {
  const filterValue = document.getElementById("categoryFilter").value;

  // Save filter to localStorage
  localStorage.setItem("selectedCategory", filterValue);

  if (filterValue === "all") {
    document.getElementById("quoteDisplay").textContent =
      "Showing all categories. Click 'Show New Quote'.";
    return;
  }

  const filtered = quotes.filter(q => q.category === filterValue);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent =
      "No quotes found for this category.";
  } else {
    const firstQuote = filtered[0];
    document.getElementById("quoteDisplay").textContent =
      `"${firstQuote.text}" — ${firstQuote.category}`;
  }
}

// ---------------------------------------------
// SHOW RANDOM QUOTE (RESPECTING FILTER)
// ---------------------------------------------
function showRandomQuote() {
  const filterValue = document.getElementById("categoryFilter").value;
  const display = document.getElementById("quoteDisplay");

  let activeQuotes = quotes;

  if (filterValue !== "all") {
    activeQuotes = quotes.filter(q => q.category === filterValue);
  }

  if (activeQuotes.length === 0) {
    display.textContent = "No quotes available for this category.";
    return;
  }

  const random = Math.floor(Math.random() * activeQuotes.length);
  const quote = activeQuotes[random];

  display.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// ---------------------------------------------
// ADD NEW QUOTE
// ---------------------------------------------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill both fields");
    return;
  }

  quotes.push({ text, category });

  saveQuotesToLocalStorage();
  populateCategories(); // update dropdown automatically

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added!");
}

// ---------------------------------------------
// EXPORT QUOTES
// ---------------------------------------------
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ---------------------------------------------
// IMPORT QUOTES
// ---------------------------------------------
function importFromJsonFile(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid file format");
        return;
      }

      quotes = imported;

      saveQuotesToLocalStorage();
      populateCategories();

      alert("Quotes imported successfully!");
    } catch {
      alert("Error reading file");
    }
  };

  reader.readAsText(file);
}

// ---------------------------------------------
// INITIALIZE ON PAGE LOAD
// ---------------------------------------------
window.onload = () => {
  populateCategories();

  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").textContent =
      `"${q.text}" — ${q.category}`;
  }
};

// ---------------------------------------------
// EVENT LISTENERS
// ---------------------------------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
