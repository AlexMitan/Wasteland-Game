function setup() {
    // put setup code here
    createCanvas(1000, 600);
    background(153);
    line(0, 0, width, height);
}

let player = {
    x: 10, y: 10, r: 40,
    angle: 0,
    vx: 0, vy: 0,
    speed: 1,
    friction: 0.96,
    cd: 0, maxCd: 20,
    hp: 5, maxHp: 5,
    dmg: 1,
    name: 'player'
}

function collide(cA, cB) {
    let distX = abs(cA.x - cB.x),
        distY = abs(cA.y - cB.y),
        distSq = distX * distX + distY * distY;

    return distSq <= (cA.r * cA.r + cB.r * cB.r);
}

function makeEnemy(x, y, r) {
    return {x, y, r, name: 'enemy'}
}
let enemies = [
    makeEnemy(100, 100, 20),
    makeEnemy(200, 300, 10),
    makeEnemy(400, 400, 50)
];
let bullets = [];
function moveTowards(objA, objB, amount) {
    let distX = objB.x - objA.x,
        distY = objB.y - objA.y,
        angle = atan2(objB.y - objA.y, objB.x - objA.x);

    objA.x += amount * cos(angle);
    objA.y += amount * sin(angle);
}

function draw() {
    background(0);
    if (frameCount % 60 == 0) {
        enemies.push(makeEnemy(random(0, width), random(0, height), random(16, 40)));
    }
    // put drawing code here
    player.angle = atan2(mouseY - player.y, mouseX - player.x);
    player.x += player.vx;
    player.y += player.vy;
    player.vx *= player.friction;
    player.vy *= player.friction;
    if (mouseIsPressed) {
        player.vx += player.speed * cos(player.angle);
        player.vy += player.speed * sin(player.angle);
    }
    // enemies
    for (let enemy of enemies) {
        // if colliding with player, die
        if (collide(enemy, player)) {
            enemy.dead = true;
            player.r -= 10;
        }
        if (enemy.r < 15) {
            enemy.dead = true;
        }
        // draw
        fill(200, 50, 50);
        circle(enemy.x, enemy.y, enemy.r);
        moveTowards(enemy, player, 3);
    }
    enemies = enemies.filter(obj => obj.dead != true);
    // bullets
    for (let bullet of bullets) {
        for (let enemy of enemies) {
            // if colliding with bullet, lose health
            if (collide(enemy, bullet)) {
                enemy.r -= 6;
                bullet.dead = true;
            }
        }
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        fill(0, 200, 0);
        circle(bullet.x, bullet.y, bullet.r);
    }
    bullets = bullets.filter(obj => obj.dead != true);
    // cooldown
    player.cd = max(player.cd - 1, 0);
    // shooting
    if (keyIsPressed && keyCode === 32 && player.cd == 0) {
        bullets.push({
            x: player.x + cos(player.angle + 6) * 10,
            y: player.y + sin(player.angle + 6) * 10,
            r: 5,
            vx: 10 * cos(player.angle),
            vy: 10 * sin(player.angle)
        });
        bullets.push({
            x: player.x + cos(player.angle - 6) * 10,
            y: player.y + sin(player.angle - 6) * 10,
            r: 5,
            vx: 10 * cos(player.angle),
            vy: 10 * sin(player.angle)
        });
        player.cd += 10;
    }
    if (player.r <= 15) {
        player.dead = true;
    }
    if (player.dead) {
        background(200);
    }
    // player and eye
    fill(100, 0, 200);
    circle(player.x, player.y, player.r);
    fill(200, 200, 250);
    circle(player.x + cos(player.angle) * 10, player.y + sin(player.angle) * 10, 10);
    // reticle
    fill(200);
    circle(mouseX, mouseY, 10);
}

function keyPressed() {
    // space=
}
