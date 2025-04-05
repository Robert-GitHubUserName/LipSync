import { voiceSelect, statusMessage } from './domElements.js';

// Store voices globally to avoid repeated fetching
let cachedVoices = [];

// Load available voices into the voice selection dropdown with improved reliability
export function loadVoices() {
    // Try to get available voices
    const voices = speechSynthesis.getVoices();
    
    if (voices && voices.length > 0) {
        // Save to our cached copy
        cachedVoices = voices;
        
        // Populate voice dropdown
        populateVoiceList(voices);
    } else {
        // Voices not available yet - try again after a short delay
        setTimeout(loadVoices, 100);
    }
}

// Populate the voice dropdown with available voices
function populateVoiceList(voices) {
    // Clear existing options
    voiceSelect.innerHTML = '';
    
    // Add each voice as an option
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    
    // Find preferred default voice (Zira or English female)
    selectDefaultVoice(voices);
    
    // Load user's previously selected voice
    loadSelectedVoice();
    
    // Update status
    statusMessage.textContent = `${voices.length} voices loaded`;
}

// Select a default voice based on preferences
function selectDefaultVoice(voices) {
    // First try to find Zira (popular Windows voice)
    let ziraIndex = -1;
    for (let i = 0; i < voices.length; i++) {
        const voiceName = voices[i].name.toLowerCase();
        if (voiceName.includes('zira')) {
            ziraIndex = i;
            break;
        }
    }
    
    if (ziraIndex >= 0) {
        voiceSelect.value = ziraIndex;
        return;
    }
    
    // Otherwise try to find any English female voice
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].lang.includes('en-') && voices[i].name.includes('Female')) {
            voiceSelect.value = i;
            return;
        }
    }
    
    // Just use the first voice if no preferred voice found
    if (voices.length > 0 && voiceSelect.value === '') {
        voiceSelect.value = 0;
    }
}

// Save the selected voice to localStorage
export function saveSelectedVoice(voice) {
    localStorage.setItem('selectedVoice', voice);
}

// Load the selected voice from localStorage
export function loadSelectedVoice() {
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice !== null) {
        voiceSelect.value = savedVoice;
    }
}

// Check for speech synthesis support
export function checkSpeechSupport() {
    if (!('speechSynthesis' in window)) {
        statusMessage.textContent = 'Your browser does not support speech synthesis!';
        return false;
    }
    return true;
}

// Initialize voices (handle asynchronous loading in some browsers)
export function initializeVoices() {
    // Get initial list of voices (might be empty in some browsers)
    loadVoices();
    
    // Set up event listener for when voices are loaded (Chrome/Edge need this)
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}