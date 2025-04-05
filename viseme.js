// URLs for all viseme images - using local paths
const imageUrls = [];
for (let i = 0; i <= 21; i++) {
    imageUrls.push(`./viseme-images/viseme-${i}.jpg`);
}

// Get DOM elements
const visemeImage = document.getElementById('visemeImage');
const textInput = document.getElementById('textInput');
const speakButton = document.getElementById('speakButton');
const spokenTextDisplay = document.getElementById('spokenTextDisplay');
const visemeDisplay = document.getElementById('visemeDisplay');
const statusMessage = document.getElementById('statusMessage');
const voiceSelect = document.getElementById('voiceSelect');
const rateSlider = document.getElementById('rateSlider');
const rateValue = document.getElementById('rateValue');
const pitchSlider = document.getElementById('pitchSlider');
const pitchValue = document.getElementById('pitchValue');
const showPhonemesCheckbox = document.getElementById('showPhonemes');
const phonemeBreakdownContainer = document.getElementById('phonemeBreakdownContainer');
const phonemeBreakdown = document.getElementById('phonemeBreakdown');

// Store animation state
let animationTimeouts = [];
let isSpeaking = false;
let wordBoundaryEvents = [];
let currentWordIndex = 0;
let highlightTimeouts = [];

function clearAllTimeouts() {
    animationTimeouts.forEach(t => clearTimeout(t));
    highlightTimeouts.forEach(t => clearTimeout(t));
    animationTimeouts = [];
    highlightTimeouts = [];
    wordBoundaryEvents = [];
}

function setVisemeImage(visemeId) {
    visemeImage.src = imageUrls[visemeId];
}

function clearAllTimeouts() {
    animationTimeouts.forEach(clearTimeout);
    highlightTimeouts.forEach(clearTimeout);
    animationTimeouts = [];
    highlightTimeouts = [];
}

function highlightCurrentWord(text, idx, len) {
    const before = text.slice(0, idx);
    const current = text.slice(idx, idx + len);
    const after = text.slice(idx + len);
    spokenTextDisplay.innerHTML = `${before}<span class="speaking-text">${current}</span>${after}`;
}

// Check for speech synthesis support
if (!('speechSynthesis' in window)) {
    statusMessage.textContent = 'Your browser does not support speech synthesis!';
    speakButton.disabled = true;
}

// Update displayed rate and pitch values on slider input
rateSlider.addEventListener('input', () => {
    rateValue.textContent = rateSlider.value;
});
pitchSlider.addEventListener('input', () => {
    pitchValue.textContent = pitchSlider.value;
});

// Toggle phoneme breakdown panel visibility
showPhonemesCheckbox.addEventListener('change', () => {
    phonemeBreakdownContainer.classList.toggle('hidden', !showPhonemesCheckbox.checked);
});

// Load available voices into the voice selection dropdown
function loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        // Voices not loaded yet – try again shortly
        setTimeout(loadVoices, 100);
        return;
    }
    // Populate voice dropdown
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
    // Select a default voice (prefer “Zira” or first English female voice)
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
        // Found Zira voice as default
    } else {
        for (let i = 0; i < voices.length; i++) {
            if (voices[i].lang.includes('en-') && voices[i].name.includes('Female')) {
                voiceSelect.value = i;
                break;
            }
        }
        if (voiceSelect.value === '') {
            voiceSelect.value = 0;
        }
    }
    loadSelectedVoice();
}
// Initialize voices (handle asynchronous loading in some browsers)
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
} else {
    loadVoices();
}

// Save the selected voice to localStorage when the user changes the selection
voiceSelect.addEventListener('change', () => {
    localStorage.setItem('selectedVoice', voiceSelect.value);
});

// Load the selected voice from localStorage on page load
function loadSelectedVoice() {
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice !== null) {
        voiceSelect.value = savedVoice;
    }
}

// Create a placeholder element for missing images
function createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-img rounded-md';
    placeholder.textContent = 'Viseme';
    return placeholder;
}

// Set the viseme image (mouth shape) by ID, with fallback for missing images
function setVisemeImage(visemeId) {
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
        setVisemeImage(0); // fallback to silence image
    }
}

// Clear all pending timeouts and reset word highlight index
function clearAllTimeouts() {
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
    wordBoundaryEvents = [];
    currentWordIndex = 0;
}

