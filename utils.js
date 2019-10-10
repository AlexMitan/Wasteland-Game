/// utils
function collide(cA, cB) {
    let distX = abs(cA.pos.x - cB.pos.x),
        distY = abs(cA.pos.y - cB.pos.y);
    if (max(distX, distY) > cA.r + cB.r) return false;
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