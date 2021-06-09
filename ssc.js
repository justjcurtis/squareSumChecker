const Graph = require('./lib/models/graph')
const fs = require('fs')
const { fork } = require('child_process');
const os = require('os')
const cpuCount = os.cpus().length
const logDate = new Date().toISOString()

const getSquares = (graphMax) => {
    let sqrt = 1;
    let squares = {}
    let currentSquare = -1

    while (true) {
        currentSquare = Math.pow(sqrt, 2)
        if (currentSquare <= graphMax) {
            squares[currentSquare] = true;
            sqrt++
        } else {
            break;
        }
    }
    return squares
}

const processBatch = (squares, currentMax, absoluteMax, batchSize, first = true) => {
    if (currentMax <= absoluteMax) {
        const childProcesses = []
        const paths = []
        for (let i = 0; i < batchSize; i++) {
            if (currentMax + i > absoluteMax) { continue }
            const pathFinder = fork('./pathFinder.js');
            pathFinder.on('message', function({ path: p, currentMax: cm }) {
                // console.log(cm, p)
                paths.push([p, cm])
                paths.sort((a, b) => {
                    return a[1] - b[1]
                })
                if (paths.length == batchSize || currentMax + paths.length == absoluteMax) {
                    for (const [p, cm] of paths) {

                        if (p != undefined) {
                            console.log(`Path found for max of ${cm}`)
                            if (process.argv[4] && process.argv[4].toLowerCase() == '-p') {
                                console.log(JSON.stringify(p))
                            }
                        } else {
                            console.log(`No path possible for max of ${cm}`)
                        }
                        if (process.argv[4] && process.argv[4].toLowerCase() == '-o') {
                            fs.appendFileSync(`./ssc_${logDate}.json`, `${first ? '[\n' : ''}${JSON.stringify({
                                n:cm,
                                p
                            })}${cm == absoluteMax ? '\n]' : ',\n'}`)
                        }
                        first = false
                    }
                    currentMax += batchSize
                    processBatch(squares, currentMax, absoluteMax, batchSize, false)
                }

            }.bind(this))

            pathFinder.on('close', function(msg) {
                this.kill();
            });
            pathFinder.send({ squares, currentMax: currentMax + i })
            childProcesses.push(pathFinder)
        }
    } else {
        if (process.argv[4] && process.argv[4].toLowerCase() == '-o') {
            fs.appendFileSync(`./ssc_${logDate}.json`, `]`)
        }
        console.timeEnd('Time taken')
    }
}

const findRoutes = (currentMax, absoluteMax, batchSize = cpuCount) => {
    console.time('Time taken')
    const squares = getSquares(absoluteMax + absoluteMax - 1)
    if (currentMax <= absoluteMax) {
        processBatch(squares, currentMax, absoluteMax, batchSize)
    }
}

const checkPath = (path, squares) => {
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]
        const b = path[i + 1]
        if (squares[a + b] == undefined) {
            return false
        }
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
            } else {
                // console.log(`Valid path found for ${pathEntry.n}`)
            }
            if (process.argv[2].toLowerCase() == '-co') {
                results.push({ n: pathEntry.n, valid })
            }
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
if (process.argv[2].toLowerCase() == '-c' || process.argv[2].toLowerCase() == '-co') {
    checkPaths(process.argv[3])
} else {
    findRoutes(parseInt(start), parseInt(end))
}