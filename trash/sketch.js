/// utils
function collide(cA, cB) {
    let distX = abs(cA.pos.x - cB.pos.x),
        distY = abs(cA.pos.y - cB.pos.y);
    if (max(distX, distY) > cA.r + cB.r) return false;
    let distSq = distX * distX + distY * distY;

    return distSq <= (cA.r * cA.r + cB.r * cB.r);
}


function setup() {
    // put setup code here
    createCanvas(1000, 600);
    background(153);
}



// const ECS = require('./ECS');
// let ecs = new ECS.ECS();
let ecs = new ECS();
console.log('SKETCH START');

// player
ecs.addEntity({
    pos: {
        x: 10, y: 10,
    },
    angle: 0,
    vel: {
        x: 0, y: 0
    },
    speed: 1,
    friction: 0.96,
    hp: {
        curr: 50, base: 50
    },
    dmg: 1,
    TYPE_PLAYER: true,
    fill: [200, 100, 250],
    shooting: {
        firing: false,
        cd: {
            base: 4,
            curr: 0
        }
    }
})
// reticle
ecs.addEntity({
    pos: {x: 0, y: 0},
    r:5, fill: [100, 100, 100], TYPE_RETICLE: true
});
// enemies
function makeEnemy(x, y, hp) {
    return {
        pos: {x:x, y:y},
        vel: {x:0, y:0},
        hp: {
            curr: hp,
            base: hp,
        },
        TYPE_ENEMY: true,
        followAmount: 3,
        fill: [200, 50, 50]
    }
}
ecs.addEntity(makeEnemy(100, 100, 20))
ecs.addEntity(makeEnemy(200, 300, 10))
ecs.addEntity(makeEnemy(400, 400, 50))
console.log(ecs);
let gameState = {
    enemySpawnCd: 0,
}

function EnemySpawnerSystem(debug=false) {
    this.process = function(ecs) {
        gameState.enemySpawnCd = Math.max(gameState.enemySpawnCd - 1, 0);
        if (gameState.enemySpawnCd === 0) {
            // new cooldown
            gameState.enemySpawnCd = random(20, 30);
            let enemy = makeEnemy(random(0, width), random(0, height), random(20, 40));
            ecs.addEntity(enemy);
        }
    }
}

function BlankSystem(debug=false) {
    this.filter = [];
    this.debug = debug;
    this.process = function(ecs) {
        let guids = ecs.filterGuids(this.filter);
        this.debug && console.log(`running blank on ${ecs.names(guids)}`);
        for (let guid of guids) {
            let entity = ecs.hash[guid];
            this.debug && console.log(``);
        }
    }
}

function HpToRadiusSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['hp']);
        for (let entity of entities) {
            entity.r = sqrt(entity.hp.curr / PI) * 10 + 10;
        }
    }
}

function EnemyFollowsPlayerSystem() {
    function moveTowards(objA, objB, amount) {
        let distX = objB.pos.x - objA.pos.x,
            distY = objB.pos.y - objA.pos.y,
            angle = atan2(distY, distX);

        objA.pos.x += amount * cos(angle);
        objA.pos.y += amount * sin(angle);
    }

    this.process = function(ecs) {
        let entities = ecs.filterEntities(['TYPE_ENEMY']);
        let players = ecs.filterEntities(['TYPE_PLAYER']);
        for (let entity of entities) {
            // TODO: change to use velocity
            moveTowards(entity, players[0], entity.followAmount);
        }
    }
}

function VelocitySystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['pos', 'vel']);
        console.log(entities.length);
        
        for (let entity of entities) {
            entity.pos.x += entity.vel.x;
            entity.pos.y += entity.vel.y;
            if (entity.friction) {
                entity.vel.x *= entity.friction;
                entity.vel.y *= entity.friction;
            }
        }
    }
}

function PlayerControlSystem() {
    // // player controls
        this.process = function(ecs) {
            let entities = ecs.filterEntities(['TYPE_PLAYER']);
            for (let player of entities) {
                player.angle = atan2(mouseY - player.pos.y, mouseX - player.pos.x);
                if (mouseIsPressed) {
                    player.vel.x += player.speed * cos(player.angle);
                    player.vel.y += player.speed * sin(player.angle);
            }
        }
    }
}

function LifetimeSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['lifetime']);
        // bullet lifetime
        for (let entity of entities) {
            entity.lifetime -= 1;
            if (entity.lifetime <= 0) entity.dead = true;
        }
    }
}

function CleanupSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['dead']);
        for (let entity of entities) {
            if (entity.dead === true){
                ecs.removeEntity(entity);
            }
        }
    }
}

function DrawingSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['pos', 'r', 'fill']);
        
        for (let entity of entities) {
            fill(...entity.fill);
            if (entity.stroke)
                stroke(...entity.stroke)
            else 
                stroke(0);
            
            circle(entity.pos.x, entity.pos.y, entity.r);
        }
    }
}

function CollisionSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['pos', 'r']);
        for (let entityA of entities) {
            for (let entityB of entities) {
                if (entityA !== entityB && collide(entityA, entityB)) {
                    if (entityA.TYPE_ENEMY && entityB.TYPE_PLAYER) {
                        entityA.dead = true;
                        entityB.hp.curr -= 10;
                    }
                    if (entityA.TYPE_ENEMY && entityB.TYPE_PLAYERBULLET) {
                        ecs.addEntity(makeExplosion(entityB.pos.x, entityB.pos.y, 5, 1, [255], null, 3, 5));
                        entityA.hp.curr -= 10;
                        entityB.dead = true;
                    }
                    if (entityA.TYPE_PLAYER && entityB.TYPE_HEALTH) {
                        entityA.hp.curr += entityB.hp.curr;
                        entityB.dead = true;
                    }
                }
            }
        }

    }
    // // collisions
}

function ReticleSystem() {
    this.process = function(ecs) {
        // reticle
        for (let reticle of ecs.filterEntities(['TYPE_RETICLE'])) {
            reticle.pos.x = mouseX;
            reticle.pos.y = mouseY;
        }
    }
}

function OddSystem() {
    this.process = function(ecs) {
        // reticle
        for (let oddity of ecs.filterEntities(['x'])) {
            console.log(oddity)
        }
    }
}

function ShootingSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['shooting'])
        // cooldown and shooting
        for (let entity of entities) {
            // cooldown
            let cd = entity.shooting.cd;
            cd.curr = max(cd.curr - 1, 0);
            // player activation
            if (entity.TYPE_PLAYER) {
                if (keyIsPressed && keyCode === 32 && cd.curr == 0) {
                    ecs.addEntity({
                        pos: {
                            x: entity.pos.x + cos(entity.angle) * 10,
                            y: entity.pos.y + sin(entity.angle) * 10,
                        },
                        r: 5,
                        fill: [200, 200, 200],
                        vel: {
                            x: 10 * cos(entity.angle + random(0.1)),
                            y: 10 * sin(entity.angle + random(0.1)),
                        },
                        TYPE_PLAYERBULLET: true,
                        lifetime: 40,
                    });
                    cd.curr += cd.base;
                }
            }
        }
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

function ExplosionSystem() {
    this.process = function(ecs) {
        let explosions = ecs.filterEntities(['TYPE_EXPLOSION']);
        // { pos: {x,y}, r, n, fill, speed, lifetime }
        for(let explosion of explosions) {
            explosion.dead = true;
            for(let i=0; i<explosion.n; i++) {
                ecs.addEntity(
                    makeParticle(
                        explosion.pos.x,
                        explosion.pos.y, 
                        random(0, TAU), 
                        explosion.speed * random(0.8, 1.2),
                        explosion.r,
                        explosion.lifetime,
                        explosion.fill,
                        explosion.stroke))
            }
        }
    }
}

let sys = [
    new EnemySpawnerSystem(),
    new HpToRadiusSystem(),
    new EnemyFollowsPlayerSystem(),
    new PlayerControlSystem(),
    new ShootingSystem(),
    new VelocitySystem(),
    new CollisionSystem(),
    new ReticleSystem(),
    new LifetimeSystem(),
    new ExplosionSystem(),

    new OddSystem(),
    
    new DrawingSystem(),
    new CleanupSystem(),
];

// { pos: {x,y}, r, n, fill, speed, lifetime }
ecs.addEntity()

function draw() {
    background(0);
    ecs.updateManager();
    for (let system of sys) {
        system.process(ecs);
    }



    

    // // enemy death
    // for (let enemy of entitiesNamed('enemy')) {
    //     if (enemy.hp <= 0) {
    //         enemy.dead = true;
    //         for (let i=0; i<4; i++) {
    //             let angle = random(0, TAU),
    //                 spd = random(0, 5);
    //             addEntity({
    //                 x: enemy.x, y: enemy.y,
    //                 vx: spd * cos(angle),
    //                 vy: spd * sin(angle),
    //                 r: random(5, 15),
    //                 fill: [200, 200, 0, 100],
    //                 stroke: [200, 200, 0],
    //                 lifetime: random(5, 20)
    //             });
    //         }
    //         if (random(100) < 30) {
    //             let pieces = random(3, 5);
    //             for (let i=0; i<pieces; i++) {
    //                 let angle = random(0, TAU),
    //                     spd = random(0, 5);
    //                 addEntity({
    //                     x: enemy.x, y: enemy.y,
    //                     vx: spd * cos(angle),
    //                     vy: spd * sin(angle),
    //                     hp: random(1, 20),
    //                     fill: [0, 200, 50, 100],
    //                     stroke: [0, 0, 0, 0],
    //                     name: 'health'
    //                 });
    //             }
    //         }
    //     }
    // }

    // // player death
    // for (let player of entitiesNamed('player')) {
    //     if (player.hp <= 0) {
    //         player.dead = true;
    //     }
    //     if (player.dead) {
    //         background(200);
    //     }
    // }


    // entities = entities.filter(obj => obj.dead != true);
}