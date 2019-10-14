function HpToRadiusSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['hp']);
        for (let entity of entities) {
            entity.r = sqrt(entity.hp.curr / PI) * 10 + 10;
        }
    }
}

function TickSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['gameState']);
        for (let entity of entities) {
            entity.gameState.tick += 1;
            fill(255);
            textSize(20);
            noStroke();
            text(entity.gameState.tick, 20, 20);
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
        let reticle = ecs.filterEntities(['TYPE_RETICLE'])[0];
        for (let player of entities) {
            let angle = atan2(reticle.pos.y - player.pos.y, reticle.pos.x - player.pos.x);
            if (dist(reticle.pos.x, reticle.pos.y, player.pos.x, player.pos.y) > 3) {
                player.pos.x += player.speed * cos(angle);
                player.pos.y += player.speed * sin(angle);
            } else {
                player.pos.x = reticle.pos.x;
                player.pos.y = reticle.pos.y;
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
            if (entity.lifetime <= 0){
                entity.dead = true;
                ecs.updateEntity(entity);
            } 
                
        }
    }
}

function VisibilitySystem() {
    this.process = function(ecs) {
        let squads = ecs.filterEntities(['containsUnits']);
        for (let squad of squads) {
            let units = getUnits(ecs, squad.guid);

            let visibility = units
                .map(u => u.stats.visibility.curr)
                .reduce((acc, curr) => acc + curr);
            let sensors = units
                .map(u => u.stats.sensors.curr)
                .reduce((acc, curr) => acc + curr);

            // setText(40, [128]);
            // text('size:' + visibility, squad.pos.x + squad.r, squad.pos.y - squad.r);
            // stroke(128);
            // noFill();
            // circle(squad.pos.x, squad.pos.y, visibility * 2);

            // setText(40, [0, 255, 255]);
            // text('vision:' + sensors, squad.pos.x + squad.r, squad.pos.y - squad.r - 30);
            // stroke([0, 255, 255]);
            // noFill();
            // circle(squad.pos.x, squad.pos.y, sensors * 2);


            squad.squadStats.visibility = visibility;
            squad.squadStats.sensors = sensors;
        }
        for (let squadA of squads) {
            for (let squadB of squads) {
                // S---|          : 4
                //       |-----V  : 6
                //      @
                // S-----------V  : 11
                if (squadA === squadB) continue;
                let distAB = dist(squadA.pos.x, squadA.pos.y, squadB.pos.x, squadB.pos.y);
                let distX = squadB.pos.x - squadA.pos.x;
                let distY = squadB.pos.y - squadA.pos.y;
                let sensA = squadA.squadStats.sensors;
                let visB = squadB.squadStats.visibility
                let detectDist = distAB - (sensA + visB);
                // setText(20, 255);
                // text('👁️', (squadA.pos.x + squadB.pos.x) / 2, (squadA.pos.y + squadB.pos.y) / 2);
                if (squadA.TYPE_PLAYER) continue;
                if (detectDist < 0) { 
                    stroke(0, 255, 255, 100);
                    line(squadA.pos.x, squadA.pos.y, squadB.pos.x, squadB.pos.y);
                } else if (detectDist < 200) {
                    let angle = atan2(distY, distX);
                    let eyeX = squadA.pos.x + cos(angle) * (visB + sensA - squadB.r);
                    let eyeY = squadA.pos.y + sin(angle) * (visB + sensA - squadB.r);
                    text('👁️' + Math.round(detectDist),
                        eyeX, eyeY);
                    // text('👁️' + Math.round(detectDist), 
                    //     (squadA.pos.x * visB + squadB.pos.x * sensA) / (visB + sensA), 
                    //     (squadA.pos.y * visB + squadB.pos.y * sensA) / (visB + sensA));
                }
            }
        }
    }
}

function CleanupSystem() {
    this.process = function(ecs) {
        // clean up empty squads

        
        let entities = ecs.filterEntities(['dead']);
        for (let entity of entities) {
            if (entity.dead === true){
                ecs.removeEntity(entity);
                let tick = ecs.filterEntities(['gameState'])[0].gameState.tick;
                // console.log('entity', entity.guid, 'removed on tick', tick);
            }
        }
    }
}

