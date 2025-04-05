import { phonemeToViseme, wordToPhonemes, digitToWord, charToPhoneme } from './config.js';
import { phonemeBreakdown } from './domElements.js';

// Additional phonemes for non-English languages
const extendedPhonemeToViseme = {
    // Spanish specific phonemes
    'ɲ': 14,  // ñ (Spanish palatal nasal)
    'β': 16,  // Spanish b/v approximant
    'ð̞': 17,  // Spanish d approximant
    'ɣ': 15,  // Spanish g approximant
    'ɾ': 21,  // Spanish tap/flap r
    'r': 21,  // Spanish trilled r

    // French specific phonemes
    'ɑ̃': 2,   // French nasal vowel as in "sans"
    'ɛ̃': 4,   // French nasal vowel as in "vin"
    'œ̃': 3,   // French nasal vowel as in "un"
    'ɔ̃': 3,   // French nasal vowel as in "bon"
    'œ': 3,   // French vowel as in "cœur"
    'ø': 7,   // French vowel as in "peu"
    'y': 7,   // French vowel as in "tu"
    'ʁ': 21,  // French uvular r

    // German specific phonemes
    'ç': 11,  // German ich-laut
    'x': 15,  // German ach-laut
    'ʏ': 7,   // German vowel as in "hübsch"
    'œ': 3,   // German vowel as in "schön"
    'pf': 16, // German affricate

    // Russian approximations
    'ɨ': 6,   // Russian vowel 'ы'
    'ɵ': 4,   // Central rounded vowel
    'ʂ': 11,  // Retroflex sibilant
    'ɕ': 11,  // Alveolo-palatal fricative
    'ts': 14, // Affricate
    'tɕ': 11, // Affricate
};

// Combine base and extended phoneme mappings
const allPhonemeToViseme = { ...phonemeToViseme, ...extendedPhonemeToViseme };

// Map a phoneme to its viseme ID (return 0 if unknown)
export function getVisemeFromPhoneme(phoneme) {
    return allPhonemeToViseme[phoneme] || 0;
}

// Predict phonemes for a word (if not in dictionary) using basic rules
export function predictPhonemes(word) {
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
            // Spanish-specific combinations
            if (di === 'rr') { phonemes.push('r'); i += 2; continue; } // Spanish rolled r
            if (di === 'ñ') { phonemes.push('ɲ'); i += 2; continue; }  // Spanish ñ
            if (di === 'll') { phonemes.push('y'); i += 2; continue; }  // Spanish ll as in "llamar"
            // German-specific combinations
            if (di === 'eu') { phonemes.push('oy'); i += 2; continue; } // German "eu" as in "heute"
            if (di === 'ei') { phonemes.push('ay'); i += 2; continue; } // German "ei" as in "nein"
            if (di === 'ie') { phonemes.push('iy'); i += 2; continue; } // German "ie" as in "Liebe"
            // French-specific combinations
            if (di === 'ou') { phonemes.push('uw'); i += 2; continue; } // French "ou" as in "vous"
            if (di === 'an' || di === 'am' || di === 'en' || di === 'em') { 
                phonemes.push('ɑ̃'); i += 2; continue; // French nasal vowel
            }
            if (di === 'in' || di === 'im' || di === 'yn' || di === 'ym') { 
                phonemes.push('ɛ̃'); i += 2; continue; // French nasal vowel
            }
            if (di === 'on' || di === 'om') { 
                phonemes.push('ɔ̃'); i += 2; continue; // French nasal vowel
            }
            // Vowel combinations
            if (di === 'ee') { phonemes.push('iy'); i += 2; continue; }
            if (di === 'ea') { phonemes.push('iy'); i += 2; continue; }
            if (di === 'ai' || di === 'ay') { phonemes.push('ey'); i += 2; continue; }
            if (di === 'ow' || di === 'oa') { phonemes.push('ow'); i += 2; continue; }
            if (di === 'oo') { phonemes.push('uw'); i += 2; continue; }
            if (di === 'oy' || di === 'oi') { phonemes.push('oy'); i += 2; continue; }
            if (di === 'au' || di === 'aw') { phonemes.push('ao'); i += 2; continue; }
            if (di === 'ou' || di === 'ow') {
                phonemes.push('aw'); // "ou"/"ow" -> 'aw'
                i += 2;
                continue;
            }
        }
        const ch = word[i];
        // Handle international characters
        if ('áàâäãå'.includes(ch)) { phonemes.push('aa'); i++; continue; }
        if ('éèêë'.includes(ch)) { phonemes.push('eh'); i++; continue; }
        if ('íìîï'.includes(ch)) { phonemes.push('iy'); i++; continue; }
        if ('óòôöõø'.includes(ch)) { phonemes.push('ow'); i++; continue; }
        if ('úùûü'.includes(ch)) { phonemes.push('uw'); i++; continue; }
        if (ch === 'ç') { phonemes.push('s'); i++; continue; }
        if (ch === 'ñ') { phonemes.push('ɲ'); i++; continue; }
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
export function getWordPhonemes(word) {
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

// Display the phoneme breakdown in the UI (list phonemes with viseme IDs)
export function displayPhonemeBreakdown(phonemeData) {
    phonemeBreakdown.innerHTML = '';
    phonemeData.forEach(item => {
        if (item.phoneme === 'silence') return;  // skip final silence
        const span = document.createElement('span');
        span.className = 'phoneme-item';
        span.innerHTML = `${item.phoneme.toUpperCase()} <span class="viseme-indicator">${item.visemeId}</span>`;
        phonemeBreakdown.appendChild(span);
    });
}