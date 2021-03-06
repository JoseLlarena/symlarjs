const
    undef = obj => typeof(obj) === 'undefined',
    { keys } = Object,
    { min } = Math,
    sq = x => x * x;

const { log } = console;
/*
Map of British English phonemes to phonetic features

PLACE: labial (LA), labiodental (LD), dental (DE), alveolar (AL), post-alveolar (PO), palatal-velar (PV[1-5]), glottal (GL)
OBSTRUCTION (B): stop(T), affricate (AF), fricative (FR), approximant (AP), vowel (H[1-7])
LENGTH (L): long (LO), short (SH)
NASALITY (N): nasal(NA), oral (OR)
ROUNDEDNESS (R): rounded(RO), mid (MI), unrounded (UN)
VOICE (V): voiced(VD), voiceless (UV)
LATERALITY (C): lateral (LT), central(CE)
DIPHTHONG (D)

Place is divided into 8 almost equally-spaced points one for each place of articulation.
Labials, labiodentals and dentals are placed closer to each other as are alveolar, postalveolar and palatal.
Place's variancee is greatest and spans [1,0] with all other dimensions adjusted accordingly
Pbstruction is divided first into 4 points for consonsants then the last interval is divided into 7 vowel heights.
Approximants are placed closer to vowels than an equal-space scheme would give them

==Variances==
*/
const [B, L, N, R, V, C] = [.68, .01, .65, .45, .10, .50],
D = .8,
    //Labial, labiodental and dental are bunched closer together
    //and the palatal-velar range is subdivided in 5 regions to accommodate vowels
    [LA, LD, DE, AL, PO, PV1, PV2, PV3, PV4, PV5, GL] = [1, .885, .750, .571, .428, .285, .249, .213, .177, .142, 0], [ST, AF, FR, AP] = [1 * B, .8 * B, .6 * B, .4 * B], [H1, H2, H3, H4, H5, H6, H7] = [.2 * B, .166 * B, .133 * B, .1 * B, .066 * B, .033 * B, 0], [LO, SH] = [1 * L, 0], [NA, OR] = [1 * N, 0], [RO, MI, UN] = [1 * R, .5 * R, 0], [VD, UV] = [1 * V, 0], [LT, CE] = [1 * C, 0];

const IPA_to_features = {
    ɑː: [PV4, H7, LO, OR, UN, VD, CE],
    æ: [PV2, H6, SH, OR, UN, VD, CE],
    ɐ: [PV3, H6, SH, OR, UN, VD, CE],
    ɔː: [PV5, H3, LO, OR, MI, VD, CE],
    aʊ: [PV1 * D + PV4 * (1 - D), H6 * D + H2 * (1 - D), LO, OR, MI, VD, CE],
    ə: [PV3, H4, SH, OR, UN, VD, CE],
    aɪ: [PV1 * D + PV1 * (1 - D), H6 * D + H2 * (1 - D), LO, OR, UN, VD, CE],
    ɛə: [PV1 * D + PV3 * (1 - D), H4 * D + H4 * (1 - D), LO, OR, UN, VD, CE],
    ɛ: [PV2, H4, SH, OR, UN, VD, CE],
    ɜː: [PV3, H4, LO, OR, UN, VD, CE],
    eɪ: [PV1 * D + PV2 * (1 - D), H4 * D + H2 * (1 - D), LO, OR, UN, VD, CE],
    ɪə: [PV2 * D + PV3 * (1 - D), H2 * D + H4 * (1 - D), LO, OR, UN, VD, CE],
    ɪ: [PV2, H2, SH, OR, UN, VD, CE],
    iː: [PV1, H1, LO, OR, UN, VD, CE],
    i: [PV1, H1, SH, OR, UN, VD, CE],
    ɒ: [PV5, H6, SH, OR, MI, VD, CE],
    əʊ: [PV3 * D + PV4 * (1 - D), H4 * D + H2 * (1 - D), LO, OR, MI, VD, CE],
    ɔɪ: [PV5 * D + PV2 * (1 - D), H3 * D + H2 * (1 - D), LO, OR, MI, VD, CE],
    ʊə: [PV4 * D + PV3 * (1 - D), H2 * D + H4 * (1 - D), LO, OR, MI, VD, CE],
    ʊ: [PV4, H2, SH, OR, MI, VD, CE],
    uː: [PV4, H1, LO, OR, MI, VD, CE],

    b: [LA, ST, SH, OR, RO, VD, CE],
    tʃ: [PO, AF, SH, OR, UN, UV, CE],
    d: [AL, ST, SH, OR, UN, VD, CE],
    ð: [DE, FR, SH, OR, UN, VD, CE],
    f: [LD, FR, SH, OR, UN, UV, CE],
    g: [PV5, ST, SH, OR, UN, VD, CE],
    h: [GL, FR, SH, OR, UN, UV, CE],
    dʒ: [PO, AF, SH, OR, UN, VD, CE],
    k: [PV5, ST, SH, OR, UN, UV, CE],
    l: [AL, AP, SH, OR, RO, VD, LT],
    m: [LA, ST, SH, NA, RO, VD, CE],
    n: [AL, ST, SH, NA, UN, VD, CE],
    ŋ: [PV5, ST, SH, NA, UN, VD, CE],
    p: [LA, ST, SH, OR, RO, UV, CE],
    ɹ: [PO, AP, SH, OR, RO, VD, CE],
    s: [AL, FR, SH, OR, UN, UV, CE],
    ʃ: [PO, FR, SH, OR, UN, UV, CE],
    t: [AL, ST, SH, OR, UN, UV, CE],
    θ: [DE, FR, SH, OR, UN, UV, CE],
    v: [LD, FR, SH, OR, RO, VD, CE],
    w: [PV5, AP, SH, OR, RO, VD, CE],
    j: [PV1, AP, SH, OR, UN, VD, CE],
    z: [AL, FR, SH, OR, UN, VD, CE],
    ʒ: [PO, FR, SH, OR, UN, VD, CE]
};

