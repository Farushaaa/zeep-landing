// Simplified script - only handles query parameters
// Extract referral code from URL
function getReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
}

// Detect platform
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

// Initialize the page
function init() {
    const referralCode = getReferralCode();

    if (!referralCode) {
        // Redirect to main website if no referral code
        setTimeout(() => {
            window.location.href = 'https://zeepapp.com';
        }, 2000);
        document.getElementById('statusText').textContent = 'No referral code found. Redirecting...';
        return;
    }

    console.log('Referral code found:', referralCode);

    // Set up store links
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
        } else {
            // App not installed - show download options after delay
            setTimeout(() => {
                loadingSpinner.style.display = 'none';
                statusText.style.display = 'none';
                noAppMessage.classList.remove('hidden');
            }, 1500);
        }
    });
}

function setupStoreLinks(referralCode) {
    const iosLink = document.getElementById('iosLink');
    const androidLink = document.getElementById('androidLink');

    iosLink.href = `https://apps.apple.com/app/zeep/id123456789?pt=${referralCode}&ct=referral`;
    androidLink.href = `https://play.google.com/store/apps/details?id=com.diarcode.zeepmobile&referrer=utm_source%3Dreferral%26utm_medium%3Dlink%26utm_campaign%3D${referralCode}`;
}

function tryOpenApp(referralCode) {
    return new Promise(function(resolve) {
        let appOpened = false;
        let resolved = false;
        const timeout = 2500;

        function resolveOnce(opened) {
            if (!resolved) {
                resolved = true;
                resolve(opened);
            }
        }

        // Detection mechanisms
        const handleVisibilityChange = function() {
            if (document.hidden || document.visibilityState === 'hidden') {
                appOpened = true;
                resolveOnce(true);
            }
        };

        const handlePageHide = function() {
            appOpened = true;
            resolveOnce(true);
        };

        const handleBlur = function() {
            appOpened = true;
            resolveOnce(true);
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('blur', handleBlur);

        // Cleanup function
        function cleanup() {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('blur', handleBlur);
        }

        // Try different methods based on platform
        if (isIOS()) {
            // For iOS, try universal link first
            const universalLink = `https://farushaaa.github.io/zeep-landing/?ref=${referralCode}`;
            window.location.href = universalLink;

            // Fallback to custom scheme after short delay
            setTimeout(() => {
                if (!appOpened && document.visibilityState === 'visible') {
                    window.location.href = `zeep://referral/${referralCode}`;
                }
            }, 800);

        } else if (isAndroid()) {
            // For Android, try intent first
            const intent = `intent://referral/${referralCode}#Intent;scheme=zeep;package=com.diarcode.zeepmobile;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.diarcode.zeepmobile;end`;

            try {
                window.location.href = intent;
            } catch (e) {
                // Fallback to custom scheme
                window.location.href = `zeep://referral/${referralCode}`;
            }

        } else {
            // Desktop - just resolve to show download options
            setTimeout(() => resolveOnce(false), 1000);
        }

        // Final timeout check
        setTimeout(() => {
            cleanup();
            if (!appOpened) {
                resolveOnce(false);
            }
        }, timeout);
    });
}

function trackReferralVisit(referralCode) {
    const trackingData = {
        referralCode: referralCode,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        source: 'landing_page',
        platform: isIOS() ? 'ios' : isAndroid() ? 'android' : 'web',
        url: window.location.href
    };

    fetch('https://api.zeepapp.com/track-referral', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
    }).catch(function(error) {
        console.log('Analytics tracking failed:', error);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);

// Also initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    init();
}