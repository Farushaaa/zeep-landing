// Fixed referral landing script - corrected Expo Go approach
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
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dev') !== 'false' && window.location.hostname.includes('github.io');
}

function init() {
    console.log('🚀 Initializing landing page...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('📱 Is Mobile:', isMobile());
    console.log('🚧 Development Mode:', isDevelopmentMode());

    // Show development mode indicator
    if (isDevelopmentMode()) {
        document.getElementById('devIndicator')?.classList.remove('hidden');
        document.getElementById('devInfo')?.classList.remove('hidden');
    }

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

    // Update status based on development mode
    if (isDevelopmentMode()) {
        statusText.textContent = 'Opening app in Expo Go...';
    } else {
        statusText.textContent = 'Opening Zeep app...';
    }

    const DETECTION_TIMEOUT = 3000; // 3 seconds
    let appOpened = false;
    let timeoutId;

    function onAppOpen() {
        if (!appOpened) {
            console.log('✅ App opened successfully');
            appOpened = true;
            clearTimeout(timeoutId);
            statusText.textContent = 'Opening app...';
        }
    }

    // Enhanced detection methods
    const handleVisibilityChange = () => {
        if (document.hidden) {
            onAppOpen();
        }
    };

    const handlePageHide = () => {
        onAppOpen();
    };

    const handleBlur = () => {
        // Small delay to avoid false positives
        setTimeout(() => {
            if (document.hidden) {
                onAppOpen();
            }
        }, 100);
    };

    // Add multiple detection methods
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('blur', handleBlur);

    // Try to open the app
    tryOpenApp(referralCode);

    // Show download options after timeout
    timeoutId = setTimeout(() => {
        if (!appOpened) {
            console.log('⏰ App detection timeout - showing download options');
            showDownloadOptions();
        }

        // Cleanup listeners
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pagehide', handlePageHide);
        window.removeEventListener('blur', handleBlur);
    }, DETECTION_TIMEOUT);
}

function tryOpenApp(referralCode) {
    console.log('🎯 Trying to open app with code:', referralCode);

    // 🔧 FIXED: Use your custom scheme in both dev and production
    // In development, Expo Go will handle your custom scheme automatically
    const appUrl = `zeep://referral/${referralCode}`;

    console.log('🔗 Opening URL:', appUrl);

    if (isIOS()) {
        console.log('🍎 iOS - trying custom scheme');
        window.location.href = appUrl;
    } else if (isAndroid()) {
        console.log('🤖 Android - trying intent first, then scheme');

        // Try Android intent first (more reliable)
        const intentUrl = `intent://referral/${referralCode}#Intent;scheme=zeep;package=host.exp.exponent;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

        try {
            window.location.href = intentUrl;

            // Fallback to custom scheme after short delay
            setTimeout(() => {
                if (!document.hidden) {
                    console.log('🔄 Intent fallback - trying custom scheme');
                    window.location.href = appUrl;
                }
            }, 500);
        } catch (e) {
            console.log('⚠️ Intent failed, trying custom scheme directly');
            window.location.href = appUrl;
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
        window.location.href = isDevelopmentMode()
            ? 'https://expo.dev'
            : 'https://zeepapp.com';
    }, 3000);
}

function setupStoreLinks(referralCode) {
    const iosLink = document.getElementById('iosLink');
    const androidLink = document.getElementById('androidLink');
    const downloadTitle = document.getElementById('downloadTitle');
    const downloadSubtitle = document.getElementById('downloadSubtitle');
    const footerText = document.getElementById('footerText');

    if (isDevelopmentMode()) {
        // 🆕 Development mode: Link to Expo Go + Instructions
        if (downloadTitle) downloadTitle.textContent = 'Get Expo Go to test!';
        if (downloadSubtitle) {
            downloadSubtitle.innerHTML = `
                Download Expo Go, then:<br>
                1. Open Expo Go<br>
                2. Scan the QR code from your development server<br>
                3. The referral link will work in your app!
            `;
        }
        if (footerText) footerText.textContent = 'Development mode • Requires Expo Go';

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

    // Development mode: just log and store locally
    if (isDevelopmentMode()) {
        console.log('📊 Development tracking data:', trackingData);
        try {
            localStorage.setItem('zeep_referral_debug', JSON.stringify(trackingData));
            localStorage.setItem('zeep_last_referral_time', Date.now().toString());
        } catch (e) {
            console.log('📊 Could not save to localStorage');
        }
    } else {
        // Production tracking
        const trackingEndpoint = 'https://api.zeepapp.com/track-referral';

        fetch(trackingEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trackingData)
        }).catch((error) => {
            console.log('📊 Tracking failed:', error.message);
        });
    }
}

// 🆕 Enhanced test buttons for development
function addTestButtons() {
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
                gap: 8px;
                z-index: 1000;
            `;

            const buttonStyles = `
                padding: 8px 12px;
                background: rgba(31, 137, 61, 0.9);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                backdrop-filter: blur(10px);
                white-space: nowrap;
                min-width: 120px;
            `;

            // Skip detection button
            const skipButton = document.createElement('button');
            skipButton.textContent = '🧪 Skip Detection';
            skipButton.style.cssText = buttonStyles;
            skipButton.onclick = () => {
                console.log('🧪 Manual override triggered');
                showDownloadOptions();
            };

            // Test custom scheme button
            const testSchemeButton = document.createElement('button');
            testSchemeButton.textContent = '🚀 Test App Link';
            testSchemeButton.style.cssText = buttonStyles;
            testSchemeButton.onclick = () => {
                console.log('🚀 Testing custom scheme');
                const referralCode = getReferralCode();
                if (referralCode) {
                    const testUrl = `zeep://referral/${referralCode}`;
                    console.log('🔗 Testing URL:', testUrl);
                    window.location.href = testUrl;
                }
            };

            // Debug info button
            const debugButton = document.createElement('button');
            debugButton.textContent = '🐛 Debug Info';
            debugButton.style.cssText = buttonStyles;
            debugButton.onclick = () => {
                const debug = localStorage.getItem('zeep_referral_debug');
                const lastTime = localStorage.getItem('zeep_last_referral_time');

                let info = 'Debug Info:\n\n';
                if (debug) {
                    info += JSON.stringify(JSON.parse(debug), null, 2);
                } else {
                    info += 'No debug info available';
                }

                if (lastTime) {
                    const time = new Date(parseInt(lastTime));
                    info += '\n\nLast visit: ' + time.toLocaleString();
                }

                alert(info);
            };

            // Copy scheme URL button
            const copyButton = document.createElement('button');
            copyButton.textContent = '📋 Copy Test URL';
            copyButton.style.cssText = buttonStyles;
            copyButton.onclick = () => {
                const referralCode = getReferralCode();
                if (referralCode) {
                    const testUrl = `zeep://referral/${referralCode}`;
                    navigator.clipboard.writeText(testUrl).then(() => {
                        alert('URL copied to clipboard:\n' + testUrl);
                    }).catch(() => {
                        prompt('Copy this URL:', testUrl);
                    });
                }
            };

            buttonContainer.appendChild(skipButton);
            buttonContainer.appendChild(testSchemeButton);
            buttonContainer.appendChild(debugButton);
            buttonContainer.appendChild(copyButton);
            document.body.appendChild(buttonContainer);
        }
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing...');
    init();
    addTestButtons();
});

// Also run immediately if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('📄 DOM already ready, initializing...');
    init();
    addTestButtons();
}

// Add a fallback initialization after 1 second
setTimeout(() => {
    const statusText = document.getElementById('statusText');
    if (statusText && statusText.textContent.includes('Checking if you have')) {
        console.log('⚠️ Fallback initialization triggered');
        init();
    }
}, 1000);