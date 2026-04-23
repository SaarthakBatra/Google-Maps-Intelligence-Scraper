/**
 * Google Maps CSS Selectors (Updated for robustness)
 * Centralized selector management for easy maintenance
 * @module scraper/selectors
 */

/**
 * Selectors for Google Maps elements (as of Feb 2026)
 * Note: Google may change their UI structure periodically
 */
const SELECTORS = {
    // Search and Results
    RESULTS_CONTAINER: 'div[role="feed"]',
    LISTING_CARD: 'div[role="article"]',
    LISTING_LINK: 'a[href*="/maps/place/"]',

    // Sponsored Label
    SPONSORED_LABEL: '[aria-label="Sponsored"], .kpih0e.uvopNe',

    // Details Panel
    // Specific role="main" that DOES NOT contain the results feed
    DETAILS_PANEL: 'div[role="main"]:not(:has(div[role="feed"]))',
    DETAILS_CONTAINER: 'div.m6QErb.DxyBCb',

    // Robust Business Name Selectors (in order of preference)
    BUSINESS_NAME_SELECTORS: [
        'h1.DUwDvf',                // Primary (most common)
        'h1[class*="DUwDvf"]',      // Partial match
        'div[role="main"] h1',      // Structure based
        '.TIHn2 h1',                // Container based
        'h1'                        // Fallback (context scoped)
    ],
    // Primary for backward compatibility
    BUSINESS_NAME: 'h1.DUwDvf',

    BUSINESS_ADDRESS: 'button[data-item-id="address"]',
    BUSINESS_PHONE: 'button[data-item-id*="phone"]',
    BUSINESS_WEBSITE: 'a[data-item-id="authority"]',
    BUSINESS_HOURS: 'button[data-item-id="oh"]',
    BUSINESS_RATING: 'div.F7nice span[aria-hidden="true"]',
    BUSINESS_REVIEWS_COUNT: 'div.F7nice span[aria-label*="reviews"]',
    BUSINESS_TYPE: 'button.DkEaL',
    SPONSORED_LABEL: 'h1[aria-label="Sponsored"], .kpih0e[aria-label="Sponsored"]', // Added based on debug HTML

    // Reviews Section
    REVIEWS_TAB: 'button[role="tab"][aria-label*="Reviews"], button:has-text("Reviews"), button[role="tab"][data-tab-index="2"], button[role="tab"][data-tab-index="1"]',
    TAB_LIST: 'div[role="tablist"]', // Container for tabs, useful for waiting
    SORT_BUTTON: 'button[data-value="Sort"], button[aria-label*="Sort reviews"]',
    SORT_MENU_OPTIONS: {
        'highest': 'div[role="menuitemradio"] div:has-text("Highest rating")',
        'lowest': 'div[role="menuitemradio"] div:has-text("Lowest rating")',
        'newest': 'div[role="menuitemradio"] div:has-text("Newest")',
    },
    REVIEWS_CONTAINER: 'div.m6QErb', // Same class as details container but inside the reviews tab context
    REVIEW_ITEM: 'div.jftiEf', // Individual review card container

    // Navigation and Modals
    CONSENT_BUTTON: 'button:has-text("Accept all"), button:has-text("I agree")',
    REJECT_BUTTON: 'button:has-text("Reject all")',
    BACK_BUTTON: 'button[aria-label*="Back"]',
    CLOSE_BUTTON: 'button[aria-label*="Close"]',

    // CAPTCHA and Error Detection
    CAPTCHA_CONTAINER: 'div#captcha, iframe[src*="recaptcha"]',
    ERROR_MESSAGE: 'div.error, div[role="alert"]',

    // Scroll and Loading
    END_OF_RESULTS: 'p:has-text("You\'ve reached the end")',
    LOADING_SPINNER: 'div[role="progressbar"]',

    // Search Input
    SEARCH_INPUT: 'input#searchboxinput',
    SEARCH_BUTTON: 'button#searchbox-searchbutton',
};

/**
 * Helper function to build composite selectors
 * @param {string} container - Container selector
 * @param {string} child - Child selector
 * @returns {string} Combined selector
 */
export function buildSelector(container, child) {
    return `${container} ${child}`;
}

export default SELECTORS;