function DrawingSystem() {
    function customText(_str, x, y, size, _fill, _stroke) {
        function monoOffset(n) {
            return 13 / 40 * n;
        }
        textFont('Courier New');
        stroke(_stroke || [0, 0]);
        fill(_fill);
        textSize(size);
        text(_str, x - monoOffset(size), y);
    }
                    
    this.process = function(ecs) {
        let circleRenderEntities = ecs.filterEntities(['pos', 'r', 'fill']);
        
        for (let entity of circleRenderEntities) {
            fill(...entity.fill);
            if (entity.stroke)
                stroke(...entity.stroke)
            else 
                stroke(0);
            
            circle(entity.pos.x, entity.pos.y, entity.r * 2);
        }

        let textRenderEntities = ecs.filterEntities(['pos', 'textRender']);
        for (let entity of textRenderEntities) {
            // textRender: {
            //     x: null, y: null,
            //     size: size || 20,
            //     fill: fill || [255],
            //     string: string || '?',
            // },
            let {size, fill, string} = entity.textRender;
            let {x, y} = entity.pos;
            customText(string, x, y, size, fill, null);
        }
    }
}

function CollisionSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['pos', 'r']);
        for (let entityA of entities) {
            entityA.collisions = new Set();
            for (let entityB of entities) {
                if (entityA !== entityB && collide(entityA, entityB)) {
                    entityA.collisions.add(entityB.guid);
                }
                // setText(30, 255);
                // text([...entityA.collisions].join(','), 
                //     entityA.pos.x, entityA.pos.y - entityA.r);
            }
        }
    }
}

function ReticleSystem() {
    this.process = function(ecs) {
        // reticle
        for (let reticle of ecs.filterEntities(['TYPE_RETICLE'])) {
            if (mouseIsPressed) {
                setText(20, [255]);
                text(reticle.pos.x + ', ' + reticle.pos.y, reticle.pos.x, reticle.pos.y);
                reticle.pos.x = mouseX;
                reticle.pos.y = mouseY;
            }
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


function ExplosionSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['TYPE_EXPLOSION']);
        // { pos: {x,y}, r, n, fill, speed, lifetime }
        for(let entity of entities) {
            entity.dead = true;
            ecs.updateEntity(entity);
            
            for(let i=0; i<entity.n; i++) {
                ecs.addEntity(
                    makeParticle(
                        entity.pos.x,
                        entity.pos.y, 
                        random(0, TAU), 
                        entity.speed * random(0.8, 1.2),
                        entity.r,
                        entity.lifetime,
                        entity.fill,
                        entity.stroke))
            }
        }
    }
}

function PositionUnitsSystem() {
    function ringCapacity(ring) {
        if (ring === 0) return 1;
        else return ring * 6;
    }
    function getRing(n) {
        // 0 1 7 18
        if (n === 0) return 0;
        let ring = 0;
        while (n > 0) {
            ring += 1;
            n -= ring * 6;
        }
        return ring;
    }
    this.ringDict = {
        ringOf: [],
        ringCapacity: [],
        ringBounds: [],
        maxCalculation: 0
    }
    this.init = function(n) {
        let dict = this.ringDict;

        dict.ringOf[0] = 0;
        dict.ringCapacity[0] = 1;
        dict.ringBounds[0] = [0, 0];

        for (let i=1; i<n; i++) {
            let ring = getRing(i);
            dict.ringOf[i] = ring;
            if (ring > dict.ringOf[i-1]) {
                firstInRing = i;
                dict.ringBounds[ring] = [i, i + ringCapacity(ring) - 1];
            }
        }
        dict.maxCalculation = n;
    }


    this.process = function(ecs) {
        let squads = ecs.filterEntities(['containsUnits']);

        for (let squad of squads) {
            let myUnits = getUnits(ecs, squad.guid);
            if (myUnits.length > this.ringDict.maxCalculation) {
                this.init(myUnits.length + 100);
            } 
            let maxRing = max(1, getRing(myUnits.length - 1));
            // render its units
            for (let i=0; i<myUnits.length; i++) {
                let ring = this.ringDict.ringOf[i];
                let ringBounds = this.ringDict.ringBounds[ring];
                let angle = map(i, ringBounds[0], ringBounds[1] + 1, 0, TAU);
                let unit = myUnits[i];
                // let offset = ring * squad.r / sqrt(myUnits.length) * 2;
                let offset = ring / maxRing * squad.r * 0.8;
                let unitX = squad.pos.x + cos(angle) * offset,
                    unitY = squad.pos.y + sin(angle) * offset;

                unit.pos.x = unitX;
                unit.pos.y = unitY;
            }
        }
    }
}

