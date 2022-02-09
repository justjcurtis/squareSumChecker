class Graph {
    constructor(squares, min, max, prevMap = null) {
        this.min = min == undefined ? 1 : min < 1 ? 1 : min;
        this.max = max < min ? min + 1 : max;
        this.squares = squares
        this.numbers = Array(max + 1 - min).fill().map((_, i) => i + min);
        this.prevMap = prevMap
        this.squareSumsMap = this.generateSquareSumsMap()
    }

    mapFromAddition() {
        let resultMap = Object.assign({}, this.prevMap)
        this.prevMap = null
        const prevMax = parseInt(Object.keys(resultMap).slice(-1)[0])
        for (let a = prevMax + 1; a <= this.max; a++) {
            resultMap[a] = []
        }
        for (let a = prevMax + 1; a <= this.max; a++) {
            for (let b = 1; b <= prevMax; b++) {
                if (this.squares[a + b] != undefined) {
                    resultMap[a].push(b)
                    if (!resultMap[b].includes(a)) resultMap[b].push(a)
                }
            }
        }
        for (let a = prevMax + 1; a < this.max; a++) {
            for (let b = a + 1; b <= this.max; b++) {
                if (this.squares[a + b] != undefined) {
                    resultMap[a].push(b)
                    resultMap[b].push(a)
                }
            }
        }
        return resultMap
    }

    generateSquareSumsMap = () => {
        if (this.prevMap != null) return this.mapFromAddition()
        let resultMap = Object.fromEntries(this.numbers.map(v => [v, []]))
        for (let a = this.min; a < this.max; a++) {
            for (let b = a + 1; b <= this.max; b++) {
                if (this.squares[a + b] != undefined) {
                    resultMap[a].push(b)
                    resultMap[b].push(a)
                }
            }
        }
        return resultMap;
    }
}

module.exports = Graph