// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log("🟢 Eco-Friendly Shopping Assistant Installed or Updated!");
    
    // Initialize storage with default settings
    chrome.storage.local.set({
        enabledFeatures: {
            productAnalysis: true,
            alternativeSuggestions: true,
            ecoBadges: true,
            carbonFootprint: true
        },
        sustainabilityMetrics: {
            ecoFriendlyMaterials: [],
            energyEfficiency: [],
            ethicalManufacturing: [],
            carbonFootprint: []
        }
    });
});

// Listen for messages from content or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📩 Background received message:", message);

    switch (message.action) {
        case "analyzeProduct":
            // Pass the product data to generate relevant mock data
            sendResponse(getMockSustainabilityData(message.productData));
            break;
            
        case "getAlternatives":
            fetchEcoFriendlyAlternatives(message.productType, sendResponse);
            break;
            
        case "updateEcoBadges":
            updateProductBadges(message.productData, sendResponse);
            break;
            
        case "calculateCarbonFootprint":
            calculateProductFootprint(message.productData, sendResponse);
            break;

        case "testMessage":
            console.log("✅ Responding to testMessage...");
            sendResponse({ message: "Hello from background script!" });
            break;
    }

    return true; // Keep message channel open for async response
});

// Handle product sustainability analysis
async function handleProductAnalysis(productData, sendResponse) {
    try {
        // TODO: Implement API call to sustainability database
        const sustainabilityScore = await analyzeSustainability(productData);
        sendResponse({
            success: true,
            sustainabilityScore,
            recommendations: generateRecommendations(sustainabilityScore)
        });
    } catch (error) {
        console.error("❌ Product analysis error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Fetch eco-friendly alternatives
async function fetchEcoFriendlyAlternatives(productType, sendResponse) {
    try {
        // TODO: Implement API call to eco-friendly products database
        const alternatives = await searchEcoAlternatives(productType);
        sendResponse({ success: true, alternatives });
    } catch (error) {
        console.error("❌ Alternative search error:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Update eco badges for a product
function updateProductBadges(productData, sendResponse) {
    const badges = {
        isRecyclable: checkRecyclability(productData),
        isPlasticFree: checkPlasticContent(productData),
        isCrueltyFree: checkCrueltyFree(productData)
    };
    sendResponse({ success: true, badges });
}

// Calculate product carbon footprint
function calculateProductFootprint(productData, sendResponse) {
    // TODO: Implement carbon footprint calculation logic
    const footprint = estimateCarbonFootprint(productData);
    sendResponse({ success: true, carbonFootprint: footprint });
}

// Placeholder functions for actual implementation
function analyzeSustainability(productData) {
    return new Promise(resolve => resolve({ score: 85 }));
}

function searchEcoAlternatives(productType) {
    return new Promise(resolve => resolve([]));
}

function generateRecommendations(sustainabilityScore) {
    return [];
}

function checkRecyclability(productData) {
    return true;
}

function checkPlasticContent(productData) {
    return true;
}

function checkCrueltyFree(productData) {
    return true;
}

function estimateCarbonFootprint(productData) {
    return { value: 0, unit: 'kg CO2e' };
}

// Modify the getMockSustainabilityData function to use product data
function getMockSustainabilityData(productData) {
    // Generate a pseudo-random score based on product name
    const generateScore = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        // Convert hash to number between 0 and 100
        return Math.abs(hash % 101);
    };

    const productName = productData.productName || "";
    const baseScore = generateScore(productName);
    
    // Generate different scores for different aspects
    const materialsScore = Math.min(100, Math.max(0, baseScore + (Math.random() * 20 - 10)));
    const energyScore = Math.min(100, Math.max(0, baseScore + (Math.random() * 20 - 10)));
    const ethicsScore = Math.min(100, Math.max(0, baseScore + (Math.random() * 20 - 10)));

    // Determine badges based on scores
    const badges = [
        { 
            name: "Recyclable", 
            achieved: materialsScore > 70 
        },
        { 
            name: "Plastic-Free", 
            achieved: materialsScore > 80 
        },
        { 
            name: "Cruelty-Free", 
            achieved: ethicsScore > 75 
        },
        { 
            name: "Energy-Efficient", 
            achieved: energyScore > 70 
        },
        { 
            name: "Sustainable Materials", 
            achieved: materialsScore > 85 
        }
    ];

    // Calculate carbon footprint based on scores
    const carbonValue = (100 - ((materialsScore + energyScore) / 2)) / 4;

    // Generate alternatives based on product category
    const alternatives = generateAlternatives(productData.category, productData.brand);

    return {
        score: Math.round(baseScore),
        badges,
        materials_score: Math.round(materialsScore),
        energy_score: Math.round(energyScore),
        ethics_score: Math.round(ethicsScore),
        carbonFootprint: {
            value: carbonValue.toFixed(1),
            unit: "kg CO2e"
        },
        alternatives
    };
}

// Helper function to generate relevant alternatives
function generateAlternatives(category, brand) {
    const ecoFriendlyBrands = {
        'Electronics': ['Fairphone', 'Framework', 'House of Marley'],
        'Clothing': ['Patagonia', 'Reformation', 'Everlane'],
        'Home': ['Avocado Green', 'Seventh Generation', 'Grove Collaborative'],
        'Beauty': ['Lush', 'RMS Beauty', 'Beautycounter'],
        'Food': ['Beyond Meat', 'Impossible Foods', 'Just Egg']
    };

    const defaultBrands = ['Eco-friendly Alternative 1', 'Sustainable Option 2', 'Green Choice 3'];
    const categoryBrands = ecoFriendlyBrands[category] || defaultBrands;

    return categoryBrands.map(altBrand => 
        `${altBrand} - Sustainable ${category || 'Product'}`
    );
}