function AsciiAnimSystem() {
    // this.example = {
    //     asciiAnim: {
    //         text,
    //         initialState: {
    //             pos: {x, y},
    //             size, fill,
    //         },
    //         finalState: {
    //             pos: {x, y},
    //             size, fill,
    //         },
    //         progress: 0,
    //         rate: 0.1,
    //     }
    // }
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['asciiAnim']);
        for (let entity of entities) {
            let anim = entity.asciiAnim;
            let { initialState, finalState } = anim;
            let x = map(anim.progress, 0, 1, initialState.pos.x, finalState.pos.x);
            let y = map(anim.progress, 0, 1, initialState.pos.y, finalState.pos.y);
            let size = map(anim.progress, 0, 1, initialState.size, finalState.size);
            fill(initialState.fill);
            
            noStroke();
            textSize(size);
            text(anim.text, x, y);

            anim.progress += anim.rate;
            if (anim.progress >= 1) {
                anim.progress = 1;
                entity.dead = true;
                ecs.updateEntity(entity);
            }    
        }
    }
}

function BarSystem() {
    function bar(x, y, currv, minv, maxv){

    }
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['stats']);
        for (let entity of entities) { 
            let hp = entity.stats.hp;
            let maxHp = entity.stats.maxHp;
            let cooldown = entity.stats.cooldown;
            let maxCooldown = entity.stats.maxCooldown;
            noStroke();
            // cooldown bar
            fill(200, 200, 0);
            rect(entity.pos.x - 6, entity.pos.y + 9, map(cooldown.base, 0, maxCooldown.base, 0, 10), 4)
            // hp bar
            fill(200, 0, 0);
            rect(entity.pos.x - 6, entity.pos.y + 6, 10, 4);
            fill(0, 200, 0);
            rect(entity.pos.x - 6, entity.pos.y + 6, map(hp.base, 0, maxHp.curr, 0, 10), 4);
        }
    }
}

function UnitUpdateSystem() {
    this.process = function(ecs) {
        // unit updates
        let units = ecs.filterEntities(['stats']);
        for (let unit of units) {
            setText(20, [255]);
            // text(unit.guid, unit.pos.x - 5, unit.pos.y - 20);
            unit.stats.cooldown.base = max(unit.stats.cooldown.base - 1, 0);
            if (unit.stats.hp.base <= 0) {
                unit.dead = true;
                ecs.updateEntity(unit);
            }
        }
    }
}

function ApplyModsSystem() {
    let mulMod = makeMulMod('attack', 2);
    let addMod = {
        stat: 'attack',
        prio: 1,
        change: val => max(4, val - 10),
    }
    let exampleModField = makeModField();
    this.process = function(ecs) {
        // every unit container in contact with a mod applier
        let squads = ecs.filterEntities(['containsUnits']);
        let modFields = ecs.filterEntities(['appliesMods']);

        // reset mods
        let moddables = ecs.filterEntities(['mods']);
        for (let moddable of moddables) {
            moddable.mods = [];
        }

        // apply mods
        for (let squad of squads) {
            for (let modField of modFields) {
                if (collide(squad, modField)) {
                    let mods = modField.appliesMods;
                    let units = getUnits(ecs, squad.guid);
                    for (let unit of units) {
                        unit.mods.push(...mods);
                    }
                    // display applied mods
                    // for (let unit of units) {
                        // setText(20, 255);
                        // text(unit.mods.length + '!', unit.pos.x - 40, unit.pos.y);
                    // }
                }
            }
        }
        let units = ecs.filterEntities(['stats']);
    }
}
function CalculateStatsSystem () {
    this.process = function(ecs) {
        let units = ecs.filterEntities(['stats']);
        for (let unit of units) {
            let { stats } = unit;
            let statNames = props(stats);
            for (let stat of statNames) {
                stats[stat].curr = stats[stat].base;
            }
            unit.mods.sort(mod => mod.prio);
            for (let mod of unit.mods) {
                let { stat, change } = mod;
                stats[stat].curr = change(stats[stat].curr);
            }
        }
    }
}

