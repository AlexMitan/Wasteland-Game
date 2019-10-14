function EncounterSystem() {
    this.process = function(ecs) {
        let squads = ecs.filterEntities(['containsUnits']);

        // determine dead squads and encounters
        for (let squadA of squads) {
            let unitsA = getUnits(ecs, squadA.guid);
            if (unitsA.length === 0) {
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
                for (let unit of unitsA) {
                    unit.stats.cooldown.base = Math.random() * unit.stats.maxCooldown.curr;
                }
            }
        }
    }
}

function UnitActingSystem() {
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
    function weights(unitA, targets, weightFunc, hostile) {
        let wList = [];
        let wSum = 0;
        for (let target of targets) {
            let weight = weightFunc(unitA, target);
            if (hostile && target.squadGuid === unitA.squadGuid) {
                weight = 0;
            }
            // rect(target.pos.x, target.pos.y - 40, weight * 5, 4);
            // TODO: decide if [weight, target] or {weight, target} is better
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
    this.process = function(ecs) {
        let squads = ecs.filterEntities(['containsUnits']);
        let units = ecs.filterEntities(['stats']);

        // make each unit off cd act
        for (let squadA of squads) {
            let { currentEncounter } = squadA;
            if (currentEncounter.size === 1) continue;
            setText(30, 255);
            // debugLog(currentEncounter);
            // text('id:' + squadA.guid + ' in ' + [...currentEncounter].join(','), 
            //     squadA.pos.x, squadA.pos.y - squadA.r - 30);
                
            // get potential targets
            let targets = units.filter(u => currentEncounter.has(u.squadGuid));
            // get ready units in squadA
            let readyUnits = units.filter(u => u.squadGuid === squadA.guid &&
                                               u.stats.cooldown.base === 0);
                                               
            // display target ids
            // setText(10, [0, 255, 100]);
            // let targetIds = targets.map(t => t.guid);
            // text([...targetIds].join(','), squadA.pos.x - squadA.r, squadA.pos.y - squadA.r);
            // for each ability, get utility
            for (let unitA of readyUnits) {
                let ux = unitA.pos.x,
                    uy = unitA.pos.y;
                // let target = pickFrom(targets);
                // let target = targets.sort(unitA => -unitA.stats.attack)[0];
                // let wList = targets -->[ [4, {}], [2, {}] ];
                // build weight list
                let abilities = {
                    physAttack: {
                        hostile: true,
                        // params: x * (1 - resist) + y * (missinghealth) + z * (hatred)
                        weightFunc: function (unitA, target) {
                            return unitA.stats.physDmg.curr + 80 * (1 - target.stats.physResist.curr) + 20 * (1 - target.stats.hp.base / target.stats.maxHp.curr)
                        },
                        execute: function(unit, target) {
                            let ux = unit.pos.x;
                            let uy = unit.pos.y;
                            // damage by attack stat and go on cooldown
                            let damage = unit.stats.physDmg.curr * (1 - target.stats.physResist.curr);
                            target.stats.hp.base -= damage;
                            unit.stats.cooldown.base = unit.stats.maxCooldown.curr;
                            ecs.addEntity(makeAsciiProjectile(round(damage), 
                                ux, uy, target.pos.x, target.pos.y, 0.05, damage + 10, [200]));
                            ecs.addEntity(makeAsciiProjectile('⚔️', 
                                ux, uy - 10, ux, uy - 15, 0.05, 30, [200]));
                        }
                    },
                    psiBomb: {
                        hostile: true,
                        weightFunc: function (unitA, target) {
                            return unitA.stats.psiDmg.curr + 80 * (1 - target.stats.psiResist.curr) + 20 * (1 - target.stats.hp.base / target.stats.maxHp.curr)
                        },
                        execute: function(unit, target) {
                            let ux = unit.pos.x;
                            let uy = unit.pos.y;
                            // damage by attack stat and go on cooldown
                            let damage = unit.stats.psiDmg.curr * (1 - target.stats.psiResist.curr);
                            target.stats.hp.base -= damage;
                            unit.stats.cooldown.base = unit.stats.maxCooldown.curr;
                            ecs.addEntity(makeAsciiProjectile(round(damage), 
                                ux, uy, target.pos.x, target.pos.y, 0.05, damage + 10, [0, 255, 255]));
                            ecs.addEntity(makeAsciiProjectile('🌟', 
                                ux, uy - 10, ux, uy - 15, 0.05, 30, [0, 255, 255]));
                        }
                    }
                }
                let decisions = [];
                for (let abilityName of props(abilities)) {
                    let ability = abilities[abilityName];
                    let { wList, wSum, wMax } = weights(unitA, targets, ability.weightFunc, ability.hostile);
                    // display weight list
                    // ecs.addEntity(makeAsciiProjectile(wList.map(pair => Math.round(pair[0])).join(','), 
                    //     unitA.pos.x, unitA.pos.y - 10,
                    //     unitA.pos.x, unitA.pos.y - 15, 0.06, 16, [255])); 
                    // target someone from the list
                    decisions.push( {ability, wSum, wList});
                }
                decisions.sort((a, b) => a.wSum < b.wSum);
                // make a decision
                let decision = decisions[0];
                // pick a target and execute
                let target = weightedPick(decision.wList, decision.wSum);
                if (target === null) continue;
                decision.ability.execute(unitA, target);
            }
        }
    }
}