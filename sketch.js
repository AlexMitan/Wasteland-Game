
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


let captain = makeUnit(400,
    30, 0,
    50, 0,
    50, 20, 70, playerSquad.guid, 20, [200, 200, 255], '👩‍✈️');

let makePsion = (squadGuid) => makeUnit(100, 
    20, 0, 
    20, 0, 70, 40, 30, squadGuid, 20, null, '🕵️');
let makeSkeleton = (squadGuid) => makeUnit(30,
    5, 0.9, 
    0, 0.1, 
    60, 10, 15, squadGuid, 10, [200], '💀');
let makeDemon = (squadGuid) => makeUnit(100, 
    10, 0.1,
    40, 0.9, 
    300, 20, 40, squadGuid, 30, [200], '👹');
        
ecs.addEntity(captain);
for (let i=0; i<6; i++) {
    let psion = makePsion(playerSquad.guid);
    ecs.addEntity(psion);
}



let mookSquad = makeSquad(550, 120, 100, [255, 0, 0, 100]);
ecs.addEntity(mookSquad);
for (let i=0; i<4; i++) {
    ecs.addEntity(makeDemon(mookSquad.guid));
}
for (let i=0; i<8; i++) {
    ecs.addEntity(makeSkeleton(mookSquad.guid));
}
// 180, 460 weak to magic
let useMagicSquad = makeSquad(180, 460, 100, [0, 0, 255, 100]);
ecs.addEntity(useMagicSquad);
for (let i=0; i<19; i++) {
    ecs.addEntity(makeSkeleton(useMagicSquad.guid));
}
// 580, 400 weak to phys
let usePhysSquad = makeSquad(780, 400, 150, [128, 100]);
ecs.addEntity(usePhysSquad);
for (let i=0; i<7; i++) {
    ecs.addEntity(makeDemon(usePhysSquad.guid));
}

// reticle
ecs.addEntity({
    TYPE_RETICLE: true,
    r: 3,
    fill: [100, 100, 255],
    pos: { x:100, y:100 },
});

// cooldown field
ecs.addEntity(makeModField(300, 180, 60,
    [makeMulMod('physDmg', 1.5), makeMulMod('psiDmg', 1.5)],
    [255, 255, 100, 50]));
ecs.addEntity(makeModField(480, 560, 130,
    [makeMulMod('visibility', 0.2)],
    [0, 255, 200, 50]));
ecs.addEntity(makeAsciiAnim('Touching\n this area\n(while fighting)\n increases\nyour damage', 230, 140, 120, 150, 0.00, 20, 40, [255, 255], [255, 0]));
ecs.addEntity(makeAsciiAnim('Skeletons are weak to\n magical attacks', 100, 570, 120, 150, 0.00, 20, 40, [255, 255], [255, 0]));
ecs.addEntity(makeAsciiAnim('Demons are weak to\n physical attacks', 710, 220, 120, 150, 0.00, 20, 40, [255, 255], [255, 0]));
ecs.addEntity(makeAsciiAnim('Blue lines indicate which\nsquads can see each other', 670, 25, 120, 150, 0.00, 20, 40, [255, 255], [255, 0]));
ecs.addEntity(makeAsciiAnim('Touching this area\n hides you from enemies', 400, 500, 120, 150, 0.00, 20, 40, [255, 255], [255, 0]));

let sys = [
    new TickSystem(),
    new CollisionSystem(),
    new ApplyModsSystem(),
    new CalculateStatsSystem(),
    new VisibilitySystem(),

    new EncounterSystem(),
    new UnitActingSystem(),
    
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