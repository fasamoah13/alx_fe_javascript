// -----------------------------
// Storage keys
// -----------------------------
const STORAGE_KEY_QUOTES = "quotes";
const STORAGE_KEY_SELECTED_CATEGORY = "selectedCategory";
const STORAGE_KEY_LAST_QUOTE = "lastViewedQuote";

// -----------------------------
// Default quotes
// -----------------------------
const defaultQuotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Mindset" }
];

// -----------------------------
// Load quotes from localStorage
// -----------------------------
let quotes = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!stored) return [...defaultQuotes];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [...defaultQuotes];
  } catch {
    return [...defaultQuotes];
  }
})();

// -----------------------------
// Save quotes
// -----------------------------
function saveQuotesToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
}

// -----------------------------
// Populate category dropdown dynamically
// -----------------------------
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  filter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category).filter(Boolean))].sort();
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem(STORAGE_KEY_SELECTED_CATEGORY);
  if (lastFilter && Array.from(filter.options).some(o => o.value === lastFilter)) {
    filter.value = lastFilter;
    filterQuotes();
  } else {
    filter.value = "all";
  }
}

// -----------------------------
// Filter quotes
// -----------------------------
function filterQuotes() {
  const filterValue = document.getElementById("categoryFilter").value;
  localStorage.setItem(STORAGE_KEY_SELECTED_CATEGORY, filterValue);

  if (filterValue === "all") {
    document.getElementById("quoteDisplay").textContent =
      "Showing all categories. Click 'Show New Quote'.";
    return;
  }

  const filtered = quotes.filter(q => q.category === filterValue);
  document.getElementById("quoteDisplay").textContent =
    filtered.length > 0
      ? `"${filtered[0].text}" — ${filtered[0].category}`
      : "No quotes found for this category.";
}

// -----------------------------
// Show random quote (respects filter)
// -----------------------------
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

  const q = activeQuotes[Math.floor(Math.random() * activeQuotes.length)];
  display.textContent = `"${q.text}" — ${q.category}`;
  sessionStorage.setItem(STORAGE_KEY_LAST_QUOTE, JSON.stringify(q));
}

// -----------------------------
// Add new quote
// -----------------------------
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill both fields");
    return;
  }

  quotes.push({ text, category });
  saveQuotesToLocalStorage();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

// -----------------------------
// Export quotes to JSON
// -----------------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

// -----------------------------
// Import quotes from JSON
// -----------------------------
function importFromJsonFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON");

      const valid = imported.filter(i => i?.text && i?.category);
      quotes.push(...valid);
      saveQuotesToLocalStorage();
      populateCategories();
      alert(`Imported ${valid.length} quotes successfully`);
    } catch {
      alert("Failed to import quotes. Make sure it's valid JSON.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// -----------------------------
// UI notification
// -----------------------------
function notifyUser(message) {
  let notif = document.getElementById("serverNotification");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "serverNotification";
    notif.style.backgroundColor = "#fffae6";
    notif.style.border = "1px solid #ffd700";
    notif.style.padding = "10px";
    notif.style.marginBottom = "10px";
    document.body.insertBefore(notif, document.body.firstChild);
  }
  notif.textContent = message;
  setTimeout(() => (notif.textContent = ""), 5000);
}

// -----------------------------
// Server functions
// -----------------------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_URL);
  if (!res.ok) throw new Error("Failed to fetch server data");
  const data = await res.json();
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: post.body || "Server"
  }));
}

async function postQuotesToServer(quotesToPost) {
  await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotesToPost)
  });
}

// -----------------------------
// Sync quotes (fetch + merge + post + conflict resolution)
// -----------------------------
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    serverQuotes.forEach(sq => {
      const idx = quotes.findIndex(lq => lq.text === sq.text);
      if (idx === -1) {
        quotes.push(sq);
        updated = true;
      } else if (quotes[idx].category !== sq.category) {
        quotes[idx].category = sq.category;
        updated = true;
      }
    });

    if (updated) {
      saveQuotesToLocalStorage();
      populateCategories();
      notifyUser("Quotes synced with server!");
    }

    await postQuotesToServer(quotes);

  } catch (err) {
    console.error("Sync failed:", err);
    notifyUser("Server sync failed.");
  }
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// -----------------------------
// Initialize page
// -----------------------------
function initialize() {
  populateCategories();

  const lastQuote = sessionStorage.getItem(STORAGE_KEY_LAST_QUOTE);
  if (lastQuote) {
    try {
      const q = JSON.parse(lastQuote);
      document.getElementById("quoteDisplay").textContent = `"${q.text}" — ${q.category}`;
    } catch {}
  } else {
    document.getElementById("quoteDisplay").textContent = "Click 'Show New Quote' to begin.";
  }

  // Event listeners
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
