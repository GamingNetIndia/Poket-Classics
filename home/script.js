document.addEventListener('DOMContentLoaded', () => {
    // 1. ALL Element Selections
    const allButtons = document.querySelectorAll('button, .game-card, .social-link');
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = document.getElementById('click-sound');
    const settingsOverlay = document.getElementById('settings-overlay');
    const detailsOverlay = document.getElementById('details-overlay');
    const confirmationOverlay = document.getElementById('confirmation-overlay');
    const privacyOverlay = document.getElementById('privacy-overlay');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const detailsBackBtn = document.getElementById('details-back-btn');
    const detailsPlayBtn = document.getElementById('details-play-btn');
    const socialLinks = document.querySelectorAll('.social-link');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    const privacyBtn = document.getElementById('privacy-btn');
    const closePrivacyBtn = document.getElementById('close-privacy-btn');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    const installButton = document.getElementById('install-pwa-btn');
    const iosInstallPrompt = document.getElementById('ios-install-prompt');
    const iosPromptText = document.getElementById('ios-prompt-text');
    const iosCopyLinkBtn = document.getElementById('ios-copy-link-btn');

    // 2. State Variables
    let deferredPrompt;
    let isMusicEnabled, isSfxEnabled, hasInteracted = false;

    // 3. Core Functions
    function playSound(sound) {
        if (!sound || !isSfxEnabled) return;
        sound.currentTime = 0;
        sound.play().catch(e => console.error("Sound play failed:", e));
    }
    function updateMusicState() {
        if (isMusicEnabled && hasInteracted) {
            backgroundMusic.play().catch(e => console.error("Music play failed:", e));
        } else {
            backgroundMusic.pause();
        }
    }
    function saveSettings() {
        localStorage.setItem('pocketClassicsMusic', isMusicEnabled);
        localStorage.setItem('pocketClassicsSfx', isSfxEnabled);
    }
    function loadSettings() {
        isMusicEnabled = localStorage.getItem('pocketClassicsMusic') !== 'false';
        isSfxEnabled = localStorage.getItem('pocketClassicsSfx') !== 'false';
        musicToggle.checked = isMusicEnabled;
        sfxToggle.checked = isSfxEnabled;
    }

    // 4. PWA Installation Logic
    function handleIosInstallation() {
        const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (!isIosDevice) return;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;
        const isSafari = !navigator.userAgent.match(/CriOS/i) && !navigator.userAgent.match(/FxiOS/i);
        const shareIconSvg = `<svg style="width:20px;height:20px;display:inline-block;vertical-align:middle;fill:white;" viewBox="0 0 24 24"><path d="M13 4.2c-.1-.1-.1-.2-.2-.2s-.2.1-.2.2v8.6c0 .2.1.3.3.3s.3-.1.3-.3V4.2z M12 2c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z M17 8.2c-.1-.1-.1-.2-.2-.2s-.2.1-.2.2v8.6c0 .2.1.3.3.3s.3-.1.3-.3V8.2z M16 7c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z M8 8.2c-.1-.1-.1-.2-.2-.2s-.2.1-.2.2v8.6c0 .2.1.3.3.3s.3-.1.3-.3V8.2z M7 7c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z M18 3.2L6.3 12.3c-.3.2-.3.6 0 .8s.6.2.8 0L18.8 4c.3-.2.3-.6 0-.8s-.6-.2-.8 0z"/></svg>`;
        if (isSafari) {
            iosPromptText.innerHTML = `To install, tap the Share ${shareIconSvg} button and then 'Add to Home Screen'.`;
            iosCopyLinkBtn.style.display = 'none';
        } else {
            iosPromptText.innerHTML = `To install, please open this page in <b>Safari</b>.`;
            iosCopyLinkBtn.style.display = 'block';
        }
        iosInstallPrompt.style.display = 'flex';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installButton) {
            installButton.style.display = 'flex';
        }
    });

    window.addEventListener('appinstalled', () => {
        if (installButton) installButton.style.display = 'none';
        if (iosInstallPrompt) iosInstallPrompt.style.display = 'none';
        deferredPrompt = null;
    });

    // 5. Event Listeners
    if (iosCopyLinkBtn) {
        iosCopyLinkBtn.addEventListener('click', () => {
            playSound(clickSound);
            navigator.clipboard.writeText(window.location.href).then(() => {
                iosPromptText.innerHTML = "Link copied! Now, in Safari, find the Share button, then 'Add to Home Screen'.";
                iosCopyLinkBtn.style.display = 'none';
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                iosPromptText.textContent = "Could not copy link. Please open in Safari manually.";
            });
        });
    }

    if (installButton) {
        installButton.addEventListener('click', async () => {
            playSound(clickSound);
            if (deferredPrompt) {
                installButton.style.display = 'none';
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                deferredPrompt = null;
            }
        });
    }
    
    allButtons.forEach(button => {
        if (!button.classList.contains('non-interactive')) {
            button.addEventListener('click', () => playSound(clickSound));
        }
    });

    document.querySelectorAll('.game-card').forEach(card => {
        if (card.classList.contains('non-interactive')) return;
        card.addEventListener('click', () => {
            const detailsImage = document.getElementById('details-image');
            const detailsTitle = document.getElementById('details-title');
            const detailsDescription = document.getElementById('details-description');
            const thumbnailContainer = document.getElementById('details-thumbnails');
            
            detailsImage.src = card.querySelector('.game-card-image').src;
            detailsTitle.textContent = card.dataset.title;
            detailsDescription.textContent = card.dataset.description;
            detailsPlayBtn.dataset.url = card.dataset.url;
            thumbnailContainer.innerHTML = '';
            const screenshotsData = card.dataset.screenshots;
            if (screenshotsData) {
                screenshotsData.split(',').forEach(url => {
                    const img = document.createElement('img');
                    img.src = url.trim();
                    img.alt = `${card.dataset.title} Screenshot`;
                    img.className = 'thumbnail-image';
                    thumbnailContainer.appendChild(img);
                });
            }
            detailsOverlay.classList.add('visible');
        });
    });

    detailsBackBtn.addEventListener('click', () => detailsOverlay.classList.remove('visible'));
    detailsPlayBtn.addEventListener('click', function() { if (this.dataset.url) { window.location.href = this.dataset.url; } });

    const closeSettingsMenu = () => settingsOverlay.classList.remove('visible');
    const closePrivacyMenu = () => privacyOverlay.classList.remove('visible');
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('visible'));
    closeSettingsBtn.addEventListener('click', closeSettingsMenu);
    settingsOverlay.addEventListener('click', (event) => { if (event.target === settingsOverlay) closeSettingsMenu(); });
    privacyBtn.addEventListener('click', () => privacyOverlay.classList.add('visible'));
    closePrivacyBtn.addEventListener('click', closePrivacyMenu);
    privacyOverlay.addEventListener('click', (event) => { if(event.target === privacyOverlay) closePrivacyMenu(); });

    musicToggle.addEventListener('change', () => { isMusicEnabled = musicToggle.checked; updateMusicState(); saveSettings(); });
    sfxToggle.addEventListener('change', () => { isSfxEnabled = sfxToggle.checked; saveSettings(); });

    const closeConfirmationMenu = () => confirmationOverlay.classList.remove('visible');
    socialLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            if (link.tagName === 'A') {
                event.preventDefault();
                const url = link.href;
                confirmYesBtn.dataset.url = url;
                confirmationOverlay.classList.add('visible');
            }
        });
    });
    confirmNoBtn.addEventListener('click', closeConfirmationMenu);
    confirmYesBtn.addEventListener('click', function() {
        const url = this.dataset.url;
        if (url) { window.open(url, '_blank'); }
        closeConfirmationMenu();
    });
    confirmationOverlay.addEventListener('click', (event) => { if (event.target === confirmationOverlay) closeConfirmationMenu(); });

    document.body.addEventListener('click', () => {
        if (hasInteracted) return;
        hasInteracted = true;
        updateMusicState();
    }, { once: true });

    // 6. Initial Setup Calls
    loadSettings();
    handleIosInstallation();
});