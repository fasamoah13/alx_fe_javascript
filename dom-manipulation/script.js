// -------------------------------------
// QUOTES ARRAY
// -------------------------------------

let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Success is not final; failure is not fatal.", category: "Success" },
  { text: "Believe you can and you're halfway there.", category: "Mindset" }
];


// -------------------------------------
// FUNCTION: Show a Random Quote
// -------------------------------------
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  // pick random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // update DOM
  quoteDisplay.textContent = `"${randomQuote.text}" — (${randomQuote.category})`;
}


// -------------------------------------
// FUNCTION: Add New Quote
// -------------------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newQuoteText = textInput.value.trim();
  const newQuoteCategory = categoryInput.value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please fill in both fields.");
    return;
  }

  // Add to the quotes array
  quotes.push({
    text: newQuoteText,
    category: newQuoteCategory
  });

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}


// -------------------------------------
// EVENT LISTENERS
// -------------------------------------

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