function CombatSystem() {
    this.process = function(ecs) {
        let squads = ecs.filterEntities(['containsUnits']);
        let units = ecs.filterEntities(['stats']);

        // determine dead squads and encounters
        for (let squadA of squads) {
            let units = getUnits(ecs, squadA.guid);
            if (units.length === 0) {
                squadA.dead = true;
                ecs.updateEntity(squadA);
                continue;
            }
            setText(30, [200, 200, 0]);
            // text("id:" + squadA.guid, squadA.pos.x - 20, squadA.pos.y + squadA.r + 20);

            // collisions to determine current combat situation
            // TODO: use collisions from system
            squadA.lastEncounter = squadA.currentEncounter;
            let squadsInEncounter = new Set(squads
                // .filter(s => s !== squadA)
                .map(s => s.guid));
                
                
            squadA.currentEncounter = intersection(squadA.collisions, squadsInEncounter);
            squadA.currentEncounter.add(squadA.guid);


            // new contact situation, make units go on initial cooldown
            if (squadA.currentEncounter.size > 0 && 
                !equalSets(squadA.lastEncounter, squadA.currentEncounter) &&
                isSuperset(squadA.currentEncounter, squadA.lastEncounter)) {
                ecs.addEntity(makeAsciiProjectile([...squadA.currentEncounter].join(','),
                                squadA.pos.x, squadA.pos.y,
                                squadA.pos.x, squadA.pos.y - 30,
                                0.05, 50,
                                [255, 255, 100]
                            ))
                // units go on initial cooldown
                for (let unit of units) {
                    unit.stats.cooldown.base = Math.random() * unit.stats.maxCooldown.curr;
                }
            }

        }

        // make each unit off cd act
        for (let squadA of squads) {
            let { currentEncounter } = squadA;
            if (currentEncounter.size === 1) continue;
            setText(30, 255);
            debugLog(currentEncounter);
            text('id:' + squadA.guid + ' in ' + [...currentEncounter].join(','), 
                squadA.pos.x, squadA.pos.y - squadA.r - 30);
                
            // get potential targets
            let targets = units.filter(u => currentEncounter.has(u.squadGuid));
            // get ready units in squadA
            let readyUnits = units.filter(u => u.squadGuid === squadA.guid &&
                                               u.stats.cooldown.base === 0);
                                               
            // display target ids
            // setText(10, [0, 255, 100]);
            // let targetIds = targets.map(t => t.guid);
            // text([...targetIds].join(','), squadA.pos.x - squadA.r, squadA.pos.y - squadA.r);

            for (let unitA of readyUnits) {
                let ux = unitA.pos.x,
                    uy = unitA.pos.y;
                // let target = pickFrom(targets);
                // let target = targets.sort(unitA => -unitA.stats.attack)[0];
                // let wList = targets -->[ [4, {}], [2, {}] ];
                // build weight list
                function attackWeight(targets) {
                    let wList = [];
                    let wSum = 0;
                    for (let target of targets) {
                        let weight = 30 + 70 * (1 - target.stats.hp.base / target.stats.maxHp.curr);
                        if (target.squadGuid === unitA.squadGuid) {
                            weight = 0;
                        } else 
                            ecs.addEntity(makeAsciiProjectile(Math.round(weight), 
                                target.pos.x, target.pos.y + 10,
                                target.pos.x, target.pos.y + 15, 0.1, 16, [255]));
                        // rect(target.pos.x, target.pos.y - 40, weight * 5, 4);
                        wList.push([weight, target]);
                        wSum += weight;
                    }
                    // sort by weight
                    wList.sort((a, b) => a[0] < b[0]);
                    return { 
                        wList: wList,
                        wSum: wSum,
                        wMax: wList[0][0]
                    }
                }
                let { wList, wSum, wMax } = attackWeight(targets); 
                ecs.addEntity(makeAsciiProjectile(wList.map(pair => Math.round(pair[0])).join(','), 
                    unitA.pos.x, unitA.pos.y - 10,
                    unitA.pos.x, unitA.pos.y - 15, 0.06, 16, [255]));
                
                function weightedPick(wList, wSum) {
                    if (wSum === undefined) wSum = wList.reduce((acc, curr) => acc + curr[0]);
                    let wRand = Math.random() * wSum;
                    let i=-1;
                    while (wRand > 0) {
                        i += 1;
                        wRand -= wList[i][0];
                    }
                    // HACK: nobody to target, move along
                    if (i === -1) return null;
    
                    return wList[i][1];
                }
                let target = weightedPick(wList, wSum);
                if (target === null) continue;
                // ecs.addEntity(makeAsciiProjectile(target.guid, 
                //     unit.pos.x, unit.pos.y,
                //     unit.pos.x + 20, unit.pos.y, 0.05, 20, [255]));

                let basicAttack = {
                    execute: function(unit, target) {
                        // damage by attack stat and go on cooldown
                        target.stats.hp.base -= unit.stats.attack.curr;
                        unit.stats.cooldown.base = unit.stats.maxCooldown.curr;
                        ecs.addEntity(makeAsciiProjectile(round(damage), ux, uy, target.pos.x, target.pos.y, 0.05, damage + 10, [255, 255, 100, 200]));
                    }
                }
                basicAttack.execute(unitA, target);
            }
        }
    }
}