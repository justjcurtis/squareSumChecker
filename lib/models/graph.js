const Vertex = require("./vertex.js");
const Connection = require("./connection.js");

class Graph {
    constructor(vertices = []) {
        this.vertices = vertices;
    }

    get(val) {
        return this.vertices[val - 1];
    }

    isSquare(n) {
        for (var i = 0; ; i++) {
            var product = i * i;
            if (product === n) {
                return true;
            } else if (product > n) {
                return false;
            }
        }
    }

    addVertex() {
        this.vertices.push(new Vertex(this.vertices.length));
        this.buildConnections();
    }

    buildConnections() {
        for (var i = 0, len = this.vertices.length - 1; i < len; i++) {
            if (this.isSquare(i + len + 2)) {
                this.vertices[i].connections.push(new Connection(len));
                this.vertices[len].connections.push(new Connection(i));
            }
        }
    }

    updateQwithPath(_path) {
        for (let i = 0; i < _path.length - 1; i++) {
            var cons = this.vertices[_path[i]].connections.map((con) => {
                return con.c;
            });
            this.vertices[_path[i]].connections[cons.indexOf(_path[i + 1])].q++;
            if (i == 0) {
                this.vertices[_path[i]].q++;
            }
        }
    }
}

module.exports = Graph;
