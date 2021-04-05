module.exports = function (user, result, secondValue, explode) { // Generate the response for dice rolls
    var reply = "<@" + user + "> rolled a `" + result.value + "`", full = "";
    if (result.modifier || result.natural == result.maxNat || result.natural == result.minNat) { // Only show natural value if it's significant
        reply += "\nNatural: `" + result.natural + "`";
    }
    if (result.modifier) {
        full += "\nModifier: `" + result.modifier + "`";
    }
    if (result.minNat == result.maxNat) { // You suck
        reply += " " + config.roll.neutral;
    }
    else if (!explode) {
        switch (result.natural) { // Crit
            case result.maxNat: reply += " " + config.roll.success; break;
            case result.minNat: reply += " " + config.roll.failure; break;
        }
    }
    if (secondValue || secondValue === 0) { // Advantage/disadvantage
        reply += "\nSecondary roll: `" + secondValue + "`";
    }
    for (let dice in result.rolls) { // Individual rolls
        full += "\n`" + dice + (dice[0] == '-' ? " = -" : " = ") + result.rolls[dice].reduce((a, b) => a + b) + "`: `" + result.rolls[dice].join(", ") + "`";
    }
    return reply.length + full.length < 200 ? reply + full : reply;
};
