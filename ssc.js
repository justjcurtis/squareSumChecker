const fs = require('fs')
const workerFarm = require('worker-farm')
const getPathService = workerFarm(require.resolve('./getPath'))
const ProgressBar = require('progress');
const logDate = new Date().toISOString()
let print = false
let bar = true

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

const getAllRoutes = async(min, max, pbar = null) => {
    return new Promise((res, rej) => {
        const squares = getSquares(max + max - 1)
        const results = {}
        let finished = 0
        const q = new Array((max - min) + 1).fill().map((_, i) => i + min)
        q.sort((a, b) => Math.random() - .5)
        for (let i = 0; i < q.length; i++) {
            getPathService({ squares, i: q[i] }, ({ path, currentMax }) => {
                finished++
                if (pbar != null) pbar.tick()
                if (path != undefined) {
                    if (print) console.log(`Path found for max of ${currentMax}`)
                    results[currentMax] = path
                } else {
                    if (print) console.log(`No path possible for max of ${currentMax}`)
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
    let pbar = null
    if (bar) pbar = new ProgressBar('Pathing [:bar] :percent | eta: :etas | elapsed: :elapseds', {
        complete: '=',
        incomplete: ' ',
        width: 40,
        total: (max - min) + 1
    });
    if (!bar) console.time('Time taken')
    const paths = await getAllRoutes(min, max, pbar)
    if (!bar) console.timeEnd('Time taken')
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

const args = process.argv.slice(2)
const start = args[0] || 1
const end = args[1] || 300
let check = false
for (let i = 0; i < args.length; i++) {
    if (args[i].includes('-')) {
        const opts = Object.fromEntries(args[i].slice(1).split('').map(v => [v, true]))
        if (opts.p) print = true
        bar = !print
        if (opts.c) check = true
        break;
    }
}
if (check) {
    checkPaths(args[1])
} else {
    findRoutes(parseInt(start), parseInt(end))
}