// Phoneme-to-viseme mapping table (viseme IDs 0–21)
const phonemeToViseme = {
    // Vowels
    'iy': 6, 'i': 6,     // as in "see", "city"
    'ih': 6, 'ɪ': 6,     // as in "sit"
    'ey': 17, 'eɪ': 17,  // as in "say"
    'eh': 4, 'ɛ': 4,     // as in "get"
    'ae': 1, 'æ': 1,     // as in "cat"
    'aa': 2, 'ɑ': 2,     // as in "far"
    'ao': 3, 'ɔ': 3,     // as in "saw"
    'uh': 17, 'ʊ': 17,   // as in "book"
    'ow': 4, 'oʊ': 4,    // as in "go"
    'uw': 7, 'u': 7,     // as in "blue"
    'ah': 1, 'ʌ': 1,     // as in "cup"
    'ay': 18, 'aɪ': 18,  // as in "hi"
    'aw': 20, 'aʊ': 20,  // as in "how"
    'oy': 19, 'ɔɪ': 19,  // as in "boy"
    'ax': 1, 'ə': 1,     // schwa (as in "ago")

    // R-colored vowels
    'ihr': 6,            // as in "ear"
    'ehr': 4,            // as in "air"
    'uhr': 17,           // as in "cure"
    'ayr': 18,           // as in "ire"
    'awr': 20,           // as in "hour"
    'aor': 3,            // as in "oar"
    'aar': 2,            // as in "car"
    'err': 8, 'ɝ': 8,    // stressed "er" (as in "fur")
    'axr': 1, 'ɚ': 1,    // unstressed "er" (as in "supper")

    // Semivowels
    'w': 7,              // as in "we"
    'y': 6, 'j': 6,      // as in "yes" (y/j)

    // Stops
    'p': 16, 'b': 16,    // bilabial stops (P, B)
    't': 14, 'd': 14,    // alveolar stops (T, D)
    'k': 15, 'g': 15,    // velar stops (K, G)

    // Nasals
    'm': 16,             // M 
    'n': 14,             // N
    'ng': 15, 'ŋ': 15,   // NG (as in "sing")

    // Fricatives
    'f': 13, 'v': 13,    // F, V
    'th': 12, 'θ': 12,   // voiceless TH (as in "thin")
    'dh': 17, 'ð': 17,   // voiced TH (as in "then")
    's': 10, 'z': 10,    // S, Z
    'sh': 11, 'ʃ': 11,   // SH 
    'zh': 11, 'ʒ': 11,   // ZH (as in "measure")
    'h': 0,              // H (no viseme movement)

    // Affricates
    'ch': 11, 'tʃ': 11,  // CH 
    'jh': 11, 'dʒ': 11,  // J (as in "joy")

    // Approximants
    'l': 9,              // L
    'r': 21, 'ɹ': 21,    // R

    // Special
    'silence': 0,
    'sp': 0,             // short pause/silence
    'sil': 0             // silence
};

// Map digits to word form for pronunciation
const digitToWord = {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine'
};

// Map punctuation/symbols to phoneme (mostly pauses)
const charToPhoneme = {
    '.': ['sp'],
    ',': ['sp'],
    '!': ['sp'],
    '?': ['sp'],
    ';': ['sp'],
    ':': ['sp'],
    '-': ['sp'],
    '(': ['sp'],
    ')': ['sp'],
    '/': ['sp']
};

