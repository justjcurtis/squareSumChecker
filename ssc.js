const Graph = require('./lib/models/graph')
const fs = require('fs')

const getSquares = (graphMax) => {
    let sqrt = 1;
    let squares = {}
    let currentSquare = -1

    while (true) {
        currentSquare = Math.pow(sqrt, 2)
        if (currentSquare > graphMax) break
        squares[currentSquare] = true;
        sqrt++
    }
    return squares
}

const getEnds = (squareSumsMap, max) => {
    let ends = []
    for (let i = 1; i <= max; i++) {
        const arr = squareSumsMap[i]
        if (arr.length === 1) ends.push(i)
    }
    return ends;
}

function findRoute(g) {
    const ends = getEnds(g.squareSumsMap, g.max);
    if (ends.length > 2) return undefined
    let squareSumsMap = Object.assign({}, g.squareSumsMap)
    if (ends.length >= 1) {
        ends.sort((a, b) => squareSumsMap[a].length - squareSumsMap[b].length)
        for (let i = 0; i < ends.length; i++) {
            const path = recursiveRoute([ends[i]], squareSumsMap, g.max)
            if (path !== undefined) return path
        }
    } else {
        for (let i = 1; i <= g.max; i++) {
            const path = recursiveRoute([i], squareSumsMap, g.max)
            if (path !== undefined) return path
        }
    }
    return undefined
}


const checkForIslandsAndThreeEnds = (path, squareSumsMap, max) => {
    let endCount = 0
    const pathMap = Object.fromEntries(path.map(v => [v, true]))
    for (let i = 1; i <= max; i++) {
        if (pathMap[i]) continue
        const arr = squareSumsMap[i]
        if (arr.length === 1) endCount++;
        if (endCount > 2 || arr.length === 0) return true;
    }
    return false;
}

const recursiveRoute = (path, squareSumsMap, max) => {
    if (path.length === max) return path
    const tip = [path[path.length - 1]]
    const nextOptions = squareSumsMap[tip].slice(0)
    if (nextOptions.length > 1 && checkForIslandsAndThreeEnds(path, squareSumsMap, max)) return undefined
    let nextSquareSumsMap = []
    for (let i = 1; i <= max; i++) {
        nextSquareSumsMap[i] = squareSumsMap[i].filter(b => b != tip)
    }
    nextOptions.sort((a, b) => squareSumsMap[a].length - squareSumsMap[b].length)
    for (const next of nextOptions) {
        let p = recursiveRoute([...path, next], nextSquareSumsMap, max)
        if (p !== undefined) return p
    }
    return undefined
}

const findRoutes = (currentMax, absoluteMax) => {
    const logDate = new Date().toISOString()
    const start = Date.now()
    const squares = getSquares(absoluteMax + absoluteMax - 1)
    let first = true;
    while (currentMax <= absoluteMax) {
        const g = new Graph(squares, 1, currentMax);
        const path = findRoute(g)
        if (path !== undefined) {
            console.log(`Path found for max of ${currentMax}`)
            if (process.argv[4] && process.argv[4].toLowerCase() === '-p') {
                console.log(JSON.stringify(path))
            }
        } else {
            console.log(`No path possible for max of ${currentMax}`)
        }
        if (process.argv[4] && process.argv[4].toLowerCase() === '-o') {
            fs.appendFileSync(`./ssc_${logDate}.json`, `${first ? '[\n' : ''}${JSON.stringify({
                n:currentMax,
                path
            })}${currentMax === absoluteMax ? '\n]' : ',\n'}`)
        }
        first = false
        currentMax++
    }
    const end = Date.now()
    console.log(`Took: ${end-start}ms`)
}

const checkPath = (path, squares) => {
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]
        const b = path[i + 1]
        if (squares[a + b] === undefined) return false
    }
    return true
}

const checkPaths = (filepath) => {
    const paths = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const graphMax = paths.slice(-1)[0].n
    const squares = getSquares(graphMax + graphMax - 1)
    let results = []
    for (const pathEntry of paths) {
        if (pathEntry.path) {
            const valid = checkPath(pathEntry.path, squares)
            if (!valid) {
                console.log(`Invalid path found for ${pathEntry.n}`)
                console.log(pathEntry.path)
            }
            if (process.argv[2].toLowerCase() === '-co') {
                results.push({ n: pathEntry.n, valid })
            }
        } else {
            console.log(`No path supplied for ${pathEntry.n}`)
        }
    }
    if (process.argv[2].toLowerCase() === '-co') {
        let outpath = `./check_${filepath.split('_').slice(-1)[0]}`
        fs.writeFileSync(outpath, JSON.stringify(results))
    }
}

const start = process.argv[2] ? process.argv[2] : 1
const end = process.argv[3] ? process.argv[3] : 300
if (process.argv[2].toLowerCase() === '-c' || process.argv[2].toLowerCase() === '-co') {
    checkPaths(process.argv[3])
} else {
    findRoutes(parseInt(start), parseInt(end))
}