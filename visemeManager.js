import { imageUrls } from './config.js';
import { visemeImage, visemeDisplay, statusMessage } from './domElements.js';

let currentVisemeId = 0; // Track the current viseme ID

// Create a placeholder element for missing images
export function createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-img rounded-md';
    placeholder.textContent = 'Viseme';
    return placeholder;
}

// Set the viseme image (mouth shape) by ID, with fallback for missing images
export function setVisemeImage(visemeId) {
    // Store the previous viseme ID for transition logic
    const previousVisemeId = currentVisemeId;
    currentVisemeId = visemeId;
    
    // Check if this is a dramatic viseme change that needs transition
    if (needsTransition(previousVisemeId, visemeId)) {
        // For dramatic mouth movements, insert a brief intermediate viseme
        const intermediateVisemeId = getIntermediateViseme(previousVisemeId, visemeId);
        
        // Set the intermediate viseme first
        if (intermediateVisemeId >= 0 && intermediateVisemeId < imageUrls.length) {
            setTimeout(() => {
                displayViseme(visemeId); // Then set the target viseme after a short delay
            }, 30); // 30ms transition time
            
            displayViseme(intermediateVisemeId); // Display intermediate immediately
            return;
        }
    }
    
    // Normal case - just set the viseme directly
    displayViseme(visemeId);
}

// The actual function that sets the viseme display
function displayViseme(visemeId) {
    if (visemeId >= 0 && visemeId < imageUrls.length) {
        visemeImage.src = imageUrls[visemeId];
        visemeImage.alt = `Viseme ID ${visemeId}`;
        visemeImage.style.display = 'block';
        // Remove any existing placeholder
        const existingPlaceholder = visemeDisplay.querySelector('.placeholder-img');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }
        visemeImage.onerror = function() {
            console.error(`Failed to load image: ${imageUrls[visemeId]}`);
            visemeImage.style.display = 'none';
            statusMessage.textContent = `Warning: Could not load viseme image ${visemeId}. Make sure you've run the download script.`;
            if (!visemeDisplay.querySelector('.placeholder-img')) {
                visemeDisplay.appendChild(createPlaceholder());
            }
        };
    } else {
        console.warn(`Invalid viseme ID: ${visemeId}`);
        displayViseme(0); // fallback to silence image
    }
}

// Determine if a transition is needed between visemes
function needsTransition(fromId, toId) {
    // No transition needed for same or adjacent visemes
    if (fromId === toId || Math.abs(fromId - toId) <= 1) {
        return false;
    }
    
    // Transitions needed when moving between major mouth position groups
    const closedVisemes = [0, 16]; // silence, p/b/m
    const openVisemes = [1, 2, 3, 4, 17]; // open vowels
    const roundedVisemes = [7, 19, 20]; // rounded vowels
    const wideVisemes = [6, 18]; // wide/spread vowels
    
    // Check if we're transitioning between different viseme groups
    const fromGroup = findVisemeGroup(fromId);
    const toGroup = findVisemeGroup(toId);
    
    return fromGroup !== toGroup;
    
    function findVisemeGroup(id) {
        if (closedVisemes.includes(id)) return 'closed';
        if (openVisemes.includes(id)) return 'open';
        if (roundedVisemes.includes(id)) return 'rounded';
        if (wideVisemes.includes(id)) return 'wide';
        return 'other';
    }
}

// Get an appropriate intermediate viseme for smooth transition
function getIntermediateViseme(fromId, toId) {
    // Neutral position as default intermediate
    let intermediate = 0;
    
    // Map specific transitions to appropriate intermediates
    const transitionMap = {
        // From closed to various positions
        '16_1': 5,  // From bilabial (p/b/m) to open vowel through half-open
        '16_6': 5,  // From bilabial to wide vowel through half-open
        '16_7': 5,  // From bilabial to rounded vowel through half-open
        
        // From wide to various positions
        '6_16': 5,  // From wide to bilabial through half-open
        '6_7': 5,   // From wide to rounded through half-open
        
        // From rounded to various positions
        '7_6': 5,   // From rounded to wide through half-open
        '7_16': 5,  // From rounded to bilabial through half-open
    };
    
    // Check for specific transition in our map
    const transitionKey = `${fromId}_${toId}`;
    if (transitionMap[transitionKey] !== undefined) {
        return transitionMap[transitionKey];
    }
    
    // Default intermediate transitions based on general rules
    if (fromId === 0) {
        // From silence to any sound - use neutral position
        return 5; // neutral/half-open position
    } else if (toId === 0) {
        // From any sound to silence - use neutral closing
        return 5; // neutral/half-open position
    }
    
    // Default - use neutral position
    return 5;
}

// Check for presence of viseme images in the local folder
export function checkForVisemeImages() {
    const testImage = new Image();
    testImage.onload = function() {
        statusMessage.textContent = 'Local viseme images loaded successfully!';
    };
    testImage.onerror = function() {
        statusMessage.textContent = 'Warning: Local viseme images not found. Please run the download script first.';
        statusMessage.className = 'mt-2 text-sm text-red-600 font-bold';
    };
    // Try loading the first viseme image (viseme-0.jpg)
    testImage.src = imageUrls[0];
}