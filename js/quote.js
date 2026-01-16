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

// Refresh every 3 hours
setInterval(fetchQuote, 10800000);
