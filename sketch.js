
let ecs = new ECS();

function setup() {
    // put setup code here
    createCanvas(1000, 600);
    background(200, 150, 200);
}
let gameState = {
    enemySpawnCd: 0,
}


let sys = [
    new PlayerControlSystem(),
    new ReticleSystem(),
    new DrawingSystem(),
    new CleanupSystem(),
    new RenderUnitsSystem(),
];

let playerSquad = {
    TYPE_PLAYER: true,
    TYPE_SQUAD: true,
    r: 80,
    fill: [100, 100, 255, 50],
    pos: { x:100, y:100 },
    // vel: { x: 0, y: 0},
    speed: 5,
};


ecs.addEntity(playerSquad);
for (let i=0; i<7; i++) {
    // let unit = makeUnit(10, 3, 3, playerSquad.guid, 10, [255], 'i');
    // ecs.addEntity(unit);
    ecs.addEntity(makeBasicUnit(playerSquad.guid));
}

let enemySquad = {
    TYPE_SQUAD: true,
    r: 100,
    fill: [200, 100, 255, 50],
    pos: { x:150, y:100 },
    // vel: { x: 0, y: 0},
    speed: 5,
};

ecs.addEntity(enemySquad);
for (let i=0; i<19; i++) {
    // let unit;
    // if (Math.random() < 0.3) 
    //     unit = makeUnit(20, 5, 5, enemySquad.guid, 15, [200], '[T]');
    // else
    //     unit = makeUnit(15, 5, 5, enemySquad.guid, 7, [200], '..');
    ecs.addEntity(makeBasicUnit(enemySquad.guid));
}

// reticle
ecs.addEntity({
    TYPE_RETICLE: true,
    r: 3,
    fill: [100, 100, 255],
    pos: { x:100, y:100 },
});

function makeNote(text, x, y, rate, size, fill, stroke) {
    return {
        TYPE_NOTE: true,
        pos: {x, y},
        text: text || 'DEFAULT NOTE',
        progress: 0,
        rate: rate || 0.1,
        size: size || 10,
        fill: fill || [255],
        stroke: stroke || [255],
    }
}

ecs.addEntity(makeNote('test', 100, 100));

function draw() {
    background(0);
    ecs.updateManager();
    for (let system of sys) {
        system.process(ecs);
    }
}