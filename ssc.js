const Graph = require('./lib/models/graph')

const arrSum = arr => arr.slice(0).reduce((a,v) => a+v);

getSquares = (graphMax) =>{
    let sqrt = 1;
    let squares = []
    let currentSquare = -1

    while(true){
        currentSquare = Math.pow(sqrt, 2)
        if(currentSquare <= graphMax){
            squares.push(currentSquare)
            sqrt++
        }else{
            break;
        }
    }
    return squares
}


const checkAll = (currentMax, absoluteMax) => {
    const squares = getSquares(absoluteMax+absoluteMax-1)
    while(currentMax <= absoluteMax){
        let sm = currentMax+currentMax-1
        const g = new Graph(squares.filter(sq => sq <= sm), 1, currentMax);
        
        let endCount = 0
        let failure = false
        for(let i = g.min; i <= g.max; i++){
            const arr = g.squareSumsMap[i]
            if(arr.length == 1){
                endCount ++
            }
            if(endCount > 2 || arr.length == 0){
                console.log(`failure for max of ${g.max}`)
                failure = true
                break
            }
        }
        if(!failure){
            console.log(`solutions possible for max of ${g.max}`)
        }
        currentMax++
    }
}

const demo = max => {
    let sm = max+max-1
    const squares = getSquares(sm)
    console.log(squares)
    const start = Date.now()
    const g = new Graph(squares.filter(sq => sq <= sm), 1, max);
    const end = Date.now()
    console.log(g.squareSumsMap)
    console.log(`Took ${end-start}ms`)
}

const findRoute = (g) => {
    for(let i = 1; i <= g.max; i++){
        let squareSumsMap = []
        for(let j = 1; j <= g.max; j++){
            squareSumsMap[j] = g.squareSumsMap[j]
        }
        const path = recursiveRoute([i], squareSumsMap, g.max)
        if(path != undefined){
            return path
        }
    }
    return undefined
}

const checkForIslandsAndThreeEnds = (path, squareSumsMap, max) => {
    let endCount = 0
    for(let i = 1; i <= max; i++){
        if(path.includes(i)){continue}
        const arr = squareSumsMap[i]
        if(arr.length == 1){
            endCount ++
        }
        if(endCount > 2 ||arr.length == 0){
            // console.log(endCount)
            return true;
        }
    }
    return false;
}

const recursiveRoute = (path, squareSumsMap, max) => {
    if(path.length == max){
        return path;
    }
    if(checkForIslandsAndThreeEnds(path, squareSumsMap, max)){
        return undefined;
    }
    const tip = path.slice(-1)
    let nextSquareSumsMap = []
    for(let i = 1; i <= max; i++){
        nextSquareSumsMap[i] = i !== tip || squareSumsMap[tip].includes(i) ? squareSumsMap[i].filter(b => b != tip) : squareSumsMap[i]
    }
    for(const next of squareSumsMap[tip]){
        let p = recursiveRoute([...path, next], nextSquareSumsMap, max)
        if(p != undefined){
            return p
        }
    }
    return undefined
}

const findRoutes = (currentMax, absoluteMax) => {
    const squares = getSquares(absoluteMax+absoluteMax-1)
    while(currentMax <= absoluteMax){
        let sm = currentMax+currentMax-1
        const g = new Graph(squares.filter(sq => sq <= sm), 1, currentMax);
        const path = findRoute(g)
        if(path != undefined){
            console.log(`\nPath found for max of ${currentMax}`)
            console.log(JSON.stringify(path))
        }else{
            console.log(`\nNo path possible for max of ${currentMax}`)
        }
        currentMax ++
    }
}

// demo(1000)
// checkAll(1, 25)
// checkSums(25, 500)
findRoutes(300, 300)