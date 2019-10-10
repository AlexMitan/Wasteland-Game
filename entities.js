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
        speed: 5,
        vel: {x: 0, y: 0},
        pos: {x, y},
        r: r || 40,
        fill: fill || [255, 128],
        stroke: stroke || [255, 0],
    }
} 

function makeUnit(hp, attack, speed, squadGuid, size, fill, string) {
    return {
        TYPE_UNIT: true,
        hp: {
            base: hp,
            curr: hp,
        },
        pos: {x: 0, y: 0},
        stats: {
            attack,
            speed,
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
    return makeUnit(10, 1.5, 5, squadGuid, null, null, 'b');
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