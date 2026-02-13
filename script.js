// State
let noClickCount = 0;
const noLabels = [
    "no",
    "are you sure?",
    "are you sure you're sure?",
    "baby please",
    "pleaseeeeeeeeeeeeeeeee",
    "pretty pweaaaaaaaaaaaaaaaaase"
];

// DOM Elements
const buttonYes = document.getElementById('button-yes');
const buttonNo = document.getElementById('button-no');
const bottomHalf = document.querySelector('.bottom-half');
const mainContainer = document.getElementById('main-container');
const successScreen = document.getElementById('success-screen');
const backgroundAudio = document.getElementById('background-audio');
const fireworksAudio = document.getElementById('fireworks-audio');

// Store original button sizes and font sizes (captured after page load)
let originalYesSize = {
    width: 0,
    height: 0,
    fontSize: 0
};
let originalNoSize = {
    width: 0,
    height: 0,
    fontSize: 0
};

// Track current scale factors (start at 1.0)
let currentYesScale = 1.0;
let currentNoScale = 1.0;

// Initialize original sizes after DOM is ready
function initializeOriginalSizes() {
    if (buttonYes.offsetWidth > 0 && buttonNo.offsetWidth > 0) {
        originalYesSize.width = buttonYes.offsetWidth;
        originalYesSize.height = buttonYes.offsetHeight;
        originalYesSize.fontSize = parseFloat(window.getComputedStyle(buttonYes).fontSize);
        
        originalNoSize.width = buttonNo.offsetWidth;
        originalNoSize.height = buttonNo.offsetHeight;
        originalNoSize.fontSize = parseFloat(window.getComputedStyle(buttonNo).fontSize);
    } else {
        // Retry if sizes aren't ready yet
        setTimeout(initializeOriginalSizes, 10);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOriginalSizes);
} else {
    initializeOriginalSizes();
}

// Track if audio has been started
let audioStarted = false;

// Initialize background audio to loop first 26 seconds
function initializeBackgroundAudio() {
    if (backgroundAudio) {
        // Set up event listener to loop the first 26 seconds
        backgroundAudio.addEventListener('timeupdate', function() {
            if (backgroundAudio.currentTime >= 26) {
                backgroundAudio.currentTime = 0;
            }
        });
        
        // Handle audio loading errors
        backgroundAudio.addEventListener('error', function(e) {
            console.error('Audio loading error:', e);
            console.error('Audio error details:', backgroundAudio.error);
        });
        
        // Handle when audio can play
        backgroundAudio.addEventListener('canplay', function() {
            console.log('Audio can play');
        });
        
        // Set volume (0.0 to 1.0)
        backgroundAudio.volume = 0.7;
        
        // Try to start playing the audio
        startAudio();
    } else {
        console.error('Background audio element not found');
    }
}

// Function to start audio (called on user interaction)
function startAudio() {
    if (backgroundAudio && !audioStarted) {
        backgroundAudio.play().then(function() {
            audioStarted = true;
            console.log('Audio started successfully');
        }).catch(function(error) {
            console.log('Audio play error:', error);
            // Will try again on user interaction
        });
    }
}

// Initialize audio when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBackgroundAudio);
} else {
    initializeBackgroundAudio();
}

// Also try to start audio on any user interaction (click anywhere on page)
document.addEventListener('click', function() {
    startAudio();
}, { once: true }); // Only try once

// Event Listeners
buttonYes.addEventListener('click', function() {
    startAudio(); // Start audio on first interaction
    transformToSuccessScreen();
});
buttonNo.addEventListener('click', function() {
    startAudio(); // Start audio on first interaction
    handleNoClick();
});

/**
 * Handles the No button click
 */
function handleNoClick() {
    noClickCount++;
    
    // Update the NO button label through the sequence
    const labelIndex = Math.min(noClickCount, noLabels.length - 1);
    buttonNo.textContent = noLabels[labelIndex];
    
    // Gradually adjust button sizes
    adjustButtonSizes();
    
    // Check if YES button covers bottom half
    if (yesButtonCoversBottomHalf()) {
        setYesButtonToFillBottomHalf();
        hideOrDisableButtonNo();
    }
    
    // After the final NO label, make YES fill bottom half
    if (buttonNo.textContent === "pretty pweaaaaaaaaaaaaaaaaase") {
        setYesButtonToFillBottomHalf();
        hideOrDisableButtonNo();
    }
}

/**
 * Adjusts button sizes: Yes multiplies by 2x each click, No divides by 2x each click
 */
