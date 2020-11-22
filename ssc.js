const fs = require("fs");
const cliProgress = require("cli-progress");
const Graph = require("./lib/models/graph");

var graph = new Graph();
let lastPaths = [];
let solutions = [];
let lastEntryPoints = [];

function millis() {
    return Date.now();
}

function seconds(start, end) {
    return Math.round((end - start) / 10) / 100;
}

function findPath() {
    //try lastPath permutations
    for (let l = lastPaths.length - 1; l >= 0; l--) {
        var _path = lastPaths[l].slice(0);
        var newVertices = graph.vertices.slice(graph.vertices.length - _path.length);
        var resultPath = permutePath(_path, newVertices);
        if (resultPath != undefined) {
            return resultPath;
        }
    }

    // try last 10 sucessful entrypoints
    for (let e = lastEntryPoints.length - 1; e >= 0; e--) {
        var ep = lastEntryPoints[e];
        var re = recursePath(graph, [ep]);
        if (re != undefined) {
            return re;
        }
    }

    // get sorted entry points for full search
    var eps = graph.vertices.slice(0).sort((a, b) => {
        return b.q - a.q;
    });

    // recursively try every entrypoint
    for (var i = 0; i < eps.length - 1; i++) {
        var resultPath = recursePath(graph, [eps[i].val]);
        if (resultPath != undefined) {
            return resultPath;
        }
    }
    return undefined;
}

function recursePath(graph, _currentPath) {
    if (_currentPath.length == graph.vertices.length) {
        return _currentPath;
    }
    var possibleConnections = graph.vertices[_currentPath[_currentPath.length - 1]].connections
        .filter((con) => {
            return !_currentPath.includes(con.c);
        })
        .sort((a, b) => {
            return b.q - a.q;
        });
    if (possibleConnections.length == 0) {
        return undefined;
    }

    for (var i = 0; i < possibleConnections.length; i++) {
        var next = possibleConnections[i];
        var newPath = _currentPath.slice(0);
        newPath.push(next.c);

        var resultPath = recursePath(graph, newPath);

        if (resultPath != undefined) {
            return resultPath;
        }
    }

    return undefined;
}

function permutePath(_path, _vertices) {
    if (_vertices.length == 0) {
        return _path;
    }
    for (let v = 0; v < _vertices.length; v++) {
        var vertex = _vertices[v];
        var candidates = [];
        for (let i = 0; i < vertex.connections.length; i++) {
            if (_path.includes(vertex.val)) {
                continue;
            }
            var candidate = graph.get(vertex.connections[i].c);
            if (candidate != undefined) {
                if (candidate.val == _path[0]) {
                    var newPath = _path.slice(0);
                    newPath.splice(0, 0, vertex.val);
                    return newPath;
                } else if (candidate.val == _path[_path.length - 1]) {
                    var newPath = _path.slice(0);
                    newPath.push(vertex.val);
                    return newPath;
                }
                candidates.push(candidate);
            }
        }
        if (candidates.length == 0) {
            return undefined;
        }
        // look for quick wins
        for (let c = 0; c < candidates.length; c++) {
            for (let C = 0; C < candidates.length; C++) {
                var connectionVals = candidates.slice(0)[c].connections.map((con) => {
                    return con.c;
                });
                if (candidates[c].connections.includes(candidates[C].val)) {
                    // insert new vertex in between c & C
                    var cIndex = _path.indexOf(candidates[c].val);
                    var CIndex = _path.indexOf(candidates[C].val);
                    newPath = _path.slice(0);
                    if (CIndex > cIndex) {
                        newPath.splice(CIndex, 0, vertex.val);
                    } else {
                        newPath.splice(cIndex, 0, vertex.val);
                    }
                    var resultPath = permutePath(newPath, _vertices.slice(1));
                    if (resultPath != undefined) {
                        return resultPath;
                    }
                }
            }
        }
    }
    return undefined;
}

function nextSearch() {
    var _path = findPath();
    return _path;
}

function performSearch(max = undefined, _start = undefined) {
    const pb = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    if (max != undefined) {
        pb.start(max, 0);
    }
    if (_start != undefined) {
        for (var i = 0; i < _start - 1; i++) {
            graph.addVertex();
            pb.update(i + 1);
        }
    }
    let start = millis();
    for (let i = _start == undefined ? 1 : _start; max == undefined || i <= max; i++) {
        graph.addVertex();
        let _path = nextSearch(graph);
        if (_path != undefined) {
            if (!lastEntryPoints.includes(_path[0])) {
                lastEntryPoints.push(_path[0]);
                if (lastEntryPoints.length > 10) {
                    lastEntryPoints = lastEntryPoints.slice(1);
                }
            }
            lastPaths.push(_path);
            if (lastPaths.length > 5) {
                lastPaths = lastPaths.slice(1);
            }
            solutions.push(i);
            //fs.appendFileSync('./solutions.json', JSON.stringify({val: i, path: _path}))
            graph.updateQwithPath(_path);
        }
        if (max != undefined) {
            pb.update(i);
        }
    }
    let end = millis();
    pb.stop();
    console.log(`finished search to ${max} in ${seconds(start, end)}s`);
    console.log(`solutions found for ${solutions}`);
}

performSearch(300, 40);
//performSearch(45);