// Dictionary of common words to phonemes (for irregular or complex pronunciations)
const wordToPhonemes = {
    // Basic common words
    'hello': ['h', 'eh', 'l', 'ow'],
    'world': ['w', 'err', 'l', 'd'],
    'this': ['dh', 'ih', 's'],
    'is': ['ih', 'z'],
    'a': ['ax'],
    'an': ['ae', 'n'],
    'the': ['dh', 'ax'],
    'demo': ['d', 'eh', 'm', 'ow'],
    'my': ['m', 'ay'],
    'name': ['n', 'ey', 'm'],
    'says': ['s', 'eh', 'z'],
    'how': ['h', 'aw'],
    'are': ['aa', 'r'],
    'you': ['y', 'uw'],
    'today': ['t', 'ax', 'd', 'ey'],
    'nice': ['n', 'ay', 's'],
    'meet': ['m', 'iy', 't'],
    'where': ['w', 'eh', 'r'],
    'when': ['w', 'eh', 'n'],
    'what': ['w', 'ah', 't'],
    'why': ['w', 'ay'],
    'who': ['h', 'uw'],
    'local': ['l', 'ow', 'k', 'ax', 'l'],
    'viseme': ['v', 'ih', 'z', 'iy', 'm'],
    'animation': ['ae', 'n', 'ax', 'm', 'ey', 'sh', 'ax', 'n'],
    'speech': ['s', 'p', 'iy', 'ch'],
    'synth': ['s', 'ih', 'n', 'th'],
    'synthesis': ['s', 'ih', 'n', 'th', 'ax', 's', 'ih', 's'],
    'browser': ['b', 'r', 'aw', 'z', 'axr'],
    'api': ['ey', 'p', 'iy', 'ay'],

    // Number words
    'zero': ['z', 'iy', 'r', 'ow'],
    'one': ['w', 'ah', 'n'],
    'two': ['t', 'uw'],
    'three': ['th', 'r', 'iy'],
    'four': ['f', 'ao', 'r'],
    'five': ['f', 'ay', 'v'],
    'six': ['s', 'ih', 'k', 's'],
    'seven': ['s', 'eh', 'v', 'ax', 'n'],
    'eight': ['ey', 't'],
    'nine': ['n', 'ay', 'n'],
    'ten': ['t', 'eh', 'n'],

    // Extended common words
    'image': ['ih', 'm', 'ih', 'jh'],
    'images': ['ih', 'm', 'ih', 'jh', 'ih', 'z'],
    'connection': ['k', 'ax', 'n', 'eh', 'k', 'sh', 'ax', 'n'],
    'required': ['r', 'ih', 'k', 'w', 'ay', 'axr', 'd'],
    'internet': ['ih', 'n', 't', 'axr', 'n', 'eh', 't'],
    'enhanced': ['eh', 'n', 'h', 'ae', 'n', 's', 't'],
    'phoneme': ['f', 'ow', 'n', 'iy', 'm'],
    'phonemes': ['f', 'ow', 'n', 'iy', 'm', 'z'],
    'comprehensive': ['k', 'aa', 'm', 'p', 'r', 'ih', 'h', 'eh', 'n', 's', 'ih', 'v'],
    'mapping': ['m', 'ae', 'p', 'ih', 'ng'],
    'sequence': ['s', 'iy', 'k', 'w', 'ax', 'n', 's'],
    'number': ['n', 'ah', 'm', 'b', 'axr'],
    'numbers': ['n', 'ah', 'm', 'b', 'axr', 'z'],

    // Additional modern words/phrases
    'i': ['ay'],         // pronoun "I"
    'hi': ['h', 'ay'],
    'hey': ['h', 'ey'],
    'bye': ['b', 'ay'],
    'no': ['n', 'ow'],
    'oh': ['ow'],
    'ok': ['ow', 'k', 'ey'],
    'okay': ['ow', 'k', 'ey'],
    'thanks': ['th', 'ae', 'ng', 'k', 's'],
    'thank': ['th', 'ae', 'ng', 'k'],
    'please': ['p', 'l', 'iy', 'z'],
    'sir': ['s', 'err'],
    'good': ['g', 'uh', 'd'],
    'book': ['b', 'uh', 'k'],
    'love': ['l', 'ah', 'v'],
    'great': ['g', 'r', 'ey', 't'],
    'awesome': ['ao', 's', 'ax', 'm'],
    'friend': ['f', 'r', 'eh', 'n', 'd'],
    'to': ['t', 'uw'],
    'do': ['d', 'uw'],
    'be': ['b', 'iy'],
    'we': ['w', 'iy'],
    'he': ['h', 'iy'],
    'she': ['sh', 'iy'],
    'me': ['m', 'iy'],
    'im': ['ay', 'm'],   // "I'm"
    'gonna': ['g', 'ah', 'n', 'ax'],   // gonna (going to)
    'wanna': ['w', 'aa', 'n', 'ax'],   // wanna (want to)
    'gotta': ['g', 'aa', 't', 'ax'],   // gotta (got to)
    'yall': ['y', 'ao', 'l'],         // y'all
    'buddy': ['b', 'ah', 'd', 'iy'],
    'dude': ['d', 'uw', 'd'],
    'bro': ['b', 'r', 'ow'],
    'yeah': ['y', 'eh'],
    'her': ['h', 'err'],
    'his': ['h', 'ih', 'z'],

    // High-frequency words (new additions)
    'of': ['ah', 'v'],
    'and': ['ae', 'n', 'd'],
    'that': ['dh', 'ae', 't'],
    'it': ['ih', 't'],
    'was': ['w', 'ah', 'z'],
    'for': ['f', 'ao', 'r'],
    'on': ['aa', 'n'],
    'as': ['ae', 'z'],
    'with': ['w', 'ih', 'th'],
    'they': ['dh', 'ey'],
    'at': ['ae', 't'],
    'have': ['h', 'ae', 'v'],
    'from': ['f', 'r', 'ah', 'm'],
    'or': ['ao', 'r'],
    'had': ['h', 'ae', 'd'],
    'by': ['b', 'ay'],
    'word': ['w', 'err', 'd'],
    'but': ['b', 'ah', 't'],
    'not': ['n', 'aa', 't'],
    'all': ['ao', 'l'],
    'were': ['w', 'err'],
    'your': ['y', 'ao', 'r'],
    'can': ['k', 'ae', 'n'],
    'said': ['s', 'eh', 'd'],
    'there': ['dh', 'eh', 'r'],
    'use': ['y', 'uw', 'z'],
    'each': ['iy', 'ch'],
    'which': ['w', 'ih', 'ch'],
    'their': ['dh', 'eh', 'r'],
    'if': ['ih', 'f'],
    'will': ['w', 'ih', 'l'],
    'up': ['ah', 'p'],
    'other': ['ah', 'dh', 'axr'],
    'about': ['ax', 'b', 'aw', 't'],
    'out': ['aw', 't'],
    'many': ['m', 'eh', 'n', 'iy'],
    'then': ['dh', 'eh', 'n'],
    'them': ['dh', 'eh', 'm'],
    'these': ['dh', 'iy', 'z'],
    'so': ['s', 'ow'],
    'some': ['s', 'ah', 'm'],
    'would': ['w', 'uh', 'd'],
    'make': ['m', 'ey', 'k'],
    'like': ['l', 'ay', 'k'],
    'him': ['h', 'ih', 'm'],
    'into': ['ih', 'n', 't', 'uw'],
    'time': ['t', 'ay', 'm'],
    'has': ['h', 'ae', 'z'],
    'look': ['l', 'uh', 'k'],
    'more': ['m', 'ao', 'r'],
    'write': ['r', 'ay', 't'],
    'go': ['g', 'ow'],
    'see': ['s', 'iy'],
    'way': ['w', 'ey'],
    'could': ['k', 'uh', 'd'],
    'people': ['p', 'iy', 'p', 'ax', 'l'],
    'than': ['dh', 'ae', 'n'],
    'first': ['f', 'err', 's', 't'],
    'water': ['w', 'ao', 't', 'axr'],
    'been': ['b', 'ih', 'n'],
    'call': ['k', 'ao', 'l'],
    'its': ['ih', 't', 's'],
    'now': ['n', 'aw'],
    'find': ['f', 'ay', 'n', 'd'],
    'long': ['l', 'ao', 'ng'],
    'down': ['d', 'aw', 'n'],
    'day': ['d', 'ey'],
    'did': ['d', 'ih', 'd'],
    'get': ['g', 'eh', 't'],
    'come': ['k', 'ah', 'm'],
    'made': ['m', 'ey', 'd'],
    'may': ['m', 'ey'],
    'part': ['p', 'aa', 'r', 't'],
    'going': ['g', 'ow', 'ih', 'ng'],

    // Common contractions (no punctuation in keys)
    'dont': ['d', 'ow', 'n', 't'],   // "don't"
    'cant': ['k', 'ae', 'n', 't'],   // "can't"
    'wont': ['w', 'ow', 'n', 't'],   // "won't"
    'youre': ['y', 'ao', 'r'],       // "you're"
    'theyre': ['dh', 'eh', 'r'],     // "they're"
    'whats': ['w', 'ah', 't', 's'],  // "what's"
    'thats': ['dh', 'ae', 't', 's'], // "that's"
    'theres': ['dh', 'eh', 'r', 'z'],// "there's"
    'whos': ['h', 'uw', 'z'],       // "who's"
    'arent': ['aa', 'r', 'n', 't'],  // "aren't"
    'isnt': ['ih', 'z', 'ax', 'n', 't'],   // "isn't"
    'wasnt': ['w', 'ah', 'z', 'ax', 'n', 't'], // "wasn't"
    'werent': ['w', 'err', 'n', 't'],    // "weren't"
    'doesnt': ['d', 'ah', 'z', 'ax', 'n', 't'], // "doesn't"
    'didnt': ['d', 'ih', 'd', 'ax', 'n', 't'],  // "didn't"
    'couldnt': ['k', 'uh', 'd', 'ax', 'n', 't'], // "couldn't"
    'wouldnt': ['w', 'uh', 'd', 'ax', 'n', 't'], // "wouldn't"
    'shouldnt': ['sh', 'uh', 'd', 'ax', 'n', 't'], // "shouldn't"
    'havent': ['h', 'ae', 'v', 'ax', 'n', 't'], // "haven't"
    'hasnt': ['h', 'ae', 'z', 'ax', 'n', 't'],  // "hasn't"
    'hadnt': ['h', 'ae', 'd', 'ax', 'n', 't'],  // "hadn't"
    'lets': ['l', 'eh', 't', 's'],   // "let's"
    'aint': ['ey', 'n', 't'],       // "ain't"

    // Informal slang/colloquial
    'kinda': ['k', 'ay', 'n', 'd', 'ax'],  // "kinda" (kind of)
    'gimme': ['g', 'ih', 'm', 'iy'],       // "gimme" (give me)
    'lemme': ['l', 'eh', 'm', 'iy'],       // "lemme" (let me)
    'ya': ['y', 'ax'],                    // "ya" (casual "you")
    'nope': ['n', 'ow', 'p'],
    'wow': ['w', 'aw'],

    // Domain-specific and additional words
    'information': ['ih', 'n', 'f', 'axr', 'm', 'ey', 'sh', 'ax', 'n'],
    'government': ['g', 'ah', 'v', 'axr', 'n', 'm', 'ax', 'n', 't'],
    'important': ['ih', 'm', 'p', 'ao', 'r', 't', 'ax', 'n', 't'],
    'because': ['b', 'ih', 'k', 'ah', 'z'],
    'example': ['ih', 'g', 'z', 'ae', 'm', 'p', 'ax', 'l'],
    'education': ['eh', 'jh', 'uw', 'k', 'ey', 'sh', 'ax', 'n'],
    'technology': ['t', 'eh', 'k', 'n', 'aa', 'l', 'ax', 'jh', 'iy'],
    'computer': ['k', 'ax', 'm', 'p', 'y', 'uw', 't', 'axr'],
    'science': ['s', 'ay', 'ax', 'n', 's'],
    'question': ['k', 'w', 'eh', 's', 'ch', 'ax', 'n'],
    'answer': ['ae', 'n', 's', 'axr'],
    'system': ['s', 'ih', 's', 't', 'ax', 'm'],
    'software': ['s', 'ao', 'f', 't', 'w', 'eh', 'r'],
    'hardware': ['h', 'aa', 'r', 'd', 'w', 'eh', 'r'],
    'network': ['n', 'eh', 't', 'w', 'err', 'k'],
    'student': ['s', 't', 'uw', 'd', 'ax', 'n', 't'],
    'teacher': ['t', 'iy', 'ch', 'axr'],
    'open': ['ow', 'p', 'ax', 'n'],
    'close': ['k', 'l', 'ow', 'z'],
    'menu': ['m', 'eh', 'n', 'y', 'uw'],
    'button': ['b', 'ah', 't', 'ax', 'n'],
    'error': ['eh', 'r', 'axr'],
    'pause': ['p', 'ao', 'z'],
    'file': ['f', 'ay', 'l'],
    'folder': ['f', 'ow', 'l', 'd', 'axr'],
    'yes': ['y', 'eh', 's'],
    'maybe': ['m', 'ey', 'b', 'iy'],
    'always': ['ao', 'l', 'w', 'ey', 'z'],
    'never': ['n', 'eh', 'v', 'axr'],
    'really': ['r', 'ih', 'l', 'iy'],
    'very': ['v', 'eh', 'r', 'iy'],
    'cool': ['k', 'uw', 'l'],
    'sorry': ['s', 'ao', 'r', 'iy'],
    'welcome': ['w', 'eh', 'l', 'k', 'ax', 'm'],
    'man': ['m', 'ae', 'n'],
    'men': ['m', 'eh', 'n'],
    'woman': ['w', 'uh', 'm', 'ax', 'n'],
    'women': ['w', 'ih', 'm', 'ih', 'n'],
    'year': ['y', 'ih', 'r'],
    'years': ['y', 'ih', 'r', 'z'],
    'week': ['w', 'iy', 'k'],
    'weeks': ['w', 'iy', 'k', 's'],
    'month': ['m', 'ah', 'n', 'th'],
    'months': ['m', 'ah', 'n', 'th', 's'],
    'person': ['p', 'err', 's', 'ax', 'n'],
    // (Note: 'people' already added above)
    'does': ['d', 'ah', 'z'],
    'though': ['dh', 'ow'],
    'through': ['th', 'r', 'uw'],
    'tough': ['t', 'ah', 'f'],
    'thought': ['th', 'ao', 't'],
    'enough': ['ih', 'n', 'ah', 'f']
};

