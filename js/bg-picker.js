// Background Picker Logic
(function () {
    const modal = document.getElementById('bgModal');
    const btn = document.getElementById('bgPickerBtn');
    const fileInput = document.getElementById('bgFileInput');
    const pathDisplay = document.getElementById('bgPathDisplay');
    const browseBtn = document.getElementById('bgBrowse');
    const applyBtn = document.getElementById('bgApply');
    const cancelBtn = document.getElementById('bgCancel');

    let selectedFilePath = null;

    // Open Modal
    if (btn) {
        btn.onclick = function () {
            if (modal) {
                modal.style.display = 'flex';

                // Show current background from localStorage
                // Check Lively-synced background first, then custom picker background
                const livelySaved = localStorage.getItem('selectedBackground');
                const customSaved = localStorage.getItem('customBackground');
                const currentBg = livelySaved || customSaved;

                if (currentBg && pathDisplay) {
                    pathDisplay.value = currentBg;
                    selectedFilePath = currentBg;
                } else if (pathDisplay) {
                    pathDisplay.value = 'No background selected';
                    selectedFilePath = null;
                }
            }
        };
    }

    // Browse Button - Trigger File Input
    if (browseBtn && fileInput) {
        browseBtn.onclick = function () {
            fileInput.click();
        };
    }

    // File Input Change
    if (fileInput) {
        fileInput.onchange = function (e) {
            const file = e.target.files[0];
            if (file) {
                if (pathDisplay) {
                    pathDisplay.value = file.name;
                }

                // Priority 1: Use real file path if available (Electron/Lively)
                if (file.path) {
                    selectedFilePath = file.path;
                    console.log('Using real file path:', selectedFilePath);
                } else {
                    // Priority 2: Check file size before converting
                    const maxSize = 5 * 1024 * 1024; // 5MB limit

                    if (file.size > maxSize) {
                        console.warn('File too large (' + (file.size / 1024 / 1024).toFixed(1) + 'MB), using blob URL (session-only)');
                        selectedFilePath = URL.createObjectURL(file);
                        alert('Note: File is ' + (file.size / 1024 / 1024).toFixed(1) + 'MB.\n\nFor files >5MB, background won\'t persist after reload.\nUse smaller files or run in Lively Wallpaper for persistence.');
                    } else {
                        // Convert to data URL (works everywhere, persists)
                        console.log('Converting file to data URL...');
                        const reader = new FileReader();
                        reader.onload = function (event) {
                            selectedFilePath = event.target.result;
                            console.log('File converted to data URL (length:', selectedFilePath.length, ')');
                        };
                        reader.onerror = function (error) {
                            console.error('FileReader error:', error);
                            alert('Failed to read file: ' + error);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        };
    }

    // Close Modal
    function closeModal() {
        if (modal) modal.style.display = 'none';
    }

    if (cancelBtn) cancelBtn.onclick = closeModal;

    // Apply Background
    if (applyBtn) {
        applyBtn.onclick = function () {
            if (selectedFilePath) {
                // Try to save to localStorage, but handle quota errors
                try {
                    localStorage.setItem('customBackground', selectedFilePath);
                    console.log('Background saved to localStorage');
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        console.warn('File too large for localStorage, using session-only');
                        alert('Note: This background is too large to persist.\nIt will work now but won\'t survive a reload.\n\nFor persistent backgrounds:\n• Use smaller files (<5MB)\n• Or run in Lively Wallpaper (uses file paths)');
                    } else {
                        console.error('localStorage error:', e);
                    }
                }
                applyBackground(selectedFilePath);
                closeModal();
            }
        };
    }

    // Apply Background Function
    function applyBackground(path) {
        console.log('Applying background (type:', path.substring(0, 30) + '...)');

        // Don't normalize data URLs or blob URLs
        if (!path.startsWith('data:') && !path.startsWith('blob:')) {
            // Normalize path
            path = path.replace(/\\/g, '/');

            // Convert Windows absolute paths to file:// URLs if needed
            if (path.match(/^[A-Za-z]:/)) {
                path = 'file:///' + path;
                console.log('Converted to file URL');
            }
        }

        const bgEl = document.querySelector('.background');
        const videoEl = document.getElementById('bgVideo');

        // Check if it's a video by file extension or MIME type
        const isVideo = path.match(/\.(mp4|webm|mkv|mov|avi|wmv)$/i) ||
            path.startsWith('data:video/');

        console.log('Is video:', !!isVideo);

        if (isVideo) {
            if (videoEl) {
                console.log('Setting video source...');
                videoEl.src = path;
                videoEl.style.display = 'block';
                videoEl.load();
                videoEl.play().catch(e => {
                    console.error("Video playback error:", e);
                    alert('Video failed to play: ' + e.message);
                });
            }
            if (bgEl) bgEl.style.backgroundImage = 'none';
        } else {
            if (videoEl) {
                videoEl.pause();
                videoEl.src = '';
                videoEl.style.display = 'none';
            }
            if (bgEl) {
                console.log('Setting image background...');
                bgEl.style.backgroundImage = `url('${path}')`;
            }
        }
    }

    // Load saved background on page load
    const restoreBackground = function () {
        // Check both localStorage keys (Lively-synced and custom picker)
        const livelySaved = localStorage.getItem('selectedBackground');
        const customSaved = localStorage.getItem('customBackground');
        const saved = customSaved || livelySaved;

        if (saved) {
            console.log('[BG-Picker] Restoring saved background:', saved.substring(0, 50));
            applyBackground(saved);
        } else {
            console.log('[BG-Picker] No saved background found');
        }
    };

    // Restore immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restoreBackground);
    } else {
        restoreBackground();
    }
})();
