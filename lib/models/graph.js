class Graph {
    constructor(squares, min, max = 25) {
        this.min = min === undefined ? 1 : min < 1 ? 1 : min;
        this.max = max < min ? min + 1 : max;
        this.squares = squares
        this.numbers = Array(max - min).fill(0).map((v, i) => i + min);
        this.squareSumsMap = this.generateSquareSumsMap()
    }

    generateSquareSumsMap = () => {
        let resultMap = {}
        for (let a = this.min; a <= this.max; a++) {
            if (resultMap[a] === undefined) {
                resultMap[a] = []
            }
            for (let b = this.min; b <= this.max; b++) {
                if (resultMap[a].includes(b)) { continue }
                if (a === b) { continue }
                if (resultMap[b] === undefined) {
                    resultMap[b] = []
                }
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