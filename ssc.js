const fs = require("fs");
const cliProgress = require("cli-progress");
let graph = [undefined];
let lastPath = [];
let solutions = [];

function millis() {
    return Date.now();
}

function seconds(start, end) {
    return Math.round((end - start) / 10) / 100;
}

function isSquare(n) {
    for (var i = 0; ; i++) {
        var product = i * i;
        if (product === n) {
            return true;
        } else if (product > n) {
            return false;
        }
    }
}

function findPath(_graph) {
    // recursively try every entrypoint
    for (var i = 1, len = _graph.length - 1; i < len; i++) {
        var resultPath = recursePath(_graph, [i]);
        if (resultPath != undefined) {
            return resultPath;
        }
    }
    return undefined;
}

function recursePath(_graph, _currentPath) {
    if (_currentPath.length == _graph.length - 1) {
        return _currentPath;
    }
    var possibleConnections = _graph[_currentPath[_currentPath.length - 1]].filter((con) => {
        return !_currentPath.includes(con);
    });
    if (possibleConnections.length == 0) {
        return undefined;
    }

    for (var i = 0; i < possibleConnections.length; i++) {
        var next = possibleConnections[i];
        var newPath = _currentPath.slice(0);
        newPath.push(next);

        var resultPath = recursePath(_graph, newPath);

        if (resultPath != undefined) {
            return resultPath;
        }
    }

    return undefined;
}

function addVertex(_graph) {
    _graph.push([]);
    _graph = buildConnections(_graph.slice(0));
    return _graph;
}

function buildConnections(_graph) {
    for (var i = 1, len = _graph.length - 1; i < len; i++) {
        if (isSquare(i + len)) {
            _graph[i].push(len);
            _graph[len].push(i);
        }
    }
    return _graph;
}

function nextSearch(_graph) {
    _graph =  addVertex(_graph.slice(0));
    var path = findPath(_graph.slice(0));

    return [_graph, path];
}

function performSearch(max = undefined, _start = undefined) {
    const pb = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    if (max != undefined) {
        pb.start(max, 0);
    }
    if (_start != undefined) {
        for (var i = 0; i < _start - 1; i++) {
            graph = addVertex(graph.slice(0))
            pb.update(i + 1);
        }
    }
    let start = millis();
    for (let i = _start == undefined ? 1 : _start; max == undefined || i <= max; i++) {
        let [g, p] = nextSearch(graph.slice(0));
        graph = g.slice(0);
        if (p != undefined) {
            lastPath = p;
            solutions.push(i);
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

performSearch(40, 15);
