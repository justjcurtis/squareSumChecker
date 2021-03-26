class Graph{
    constructor(squares, min, max = 25){
        if(min == undefined){
            min = 1
        }
        else if(min < 1){
            min = 1
        }
        this.min = min;
        this.max = max;
        this.squares = squares
        this.numbers = Array(max-min).fill(0).map((v, i) => i + min);
        this.squareSumsMap = this.generateSquareSumsMap()
    }

    generateSquareSumsMap = () => {
        const max = this.max + this.max -1;
        let resultMap = {}

        for(let a = this.min; a <= this.max; a++){
            if(resultMap[a] == undefined){
                resultMap[a] = []
            }
            for(let b = this.min; b <= this.max; b++){
                if(resultMap[a].includes(b)){continue}
                if(a===b){continue}
                if(resultMap[b] == undefined){
                    resultMap[b] = []
                }
                if(this.squares.includes(a+b)){
                    resultMap[a].push(b)
                    resultMap[b].push(a)
                }
            }
        }
        return resultMap;
    }
}

module.exports = Graph