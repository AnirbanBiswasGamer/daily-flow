const quoteWidget = document.getElementById("quote-widget");

function fetchQuote() {
    if (!quoteWidget) return;

    // Visual loading state
    quoteWidget.style.opacity = "0.5";

    // Quotable API - selecting tags for productivity/wisdom
    fetch('https://api.quotable.io/quotes/random?tags=productivity|wisdom|inspirational|success')
        .then(res => {
            if (!res.ok) throw new Error("Quote API failed");
            return res.json();
        })
        .then(data => {
            // API returns an Array for /quotes/random
            const quote = Array.isArray(data) ? data[0] : data;

            quoteWidget.innerHTML = `
        <div class="quote-text">"${quote.content}"</div>
        <div class="quote-author">— ${quote.author}</div>
      `;
            quoteWidget.style.opacity = "1";
        })
        .catch(err => {
            console.warn("Quote fetch error", err);
            // Fallback Quote
            quoteWidget.innerHTML = `
        <div class="quote-text">"Action is the foundational key to all success."</div>
        <div class="quote-author">— Picasso</div>
      `;
            quoteWidget.style.opacity = "1";
        });
}

// Refresh on click
if (quoteWidget) {
    quoteWidget.title = "Click for new quote";
    quoteWidget.style.cursor = "pointer";
    quoteWidget.addEventListener("click", fetchQuote);
}

// Initial fetch
fetchQuote();

// Refresh Interval Logic
let quoteIntervalFn;

window.updateQuoteInterval = function (selectionIndex) {
    // Map index to milliseconds
    // 0: 1 Hour, 1: 3 Hours, 2: 6 Hours, 3: 1 Day
    const intervals = [3600000, 10800000, 21600000, 86400000];
    const ms = intervals[selectionIndex] || 10800000;

    if (quoteIntervalFn) clearInterval(quoteIntervalFn);
    quoteIntervalFn = setInterval(fetchQuote, ms);
    console.log("Quote Interval Updated:", ms);
};

// Initial Start (Default 3h = Index 1)
window.updateQuoteInterval(1);
