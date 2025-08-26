// Landing script for published Expo app (not development server)
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

// 🆕 Check if using published Expo app
function isExpoPublished() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('expo') !== 'false'; // Default to true for Expo Go
}

function init() {
    console.log('🚀 Initializing landing page...');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('📱 Is Mobile:', isMobile());
    console.log('📦 Using Expo Published:', isExpoPublished());

    // Show Expo mode indicator
    if (isExpoPublished()) {
        document.getElementById('expoIndicator')?.classList.remove('hidden');
        document.getElementById('expoInfo')?.classList.remove('hidden');
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

    if (isExpoPublished()) {
        statusText.textContent = 'Opening in Expo Go...';
    } else {
        statusText.textContent = 'Opening Zeep app...';
    }

    const DETECTION_TIMEOUT = 3500; // Slightly longer for Expo Go loading
    let appOpened = false;
    let timeoutId;

    function onAppOpen() {
        if (!appOpened) {
            console.log('✅ App opened successfully');
            appOpened = true;
            clearTimeout(timeoutId);
            statusText.textContent = 'Loading app...';
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
        setTimeout(() => {
            if (document.hidden) {
                onAppOpen();
            }
        }, 100);
    };

    // Add detection methods
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

    if (isExpoPublished()) {
        tryOpenExpoPublished(referralCode);
    } else {
        tryOpenProductionApp(referralCode);
    }
}

function tryOpenExpoPublished(referralCode) {
    // 🚨 REPLACE WITH YOUR ACTUAL EXPO USERNAME/PROJECT
    const EXPO_USERNAME = 'faradev'; // ⚠️ UPDATE THIS
    const EXPO_PROJECT_SLUG = 'zeep'; // From your app.json

    console.log('📦 Opening published Expo app');

    if (isIOS()) {
        console.log('🍎 iOS + Published Expo');

        // Method 1: Universal link (most reliable for iOS)
        const universalLink = `https://expo.io/@${EXPO_USERNAME}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}`;

        // Method 2: Custom scheme with Expo
        const customScheme = `zeep://referral/${referralCode}`;

        // Method 3: Expo scheme (fallback)
        const expoScheme = `exp://exp.host/@${EXPO_USERNAME}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}`;

        console.log('🔗 Trying universal link:', universalLink);

        // Try universal link first
        window.location.href = universalLink;

        // Fallback to custom scheme
        setTimeout(() => {
            if (!document.hidden) {
                console.log('🔄 Fallback to custom scheme:', customScheme);
                window.location.href = customScheme;
            }
        }, 1000);

        // Final fallback to Expo scheme
        setTimeout(() => {
            if (!document.hidden) {
                console.log('🔄 Final fallback to Expo scheme:', expoScheme);
                window.location.href = expoScheme;
            }
        }, 2000);

    } else if (isAndroid()) {
        console.log('🤖 Android + Published Expo');

        const customScheme = `zeep://referral/${referralCode}`;
        const expoScheme = `exp://exp.host/@${EXPO_USERNAME}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}`;

        // Method 1: Try custom scheme with Expo Go intent
        const customIntent = `intent://referral/${referralCode}#Intent;scheme=zeep;package=host.exp.exponent;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

        // Method 2: Expo Go intent with Expo scheme
        const expoIntent = `intent://exp.host/@${EXPO_USERNAME}/${EXPO_PROJECT_SLUG}?referralCode=${referralCode}#Intent;scheme=exp;package=host.exp.exponent;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

        console.log('🔗 Trying custom intent:', customIntent);

        try {
            window.location.href = customIntent;

            // Fallback to Expo intent
            setTimeout(() => {
                if (!document.hidden) {
                    console.log('🔄 Fallback to Expo intent:', expoIntent);
                    window.location.href = expoIntent;
                }
            }, 800);

            // Final fallback to schemes
            setTimeout(() => {
                if (!document.hidden) {
                    console.log('🔄 Final fallback to scheme:', customScheme);
                    window.location.href = customScheme;
                }
            }, 1500);

        } catch (e) {
            console.log('⚠️ Intents failed, trying schemes directly');
            window.location.href = customScheme;

            setTimeout(() => {
                if (!document.hidden) {
                    window.location.href = expoScheme;
                }
            }, 500);
        }
    }
}

function tryOpenProductionApp(referralCode) {
    const appUrl = `zeep://referral/${referralCode}`;
    console.log('🏭 Production app - opening:', appUrl);

    if (isIOS()) {
        window.location.href = appUrl;
    } else if (isAndroid()) {
        const intentUrl = `intent://referral/${referralCode}#Intent;scheme=zeep;package=com.diarcode.zeepmobile;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;

        try {
            window.location.href = intentUrl;
            setTimeout(() => {
                if (!document.hidden) {
                    window.location.href = appUrl;
                }
            }, 500);
        } catch (e) {
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
        window.location.href = 'https://expo.io';
    }, 3000);
}

function setupStoreLinks(referralCode) {
    const iosLink = document.getElementById('iosLink');
    const androidLink = document.getElementById('androidLink');
    const downloadTitle = document.getElementById('downloadTitle');
    const downloadSubtitle = document.getElementById('downloadSubtitle');
    const footerText = document.getElementById('footerText');

    if (isExpoPublished()) {
        // Expo Go mode: Link to Expo Go + Instructions
        if (downloadTitle) downloadTitle.textContent = 'Get Expo Go!';
        if (downloadSubtitle) {
            downloadSubtitle.innerHTML = `
                Download Expo Go to access the Zeep app:<br><br>
                <strong>After installing Expo Go:</strong><br>
                1. Open Expo Go<br>
                2. Search for "zeep" or visit our Expo page<br>
                3. Your referral will be applied automatically!
            `;
        }
        if (footerText) footerText.textContent = 'Powered by Expo • Free to use';

        if (iosLink) {
            iosLink.href = 'https://apps.apple.com/app/expo-go/id982107779';
            iosLink.textContent = '📱 Get Expo Go for iPhone';
        }

        if (androidLink) {
            androidLink.href = 'https://play.google.com/store/apps/details?id=host.exp.exponent';
            androidLink.textContent = '🤖 Get Expo Go for Android';
        }
    } else {
        // Production mode: Link to actual app
        if (downloadTitle) downloadTitle.textContent = 'Get the Zeep App!';
        if (downloadSubtitle) {
            downloadSubtitle.textContent = 'Download Zeep to accept this invitation and start earning rewards!';
        }

        if (iosLink) {
            iosLink.href = `https://apps.apple.com/app/zeep/id123456789?pt=${referralCode}&ct=referral`;
            iosLink.textContent = '📱 Download for iPhone';
        }

        if (androidLink) {
            androidLink.href = `https://play.google.com/store/apps/details?id=com.diarcode.zeepmobile&referrer=utm_source%3Dreferral%26utm_medium%3Dlink%26utm_campaign%3D${referralCode}`;
            androidLink.textContent = '🤖 Download for Android';
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
        expoPublished: isExpoPublished()
    };

    // Store debug info
    try {
        localStorage.setItem('zeep_referral_debug', JSON.stringify(trackingData));
        localStorage.setItem('zeep_last_referral_time', Date.now().toString());
    } catch (e) {
        console.log('📊 Could not save to localStorage');
    }

    console.log('📊 Tracking data:', trackingData);

    // If you have analytics endpoint, uncomment:
    /*
    fetch('https://api.zeepapp.com/track-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
    }).catch((error) => {
        console.log('📊 Tracking failed:', error.message);
    });
    */
}

// 🆕 Test buttons for Expo published mode
function addTestButtons() {
    setTimeout(() => {
        const container = document.querySelector('.container');
        if (container && window.location.href.includes('github.io')) {
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
                font-size: 11px;
                cursor: pointer;
                backdrop-filter: blur(10px);
                white-space: nowrap;
                min-width: 110px;
            `;

            // Skip detection
            const skipButton = document.createElement('button');
            skipButton.textContent = '🧪 Skip Detection';
            skipButton.style.cssText = buttonStyles;
            skipButton.onclick = () => showDownloadOptions();

            // Test Expo scheme
            const testExpoButton = document.createElement('button');
            testExpoButton.textContent = '📦 Test Expo Link';
            testExpoButton.style.cssText = buttonStyles;
            testExpoButton.onclick = () => {
                const code = getReferralCode();
                if (code) tryOpenExpoPublished(code);
            };

            // Copy URLs
            const copyButton = document.createElement('button');
            copyButton.textContent = '📋 Copy Test URLs';
            copyButton.style.cssText = buttonStyles;
            copyButton.onclick = () => {
                const code = getReferralCode();
                const urls = [
                    `zeep://referral/${code}`,
                    `exp://exp.host/@yourusername/zeep?referralCode=${code}`,
                    `https://expo.io/@yourusername/zeep?referralCode=${code}`
                ];

                const urlText = urls.join('\n\n');
                navigator.clipboard.writeText(urlText).then(() => {
                    alert('Test URLs copied to clipboard!');
                }).catch(() => {
                    prompt('Copy these test URLs:', urlText);
                });
            };

            // Debug info
            const debugButton = document.createElement('button');
            debugButton.textContent = '🐛 Debug Info';
            debugButton.style.cssText = buttonStyles;
            debugButton.onclick = () => {
                const debug = localStorage.getItem('zeep_referral_debug');
                if (debug) {
                    alert('Debug Info:\n\n' + JSON.stringify(JSON.parse(debug), null, 2));
                } else {
                    alert('No debug info available');
                }
            };

            buttonContainer.appendChild(skipButton);
            buttonContainer.appendChild(testExpoButton);
            buttonContainer.appendChild(copyButton);
            buttonContainer.appendChild(debugButton);
            document.body.appendChild(buttonContainer);
        }
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing...');
    init();
    addTestButtons();
});

if (document.readyState !== 'loading') {
    console.log('📄 DOM already ready, initializing...');
    init();
    addTestButtons();
}

setTimeout(() => {
    const statusText = document.getElementById('statusText');
    if (statusText && statusText.textContent.includes('Checking if you have')) {
        console.log('⚠️ Fallback initialization triggered');
        init();
    }
}, 1000);