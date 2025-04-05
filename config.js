// URLs for all viseme images - using local paths
export const imageUrls = [];
for (let i = 0; i <= 21; i++) {
    imageUrls.push(`./viseme-images/viseme-${i}.jpg`);
}

// Phoneme-to-viseme mapping table (viseme IDs 0–21)
export const phonemeToViseme = {
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
export const digitToWord = {
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
export const charToPhoneme = {
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
export const wordToPhonemes = {
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
