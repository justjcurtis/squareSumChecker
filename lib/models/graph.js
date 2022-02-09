class Graph {
    constructor(conMap, min, max, hash = (a, b) => a + b) {
        this.min = min == undefined ? 1 : min < 1 ? 1 : min;
        this.max = max < min ? min + 1 : max;
        this.conMap = conMap
        this.hash = hash
        this.numbers = Array(max + 1 - min).fill().map((_, i) => i + min);
        this.hashMap = this.generateHashMap()
    }

    generateHashMap = () => {
        let resultMap = Object.fromEntries(this.numbers.map(v => [v, []]))
        for (let a = this.min; a < this.max; a++) {
            for (let b = a + 1; b <= this.max; b++) {
                if (this.conMap[this.hash(a, b)] != undefined) {
                    resultMap[a].push(b)
                    resultMap[b].push(a)
                }
            }
        }
        return resultMap;
    }
}

module.exports = Graph