function left_right_to_cost_from(ipa_to_features)
{
    const phones = keys(ipa_to_features),
        left_right_to_cost = {};

    let i = 0,
        min_cost = Number.MAX_SAFE_INTEGER;

    for (const left_phone of phones)
    {
        const left_features = ipa_to_features[left_phone];

        for (const right_phone of phones.slice(i + 1))
        {
            const right_features = ipa_to_features[right_phone],
                key = `${left_phone} ${right_phone}`;

            left_right_to_cost[key] = left_features
                .map((feat, k) => sq(feat - right_features[k]))
                .reduce((sum, sqdiff) => sum + sqdiff);

            left_right_to_cost[`${right_phone} ${left_phone}`] = left_right_to_cost[key];
            min_cost = min(min_cost, left_right_to_cost[key]);
        }
        i++;
    }

    return [left_right_to_cost, min_cost];
}


const [left_right_to_cost, min_cost] = left_right_to_cost_from(IPA_to_features);

export const
    /**
     * The symbol representing an edit gap, the middle dot, U+00B7
     * @const 
     * @type {string}
     * @default
     */
    GAP = '·'
    /**
     * The levenshtein edit [cost function]{@link cost-function}. Returns 1 for any pair of symbols that is not equal and zero
     * otherwise.
     * @const
     * @type {cost-function}
     * @default
     */
    ,
    LEVENSHTEIN = (q, h) => (q === h ? 0 : 1),
    /**
     * A British English phonetic [cost function]{@link cost-function} between the strings representing the phonemes in the 
     * International Phonetic alphabet.
     * 
     * The costs are normalised between 0 and 1. For non-phonetic inputs it behaves like the {@link LEVENSHTEIN} function
     * 
     * @const
     * @type {cost-function}
     * @default
     */
    EN_GB_PHONE = (left, right) =>
    {
        return left === right ? 0 :
            left === GAP || right === GAP ? .25 :
            undef(IPA_to_features[left]) || undef(IPA_to_features[right]) ? 1 :
            left_right_to_cost[`${left} ${right}`];
    };

EN_GB_PHONE.min_cost = min_cost;
EN_GB_PHONE.max_cost = 1;
LEVENSHTEIN.min_cost = 1;
LEVENSHTEIN.max_cost = 1;