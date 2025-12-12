// -------------------------------------
// Load quotes from localStorage OR use defaults
// -------------------------------------

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Mindset" }
];

// -------------------------------------
// Save quotes to localStorage
// -------------------------------------
function saveQuotesToLocalStorage() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------------------------
// Show Random Quote
// -------------------------------------
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const random = Math.floor(Math.random() * quotes.length);
  const quote = quotes[random];

  display.textContent = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// -------------------------------------
// Add Quote
// -------------------------------------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill both fields");
    return;
  }

  quotes.push({ text, category });

  // save to local storage
  saveQuotesToLocalStorage();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added!");
}

// -------------------------------------
// EXPORT QUOTES TO JSON FILE
// -------------------------------------
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

// -------------------------------------
// IMPORT QUOTES FROM JSON FILE
// -------------------------------------
function importFromJsonFile(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format");
        return;
      }

      quotes = importedQuotes;

      // Save imported quotes to localStorage
      saveQuotesToLocalStorage();

      alert("Quotes imported successfully!");

    } catch (err) {
      alert("Error reading file");
    }
  };

  reader.readAsText(file);
}

// -------------------------------------
// EVENT LISTENERS
// -------------------------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// -------------------------------------
// Load last viewed quote from sessionStorage (optional)
// -------------------------------------
window.onload = () => {
  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").textContent =
      `"${q.text}" — ${q.category}`;
  }
};
