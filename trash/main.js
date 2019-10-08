(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const setOps = require('./setOps');

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

class ECS {
    constructor() {
        this.guid = 1;

        // { 0:entity, 1:undefined, 2:entity }
        this.hash = {};
        this.systems = [];

        // { "sprite": [0, 1], "health": [0, 2] }
        this.manager = {};
    }
    addEntities(...entities) {
        for (let entity of entities) {
            this.addEntity(entity);
        }
    }
    addEntity(entity) {
        ensure(typeof entity === 'object', `Entity ${entity} is not an object`);
        // assign a guid if there is none
        if (entity.guid == undefined) entity.guid = this.guid++;
        let guid = entity.guid;
        // if there's already an entity there, throw error if different entity
        if (this.hash[guid] != undefined) {
            if (this.hash[guid] === entity) {
                console.log(`re-adding entity at guid ${guid}`);
            } else {
                throw `ECS.addEntity(entity): Existing entity at id ${guid}: ${this.hash[guid]}`;
            }
        }
        // add entity to hash
        this.hash[guid] = entity;
        // add entity to manager
        for (let component of props(entity)) {
            this.addToManager(component, guid);
        }
    }
    getFirst(components) {
        return Array.from(this.filterGuids(components))[0];
    }
    removeEntities(entities) {
        for (let entity of entities) {
            this.removeEntity(entity);
        }
    }
    removeEntity(entity) {
        let guid = entity.guid;
        // remove entity from hash
        delete this.hash[guid]
        // remove entity from manager
        for (let component of props(entity)) {
            // each manager removes the id from the list
            this.manager[component].delete(guid);
        }
    }
    addSystem(system) {
        // TODO: more to do here?
        this.systems.push(system);
        if (system.process == undefined) {
            console.log(`WARNING: system ${system} does not have a process(ecs) method defined.`);
        }
    }
    updateGuid(guid) {
        ensure(this.hash[guid] != undefined, `No entity mapped at guid ${guid}!`);
        this.updateEntity(this.hash[guid]);
    }
    updateEntity(entity) {
        ensure(typeof entity === 'object', `ECS.updateEntity(entity): Entity ${entity} is not an object`);
        ensure(entity.guid != undefined, `ECS.updateEntity(entity): Entity ${entity} has no guid`);
        ensure(this.hash[entity.guid] != undefined, `ECS.updateEntity(entity): Entity ${entity} not registered with ECS`);
        // components in manager but no longer in entity
        for (let component of props(this.manager)) {
            if (!has(entity, component)) {
                this.manager[component].delete(entity.guid);
            }
        }
        // add entity components to manager
        for (let component of props(entity)) {
            this.addToManager(component, entity.guid);
        }
    }
    addToManager(component, guid) {
        if (has(this.manager, component)) {
            // add to set if existing component type
            this.manager[component].add(guid);
        } else {
            // add set if new component type
            this.manager[component] = (guid == undefined ? new Set() : new Set([guid]));
        }
    }
    updateManager() {
        this.manager = {};
        for (let guid of props(this.hash)) {
            const entity = this.hash[guid];
            // for each component in the object, add to manager
            for (let component of props(entity)) {
                this.addToManager(component, guid);
            }
        }
    }
    filterGuids(components) {
        let { manager } = this;
        if (!has(manager, components[0])) return new Set();
        let set = manager[components[0]];
        for (let component of components.slice(1)) {
            if (has(manager, component)) {
                set = setOps.intersection(set, manager[component]);
            } else {
                return new Set();
            }
        }
        return set;
    }
    filterEntities(components) {
        return Array.from(this.filterGuids(components)).map(guid => this.hash[guid]);
    }
    names(set) {
        let arr = [];
        for (let id of set) {
            ensure(has(this.hash, id), `ECS.names(set): Guid ${id} not in hash.`);
            arr.push(this.hash[id].name);
        }
        return arr;
    }
}
if (true) {
    let ecs = new ECS();
    let player = {
        name: 'player',
        player: true,
        sprite: './player.png',
        health: {
            base: 20,
            regen: 1,
            current: 18
        }
    }
    let enemy = {
        name: 'enemy',
        position: {x: 20, y: 20},
        velocity: {x: 4, y: -2},
        sprite: './enemy.png',
        health: {
            base: 10,
            regen: 5,
            current: 7
        }
    }
    
    let flame = {
        name: 'flame',
        position: {x: 4, y: 4},
        velocity: {x: 0, y: -3},
        friction: {value: 5},
        sprite: './fire.png',
    }
    ecs.addEntity(player);
    ecs.addEntity(enemy);
    ecs.addEntity(flame);
    // ecs.removeEntity(flame);
    // delete flame.position;
    console.log(ecs.names(ecs.filterGuids(['position'])));
    console.log(ecs.names(ecs.filterGuids(['heat'])));
    
    // flame.position = undefined;
    // flame.heat = 5;
    // console.log(ecs.names(ecs.filterGuids(['heat'])));
    // ecs.updateEntity(flame);
    // console.log(ecs.names(ecs.filterGuids(['heat'])));
    // ecs.updateGuid(flame.guid);
    // ecs.updateManager();
    // console.log(ecs.names(ecs.filterGuids(['position'])));
    console.log(ecs.names(ecs.filterGuids(['name','heat'])));
    console.log(ecs);
    
}

module.exports = { ECS };
},{"./setOps":2}],2:[function(require,module,exports){
function isSuperset(set, subset) {
    for (let elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

function union(setA, ...sets) {
    let _union = new Set(setA);
    for (let setB of sets) {
        for (let elem of setB) {
            _union.add(elem);
        }
    }
    return _union;
}

function intersection(setA, ...sets) {
    let _intersection = new Set(setA);
    for (let setB of sets) {
        for (let elem of _intersection) {
            if (!setB.has(elem)) {
                _intersection.delete(elem);
            }
        }
    }
    return _intersection;
}

function difference(setA, ...sets) {
    let _difference = new Set(setA);
    for (let setB of sets) {
        for (let elem of setB) {
            _difference.delete(elem);
        }
    }
    return _difference;
}

module.exports = { isSuperset, union, intersection, difference };
},{}],3:[function(require,module,exports){
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



const ECS = require('./ECS');
let ecs = new ECS.ECS();
console.log('SKETCH START');


function getEntities(cond) {
    return entities.filter(entity => cond(entity));
}
function entitiesNamed(name) {
    return entities.filter(entity => entity.name == name);
}
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
    cd: {
        curr: 0, base: 20,
    },
    hp: {
        curr: 5, base: 5
    },
    dmg: 1,
    TYPE_PLAYER: true,
    fill: [200, 100, 250]
})
// reticle
ecs.addEntity({
    pos: {x: 0, y: 0},
    r:5, fill: [100, 100, 100], TYPE_RETICLE: true
});
// enemies
function makeEnemy(x, y, hp) {
    return {
        pos: {x, y},
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
        this.cooldown = Math.max(this.cooldown - 1, 0);
        if (gameState.cooldown === 0) {
            // new cooldown
            gameState.enemySpawnCd = random(10, 20);
            let enemy = entities.makeEnemy(random(0, width), random(0, height), random(20, 40));
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
            entity.r = sqrt(entity.hp / PI) * 10;
        }
    }
}

function EnemyFollowsPlayerSystem() {
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
    // for (let player of entitiesNamed('player')) {
    //     player.angle = atan2(mouseY - player.y, mouseX - player.x);
    //     if (mouseIsPressed) {
        //     }
        // }
        this.process = function(ecs) {
            let entities = ecs.filterEntities(['TYPE_PLAYER']);
            for (let player of entities) {
                player.angle = atan2(mouseY - player.y, mouseX - player.x);
                if (mouseIsPressed) {
                    player.vel.x += player.speed * cos(player.angle);
                    player.vel.y += player.speed * sin(player.angle);
            }
        }
    }
}

function LifetimeSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities('lifetime');
        // bullet lifetime
        for (let entity of entities) {
            entity.lifetime -= 1;
            if (entity.lifetime <= 0) entity.dead = true;
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
            circle(entity.x, entity.y, entity.r);
        }
    }
}