// Predict phonemes for a word (if not in dictionary) using basic rules
function predictPhonemes(word) {
    word = word.toLowerCase().replace(/[^\w]/g, '');
    if (wordToPhonemes[word]) {
        return wordToPhonemes[word];
    }
    const phonemes = [];
    let i = 0;
    // Prefix rules
    if (word.startsWith('re')) {
        phonemes.push('r', 'iy'); i += 2;
    } else if (word.startsWith('un')) {
        phonemes.push('ah', 'n'); i += 2;
    } else if (word.startsWith('in')) {
        phonemes.push('ih', 'n'); i += 2;
    } else if (word.startsWith('ex')) {
        phonemes.push('eh', 'k', 's'); i += 2;
    } else if (word.startsWith('pre')) {
        phonemes.push('p', 'r', 'iy'); i += 3;
    } else if (word.startsWith('pro')) {
        phonemes.push('p', 'r', 'ow'); i += 3;
    }
    // Letter combination rules
    while (i < word.length) {
        if (i < word.length - 2) {
            const tri = word.substr(i, 3);
            if (tri === 'igh') { phonemes.push('ay'); i += 3; continue; }
            if (tri === 'tch') { phonemes.push('ch'); i += 3; continue; }
        }
        if (i < word.length - 1) {
            const di = word.substr(i, 2);
            if (di === 'th') { phonemes.push('th'); i += 2; continue; }
            if (di === 'ch') { phonemes.push('ch'); i += 2; continue; }
            if (di === 'sh') { phonemes.push('sh'); i += 2; continue; }
            if (di === 'ph') { phonemes.push('f'); i += 2; continue; }
            if (di === 'wh') { phonemes.push('w'); i += 2; continue; }
            if (di === 'kn') { phonemes.push('n'); i += 2; continue; }
            if (di === 'wr') { phonemes.push('r'); i += 2; continue; }
            if (di === 'qu') { phonemes.push('k', 'w'); i += 2; continue; }
            if (di === 'ng') { phonemes.push('ng'); i += 2; continue; }
            if (di === 'ck') { phonemes.push('k'); i += 2; continue; }
            // Vowel combinations
            if (di === 'ee') { phonemes.push('iy'); i += 2; continue; }
            if (di === 'ea') { phonemes.push('iy'); i += 2; continue; }
            if (di === 'ai' || di === 'ay') { phonemes.push('ey'); i += 2; continue; }
            if (di === 'ow' || di === 'oa') { phonemes.push('ow'); i += 2; continue; }
            if (di === 'oo') { phonemes.push('uw'); i += 2; continue; }
            if (di === 'oy' || di === 'oi') { phonemes.push('oy'); i += 2; continue; }
            if (di === 'au' || di === 'aw') { phonemes.push('ao'); i += 2; continue; }
            if (di === 'ou' || di === 'ow') {
                // "ou"/"ow" before vowel -> 'aw' (as in "hour"), else 'aw' (approximation)
                phonemes.push('aw');
                i += 2;
                continue;
            }
        }
        const ch = word[i];
        if ('aeiou'.includes(ch)) {
            // Magic-E rule for long vowels
            if (ch === 'a') {
                if (i + 2 < word.length && !('aeiou'.includes(word[i+1])) && word[i+2] === 'e') {
                    phonemes.push('ey');
                } else {
                    phonemes.push('ae');
                }
            } else if (ch === 'e') {
                if (i === word.length - 1) {
                    // silent "e" at end
                } else {
                    phonemes.push('eh');
                }
            } else if (ch === 'i') {
                if (i + 2 < word.length && !('aeiou'.includes(word[i+1])) && word[i+2] === 'e') {
                    phonemes.push('ay');
                } else {
                    phonemes.push('ih');
                }
            } else if (ch === 'o') {
                if (i + 2 < word.length && !('aeiou'.includes(word[i+1])) && word[i+2] === 'e') {
                    phonemes.push('ow');
                } else {
                    phonemes.push('aa');
                }
            } else if (ch === 'u') {
                phonemes.push('ah');
            }
        } else {
            // Consonants
            if (ch === 'c') {
                if (i + 1 < word.length && 'eiy'.includes(word[i+1])) {
                    phonemes.push('s');
                } else {
                    phonemes.push('k');
                }
            } else if (ch === 'g') {
                if (i + 1 < word.length && 'eiy'.includes(word[i+1])) {
                    phonemes.push('jh');
                } else {
                    phonemes.push('g');
                }
            } else if (ch === 'j') {
                phonemes.push('jh');
            } else if (ch === 'x') {
                phonemes.push('k', 's');
            } else if (ch === 'q') {
                phonemes.push('k');
            } else {
                phonemes.push(ch);
            }
        }
        i++;
    }
    // Suffix rules
    if (word.endsWith('ing')) {
        phonemes.splice(phonemes.length - 3, 3, 'ih', 'ng');
    } else if (word.endsWith('ed')) {
        if (phonemes.length > 2) {
            const last = phonemes[phonemes.length - 1];
            if ('tdkg'.includes(last)) {
                phonemes.splice(phonemes.length - 2, 2, last, 't');
            } else {
                phonemes.splice(phonemes.length - 2, 2, last, 'd');
            }
        }
    } else if (word.endsWith('es') || word.endsWith('s')) {
        if (phonemes.length > 2) {
            const last = phonemes[phonemes.length - 1];
            if (['s', 'z', 'sh', 'ch', 'jh'].includes(last)) {
                phonemes.push('ih', 'z');
            } else {
                phonemes.push('z');
            }
        }
    }
    return phonemes;
}

