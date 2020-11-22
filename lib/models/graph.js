const Vertex = require("./vertex.js");
const Connection = require("./connection.js");

class Graph {
    constructor(vertices = []) {
        this.vertices = vertices;
    }

    get(val) {
        return this.vertices[val - 1];
    }

    isSquare(num) {
        if (num == 1) return true;
        let left = 2;
        let right = Math.floor(num / 2);
        while (left <= right) {
            let middle = Math.floor((left + right) / 2);
            let sqr = middle * middle;
            if (sqr == num) {
                return true;
            } else {
                if (sqr > num) {
                    right = middle - 1;
                } else {
                    left = middle + 1;
                }
            }
        }

        return false;
        //if (n % 2 == 0) {
        //return false;
        //} else {
        //return Math.sqrt(n) % 1 === 0;
        //}
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
