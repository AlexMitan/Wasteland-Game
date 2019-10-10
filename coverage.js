function setup() {
    createCanvas(400, 400);
  }
  
  function collide(cA, cB) {
    let d = dist(cA.x, cA.y, cB.x, cB.y);
  
    return d <= (cA.r + cB.r);
  }
  
  function overlap(cA, cB) {
    let d = dist(cA.x, cA.y, cB.x, cB.y);
    let cS = cA, cL = cB;
    if (cA.r > cB.r) {
      cL = cA;
      cS = cB;
    }
    if (collide(circleA, circleB)) {
      stroke('purple');
    } else {
      stroke('black');
    }
    line(cA.x, cA.y, cB.x, cB.y);
    
    let rS = min(cA.r, cB.r);
    let rL = max(cA.r, cB.r);
    let rLens = constrain(rL + rS - d, 0, rS * 2);
    let ratioOfSmall = rLens / rS / 2;
    let ratioOfLarge = rLens / rL / 2;
    noStroke();
    fill('black')
    text('rA ' + cA.r + '  rL ' + cB.r, 30, 30);
    textSize(20);
    text('coverage of small: ' + ratioOfSmall, 20, 120);
    text('coverage of big  : ' + ratioOfLarge, 20, 150);
    
    let ix = (cA.x + cB.x) / 2;
    let iy = (cA.y + cB.y) / 2;
    fill(255, 130);
    circle(cS.x, cS.y, cS.r * ratioOfSmall * 2);
    circle(cL.x, cL.y, cL.r * ratioOfLarge * 2);
    
  }
  
  let circleA = {
    x: 100,
    y: 260,
    r: 75
  }
  
  let circleB = {
    x: 160,
    y: 260,
    r: 50
  }
  
  function draw() {
    background(128);
    circleA.x = mouseX;
    circleA.y = mouseY;
  
    
    stroke('black');
    fill(255, 0, 0, 100);
    circle(circleA.x, circleA.y, circleA.r * 2);
    fill(0, 0, 255, 100);
    circle(circleB.x, circleB.y, circleB.r * 2);
    overlap(circleA, circleB);
  }