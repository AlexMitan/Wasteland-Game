
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
    

let playerSquad = makeSquad(100, 100, 100, [0, 255, 0, 100]);
playerSquad.TYPE_PLAYER = true;
ecs.addEntity(playerSquad);

let mookSquad = makeSquad(390, 150, 100, [255, 0, 0, 100]);
ecs.addEntity(mookSquad);
let giantSquad = makeSquad(270, 250, 40, [255, 100, 0, 100]);
ecs.addEntity(giantSquad);

let captain = makeUnit(100, 5, 100, playerSquad.guid, 20, [200, 200, 255], '👩‍✈️');
ecs.addEntity(captain);
for (let i=0; i<6; i++) {
    let unit = makeUnit(100, 4, 100, playerSquad.guid, 20, [200, 200, 255], '🕵️');
    ecs.addEntity(unit);
    // ecs.addEntity(makeBasicUnit(playerSquad.guid));
}


ecs.addEntity(makeUnit(400, 50, 300, giantSquad.guid, 40, [200], '🐙'));

for (let i=0; i<7; i++) {
    let unit;
    if (Math.random() < 0.15) 
        unit = makeUnit(300, 10, 400, mookSquad.guid, 30, [200], '👹');
    else
        unit = makeUnit(30, 2, 100, mookSquad.guid, 10, [200], '💀');
        
    ecs.addEntity(unit);
}

// reticle
ecs.addEntity({
    TYPE_RETICLE: true,
    r: 3,
    fill: [100, 100, 255],
    pos: { x:100, y:100 },
});
  
let forest = ecs.addEntity(makeModArea(200, 300, 30,
    [makeMulMod('attack', 5)],
    [0, 255, 100, 100]));
// ecs.addEntity(makeAsciiAnim('test', 100, 100, 120, 150, 0.05, 20, 40, [255, 255], [255, 0]));

let sys = [
    new TickSystem(),
    new CollisionSystem(),
    new ApplyModsSystem(),
    new CalculateStatsSystem(),
    new CombatSystem(),
    
    new PositionUnitsSystem(),
    new DrawingSystem(),
    
    new PlayerControlSystem(),
    new ReticleSystem(),
    new VelocitySystem(),

    new UnitUpdateSystem(),
    
    new AsciiAnimSystem(),
    new BarSystem(),
    new CleanupSystem(),
];
function draw() {
    background(0);
    ecs.updateManager();
    for (let system of sys) {
        system.process(ecs);
    }
}