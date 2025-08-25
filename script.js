// Reliable and fast app detection script
function getReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('ref');
    console.log('📱 Referral code extracted:', code);
    return code;
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

function isMobile() {
    return isIOS() || isAndroid();
}

function init() {
    console.log('🚀 Initializing landing page...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('📱 Is Mobile:', isMobile());

    const referralCode = getReferralCode();

    if (!referralCode) {
        console.log('❌ No referral code found');
        showError('No referral code found');
        return;
    }

    console.log('✅ Referral code found:', referralCode);
    setupStoreLinks(referralCode);

    // Only try app detection on mobile devices
    if (isMobile()) {
        attemptAppOpen(referralCode);
    } else {
        console.log('💻 Desktop detected, showing download options');
        showDownloadOptions();
    }

    trackReferralVisit(referralCode);
}

function attemptAppOpen(referralCode) {
    console.log('📱 Attempting to open app...');

    const statusText = document.getElementById('statusText');
    const loadingSpinner = document.getElementById('loadingSpinner');

    statusText.textContent = 'Opening Zeep app...';

    // Much shorter timeout for faster user feedback
    const DETECTION_TIMEOUT = 2000; // 2 seconds instead of 3
    let appOpened = false;
    let timeoutId;

    // Simplified detection - just check if page becomes hidden
    function onAppOpen() {
        if (!appOpened) {
            console.log('✅ App opened successfully');
            appOpened = true;
            clearTimeout(timeoutId);
            statusText.textContent = 'Opening app...';
        }
    }

    // Only use the most reliable detection method
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            onAppOpen();
        }
    });

    // Try to open the app
    tryOpenApp(referralCode);

    // Show download options after timeout
    timeoutId = setTimeout(() => {
        if (!appOpened) {
            console.log('⏰ App detection timeout - showing download options');
            showDownloadOptions();
        }
    }, DETECTION_TIMEOUT);
}

function tryOpenApp(referralCode) {
    console.log('🎯 Trying to open app with code:', referralCode);

    if (isIOS()) {
        console.log('🍎 iOS detected - trying custom scheme');
        // For iOS, use custom scheme directly - it's more reliable
        window.location.href = `zeep://referral/${referralCode}`;

    } else if (isAndroid()) {
        console.log('🤖 Android detected - trying intent');
        // For Android, try intent URL first
        const intentUrl = `intent://referral/${referralCode}#Intent;scheme=zeep;package=com.diarcode.zeepmobile;end`;

        try {
            window.location.href = intentUrl;
        } catch (e) {
            console.log('⚠️ Intent failed, trying custom scheme');
            window.location.href = `zeep://referral/${referralCode}`;
        }
    }
}

function showDownloadOptions() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusText = document.getElementById('statusText');
    const noAppMessage = document.getElementById('noAppMessage');

    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (statusText) statusText.style.display = 'none';
    if (noAppMessage) noAppMessage.classList.remove('hidden');

    console.log('📥 Showing download options');
}

function showError(message) {
    const statusText = document.getElementById('statusText');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (statusText) statusText.textContent = message;
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    setTimeout(() => {
        window.location.href = 'https://zeepapp.com';
    }, 3000);
}

function setupStoreLinks(referralCode) {
    const iosLink = document.getElementById('iosLink');
    const androidLink = document.getElementById('androidLink');

    if (iosLink) {
        iosLink.href = `https://apps.apple.com/app/zeep/id123456789?pt=${referralCode}&ct=referral`;
        console.log('🔗 iOS App Store link set');
    }

    if (androidLink) {
        androidLink.href = `https://play.google.com/store/apps/details?id=com.diarcode.zeepmobile&referrer=utm_source%3Dreferral%26utm_medium%3Dlink%26utm_campaign%3D${referralCode}`;
        console.log('🔗 Android Play Store link set');
    }
}

function trackReferralVisit(referralCode) {
    console.log('📊 Tracking referral visit...');

    const trackingData = {
        referralCode: referralCode,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        source: 'landing_page',
        platform: isIOS() ? 'ios' : isAndroid() ? 'android' : 'web',
        url: window.location.href
    };

    // Use a more reliable tracking method
    if (navigator.sendBeacon) {
        // Use sendBeacon if available (more reliable)
        const blob = new Blob([JSON.stringify(trackingData)], { type: 'application/json' });
        navigator.sendBeacon('https://api.zeepapp.com/track-referral', blob);
    } else {
        // Fallback to fetch
        fetch('https://api.zeepapp.com/track-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData)
        }).catch(() => console.log('📊 Tracking failed (this is OK)'));
    }
}

// Add manual override button for testing
function addTestButton() {
    setTimeout(() => {
        const container = document.querySelector('.container');
        if (container) {
            const button = document.createElement('button');
            button.textContent = '🧪 Skip Detection (Test)';
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 15px;
                background: rgba(31, 137, 61, 0.9);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                z-index: 1000;
                backdrop-filter: blur(10px);
            `;
            button.onclick = () => {
                console.log('🧪 Manual override triggered');
                showDownloadOptions();
            };
            document.body.appendChild(button);
        }
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing...');
    init();
    addTestButton(); // Add test button for debugging
});

// Also run immediately if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('📄 DOM already ready, initializing...');
    init();
    addTestButton();
}

// Add a fallback initialization after 1 second
setTimeout(() => {
    const statusText = document.getElementById('statusText');
    if (statusText && statusText.textContent === 'Checking if you have the Zeep app...') {
        console.log('⚠️ Fallback initialization triggered');
        init();
    }
}, 1000);