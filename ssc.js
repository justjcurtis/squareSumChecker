const fs = require('fs')
const { resolve } = require('path/posix')
const workerFarm = require('worker-farm')
const getPathService = workerFarm(require.resolve('./getPath'))
const logDate = new Date().toISOString()

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

const getAllRoutes = async(min, max, print) => {
    return new Promise((res, rej) => {
        const squares = getSquares(max + max - 1)
        const results = {}
        let finished = 0
        for (let i = min; i <= max; i++) {
            getPathService({ squares, i, max }, ({ path, currentMax }) => {
                finished++
                if(path != undefined){
                    if(print) console.log(`Path found for max of ${currentMax}`)
                    results[currentMax] = path
                }else{
                    if(print)console.log(`No path possible for max of ${currentMax}`)
                    results[currentMax] = null
                }

                if (finished == (max - min) + 1) {
                    workerFarm.end(getPathService)
                    res(results)
                }
            })
        }
    })
}

const findRoutes = async(min, max) => {
    const print = process.argv.slice(2).includes('-p')
    console.time('Time taken')
    const paths = await getAllRoutes(min, max, print)
    console.timeEnd('Time taken')
    if (process.argv[4] && process.argv[4].toLowerCase() == '-o') {
        console.log('Saving...')
        fs.writeFileSync(`./ssc_${logDate}.json`, JSON.stringify(paths))
        console.log(`Saved ssc_${logDate}.json`)
    }
}

const checkPath = (path, squares) => {
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]
        const b = path[i + 1]
        if (squares[a + b] == undefined) return false
    }
    return true
}

const checkPaths = (filepath) => {
    const paths = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const graphMax = paths[paths.length - 1].n
    const squares = getSquares(graphMax + graphMax - 1)
    let results = []
    for (let i = 0; i < paths.length; i++) {
        const pathEntry = paths[i]
        if (pathEntry.path) {
            const valid = checkPath(pathEntry.path, squares)
            if (!valid) {
                console.log(`Invalid path found for ${pathEntry.n}`)
                console.log(pathEntry.path)
            }
            if (process.argv[2].toLowerCase() == '-co') results.push({ n: pathEntry.n, valid })
        } else {
            console.log(`No path supplied for ${pathEntry.n}`)
        }
    }
    if (process.argv[2].toLowerCase() == '-co') {
        let outpath = `./check_${filepath.split('_').slice(-1)[0]}`
        fs.writeFileSync(outpath, JSON.stringify(results))
    }
}

const start = process.argv[2] ? process.argv[2] : 1
const end = process.argv[3] ? process.argv[3] : 300
if (process.argv.length > 2 && (process.argv[2].toLowerCase() == '-c' || process.argv[2].toLowerCase() == '-co')) {
    checkPaths(process.argv[3])
} else {
    findRoutes(parseInt(start), parseInt(end))
}