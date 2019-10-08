/// utils
function collide(cA, cB) {
    let distX = abs(cA.pos.x - cB.pos.x),
        distY = abs(cA.pos.y - cB.pos.y);
    if (max(distX, distY) > cA.r + cB.r) return false;
    let distSq = distX * distX + distY * distY;

    return distSq <= (cA.r + cB.r) * (cA.r + cB.r);
}
function getUnits(ecs, squadID) {
    let allUnits = ecs.filterEntities(['TYPE_UNIT']);
    return allUnits.filter(e => e.squad === squadID);
}
