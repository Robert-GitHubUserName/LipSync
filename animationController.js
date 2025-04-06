import { spokenTextDisplay } from './domElements.js';
import { getVisemeFromPhoneme, getWordPhonemes, displayPhonemeBreakdown } from './phonemeProcessor.js';

// Animation state variables
export let animationTimeouts = [];
export let isSpeaking = false;
export let wordBoundaryEvents = [];
export let currentWordIndex = 0;
export let highlightTimeouts = [];

// Language-specific timing parameters - these will be overridden from main.js
export let languageParams = {
    vowelMultiplier: 1.4,
    consonantMultiplier: 1.3,
    pauseMultiplier: 1.8,
    tokenPausePunctuation: 120,
    tokenPauseWord: 50
};

// Update timing parameters based on detected language
export function setLanguageTimingParams(params) {
    languageParams = { ...languageParams, ...params };
}

// Clear all pending timeouts and reset animation state
export function clearAllTimeouts() {
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    highlightTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
    highlightTimeouts = [];
    wordBoundaryEvents = [];
    currentWordIndex = 0;
}

// Clear only highlight timeouts
export function clearHighlightTimeouts() {
    highlightTimeouts.forEach(timeout => clearTimeout(timeout));
    highlightTimeouts = [];
}

// Highlight a word in the text display
export function highlightCurrentWord(text, idx, len) {
    const before = text.slice(0, idx);
    const current = text.slice(idx, idx + len);
    const after = text.slice(idx + len);
    spokenTextDisplay.innerHTML = `${before}<span class="speaking-text">${current}</span>${after}`;
}

// Highlight the current word being spoken in the displayed text
export function highlightWord(wordIndex, text) {
    // Improved tokenization that keeps punctuation with words
    const tokens = text.split(/\s+/)
        .filter(token => token.length > 0)
        .map(token => token.trim());
    
    currentWordIndex = wordIndex;
    
    // Check if wordIndex is valid
    if (wordIndex >= 0 && wordIndex < tokens.length) {
        // Create HTML with the current word highlighted
        let html = '';
        let currentPosition = 0;
        
        for (let i = 0; i < tokens.length; i++) {
            // Find the position of this token in original text
            const tokenPosition = text.indexOf(tokens[i], currentPosition);
            
            if (tokenPosition !== -1) {
                // Add any whitespace before this token
                if (tokenPosition > currentPosition) {
                    html += text.substring(currentPosition, tokenPosition);
                }
                
                // Add the token itself (highlighted if it's the current word)
                if (i === wordIndex) {
                    html += `<span class="speaking-text">${tokens[i]}</span>`;
                } else {
                    html += tokens[i];
                }
                
                // Update the current position
                currentPosition = tokenPosition + tokens[i].length;
            }
        }
        
        // Add any remaining text
        if (currentPosition < text.length) {
            html += text.substring(currentPosition);
        }
        
        spokenTextDisplay.innerHTML = html;
    }
}

