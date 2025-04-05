import { speakButton, textInput, statusMessage, spokenTextDisplay, rateSlider, pitchSlider, voiceSelect, showPhonemesCheckbox } from './domElements.js';
import { setVisemeImage, checkForVisemeImages } from './visemeManager.js';
import { checkSpeechSupport, initializeVoices, saveSelectedVoice } from './speechManager.js';
import { clearAllTimeouts, clearHighlightTimeouts, generateVisemeSequence, highlightWord, isSpeaking, animationTimeouts, wordBoundaryEvents, setLanguageTimingParams } from './animationController.js';
import { getWordPhonemes, getVisemeFromPhoneme } from './phonemeProcessor.js';

// Language detection parameters
const languagePatterns = {
    english: /^[a-zA-Z0-9\s.,!?;:()\-'"]+$/,
    spanish: /[áéíóúüñ¿¡]/i,
    french: /[àâæçéèêëîïôœùûüÿ]/i,
    german: /[äöüß]/i,
    italian: /[àèéìíîòóùú]/i,
    japanese: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/,
    chinese: /[\u4e00-\u9fff\u3400-\u4dbf]/,
    korean: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/,
    russian: /[\u0400-\u04FF]/,
};

// Detect the most likely language of the input text
function detectLanguage(text) {
    // Check for specific language patterns
    for (const [language, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(text)) {
            return language;
        }
    }
    // Default to English if no specific patterns are detected
    return 'english';
}

// Adjust timing parameters based on language
function getLanguageTimingParameters(detectedLanguage, voiceLang = '') {
    // Base timing parameters
    const params = {
        anticipatoryOffset: 45,
        wordOffset: 25,
        vowelMultiplier: 1.4,
        consonantMultiplier: 1.3,
        pauseMultiplier: 1.8,
        tokenPausePunctuation: 120,
        tokenPauseWord: 50
    };
    
    // Adjust based on detected language
    switch (detectedLanguage) {
        case 'spanish':
            params.anticipatoryOffset = 40;
            params.vowelMultiplier = 1.5;    // Spanish has clear vowels
            params.consonantMultiplier = 1.2;
            break;
        case 'french':
            params.anticipatoryOffset = 35;  // French tends to blend sounds
            params.vowelMultiplier = 1.6;    // French has longer vowels
            params.consonantMultiplier = 1.1;
            break;
        case 'german':
            params.anticipatoryOffset = 50;  // German needs more anticipation
            params.vowelMultiplier = 1.3;
            params.consonantMultiplier = 1.4; // German has strong consonants
            break;
        case 'italian':
            params.anticipatoryOffset = 40;
            params.vowelMultiplier = 1.6;    // Italian has pronounced vowels
            params.consonantMultiplier = 1.2;
            break;
        case 'japanese':
            params.anticipatoryOffset = 30;  // Japanese has less anticipatory articulation
            params.vowelMultiplier = 1.2;    // Less vowel emphasis
            params.pauseMultiplier = 2.0;    // More distinct pauses
            break;
        case 'chinese':
            params.anticipatoryOffset = 25;  // Less anticipation for tonal languages
            params.vowelMultiplier = 1.5;    // Emphasis on vowel tones
            params.tokenPauseWord = 60;      // More pauses between words
            break;
        case 'korean':
            params.anticipatoryOffset = 35;
            params.vowelMultiplier = 1.3;
            params.consonantMultiplier = 1.4;
            break;
        case 'russian':
            params.anticipatoryOffset = 50;  // Russian needs more anticipation
            params.consonantMultiplier = 1.5; // Heavy consonant emphasis
            break;
    }
    
    // Further override based on voice language if available
    if (voiceLang) {
        if (voiceLang.startsWith('en-')) {
            if (voiceLang === 'en-GB') {
                params.anticipatoryOffset = 42; // British voices need slightly different timing
            } else if (voiceLang === 'en-US') {
                params.anticipatoryOffset = 45; // American voices
            } else if (voiceLang === 'en-AU') {
                params.anticipatoryOffset = 40; // Australian voices are slightly faster
            }
        }
        // Add more voice-specific adjustments as needed
    }
    
    return params;
}

// Set up event listeners for UI controls
rateSlider.addEventListener('input', () => {
    document.getElementById('rateValue').textContent = rateSlider.value;
});

pitchSlider.addEventListener('input', () => {
    document.getElementById('pitchValue').textContent = pitchSlider.value;
});

// Toggle phoneme breakdown panel visibility
showPhonemesCheckbox.addEventListener('change', () => {
    document.getElementById('phonemeBreakdownContainer').classList.toggle('hidden', !showPhonemesCheckbox.checked);
});

// Save the selected voice to localStorage when the user changes the selection
voiceSelect.addEventListener('change', () => {
    saveSelectedVoice(voiceSelect.value);
});

// Function to speak text
function speakText(text) {
    if (!text) return;

    clearAllTimeouts();
    speechSynthesis.cancel();
    setVisemeImage(0);
    spokenTextDisplay.textContent = text;
    speakButton.disabled = true;
    window.isSpeaking = true;

    // Detect language and get appropriate timing parameters
    const detectedLanguage = detectLanguage(text);
    
    // Generate viseme sequence
    const visemeSequence = generateVisemeSequence(text, showPhonemesCheckbox.checked);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = speechSynthesis.getVoices();
    let voiceLang = '';
    
    // Only set a voice if we have valid voices and a valid selection
    if (voices.length > 0 && voiceSelect.value !== '') {
        const voiceIndex = parseInt(voiceSelect.value, 10);
        if (!isNaN(voiceIndex) && voiceIndex >= 0 && voiceIndex < voices.length) {
            utterance.voice = voices[voiceIndex];
            voiceLang = voices[voiceIndex].lang;
        }
    }

    // Get language-specific timing parameters
    const langParams = getLanguageTimingParameters(detectedLanguage, voiceLang);
    
    // Apply language parameters to the animation controller
    setLanguageTimingParams(langParams);
    
    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);

    // Set up the boundary event handler to highlight words as they're spoken
    utterance.onboundary = (event) => {
        if (event.name === 'word') {
            // Get the current word from the text based on character index
            const currentWordText = text.substring(event.charIndex, event.charIndex + event.charLength).trim();
            
            if (currentWordText) {
                // Find the word index in our tokens, with improved punctuation handling
                let wordIndex = -1;
                let charCount = 0;
                
                // Use a more sophisticated tokenization that keeps punctuation with words
                const tokens = text.split(/\s+/).map(token => {
                    // For tokens that contain punctuation, we want to keep them as single units
                    // This makes "Hello!" a single token rather than two separate tokens
                    return token.trim();
                }).filter(token => token.length > 0);
                
                // Find which token contains the current character index
                for (let i = 0; i < tokens.length; i++) {
                    // Calculate the end position of this token (including spaces)
                    const endPos = charCount + tokens[i].length;
                    
                    // Check if the event's character index falls within this token
                    // Also handle the case where the boundary might be at punctuation within a word
                    if ((charCount <= event.charIndex && event.charIndex < endPos) || 
                        (tokens[i].includes(currentWordText))) {
                        wordIndex = i;
                        break;
                    }
                    
                    // Move to the next token, account for the token and the space after it
                    charCount += tokens[i].length + 1;
                }
                
                if (wordIndex >= 0) {
                    // Directly highlight the current word
                    highlightWord(wordIndex, text);
                    
                    // Clean the word to get phonemes (strip punctuation)
                    const cleanWord = currentWordText.replace(/[^\w\s]/g, '').toLowerCase();
                    
                    // Also update the viseme for the beginning of this word
                    const phonemes = getWordPhonemes(cleanWord);
                    if (phonemes.length > 0) {
                        setVisemeImage(getVisemeFromPhoneme(phonemes[0]));
                    }
                }
            }
        }
    };

    // We'll still use our timing predictions for viseme animation (mouth movement)
    // but not for word highlighting
    utterance.onstart = () => {
        statusMessage.textContent = `Speaking... (${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)} detected)`;

        // Schedule viseme changes based on calculated timing
        visemeSequence.forEach(({ visemeId, time, phoneme }) => {
            // Different anticipation offsets for different phoneme types
            let anticipatoryOffset = langParams.anticipatoryOffset; // default offset from language params
            
            if (phoneme) {
                // Plosives/stops need more anticipation (form earlier, release quickly)
                if (['p', 'b', 't', 'd', 'k', 'g'].includes(phoneme)) {
                    anticipatoryOffset = langParams.anticipatoryOffset * 1.5;
                }
                // Vowels need less anticipation as they extend over time
                else if ('aeiouàáâäæãåāèéêëēėęîïíīįìôöòóœøōõûüùúūÿ'.includes(phoneme[0])) {
                    anticipatoryOffset = langParams.anticipatoryOffset * 0.7;
                }
                // Fricatives need medium anticipation
                else if (['f', 'v', 's', 'z', 'sh', 'zh', 'th', 'dh'].includes(phoneme)) {
                    anticipatoryOffset = langParams.anticipatoryOffset * 1.1;
                }
            }
            
            // Apply rate adjustment - faster speech needs more anticipation
            const rateAdjustedOffset = anticipatoryOffset * Math.pow(utterance.rate, 0.5);
            const scaledTime = Math.max(0, (time - rateAdjustedOffset)) / utterance.rate;
            const timeout = setTimeout(() => setVisemeImage(visemeId), scaledTime);
            animationTimeouts.push(timeout);
        });
        
        // We no longer pre-schedule word highlighting - that will be handled by the onboundary event
    };

    utterance.onend = () => {
        window.isSpeaking = false;
        statusMessage.textContent = 'Done speaking';
        clearAllTimeouts();
        spokenTextDisplay.textContent = text;
        setTimeout(() => setVisemeImage(0), 25);
        speakButton.disabled = false;
    };

    utterance.onerror = (e) => {
        console.error('Speech error:', e);
        window.isSpeaking = false;
        statusMessage.textContent = 'Speech error occurred';
        speakButton.disabled = false;
    };

    speechSynthesis.speak(utterance);
}

// Handle Speak button clicks
speakButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        if (window.isSpeaking) {
            // Cancel current speech
            speechSynthesis.cancel();
            window.isSpeaking = false;
            statusMessage.textContent = 'Speech cancelled';
            speakButton.disabled = false;
        } else {
            speakText(text);
        }
    } else {
        statusMessage.textContent = 'Please enter some text to speak';
    }
});

// Initialize the demo on page load
window.addEventListener('DOMContentLoaded', () => {
    // Check speech synthesis support
    if (!checkSpeechSupport()) {
        speakButton.disabled = true;
        return;
    }
    
    // Initialize UI
    setVisemeImage(0);
    checkForVisemeImages();
    initializeVoices();
    
    // Set global state
    window.isSpeaking = false;
});

// Export the speakText function for potential external use
export { speakText };