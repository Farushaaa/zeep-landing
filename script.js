// Enhanced referral landing script with Expo Go support
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

// 🆕 Development mode detection
function isDevelopmentMode() {
    // You can control this via URL parameter or always true during development
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dev') === 'true' || window.location.hostname.includes('github.io');
}

function init() {
    console.log('🚀 Initializing landing page...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('📱 Is Mobile:', isMobile());
    console.log('🚧 Development Mode:', isDevelopmentMode());

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

    // Update status based on development mode
    if (isDevelopmentMode()) {
        statusText.textContent = 'Opening Expo Go...';
    } else {
        statusText.textContent = 'Opening Zeep app...';
    }

    const DETECTION_TIMEOUT = 2500; // Slightly longer for Expo Go
    let appOpened = false;
    let timeoutId;

    function onAppOpen() {
        if (!appOpened) {
            console.log('✅ App opened successfully');
            appOpened = true;
            clearTimeout(timeoutId);
            statusText.textContent = isDevelopmentMode() ? 'Opening in Expo Go...' : 'Opening app...';
        }
    }

    // Detection method
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

    if (isDevelopmentMode()) {
        // 🆕 Development mode: Open via Expo Go
        console.log('🚧 Development mode - opening via Expo Go');
        tryOpenExpoGo(referralCode);
    } else {
        // Production mode: Use custom scheme
        tryOpenProductionApp(referralCode);
    }
}

function tryOpenExpoGo(referralCode) {
    // Your Expo project URL - replace with your actual project details
    const EXPO_PROJECT_ID = '8fb828ae-8f7e-44a8-aa5f-0947e91a6b99'; // From your app.json
    const EXPO_PROJECT_SLUG = 'zeep'; // From your app.json

    if (isIOS()) {
        console.log('🍎 iOS + Expo Go');

        // Method 1: Try Expo Go universal link with deep link
        const expoUniversalLink = `https://expo.dev/--/to-exp/exp://exp.host/@${getExpoUsername()}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}`;

        // Method 2: Direct Expo Go scheme
        const expoSchemeUrl = `exp://exp.host/@${getExpoUsername()}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}`;

        // Try universal link first
        window.location.href = expoUniversalLink;

        // Fallback to scheme after delay
        setTimeout(() => {
            window.location.href = expoSchemeUrl;
        }, 1000);

    } else if (isAndroid()) {
        console.log('🤖 Android + Expo Go');

        // For Android, we can try the intent URL for Expo Go
        const expoIntent = `intent://exp.host/@${getExpoUsername()}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}#Intent;scheme=exp;package=host.exp.exponent;end`;

        try {
            window.location.href = expoIntent;
        } catch (e) {
            console.log('⚠️ Expo intent failed, trying scheme');
            window.location.href = `exp://exp.host/@${getExpoUsername()}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}`;
        }
    }
}

function getExpoUsername() {
    // 🚨 Replace this with your actual Expo username
    // You can find this in your Expo account or by running `expo whoami`
    return 'faradev'; // ⚠️ UPDATE THIS
}

function tryOpenProductionApp(referralCode) {
    if (isIOS()) {
        console.log('🍎 iOS Production - trying custom scheme');
        window.location.href = `zeep://referral/${referralCode}`;
    } else if (isAndroid()) {
        console.log('🤖 Android Production - trying intent');
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
        // Redirect to your main website or Expo project page
        window.location.href = isDevelopmentMode()
            ? `https://expo.dev/@${getExpoUsername()}/zeep`
            : 'https://zeepapp.com';
    }, 3000);
}

function setupStoreLinks(referralCode) {
    const iosLink = document.getElementById('iosLink');
    const androidLink = document.getElementById('androidLink');

    if (isDevelopmentMode()) {
        // 🆕 Development mode: Link to Expo Go
        if (iosLink) {
            iosLink.href = 'https://apps.apple.com/app/expo-go/id982107779';
            iosLink.textContent = '📱 Get Expo Go for iPhone';
            console.log('🔗 iOS Expo Go link set');
        }

        if (androidLink) {
            androidLink.href = 'https://play.google.com/store/apps/details?id=host.exp.exponent';
            androidLink.textContent = '🤖 Get Expo Go for Android';
            console.log('🔗 Android Expo Go link set');
        }
    } else {
        // Production mode: Link to your actual app
        if (iosLink) {
            iosLink.href = `https://apps.apple.com/app/zeep/id123456789?pt=${referralCode}&ct=referral`;
            iosLink.textContent = '📱 Download for iPhone';
            console.log('🔗 iOS App Store link set');
        }

        if (androidLink) {
            androidLink.href = `https://play.google.com/store/apps/details?id=com.diarcode.zeepmobile&referrer=utm_source%3Dreferral%26utm_medium%3Dlink%26utm_campaign%3D${referralCode}`;
            androidLink.textContent = '🤖 Download for Android';
            console.log('🔗 Android Play Store link set');
        }
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
        url: window.location.href,
        developmentMode: isDevelopmentMode()
    };

    // 🆕 Only track if you have a real API endpoint
    const trackingEndpoint = 'https://api.zeepapp.com/track-referral';

    // Simple tracking with error handling
    fetch(trackingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
    }).catch((error) => {
        console.log('📊 Tracking failed (this is expected in development):', error.message);

        // 🆕 For development, log to console or localStorage
        if (isDevelopmentMode()) {
            console.log('📊 Development tracking data:', trackingData);
            localStorage.setItem('zeep_referral_debug', JSON.stringify(trackingData));
        }
    });
}

// 🆕 Enhanced test button for development
function addTestButton() {
    if (!isDevelopmentMode()) return;

    setTimeout(() => {
        const container = document.querySelector('.container');
        if (container) {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 1000;
            `;

            // Skip detection button
            const skipButton = document.createElement('button');
            skipButton.textContent = '🧪 Skip Detection';
            skipButton.style.cssText = getButtonStyles();
            skipButton.onclick = () => {
                console.log('🧪 Manual override triggered');
                showDownloadOptions();
            };

            // Force Expo Go button
            const expoButton = document.createElement('button');
            expoButton.textContent = '🚀 Force Expo Go';
            expoButton.style.cssText = getButtonStyles();
            expoButton.onclick = () => {
                console.log('🚀 Force Expo Go triggered');
                const referralCode = getReferralCode();
                if (referralCode) {
                    tryOpenExpoGo(referralCode);
                }
            };

            buttonContainer.appendChild(skipButton);
            buttonContainer.appendChild(expoButton);
            document.body.appendChild(buttonContainer);
        }
    }, 3000);
}

function getButtonStyles() {
    return `
        padding: 8px 12px;
        background: rgba(31, 137, 61, 0.9);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        backdrop-filter: blur(10px);
        white-space: nowrap;
    `;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing...');
    init();
    addTestButton();
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
    if (statusText && statusText.textContent.includes('Checking if you have')) {
        console.log('⚠️ Fallback initialization triggered');
        init();
    }
}, 1000);