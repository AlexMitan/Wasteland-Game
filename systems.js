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
                let angle = atan2(mouseY - player.pos.y, mouseX - player.pos.x);
                if (mouseIsPressed) {
                    player.pos.x += player.speed * cos(angle);
                    player.pos.y += player.speed * sin(angle);
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
            for (let entityB of entities) {
            }
        }
    }
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
        // init
        let squads = ecs.filterEntities(['containsUnits']);
        // {
        //     squad: {
        //         speed: 5
        //     },
        //     pos: {x, y},
        //     r: r || 40,
        //     fill: fill || [255, 128],
        //     stroke: stroke || [255, 0],
        // }
        // for each squad
        for (let squad of squads) {
            let myUnits = getUnits(ecs, squad.guid);
            if (myUnits.length > this.ringDict.maxCalculation) {
                this.init(myUnits.length + 100);
                console.log('init!');
            } 
            // render its units
            for (let i=0; i<myUnits.length; i++) {
                let ring = this.ringDict.ringOf[i];
                let ringBounds = this.ringDict.ringBounds[ring];
                let angle = map(i, ringBounds[0], ringBounds[1] + 1, 0, TAU);
                let unit = myUnits[i];
                let offset = ring * 30;
                let unitX = squad.pos.x + cos(angle) * offset,
                    unitY = squad.pos.y + sin(angle) * offset;

                unit.pos.x = unitX;
                unit.pos.y = unitY;
            }
        }
    }
}

function NoteSystem() {
    // TYPE_NOTE: true,
    // pos: {x, y},
    // text: text || 'DEFAULT NOTE',
    // progress: 0,
    // rate: rate || 0.1,
    // size: size || 10,
    // fill: fill || [255],
    // stroke: stroke || [255],
    this.process = function(ecs) {
        let notes = ecs.filterEntities(['TYPE_NOTE']);
        for (let note of notes) {
            fill(note.fill);
            stroke(note.stroke);
            textSize(note.size);
            let {x, y} = note.pos;
            
            // text(note.text, x, y);
            text(note.text, x, y - (10 * note.progress));
            note.progress += note.rate;
            if (note.progress >= 1) note.dead = true;
        }
    }
}

function HpBarSystem() {
    this.process = function(ecs) {
        let entities = ecs.filterEntities(['hp']);
        for (let entity of entities) { 
            let hp = entity.hp;
            fill(0, 200, 0);
            stroke(0, 0);
            rect(entity.pos.x - 6, entity.pos.y + 6, map(hp.curr, 0, hp.base, 0, 10), 4);
        }
    }
}

function CombatSystem() {
    this.process = function(ecs) {
        let squads = ecs.filterEntities(['containsUnits']);
        
        for (let squadA of squads) {
            for (let squadB of squads) {
                if (squadA !== squadB && collide(squadA, squadB)) {
                    // ecs.addEntity(makeNote('bump!', squadA.pos.x, squadA.pos.y));
                    let unitsA = getUnits(ecs, squadA.guid);
                    var attacker = unitsA[Math.floor(Math.random()*unitsA.length)];
                    
                    let unitsB = getUnits(ecs, squadB.guid);
                    var defender = unitsB[Math.floor(Math.random()*unitsB.length)];

                    if (Math.random() < 0.1) {
                        ecs.addEntity(makeNote('pow!', attacker.pos.x, attacker.pos.y, 0.05, 10));
                        defender.hp.curr -= attacker.stats.attack;
                        if (defender.hp.curr <= 0) defender.dead = true;
                    }
                }
            }
        }
    }
}