// Get phoneme sequence for a given token (word/punctuation)
function getWordPhonemes(word) {
    word = word.toLowerCase().trim();
    if (!word) return [];
    // If the token is a number (all digits), pronounce each digit
    if (/^\d+$/.test(word)) {
        if (word.length > 1) {
            let phonemes = [];
            for (const digit of word) {
                const digitWord = digitToWord[digit];
                const digitPhonemes = wordToPhonemes[digitWord] || predictPhonemes(digitWord);
                phonemes = phonemes.concat(digitPhonemes);
                if (digit !== word[word.length - 1]) {
                    phonemes.push('sp');
                }
            }
            return phonemes;
        } else {
            const digitWord = digitToWord[word];
            return wordToPhonemes[digitWord] || predictPhonemes[digitWord];
        }
    }
    // Punctuation token
    if (charToPhoneme[word]) {
        return charToPhoneme[word];
    }
    // Direct dictionary lookup
    if (wordToPhonemes[word]) {
        return wordToPhonemes[word];
    }
    // Fallback to prediction
    return predictPhonemes(word);
}

// Map a phoneme to its viseme ID (return 0 if unknown)
function getVisemeFromPhoneme(phoneme) {
    return phonemeToViseme[phoneme] || 0;
}

// Generate a viseme animation sequence for the entire input text
function generateVisemeSequence(text) {
    // Tokenize text into words and punctuation tokens
    const tokens = [];
    let currentToken = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/\s/.test(char)) {
            if (currentToken) {
                tokens.push(currentToken);
                currentToken = '';
            }
            continue;
        } else if (/\d/.test(char)) {
            if (currentToken && !/\d/.test(currentToken[currentToken.length - 1])) {
                tokens.push(currentToken);
                currentToken = char;
            } else {
                currentToken += char;
            }
        } else if ([',', '.', '!', '?', ';', ':', '-', '(', ')'].includes(char)) {
            if (currentToken) {
                tokens.push(currentToken);
                currentToken = '';
            }
            tokens.push(char);
        } else {
            if (currentToken && /\d/.test(currentToken[currentToken.length - 1]) && !/\d/.test(char)) {
                tokens.push(currentToken);
                currentToken = char;
            } else {
                currentToken += char;
            }
        }
    }
    if (currentToken) tokens.push(currentToken);

    const visemeData = [];
    const phonemeData = [];
    let currentTime = 100; // start a bit after 0ms
    tokens.forEach((token, index) => {
        // Record word boundary for highlighting
        wordBoundaryEvents.push({ time: currentTime, wordIndex: index });
        // Determine phonemes for this token
        const phonemes = getWordPhonemes(token);
        if (phonemes.length === 0) return;
        // Base duration per phoneme (shorter if many phonemes)
        const baseDuration = Math.max(60, 100 - (phonemes.length * 5));
        phonemes.forEach(phoneme => {
            const visemeId = getVisemeFromPhoneme(phoneme);
            visemeData.push({ time: currentTime, visemeId: visemeId, token: token, phoneme: phoneme });
            phonemeData.push({ time: currentTime, phoneme: phoneme, visemeId: visemeId, word: token });
            let duration = baseDuration;
            if ('aeiou'.includes(phoneme[0])) {
                duration *= 1.2;    // vowels slightly longer
            } else if (['ch', 'jh', 'sh', 'zh'].includes(phoneme)) {
                duration *= 1.1;    // affricates/fricatives slightly longer
            } else if (phoneme === 'sp') {
                duration *= 1.5;    // pauses longer
            }
            currentTime += duration;
        });
        // Small pause after each token (longer if token was punctuation)
        currentTime += /^[,\.!?;:\-()]$/.test(token) ? 50 : 20;
    });
    // Append a final silent viseme to close mouth at end
    visemeData.push({ time: currentTime, visemeId: 0, token: 'end', phoneme: 'silence' });
    // Update phoneme breakdown display if enabled
    if (showPhonemesCheckbox.checked) {
        displayPhonemeBreakdown(phonemeData);
    }
    return visemeData;
}

