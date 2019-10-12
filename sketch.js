
let ecs = new ECS();

function setup() {
    // put setup code here
    createCanvas(1000, 600);
    background(200, 150, 200);
}
ecs.addEntity({
    gameState: {
        tick: 0,
    }
});
    
let sys = [
    new PlayerControlSystem(),
    new ReticleSystem(),
    new TickSystem(),
    
    new DrawingSystem(),
    new PositionUnitsSystem(),
    new AsciiAnimSystem(),
    new BarSystem(),
    new VelocitySystem(),
    new CombatSystem(),

    new CleanupSystem(),
];

let playerSquad = makeSquad(100, 100, 60, [0, 255, 0, 100]);
playerSquad.TYPE_PLAYER = true;

ecs.addEntity(playerSquad);
let captain = makeUnit(100, 15, 100, playerSquad.guid, 20, [200, 200, 255], '👩‍✈️');
ecs.addEntity(captain);
for (let i=0; i<6; i++) {
    let unit = makeUnit(100, 15, 100, playerSquad.guid, 20, [200, 200, 255], '🕵️');
    ecs.addEntity(unit);
    // ecs.addEntity(makeBasicUnit(playerSquad.guid));
}

let enemySquad = makeSquad(390, 150, 100, [255, 0, 0, 100]);
ecs.addEntity(enemySquad);
let enemySquadAlso = makeSquad(270, 230, 30, [255, 100, 0, 100]);
ecs.addEntity(enemySquadAlso);

ecs.addEntity(makeUnit(400, 10, 400, enemySquadAlso.guid, 40, [200], '🐙'));

for (let i=0; i<19; i++) {
    let unit;
    if (Math.random() < 0.1) 
        unit = makeUnit(300, 10, 400, enemySquad.guid, 30, [200], '👹');
    else
        unit = makeUnit(50, 1, 100, enemySquad.guid, 10, [200], '💀');
        
    ecs.addEntity(unit);
}

// reticle
ecs.addEntity({
    TYPE_RETICLE: true,
    r: 3,
    fill: [100, 100, 255],
    pos: { x:100, y:100 },
});


// ecs.addEntity(makeAsciiAnim('test', 100, 100, 120, 150, 0.05, 20, 40, [255, 255], [255, 0]));

function draw() {
    background(0);
    ecs.updateManager();
    for (let system of sys) {
        system.process(ecs);
    }
}