// Generate a viseme animation sequence for the entire input text
export function generateVisemeSequence(text, showPhonemesChecked) {
    // Improved tokenization that keeps punctuation attached to words
    const tokens = [];
    let currentWord = '';
    let i = 0;
    
    while (i < text.length) {
        const char = text[i];
        
        // Handle whitespace - end current word and skip spaces
        if (/\s/.test(char)) {
            if (currentWord) {
                tokens.push(currentWord);
                currentWord = '';
            }
            i++;
            continue;
        }
        
        // Special case for punctuation that should be separate from words
        // Only separate these if they're not inside a word
        if ((char === '(' || char === ')' || char === '"' || char === "'" || char === '-') && !currentWord) {
            tokens.push(char);
            i++;
            continue;
        }
        
        // All other characters (including punctuation) get added to the current word
        currentWord += char;
        i++;
        
        // If we've just added punctuation at the end of a word and next char is a space or end,
        // end the current word now
        if (i === text.length || (i < text.length && /\s/.test(text[i]))) {
            if (currentWord) {
                tokens.push(currentWord);
                currentWord = '';
            }
        }
    }
    
    // Add any remaining word
    if (currentWord) {
        tokens.push(currentWord);
    }

    const visemeData = [];
    const phonemeData = [];
    let currentTime = 100; // start a bit after 0ms
    let wordIndex = 0;
    
    tokens.forEach((token, index) => {
        // Skip processing for whitespace tokens
        if (!token.trim()) {
            return;
        }
        
        // Extract the actual word content without punctuation for phoneme lookup
        const wordContent = token.replace(/[^\w\s]/g, '').toLowerCase();
        if (!wordContent) {
            // Pure punctuation token, treat as pause
            currentTime += languageParams.tokenPausePunctuation;
            return;
        }
        
        // Get phonemes for the word content (without punctuation)
        const phonemes = getWordPhonemes(wordContent);
        if (!phonemes.length) return;
        
        // Improved timing calculations
        // Calculate word duration based on number of syllables (approximated by vowel count)
        const vowelCount = phonemes.filter(p => 'aeiou'.includes(p[0])).length;
        const syllableCount = Math.max(1, vowelCount);
        const wordDuration = syllableCount * 180; // base duration per syllable
        
        // Record the word boundary event - include both display token and cleaned word
        wordBoundaryEvents.push({ 
            time: currentTime, 
            wordIndex: wordIndex++, // Only count actual word tokens
            token: token,           // Full token with punctuation
            word: wordContent,      // Word without punctuation
            duration: wordDuration  // Store calculated word duration
        });
        
        // The start time for this word's visemes
        const wordStartTime = currentTime;
        
        // Distribute visemes across the word duration
        phonemes.forEach((phoneme, phonemeIndex) => {
            const visemeId = getVisemeFromPhoneme(phoneme);
            
            // More sophisticated duration calculation based on phoneme type
            let phonemeDuration = 0;
            
            // Vowels last longer than consonants
            if ('aeiou'.includes(phoneme[0])) {
                phonemeDuration = wordDuration * 0.4 / syllableCount;
            } 
            // Consonant clusters need special handling
            else if (['ch', 'jh', 'sh', 'zh', 'th', 'dh'].includes(phoneme)) {
                phonemeDuration = wordDuration * 0.25 / phonemes.length;
            }
            // Stops need to be quicker
            else if (['p', 'b', 't', 'd', 'k', 'g'].includes(phoneme)) {
                phonemeDuration = wordDuration * 0.15 / phonemes.length;
            }
            // Standard consonants
            else {
                phonemeDuration = wordDuration * 0.2 / phonemes.length;
            }
            
            // Apply language-specific multipliers to fine-tune timing
            if ('aeiou'.includes(phoneme[0])) {
                phonemeDuration *= languageParams.vowelMultiplier;
            } 
            else if (['ch', 'jh', 'sh', 'zh'].includes(phoneme)) {
                phonemeDuration *= languageParams.consonantMultiplier;
            }
            else if (phoneme === 'sp') {
                phonemeDuration *= languageParams.pauseMultiplier;
            }
            
            // For anticipatory coarticulation:
            // Each phoneme starts at a position proportional to its index in the word
            // This creates smoother transitions between mouth positions
            const phoneticProgress = phonemeIndex / Math.max(1, phonemes.length - 1);
            const anticipationFactor = 0.25; // How early we start anticipating the next sound
            const phonemeTime = wordStartTime + (phoneticProgress - anticipationFactor) * wordDuration;
            
            // Don't let phoneme times go negative or overlap with previous word
            const adjustedTime = Math.max(wordStartTime, phonemeTime); 
            
            // Add the viseme data for this phoneme
            visemeData.push({ 
                time: adjustedTime, 
                visemeId: visemeId, 
                token: token, 
                phoneme: phoneme 
            });
            
            phonemeData.push({ 
                time: adjustedTime, 
                phoneme: phoneme, 
                visemeId: visemeId, 
                word: wordContent 
            });
        });
        
        // Move the time cursor forward by this word's duration
        currentTime += wordDuration;
        
        // Add additional pause for punctuation if present
        if (/[,.!?;:]/.test(token)) {
            const punctuationType = token.match(/[,.!?;:]/)[0];
            // Different punctuation adds different pause lengths
            switch(punctuationType) {
                case '.': 
                case '!':
                case '?':
                    currentTime += languageParams.tokenPausePunctuation * 1.5; // Longer pause for end of sentence
                    break;
                case ',':
                case ';':
                case ':':
                    currentTime += languageParams.tokenPausePunctuation; // Medium pause for mid-sentence breaks
                    break;
                default:
                    currentTime += languageParams.tokenPauseWord; // Standard pause otherwise
            }
        } else {
            // Small pause between words
            currentTime += languageParams.tokenPauseWord;
        }
    });
    
    // Sort viseme data by time to ensure proper sequence
    visemeData.sort((a, b) => a.time - b.time);
    
    // Append a final silent viseme to close mouth at end
    visemeData.push({ time: currentTime + 100, visemeId: 0, token: 'end', phoneme: 'silence' });
    
    // Update phoneme breakdown display if enabled
    if (showPhonemesChecked) {
        displayPhonemeBreakdown(phonemeData);
    }
    
    return visemeData;
}