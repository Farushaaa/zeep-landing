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
        const startTime = Date.now();
        const timeout = 3000; // Increased timeout for better detection
        let appOpened = false;

        // Create detection mechanisms
        const beforeUnload = function() {
            appOpened = true;
            resolve(true);
        };

        const visibilityChange = function() {
            if (document.hidden) {
                appOpened = true;
                resolve(true);
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', beforeUnload);
        document.addEventListener('visibilitychange', visibilityChange);

        // Try universal link first (works better on newer devices)
        const universalLink = `https://zeepapp.com/referral/${referralCode}`;
        window.location.href = universalLink;

        // Fallback to custom scheme after delay
        setTimeout(function() {
            if (!appOpened && document.visibilityState === 'visible') {
                const customScheme = `zeep://referral/${referralCode}`;
                window.location.href = customScheme;
            }
        }, 1000);

        // Final check after timeout
        setTimeout(function() {
            window.removeEventListener('beforeunload', beforeUnload);
            document.removeEventListener('visibilitychange', visibilityChange);

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