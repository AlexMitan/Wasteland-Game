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
        squad: {
            speed: 5
        },
        pos: {x, y},
        r: r || 40,
        fill: fill || [255, 128],
        stroke: stroke || [255, 0],
    }
} 

function makeUnit(hp, attack, speed, squadGuid, size, fill, letter) {
    return {
        TYPE_UNIT: true,
        hp: {
            base: hp,
            curr: hp,
        },
        pos: {x: 0, y: 0},
        attack,
        speed,
        size: size || 20,
        fill: fill || [255],
        squadGuid: squadGuid,
        letter: letter || ' ',
    }
}

function makeBasicUnit(squadGuid) {
    return makeUnit(10, 1, 5, squadGuid, null, null, 'b');
}