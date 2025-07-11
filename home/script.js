document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const allButtons = document.querySelectorAll('button, .game-card, .social-link');
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = document.getElementById('click-sound');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOverlay = document.getElementById('settings-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    const detailsOverlay = document.getElementById('details-overlay');
    const detailsBackBtn = document.getElementById('details-back-btn');
    const detailsPlayBtn = document.getElementById('details-play-btn');
    const socialLinks = document.querySelectorAll('.social-link');
    const confirmationOverlay = document.getElementById('confirmation-overlay');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    const privacyBtn = document.getElementById('privacy-btn');
    const privacyOverlay = document.getElementById('privacy-overlay');
    const closePrivacyBtn = document.getElementById('close-privacy-btn');

    // --- State Variables ---
    let isMusicEnabled, isSfxEnabled, hasInteracted = false;

    // --- Functions ---
    function playSound(sound) { if (!sound || !isSfxEnabled) return; sound.currentTime = 0; sound.play().catch(e => {}); }
    function updateMusicState() { if (isMusicEnabled && hasInteracted) { backgroundMusic.play().catch(e => {}); } else { backgroundMusic.pause(); } }
    function saveSettings() { localStorage.setItem('pocketClassicsMusic', isMusicEnabled); localStorage.setItem('pocketClassicsSfx', isSfxEnabled); }
    function loadSettings() {
        isMusicEnabled = localStorage.getItem('pocketClassicsMusic') !== 'false';
        isSfxEnabled = localStorage.getItem('pocketClassicsSfx') !== 'false';
        musicToggle.checked = isMusicEnabled;
        sfxToggle.checked = isSfxEnabled;
    }

    // --- Event Listeners Setup ---
    loadSettings();

    // Universal Click Sound
    allButtons.forEach(button => {
        if (!button.classList.contains('non-interactive')) {
            button.addEventListener('click', () => playSound(clickSound));
        }
    });
    
    // Game Card Interaction
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

    // Details Modal Controls
    detailsBackBtn.addEventListener('click', () => detailsOverlay.classList.remove('visible'));
    detailsPlayBtn.addEventListener('click', function() { if (this.dataset.url) { window.location.href = this.dataset.url; } });

    // Settings & Privacy Modals
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.add('visible'));
    const closeSettingsMenu = () => settingsOverlay.classList.remove('visible');
    closeSettingsBtn.addEventListener('click', closeSettingsMenu);
    settingsOverlay.addEventListener('click', (event) => { if (event.target === settingsOverlay) closeSettingsMenu(); });
    
    privacyBtn.addEventListener('click', () => privacyOverlay.classList.add('visible'));
    const closePrivacyMenu = () => privacyOverlay.classList.remove('visible');
    closePrivacyBtn.addEventListener('click', closePrivacyMenu);
    privacyOverlay.addEventListener('click', (event) => { if(event.target === privacyOverlay) closePrivacyMenu(); });

    // Sound Toggles
    musicToggle.addEventListener('change', () => { isMusicEnabled = musicToggle.checked; updateMusicState(); saveSettings(); });
    sfxToggle.addEventListener('change', () => { isSfxEnabled = sfxToggle.checked; saveSettings(); });
    
    // External Link Confirmation
    socialLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            // We only want to intercept clicks on actual links (<a> tags)
            if (link.tagName === 'A') {
                event.preventDefault();
                const url = link.href;
                confirmYesBtn.dataset.url = url;
                confirmationOverlay.classList.add('visible');
            }
        });
    });

    const closeConfirmationMenu = () => confirmationOverlay.classList.remove('visible');
    confirmNoBtn.addEventListener('click', closeConfirmationMenu);
    confirmYesBtn.addEventListener('click', function() {
        const url = this.dataset.url;
        if (url) { window.open(url, '_blank'); }
        closeConfirmationMenu();
    });
    confirmationOverlay.addEventListener('click', (event) => { if(event.target === confirmationOverlay) closeConfirmationMenu(); });

    // Smart Music Start
    document.body.addEventListener('click', () => {
        if (hasInteracted) return;
        hasInteracted = true;
        updateMusicState();
    }, { once: true });
});