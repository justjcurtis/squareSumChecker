class Graph {
    constructor(squares, min, max = 25) {
        this.min = min === undefined ? 1 : min < 1 ? 1 : min;
        this.max = max < min ? min + 1 : max;
        this.squares = squares
        this.numbers = Array(max + 1 - min).fill().map((_, i) => i + min);
        this.squareSumsMap = this.generateSquareSumsMap()
    }

    generateSquareSumsMap = () => {
        let resultMap = Object.fromEntries(this.numbers.map(v => [v, []]))
        for (let a = this.min; a < this.max; a++) {
            for (let b = a + 1; b <= this.max; b++) {
                if (this.squares[a + b] !== undefined) {
                    resultMap[a].push(b)
                    resultMap[b].push(a)
                }
            }
        }
        return resultMap;
    }
}

module.exports = Graph