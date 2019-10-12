function makeExplosion(x, y, r, n, fill, stroke, speed, lifetime) {
    return {
        TYPE_EXPLOSION: true,
        pos: { x, y },
        r, n,
        fill: fill || [255, 255, 0, 100], 
        stroke: stroke || [0, 0, 0, 0],
        speed: speed || 10, 
        lifetime: lifetime || 10,
    }
}

function makeParticle(x, y, angle, speed, r, lifetime, fill, stroke) {
    return {
        pos: { x, y },
        r: r || 5,
        fill: fill || [255],
        vel: {
            x: speed * cos(angle),
            y: speed * sin(angle),
        },
        stroke,
        lifetime: lifetime || 10,
    };
}

function makeSquad(x, y, r, fill, stroke) {
    return {
        containsUnits: {
        },
        lastCombat: new Set(),
        currentCombat: new Set(),
        speed: 5,
        vel: {x: 0, y: 0},
        pos: {x, y},
        r: r || 40,
        collisions: null,
        fill: fill || [255, 128],
        stroke: stroke || [255, 0],
    }
} 
function makeModArea(x, y, r, mods, fill, stroke) {
    return {
        pos: {x, y},
        r: r || 40,
        collisions: null,
        fill: fill || [255, 128],
        stroke: stroke || [255, 0],
        appliesMods: mods,
    }
}

function makeCollision(entityA, entityB) {
    return {
        collision: {
            entityA, entityB
        }
    }
}

function makeNote(text, x, y, rate) {
    return makeAsciiProjectile(text, x, y, x, y-10, rate || 0.1, 20, [255]);
}

function makeMod(stat, prio, change) {
    return {
        stat, prio, change
    }
}

function makeMulMod(stat, factor) {
    return makeMod(stat, 1, stat => stat * factor);
}

function makeAddMod(stat, add) {
    return makeMod(stat, 1, stat => stat + add);
}

function makeUnit(hp, attack, cooldown, squadGuid, size, fill, string) {
    return {
        TYPE_UNIT: true,
        pos: {x:0, y:0},
        mods: [],
        stats: {
            hp: {
                max: hp,
                base: hp,
                curr: 0,
            },
            cooldown: {
                max: cooldown * 2,
                base: cooldown,
                curr: 0,
            },
            attack: {
                base: attack,
                curr: 0
            },
            speed: {
                base: 5,
                curr: 0,
            }
        },
        textRender: {
            size: size || 20,
            fill: fill || [255],
            string: string || '?',
        },
        squadGuid: squadGuid,
    }
}

function makeBasicUnit(squadGuid) {
    return makeUnit(10, 2, 10, squadGuid, 10, [255], 'T');
}

function makeAsciiAnim(text, xa, ya, xb, yb, rate, sizeA, sizeB, fillA, fillB) {
    return {
        // initial state
        asciiAnim: {
            text,
            initialState: {
                pos: {x:xa, y:ya},
                size: sizeA, 
                fill: fillA,
            },
            // final state
            finalState: {
                pos: {x:xb, y:yb},
                size: sizeB, 
                fill: fillB,
            },
            // progress
            progress: 0,
            rate,
        }
    }
}

function makeAsciiProjectile(text, xa, ya, xb, yb, rate, size, fill) {
    return makeAsciiAnim(text, xa, ya, xb, yb, rate, size, size, fill, fill);
}