// Display the phoneme breakdown in the UI (list phonemes with viseme IDs)
function displayPhonemeBreakdown(phonemeData) {
    phonemeBreakdown.innerHTML = '';
    phonemeData.forEach(item => {
        if (item.phoneme === 'silence') return;  // skip final silence
        const span = document.createElement('span');
        span.className = 'phoneme-item';
        span.innerHTML = `${item.phoneme.toUpperCase()} <span class="viseme-indicator">${item.visemeId}</span>`;
        phonemeBreakdown.appendChild(span);
    });
}

// Highlight the current word being spoken in the displayed text
function highlightWord(wordIndex, text) {
    const tokens = [];
    let currentToken = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/\s/.test(char)) {
            if (currentToken) {
                tokens.push(currentToken);
                currentToken = '';
            }
            tokens.push(' ');
            continue;
        } else if (/\d/.test(char)) {
            if (currentToken && !/\d/.test(currentToken[currentToken.length - 1])) {
                tokens.push(currentToken);
                currentToken = char;
            } else {
                currentToken += char;
            }
        } else if ([',', '.', '!', '?', ';', ':', '-', '(', ')'].includes(char)) {
            if (currentToken) {
                tokens.push(currentToken);
                currentToken = '';
            }
            tokens.push(char);
        } else {
            if (currentToken && /\d/.test(currentToken[currentToken.length - 1]) && !/\d/.test(char)) {
                tokens.push(currentToken);
                currentToken = char;
            } else {
                currentToken += char;
            }
        }
    }
    if (currentToken) tokens.push(currentToken);
    const realTokens = tokens.filter(t => t.trim().length > 0);
    currentWordIndex = wordIndex;
    if (wordIndex >= 0 && wordIndex < realTokens.length) {
        let html = '';
        let foundWords = 0;
        tokens.forEach(token => {
            if (token.trim().length === 0) {
                html += token;  // preserve spaces
            } else {
                if (foundWords === wordIndex) {
                    html += `<span class="speaking-text">${token}</span>`;
                } else {
                    html += token;
                }
                foundWords++;
            }
        });
        spokenTextDisplay.innerHTML = html;
    }
}

