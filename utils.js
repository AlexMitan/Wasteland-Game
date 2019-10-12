/// utils
function collide(cA, cB) {
    let distX = Math.abs(cA.pos.x - cB.pos.x),
        distY = Math.abs(cA.pos.y - cB.pos.y);
    if (Math.max(distX, distY) > cA.r + cB.r) return false;
    let distSq = distX * distX + distY * distY;

    return distSq <= (cA.r + cB.r) * (cA.r + cB.r);
}
function getUnits(ecs, squadGuid) {
    let allUnits = ecs.filterEntities(['TYPE_UNIT']);
    return allUnits.filter(e => e.squadGuid === squadGuid);
}
function pickFrom(arr) {
    return arr[Math.floor(Math.random()*arr.length)]
}

function setText(_size, _fill) {
    textSize(_size);
    fill(_fill);
    noStroke();
}

function ensure(cond, message) {
    if (!cond) throw message;
}

function props(obj) {
    let arr = [];
    for (let property in obj) {
        if (obj.hasOwnProperty(property) && obj[property] != undefined) {
            arr.push(property);
        }
    }
    return arr;
}

function has(obj, prop) {
    return obj.hasOwnProperty(prop) && obj[prop] != undefined;
}

let debug = 10;
function debugLog() {
    if (debug > 0) {
        debug--;
        console.log(...arguments)
    }
}