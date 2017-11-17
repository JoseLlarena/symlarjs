'use strict';
const { lev, vlev, eddist, veddist, LEVENSHTEIN, GAP } = require('./symlar');
const { gen, sample, sampleOne } = require('testcheck'),
    Benchmark = require('benchmark'),
    leven = require('leven'),
    talisman = require('talisman/metrics/distance/levenshtein'),
    vtalisman = talisman.limited,
    fast_levenshtein = require('fast-levenshtein').get,
    levenshtein_edit_distance = require('levenshtein-edit-distance'),
    js_levenshtein = require('js-levenshtein');

const { log } = console, { max, floor, sqrt } = Math;

const
    N = 10000,
    lefts = non_empty_strings(1, 50, N),
    rights = non_empty_strings(1, 50, N),
    max_dists = small_max_distances(lefts, rights);

log('\n', 'COMPUTATION VS VERIFICATION OF LEVENSHTEIN DISTANCE:\n');

new Benchmark.Suite('',
    {
        maxTime: 120
    })
    .add('symlar/lev               ', harness((L, R, max_d) => lev(L, R) <= max_d))
    .add('symlar/vlev              ', harness((L, R, max_d) => vlev(L, R, max_d)))
    .add('symlar/eddist            ', harness((L, R, max_d) => eddist(L, R, LEVENSHTEIN) <= max_d))
    .add('symlar/veddist           ', harness((L, R, max_d) => veddist(L, R, LEVENSHTEIN, max_d)))
    .add('leven                    ', harness((L, R, max_d) => leven(L, R) <= max_d))
    .add('talisman                 ', harness((L, R, max_d) => talisman(L, R) <= max_d))
    .add('vtalisman                ', harness((L, R, max_d) => vtalisman(max_d, L, R) <= max_d))
    .add('fast-levenshtein         ', harness((L, R, max_d) => fast_levenshtein(L, R) <= max_d))
    .add('js-levenshtein           ', harness((L, R, max_d) => js_levenshtein(L, R) <= max_d))
    .add('levenshtein-edit-distance', harness((L, R, max_d) => levenshtein_edit_distance(L, R) <= max_d))
    .on('cycle', event => log(`\t${event.target}`))
    .on('complete', function()
    {
        log(`\n\tfastest is ${this.filter('fastest').map('name')}`);
    })
    .run({ 'async': false });

function non_empty_strings(min_length, max_length, N)
{
    return sample(
        gen.array(
            gen.char
            .notEmpty()
            .suchThat(c => c !== GAP), { minSize: min_length, maxSize: max_length })
        .then(a => a.join('')), N);
}

function small_max_distances(lefts, rights)
{
    const small_dist = (left_length, right_length) => floor(sqrt(max(left_length, right_length)));

    return lefts.map((left, k) => sampleOne(gen.intWithin(1, small_dist(left.length, rights[k].length))));
}

function harness(fn)
{
    function to_benchmark()
    {
        try
        {
            for (let i = 0; i < N; i++)
                fn(lefts[i], rights[i], max_dists[i]);
        }
        catch (error)
        {
            log(error);
            process.exit(-1);
        }
    }

    return to_benchmark;
}