function ReticleSystem() {
    this.process = function(ecs) {
        // reticle
        for (let reticle of ecs.filterEntities(['TYPE_RETICLE'])) {
            reticle.x = mouseX;
            reticle.y = mouseY;
        }
    }
}

let sys = [
    new EnemySpawnerSystem(),
    new HpToRadiusSystem(),
    new EnemyFollowsPlayerSystem(),
    new PlayerControlSystem(),
    new LifetimeSystem(),
    new DrawingSystem(),
    new ReticleSystem(),
];

function draw() {
    background(0);
    ecs.updateManager();
    for (let system of sys) {
        system.process(ecs);
    }
    console.log('ok?');

    // // collisions
    // for (let entityA of getEntities(e => e.x && e.y && e.r)) {
    //     for (let entityB of getEntities(e => e.x && e.y && e.r && e != entityA)) {
    //         if (collide(entityA, entityB)) {
    //             if (entityA.name == 'enemy' && entityB.name == 'player') {
    //                 entityA.dead = true;
    //                 entityB.hp -= 10;
    //             }
    //             if (entityA.name == 'enemy' && entityB.name == 'bullet') {
    //                 entityA.hp -= 10;
    //             }
    //             if (entityA.name == 'player' && entityB.name == 'health') {
    //                 entityA.hp += entityB.hp;
    //                 entityB.dead = true;
    //             }
    //         }
    //     }
    // }


    
    // // cooldown and shooting
    // for (let player of entitiesNamed('player')) {
    //     // cooldown
    //     player.cd = max(player.cd - 1, 0);
    //     // shooting
    //     if (keyIsPressed && keyCode === 32 && player.cd == 0) {
    //         addEntity({
    //             x: player.x + cos(player.angle + 6) * 10,
    //             y: player.y + sin(player.angle + 6) * 10,
    //             r: 5,
    //             fill: [200, 200, 200],
    //             vx: 10 * cos(player.angle),
    //             vy: 10 * sin(player.angle),
    //             name: 'bullet',
    //             lifetime: 40
    //         });
    //         addEntity({
    //             x: player.x + cos(player.angle - 6) * 10,
    //             y: player.y + sin(player.angle - 6) * 10,
    //             r: 5,
    //             fill: [200, 200, 200],
    //             vx: 10 * cos(player.angle),
    //             vy: 10 * sin(player.angle),
    //             name: 'bullet',
    //             lifetime: 40
    //         });
    //         player.cd += 10;
    //     }
    // }

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
},{"./ECS":1}]},{},[3]);
