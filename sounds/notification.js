// Function to play notification sound
function playNotificationSound() {
    try {
        // First try to use the embedded audio element in the HTML
        const embeddedAudio = document.getElementById('notification-sound');
        
        if (embeddedAudio) {
            console.log('Using embedded audio element');
            
            // Reset the audio to the beginning
            embeddedAudio.currentTime = 0;
            embeddedAudio.volume = 1.0;
            
            // Try to play the embedded audio
            const playPromise = embeddedAudio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Embedded audio playback started successfully');
                    })
                    .catch(error => {
                        console.error("Error playing embedded audio:", error);
                        fallbackPlay();
                    });
            }
        } else {
            console.log('No embedded audio element found, using fallback');
            fallbackPlay();
        }
    } catch (error) {
        console.error("Error in playNotificationSound:", error);
        fallbackPlay();
    }
}

// Fallback function to play sound using the Audio API
function fallbackPlay() {
    try {
        console.log('Attempting fallback audio playback');
        // Create a new Audio object
        const audio = new Audio('sounds/noti.mp3');
        audio.volume = 1.0;
        
        // Force play with a slight delay
        setTimeout(() => {
            audio.play()
                .then(() => console.log('Fallback audio played successfully'))
                .catch(error => console.error('Fallback audio failed:', error));
        }, 50);
    } catch (error) {
        console.error("Error in fallback audio:", error);
    }
}

// Make the function globally available
window.playNotificationSound = playNotificationSound;

// Create an auto-play permission request function - but don't call automatically
function requestAudioPermission() {
    // This should be called after user interaction
    try {
        // Create a context that will help with future playback
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Try to play a silent sound
        const embeddedAudio = document.getElementById('notification-sound');
        if (embeddedAudio) {
            // Save current volume
            const originalVolume = embeddedAudio.volume;
            // Set volume to 0 (silent)
            embeddedAudio.volume = 0;
            
            embeddedAudio.play()
                .then(() => {
                    console.log('Audio permission granted');
                    // Pause it immediately
                    embeddedAudio.pause();
                    // Reset volume
                    embeddedAudio.volume = originalVolume;
                })
                .catch(error => {
                    console.error('Audio permission denied:', error);
                    embeddedAudio.volume = originalVolume;
                });
        }
    } catch (error) {
        console.error('Error requesting audio permission:', error);
    }
}

// No longer request audio permission on DOMContentLoaded
// Instead, do it on first user interaction
document.addEventListener('click', function initAudio() {
    requestAudioPermission();
    // Remove this listener after first interaction
    document.removeEventListener('click', initAudio);
}, { once: true });

// Additionally expose a direct play method for testing
window.testSound = function() {
    // Request permission first (if not already granted)
    requestAudioPermission();
    // Then try to play sound
    setTimeout(playNotificationSound, 100);
    return "Sound test initiated";
};
