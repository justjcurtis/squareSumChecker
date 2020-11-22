class Vertex {
    constructor(val, connections = [], q = 0) {
        this.val = val;
        this.q = q;
        this.connections = connections;
    }

    toJson() {
        return { val: this.val, connections: this.connections, q: this.q };
    }

    static FromJson(json) {
        return new Vertex(json.val, json.connections, json.q);
    }
}

module.exports = Vertex;