function speakText(text) {
    if (!text) return;

    clearAllTimeouts();
    speechSynthesis.cancel();
    setVisemeImage(0);
    spokenTextDisplay.textContent = text;
    speakButton.disabled = true;
    isSpeaking = true;

    const visemeSequence = generateVisemeSequence(text);
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    if (voices.length && voiceSelect.value) {
        utterance.voice = voices[parseInt(voiceSelect.value, 10)];
    }

    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);

    utterance.onstart = () => {
        statusMessage.textContent = 'Speaking...';

        visemeSequence.forEach(({ visemeId, time }) => {
            const scaledTime = time / utterance.rate;
            const timeout = setTimeout(() => setVisemeImage(visemeId), scaledTime);
            animationTimeouts.push(timeout);
        });
    };

    utterance.onboundary = ({ name, charIndex: idx, charLength: len }) => {
        if (name === 'word') {
            highlightCurrentWord(text, idx, len || text.slice(idx).search(/[\s,.!?;:\-()]/) || text.length - idx);

            const currentWord = text.slice(idx, idx + len).trim().toLowerCase();
            const phonemes = getWordPhonemes(currentWord);
            if (phonemes.length) {
                setVisemeImage(getVisemeFromPhoneme(phonemes[0]));
            }

            highlightTimeouts.forEach(clearTimeout);
            highlightTimeouts = [];
        }
    };

    utterance.onend = () => {
        isSpeaking = false;
        statusMessage.textContent = 'Done speaking';
        clearAllTimeouts();
        spokenTextDisplay.textContent = text;
        setTimeout(() => setVisemeImage(0), 25);
        speakButton.disabled = false;
    };

    utterance.onerror = (e) => {
        console.error('Speech error:', e);
        isSpeaking = false;
        statusMessage.textContent = 'Speech error occurred';
        speakButton.disabled = false;
    };

    speechSynthesis.speak(utterance);
}

// Check for presence of viseme images in the local folder
function checkForVisemeImages() {
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

// Handle Speak button clicks
speakButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        if (isSpeaking) {
            // Cancel current speech
            speechSynthesis.cancel();
            isSpeaking = false;
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
    setVisemeImage(0);
    checkForVisemeImages();
});
