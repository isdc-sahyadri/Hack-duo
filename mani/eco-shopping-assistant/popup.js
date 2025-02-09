document.addEventListener("DOMContentLoaded", function () {
    initializePopup();
});

/**
 * Initializes the popup by requesting product details from the content script.
 */
function initializePopup() {
    showLoading(true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) {
            showLoading(false);
            return showError("No active tab found.");
        }

        // First get product details from content script
        chrome.tabs.sendMessage(tabs[0].id, { action: "getProductDetails" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Chrome Runtime Error:", chrome.runtime.lastError);
                showLoading(false);
                return showError("Error communicating with content script.");
            }

            if (!response || !response.productName) {
                showLoading(false);
                return showError("Could not retrieve product details.");
            }

            // Update product details in UI
            updateProductDetails(response);

            // Now get sustainability data from background script
            chrome.runtime.sendMessage(
                { action: "analyzeProduct", productData: response },
                (sustainabilityData) => {
                    showLoading(false);
                    if (sustainabilityData) {
                        updateSustainabilityUI(sustainabilityData);
                    } else {
                        showError("Failed to fetch sustainability data.");
                    }
                }
            );
        });
    });
}

function updateProductDetails(details) {
    document.getElementById("product-name").textContent = details.productName;
    document.getElementById("product-price").textContent = 
        details.productPrice !== "N/A" ? `$${details.productPrice}` : "N/A";
}

function updateSustainabilityUI(data) {
    // Update sustainability score
    const scoreElement = document.querySelector("#sustainability-score .score-value");
    if (scoreElement) {
        scoreElement.textContent = data.score;
    }

    // Update score breakdown
    document.getElementById("materials-score").textContent = `${data.materials_score}%`;
    document.getElementById("energy-score").textContent = `${data.energy_score}%`;
    document.getElementById("ethics-score").textContent = `${data.ethics_score}%`;

    // Update eco badges
    const badgesContainer = document.getElementById("eco-badges");
    badgesContainer.innerHTML = data.badges.map(badge => `
        <span class="eco-badge ${badge.achieved ? 'achieved' : ''}">
            ${badge.name}
        </span>
    `).join('');

    // Update carbon footprint
    const footprintElement = document.getElementById("carbon-footprint");
    footprintElement.textContent = `${data.carbonFootprint.value} ${data.carbonFootprint.unit}`;

    // Update alternatives
    const alternativesContainer = document.getElementById("alternative-list");
    if (data.alternatives.length > 0) {
        alternativesContainer.innerHTML = data.alternatives.map(alt => `
            <div class="alternative-item">
                <p>${alt}</p>
            </div>
        `).join('');
    } else {
        alternativesContainer.innerHTML = '<p>No alternatives found</p>';
    }
}

/**
 * Shows a loading state in the UI.
 */
function showLoading(isLoading) {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.classList.toggle("hidden", !isLoading);
    }
}

/**
 * Displays an error message in the popup.
 */
function showError(message) {
    const container = document.getElementById("container");
    if (container) {
        container.innerHTML += `<p class="error-message" style="color: red;">${message}</p>`;
    }
}

function sendMessageWithRetry(tabId, message, retries = 5) {
    if (retries === 0) {
        showError("❌ Could not establish connection with content script.");
        return;
    }

    chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Retrying...", retries);
            setTimeout(() => sendMessageWithRetry(tabId, message, retries - 1), 500);
        } else {
            updateUI(response.productName, response.productPrice);
        }
    });
}
