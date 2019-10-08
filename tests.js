// function getRing(n) {
//     // 0 1 7 18
//     if (n === 0) return 0;
//     let ring = 0;
//     while (n > 0) {
//         ring += 1;
//         n -= ring * 6;
//     }
//     return ring;
// }

// function ringCapacity(ring) {
//     if (ring === 0) return 1;
//     else return ring * 6;
// }

// function ringBoundaries(ring) {
//     // 0-0, 1-6, 7-18 , 19-
//     //  0 ,  1 ,  2   ,
//     if (ring === 0) return [0, 0];
//     else {

//     }
// }

// for (let i=0; i<60; i++) {
//     console.log('i', i, '---->', getRing(i));
// }


function RenderUnitsSystem() {
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
        let currentRing = 0,
            firstInRing = 0,
            lastInRing = 0,
            bounds = [0, 0],
            dict = this.ringDict;

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
}

let ringer = new RenderUnitsSystem();
ringer.init(100);
console.log(ringer);
console.log(ringer.ringDict.ringBounds);