const rollParser = require("roll-parser"); // Dice rolls

const maxDice = 10000; // Hard limit
const operators = ['+', '-']; // Operators to parse

function roll(query) { // Roll dice
    var parse = parseQuery(query);
    if (parse) {
        return rollParse(parse);
    }
}

function advantage(query) { // Roll with advantage
    var parse = parseQuery(query);
    if (parse) {
        return [rollParse(parse), rollParse(parse)].sort((a, b) => b.value - a.value);
    }
}

function disadvantage(query) { // Roll with disadvantage
    var parse = parseQuery(query);
    if (parse) {
        return [rollParse(parse), rollParse(parse)].sort((a, b) => a.value - b.value);
    }
}

function exploding(query) { // Roll exploding dice
    var parse = parseQuery(query);
    if (parse) {
        return rollParse(parse, true);
    }
}

function hits(query) { // Roll dice with a threshold
    var parse = rollParser.parse(query);
    if (parse && parse.success) {

    }
}

function stat(count) { // Roll a single stat
    if (count <= exports.maxDice) {
        return rollStat(count);
    }
}

function stats(count) { // Roll six stats
    if (count <= exports.maxDice) {
        var results = [];
        for (let i = 0; i < 6; i++) {
            results.push(rollStat(count));
        }
        return results.sort((a, b) => b - a);
    }
}

function customParse(query) { // Modify roll-parser's parse result
    var parse = rollParser.parse(query.substring(operators.includes(query[0])));
    if (parse && parse.count <= exports.maxDice) {
        return {
            query: query,
            positive: query[0] != '-',
            count: parse.count,
            dice: parse.dice,
            min: parse.count,
            max: parse.count * parse.dice
        };
    }
}

function parseQuery(query) { // Parse a query into rolls and modifiers
    var foo = "", bar, pq = {
        rolls: [],
        modifier: 0
    };
    for (let i = 0; i < query.length; i++) {
        if (foo && operators.includes(query[i])) { // Push stack
            if (bar = Number(foo)) { // Modifier
                pq.modifier += bar;
            }
            else if (bar = customParse(foo)) { // Dice Roll
                pq.rolls.push(bar);
            }
            else { // Nothing
                return;
            }
            foo = ""; // New stack
        }
        foo += query[i];
    }
    if (bar = Number(foo)) { // One more for the road
        pq.modifier += bar;
    }
    else if (bar = customParse(foo)) {
        pq.rolls.push(bar);
    }
    else {
        return;
    }
    return pq;
}

function dupeNumber(obj, key, n = 2) { // Find the number of dupes there are
    return obj[key + " (" + n + ")"] ? dupeNumber(obj, key, n + 1) : n;
}

function diceRoller(dice, explode) { // Actually roll the dice
    var results = [];
    for (let i = 0; i < dice.count; i++) {
        results.push(Math.ceil(Math.random() * dice.dice));
        if (explode && dice.dice != 1 && results[results.length - 1] == dice.dice) {
            i--;
        }
    }
    return results;
}

function rollParse(parse, explode = false) { // Roll all dice from a parsed query
    return parse.rolls.reduce((results, current) => {
        let foo = diceRoller(current, explode).sort((a, b) => b - a), bar = foo.reduce((a, b) => a + b) * (current.positive ? 1 : -1);
        results.value += bar;
        results.natural += bar;
        results.minNat += current.min;
        results.maxNat += current.max;
        if (results.rolls[current.query]) {
            results.rolls[current.query + " (" + dupeNumber(results.rolls) + ")"] = foo;
        }
        else {
            results.rolls[current.query] = foo;
        }
        return results;
    }, {
        value: parse.modifier,
        natural: 0,
        modifier: parse.modifier,
        minNat: 0,
        maxNat: 0,
        rolls: {}
    });
}

function rollStat(count) { // Best three of nd6, reroll 1s once
    var foo, results = [];
    for (let i = 0; i < count; i++) {
        foo = Math.ceil(Math.random() * 6);
        results.push(foo == 1 ? Math.ceil(Math.random() * 6) : foo);
    }
    return results.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b);
}

module.exports = {
    maxDice,
    roll,
    advantage,
    disadvantage,
    exploding,
    hits,
    stat,
    stats
};
