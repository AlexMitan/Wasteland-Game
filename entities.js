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

function makeUnit(hp, attack, speed, squadGuid, r, fill, letter) {
    return {
        TYPE_UNIT: true,
        hp, attack, speed,
        r: r || 3,
        fill: fill || [255],
        squad: squadGuid,
        letter: letter || ' ',
    }
}

function makeBasicUnit(squadGuid) {
    return makeUnit(10, 1, 5, squadGuid, 5, [255], 'b');
}