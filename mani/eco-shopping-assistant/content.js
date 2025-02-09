function getProductDetails() {
    console.log("🔍 Attempting to extract product details...");

    // Extracting product name
    let productName = document.querySelector("#productTitle, h1")?.innerText?.trim() || "Unknown Product";

    if (productName !== "Unknown Product") {
        productName = productName.replace(/\s+/g, " "); // Normalize spaces
        console.log("✅ Extracted Product Name:", productName);
    } else {
        console.warn("⚠️ Product name not found.");
    }

    // Possible price selectors for different e-commerce sites
    let priceSelectors = [
        ".a-price .a-offscreen", "#price_inside_buybox", "#priceblock_ourprice",
        "#priceblock_dealprice", ".price", ".product-price", ".price-tag",
        "[data-price]", ".a-size-medium.a-color-price", ".priceView-hero-price span",
        ".product-price__current-price"
    ];

    let productPrice = "N/A";

    for (let selector of priceSelectors) {
        let priceElement = document.querySelector(selector);
        if (priceElement) {
            productPrice = priceElement.innerText.match(/[\d.,]+/)?.[0] || "N/A";
            console.log("✅ Extracted Product Price:", productPrice);
            break;
        }
    }

    if (productPrice === "N/A") {
        console.warn("⚠️ Could not extract product price.");
    }

    // Extract product description and specifications
    const description = document.querySelector("#productDescription, .product-description")?.innerText?.trim() || "";
    
    // Extract product materials and specifications
    const specifications = Array.from(document.querySelectorAll("#productDetails_techSpec_section_1 tr, #detailBullets_feature_div li"))
        .map(row => ({
            label: row.querySelector("th, span:first-child")?.innerText?.trim() || "",
            value: row.querySelector("td, span:last-child")?.innerText?.trim() || ""
        }))
        .filter(spec => spec.label && spec.value);

    // Extract product brand
    const brand = document.querySelector("#bylineInfo, .product-brand")?.innerText?.trim() || "Unknown Brand";

    // Extract product category
    const breadcrumbs = Array.from(document.querySelectorAll("#wayfinding-breadcrumbs_container a, .breadcrumb a"))
        .map(a => a.innerText.trim());
    const category = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1] : "Unknown Category";

    // Extract product images
    const imageUrls = Array.from(document.querySelectorAll("#imgBlkFront, #landingImage, .product-image"))
        .map(img => img.src)
        .filter(Boolean);

    return {
        productName,
        productPrice,
        description,
        specifications,
        brand,
        category,
        imageUrls,
        url: window.location.href
    };
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProductDetails") {
        console.log("📩 Received request for product details...");
        const productDetails = getProductDetails();
        sendResponse(productDetails);
    } else if (request.action === "injectSustainabilityBadges") {
        injectSustainabilityUI(request.data);
        sendResponse({ success: true });
    } else if (request.action === "testMessage") {
        console.log("✅ Content script received a message!");
        sendResponse({ message: "Hello from content script!" });
    }
    return true; // Keep message channel open
});

// Function to inject sustainability UI elements
function injectSustainabilityUI(sustainabilityData) {
    // Create sustainability badge container
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'eco-badges-container';
    badgeContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 9999;
    `;

    // Add sustainability score
    const scoreElement = document.createElement('div');
    scoreElement.innerHTML = `
        <h3>Sustainability Score: ${sustainabilityData.score}/100</h3>
        <div class="eco-badges">
            ${sustainabilityData.badges.map(badge => `
                <span class="eco-badge ${badge.achieved ? 'achieved' : ''}">
                    ${badge.name}
                </span>
            `).join('')}
        </div>
    `;

    badgeContainer.appendChild(scoreElement);
    document.body.appendChild(badgeContainer);
}
