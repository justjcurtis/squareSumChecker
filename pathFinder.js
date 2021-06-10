const Graph = require('./lib/models/graph')

process.on('message', function(message) {

    init = function() {
        handleMessage(message);
    }.bind(this)();


    function getEnds(squareSumsMap, max) {
        let ends = []
        for (let i = 1; i <= max; i++) {
            const arr = squareSumsMap[i]
            if (arr.length == 1) {
                ends.push(i)
            }
        }
        return ends;
    }

    function checkForIslandsAndThreeEnds(path, squareSumsMap, max) {
        let endCount = 0
        for (let i = 1; i <= max; i++) {
            if (path.includes(i)) { continue }
            const arr = squareSumsMap[i]
            if (arr.length == 1) {
                endCount++
            }
            if (endCount > 2 || arr.length == 0) {
                // console.log(endCount)
                return true;
            }
        }
        return false;
    }

    function recursiveRoute(path, squareSumsMap, max) {
        if (path.length == max) {
            return path;
        }
        if (checkForIslandsAndThreeEnds(path, squareSumsMap, max)) {
            return undefined;
        }
        const tip = path.slice(-1)
        let nextSquareSumsMap = []
        for (let i = 1; i <= max; i++) {
            nextSquareSumsMap[i] = i !== tip || squareSumsMap[tip].includes(i) ? squareSumsMap[i].filter(b => b != tip) : squareSumsMap[i]
        }
        const nextOptions = squareSumsMap[tip].slice(0)
        nextOptions.sort((a, b) => squareSumsMap[a].length - squareSumsMap[b].length)
        for (const next of nextOptions) {
            let p = recursiveRoute([...path, next], nextSquareSumsMap, max)
            if (p != undefined) {
                return p
            }
        }
        return undefined
    }

    function findRoute(g) {
        const ends = getEnds(g.squareSumsMap, g.max);
        if (ends.length > 2) {
            return undefined
        }

        if (ends.length >= 1) {
            ends.sort((a, b) => g.squareSumsMap[a].length - g.squareSumsMap[b].length)
            for (let i = 0; i < ends.length; i++) {
                let squareSumsMap = []
                for (let j = 1; j <= g.max; j++) {
                    squareSumsMap[j] = g.squareSumsMap[j]
                }
                const path = recursiveRoute([ends[i]], squareSumsMap, g.max)
                if (path != undefined) {
                    return path
                }
            }
        } else {
            for (let i = 1; i <= g.max; i++) {
                let squareSumsMap = []
                for (let j = 1; j <= g.max; j++) {
                    squareSumsMap[j] = g.squareSumsMap[j];
                }
                for (let j = 1; j <= g.max; j++) {
                    squareSumsMap[j].sort((a, b) => {
                        return g.squareSumsMap[a].length - g.squareSumsMap[b].length
                    })
                }
                const path = recursiveRoute([i], squareSumsMap, g.max)
                if (path != undefined) {
                    return path
                }
            }
        }
        return undefined
    }

    function handleMessage(message) {
        if (message.squares && message.currentMax) {
            const { squares, currentMax } = message
            try {
                const g = new Graph(squares, 1, currentMax);
                const path = findRoute(g)
                process.send({ path, currentMax })
            } catch (err) {
                console.log(err)
            }
        }
        if (message.kill) {
            process.disconnect()
        }
    }
});

process.on('uncaughtException', function(err) {
    console.log("Error happened: " + err.message + "\n" + err.stack + ".\n");
    console.log("Gracefully finish the routine.");
});