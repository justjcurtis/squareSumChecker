const Graph = require('./lib/models/graph')

let max = 25
while(max <= 10000){
    const g = new Graph(1, max);
    
    let endCount = 0
    for(let i = g.min; i <= g.max; i++){
        const arr = g[i]
        if(g.squareSumsMap[i].length == 1){
            endCount ++
        }
        if(endCount > 2){
            console.log(`failure for max of ${g.max}`)
            throw("end")
        }
    }
    console.log(`solutions possible for max of ${g.max}`)
    max++
}