class Connection {
    constructor(c = undefined, q = 0) {
        this.c = c;
        this.q = q;
    }

    toJson() {
        return { c: this.c, q: this.q };
    }

    static FromJson(json) {
        return new Connection(json.c, json.q);
    }
}

module.exports = Connection;
