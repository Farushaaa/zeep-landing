// Extract referral code from URL
function getReferralCode() {
    const path = window.location.pathname;
    const match = path.match(/\/referral\/([^\/\?]+)/);
    return match ? match[1] : null;
}

// Detect platform
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

// Initialize the page - Auto redirect for app users
function init() {
    const referralCode = getReferralCode();

    if (!referralCode) {
        window.location.href = 'https://zeepapp.com';
        return;
    }

    console.log('Referral code:', referralCode);

    // Set up store links (in case we need them)
    setupStoreLinks(referralCode);

    // Auto-attempt to open app
    autoRedirectToApp(referralCode);

    // Track the referral visit
    trackReferralVisit(referralCode);
}

function autoRedirectToApp(referralCode) {
    const statusText = document.getElementById('statusText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noAppMessage = document.getElementById('noAppMessage');

    statusText.textContent = 'Opening Zeep app...';

    // Try to open the app immediately
    tryOpenApp(referralCode).then(function(appOpened) {
        if (appOpened) {
            statusText.textContent = 'Redirecting to app...';
            // App opened successfully - we're done!
        } else {
            // App not installed - show message
            loadingSpinner.style.display = 'none';
            statusText.style.display = 'none';
            noAppMessage.classList.remove('hidden');
        }
    });
}

function setupStoreLinks(referralCode) {
    const iosLink = document.getElementById('iosLink');
    const androidLink = document.getElementById('androidLink');

    // Replace with your actual app store URLs
    iosLink.href = `https://apps.apple.com/app/zeep/id123456789?pt=${referralCode}`;
    androidLink.href = `https://play.google.com/store/apps/details?id=com.diarcode.zeepmobile&referrer=utm_source%3Dreferral%26utm_content%3D${referralCode}`;
}

function tryOpenApp(referralCode) {
    return new Promise(function(resolve) {
        const timeout = 3000;
        let appOpened = false;

        // Skip universal link, go straight to custom scheme
        const customScheme = `zeep://referral/${referralCode}`;
        window.location.href = customScheme;

        // Rest of your detection logic...
        setTimeout(function() {
            if (!appOpened) {
                resolve(false);
            }
        }, timeout);
    });
}

function trackReferralVisit(referralCode) {
    // Track the referral visit to your analytics
    // You can use Google Analytics, Mixpanel, or your own API

    // Example with a simple API call:
    fetch(`https://api.zeepapp.com/track-referral`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            referralCode: referralCode,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            source: 'landing_page'
        })
    }).catch(function(error) {
        console.log('Analytics tracking failed:', error);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);