function adjustButtonSizes() {
    // Ensure original sizes are captured
    if (originalYesSize.width === 0 || originalNoSize.width === 0) {
        initializeOriginalSizes();
        return;
    }
    
    // Yes button: multiply by 2 each click
    currentYesScale = currentYesScale * 2;
    const newYesWidth = originalYesSize.width * currentYesScale;
    const newYesHeight = originalYesSize.height * currentYesScale;
    
    buttonYes.style.width = newYesWidth + 'px';
    buttonYes.style.height = newYesHeight + 'px';
    buttonYes.style.fontSize = (originalYesSize.fontSize * currentYesScale) + 'px';
    
    // No button: divide by 2 each click (multiply by 0.5)
    currentNoScale = currentNoScale * 0.5;
    const newNoWidth = originalNoSize.width * currentNoScale;
    const newNoHeight = originalNoSize.height * currentNoScale;
    
    buttonNo.style.width = newNoWidth + 'px';
    buttonNo.style.height = newNoHeight + 'px';
    
    // Scale font size proportionally but ensure minimum readability
    // Use a minimum font size of 10px to keep text readable
    const calculatedFontSize = originalNoSize.fontSize * currentNoScale;
    const minFontSize = 10;
    const finalFontSize = Math.max(calculatedFontSize, minFontSize);
    buttonNo.style.fontSize = finalFontSize + 'px';
    
    // Adjust padding to be proportional but ensure text doesn't get cut off
    // Use smaller padding as button shrinks to maximize text space
    const originalPadding = 20; // Original padding from CSS
    const scaledPadding = Math.max(originalPadding * currentNoScale, 2);
    buttonNo.style.padding = scaledPadding + 'px ' + (scaledPadding * 1.5) + 'px';
    
    // Allow text to wrap when button becomes very small to keep it readable
    if (currentNoScale < 0.5) {
        buttonNo.style.whiteSpace = 'normal';
        buttonNo.style.wordWrap = 'break-word';
        buttonNo.style.overflow = 'visible';
        // Increase height slightly to accommodate wrapped text
        buttonNo.style.height = 'auto';
        buttonNo.style.minHeight = newNoHeight + 'px';
    } else {
        buttonNo.style.whiteSpace = 'normal';
        buttonNo.style.height = newNoHeight + 'px';
    }
}

/**
 * Checks if YES button covers the bottom half of the viewport
 */
function yesButtonCoversBottomHalf() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const bottomHalfHeight = viewportHeight / 2; // 50vh
    const bottomHalfWidth = viewportWidth;
    
    const yesButtonRect = buttonYes.getBoundingClientRect();
    
    return yesButtonRect.height >= bottomHalfHeight && 
           yesButtonRect.width >= bottomHalfWidth;
}

/**
 * Sets YES button to fill the entire bottom half, positioned relative to viewport
 */
function setYesButtonToFillBottomHalf() {
    // Position relative to viewport (not container)
    buttonYes.style.position = 'fixed';
    buttonYes.style.top = '50vh'; // Start at middle of viewport (bottom half)
    buttonYes.style.left = '0';
    buttonYes.style.width = '100vw';
    buttonYes.style.height = '50vh';
    buttonYes.style.fontSize = '3em';
    buttonYes.style.borderRadius = '0';
    buttonYes.style.zIndex = '100';
    buttonYes.style.margin = '0';
    buttonYes.style.padding = '0';
    
    // Hide the prompt text
    const promptText = document.querySelector('.prompt-text');
    if (promptText) {
        promptText.style.display = 'none';
    }
}

/**
 * Hides or disables the NO button
 */
function hideOrDisableButtonNo() {
    buttonNo.classList.add('hidden');
    buttonNo.disabled = true;
}

/**
 * Transforms to the success screen
 */
function transformToSuccessScreen() {
    // Hide main container
    mainContainer.classList.add('hidden');
    
    // Show success screen
    successScreen.classList.remove('hidden');
    
    // Play fireworks audio and make it loop
    if (fireworksAudio) {
        fireworksAudio.volume = 1.0; // Full volume for fireworks
        fireworksAudio.play().then(function() {
            console.log('Fireworks audio started');
        }).catch(function(error) {
            console.log('Fireworks audio play error:', error);
            // Try again after a short delay
            setTimeout(function() {
                fireworksAudio.play().catch(function(err) {
                    console.log('Fireworks audio retry failed:', err);
                });
            }, 100);
        });
    }
    
    // Add some sparkle effect
    createSparkles();
}

/**
 * Creates sparkle effects for the success screen
 */
function createSparkles() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'absolute';
            sparkle.style.width = '10px';
            sparkle.style.height = '10px';
            sparkle.style.backgroundColor = '#ffd700';
            sparkle.style.borderRadius = '50%';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animation = 'sparkle 2s ease-out forwards';
            sparkle.style.boxShadow = '0 0 10px #ffd700';
            successScreen.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 2000);
        }, i * 50);
    }
}

// Add sparkle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Floating Hearts Background Effect
let heartsContainer;
const heartSizes = ['heart-small', 'heart-medium', 'heart-large'];

function createHeart() {
    if (!heartsContainer) return;
    
    const heart = document.createElement('div');
    const sizeClass = heartSizes[Math.floor(Math.random() * heartSizes.length)];
    heart.className = `heart ${sizeClass}`;
    heart.textContent = '♥';
    
    // Random starting position (0-100% of width)
    const startX = Math.random() * 100;
    heart.style.left = `${startX}%`;
    
    // Random animation duration (8-15 seconds)
    const duration = 8 + Math.random() * 7;
    heart.style.animationDuration = `${duration}s`;
    
    // Random delay (0-3 seconds)
    heart.style.animationDelay = `${Math.random() * 3}s`;
    
    heartsContainer.appendChild(heart);
    
    // Remove heart after animation completes
    setTimeout(() => {
        if (heart.parentNode) {
            heart.remove();
        }
    }, (duration + 3) * 1000);
}

// Create hearts periodically (only on main page, not success screen)
function startHeartAnimation() {
    heartsContainer = document.getElementById('hearts-container');
    if (!heartsContainer) {
        console.error('Hearts container not found');
        return;
    }
    
    // Create initial hearts
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createHeart(), i * 300);
    }
    
    // Continue creating hearts every 1.5 seconds
    const heartInterval = setInterval(() => {
        if (!successScreen || !successScreen.classList.contains('hidden')) {
            clearInterval(heartInterval);
            return;
        }
        createHeart();
    }, 1500);
}

// Start heart animation when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHeartAnimation);
} else {
    startHeartAnimation();
}