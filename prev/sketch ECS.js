/// utils
function collide(cA, cB) {
    let distX = abs(cA.x - cB.x),
        distY = abs(cA.y - cB.y);
    if (max(distX, distY) > cA.r + cB.r) return false;
    let distSq = distX * distX + distY * distY;

    return distSq <= (cA.r * cA.r + cB.r * cB.r);
}

function moveTowards(objA, objB, amount) {
    let distX = objB.x - objA.x,
        distY = objB.y - objA.y,
        angle = atan2(objB.y - objA.y, objB.x - objA.x);

    objA.x += amount * cos(angle);
    objA.y += amount * sin(angle);
}

function setup() {
    // put setup code here
    createCanvas(1000, 600);
    background(153);
}
let entities = []
let GUID = 0;
function addEntity(entity) {
    entity.GUID = GUID++;
    entities.push(entity);
}
function getEntities(cond) {
    return entities.filter(entity => cond(entity));
}
function entitiesNamed(name) {
    return entities.filter(entity => entity.name == name);
}
// player
addEntity({
    x: 10, y: 10,
    angle: 0,
    vx: 0, vy: 0,
    speed: 1,
    friction: 0.96,
    cd: 0, maxCd: 20,
    hp: 5, maxHp: 5,
    dmg: 1,
    name: 'player',
    fill: [200, 100, 250]
})
// reticle
addEntity({
    x: mouseX, y: mouseY, r:5, fill: [100, 100, 100], name: 'reticle'
});
// enemies
function makeEnemy(x, y, hp) {
    return {x, y, hp, name: 'enemy',
        fill: [200, 50, 50]}
}
addEntity(makeEnemy(100, 100, 20))
addEntity(makeEnemy(200, 300, 10))
addEntity(makeEnemy(400, 400, 50))


function draw() {
    background(0);
    // enemy spawn
    if (frameCount % 60 == 0) {
        addEntity(makeEnemy(random(0, width), random(0, height), random(16, 40)));
    }

    // hp to r
    for (let entity of getEntities(e => e.hp)) {
        entity.r = sqrt(entity.hp / PI) * 10;
    }

    // enemy follows player
    for (let enemy of entitiesNamed('enemy')) {
        let player = entitiesNamed('player')[0];   
        moveTowards(enemy, player, 3);
    }

    // pos += v
    for (let entity of getEntities(e => e.x && e.y && e.vx && e.vy)) {
        entity.x += entity.vx;
        entity.y += entity.vy;
        if (entity.friction) {
            entity.vx *= entity.friction;
            entity.vy *= entity.friction;
        }
    }

    // player controls
    for (let player of entitiesNamed('player')) {
        player.angle = atan2(mouseY - player.y, mouseX - player.x);
        if (mouseIsPressed) {
            player.vx += player.speed * cos(player.angle);
            player.vy += player.speed * sin(player.angle);
        }
    }

    // collisions
    for (let entityA of getEntities(e => e.x && e.y && e.r)) {
        for (let entityB of getEntities(e => e.x && e.y && e.r && e != entityA)) {
            if (collide(entityA, entityB)) {
                if (entityA.name == 'enemy' && entityB.name == 'player') {
                    entityA.dead = true;
                    entityB.hp -= 10;
                }
                if (entityA.name == 'enemy' && entityB.name == 'bullet') {
                    entityA.hp -= 10;
                }
                if (entityA.name == 'player' && entityB.name == 'health') {
                    entityA.hp += entityB.hp;
                    entityB.dead = true;
                }
            }
        }
    }

    // drawing
    for (let entity of getEntities(e => e.x && e.y && e.r && e.fill)) {
        fill(...entity.fill);
        if (entity.stroke)
            stroke(...entity.stroke)
        else 
            stroke(0);
        circle(entity.x, entity.y, entity.r);
    }

    // bullet lifetime
    for (let entity of getEntities(e => e.lifetime)) {
        entity.lifetime -= 1;
        if (entity.lifetime <= 0) entity.dead = true;
    }
    
    // cooldown and shooting
    for (let player of entitiesNamed('player')) {
        // cooldown
        player.cd = max(player.cd - 1, 0);
        // shooting
        if (keyIsPressed && keyCode === 32 && player.cd == 0) {
            addEntity({
                x: player.x + cos(player.angle + 6) * 10,
                y: player.y + sin(player.angle + 6) * 10,
                r: 5,
                fill: [200, 200, 200],
                vx: 10 * cos(player.angle),
                vy: 10 * sin(player.angle),
                name: 'bullet',
                lifetime: 40
            });
            addEntity({
                x: player.x + cos(player.angle - 6) * 10,
                y: player.y + sin(player.angle - 6) * 10,
                r: 5,
                fill: [200, 200, 200],
                vx: 10 * cos(player.angle),
                vy: 10 * sin(player.angle),
                name: 'bullet',
                lifetime: 40
            });
            player.cd += 10;
        }
    }

    // enemy death
    for (let enemy of entitiesNamed('enemy')) {
        if (enemy.hp <= 0) {
            enemy.dead = true;
            for (let i=0; i<4; i++) {
                let angle = random(0, TAU),
                    spd = random(0, 5);
                addEntity({
                    x: enemy.x, y: enemy.y,
                    vx: spd * cos(angle),
                    vy: spd * sin(angle),
                    r: random(5, 15),
                    fill: [200, 200, 0, 100],
                    stroke: [200, 200, 0],
                    lifetime: random(5, 20)
                });
            }
            if (random(100) < 30) {
                let pieces = random(3, 5);
                for (let i=0; i<pieces; i++) {
                    let angle = random(0, TAU),
                        spd = random(0, 5);
                    addEntity({
                        x: enemy.x, y: enemy.y,
                        vx: spd * cos(angle),
                        vy: spd * sin(angle),
                        hp: random(1, 20),
                        fill: [0, 200, 50, 100],
                        stroke: [0, 0, 0, 0],
                        name: 'health'
                    });
                }
            }
        }
    }

    // player death
    for (let player of entitiesNamed('player')) {
        if (player.hp <= 0) {
            player.dead = true;
        }
        if (player.dead) {
            background(200);
        }
    }

    // reticle
    for (let reticle of entitiesNamed('reticle')) {
        reticle.x = mouseX;
        reticle.y = mouseY;
    }

    entities = entities.filter(obj => obj.dead != true);
}