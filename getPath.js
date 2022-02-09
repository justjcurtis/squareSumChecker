const Graph = require('./lib/models/graph')

function getEnds(squareSumsMap, max) {
    let ends = []
    for (let i = 1; i <= max; i++) {
        const arr = squareSumsMap[i]
        if (arr.length == 1) ends.push(i)
    }
    return ends;
}

function checkForIslandsAndThreeEnds(path, squareSumsMap, max) {
    let endCount = 0
    const pathMap = Object.fromEntries(path.map(v => [v, true]))
    for (let i = 1; i <= max; i++) {
        if (pathMap[i]) { continue }
        const arr = squareSumsMap[i]
        if (arr.length == 1) endCount++;
        if (endCount > 2 || arr.length == 0) return true;
    }
    return false;
}

function recursiveRoute(path, squareSumsMap, max) {
    if (path.length == max) return path;
    if (checkForIslandsAndThreeEnds(path, squareSumsMap, max)) return undefined;
    const tip = [path[path.length - 1]]
    let nextSquareSumsMap = []
    for (let i = 1; i <= max; i++) {
        nextSquareSumsMap[i] = squareSumsMap[i].filter(b => b != tip)
    }
    const nextOptions = squareSumsMap[tip]
    nextOptions.sort((a, b) => squareSumsMap[a].length - squareSumsMap[b].length)
    for (let i = 0; i < nextOptions.length; i++) {
        let p = recursiveRoute([...path, nextOptions[i]], nextSquareSumsMap, max)
        if (p != undefined) return p
    }
    return undefined
}

function findRoute(g) {
    const ends = getEnds(g.squareSumsMap, g.max);
    if (ends.length > 2) return undefined
    let squareSumsMap = Object.assign({}, g.squareSumsMap)
    if (ends.length >= 1) {
        ends.sort((a, b) => g.squareSumsMap[a].length - g.squareSumsMap[b].length)
        for (let i = 0; i < ends.length; i++) {
            const path = recursiveRoute([ends[i]], squareSumsMap, g.max)
            if (path != undefined) return path
        }
    } else {
        for (let i = 1; i <= g.max; i++) {
            squareSumsMap[i].sort((a, b) => squareSumsMap[a].length - squareSumsMap[b].length)
            const path = recursiveRoute([i], squareSumsMap, g.max)
            if (path != undefined) return path
        }
    }
    return undefined
}

function getPath(args, callback) {
    const { squares, i: currentMax } = args
    try {
        const g = new Graph(squares, 1, currentMax);
        const path = findRoute(g)
        callback({ path, currentMax, map: g.squareSumsMap })
    } catch (err) {
        console.log(err)
    }
}

module.exports = getPath