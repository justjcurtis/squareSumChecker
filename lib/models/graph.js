class Graph{
    constructor(min, max = 25){
        if(min == undefined){
            min = 1
        }
        else if(min < 1){
            min = 1
        }
        this.min = min;
        this.max = max;
        this.numbers = Array(max-min).fill(0).map((v, i) => i + min);
        this.squareSumsMap = this.generarteSqaureSumsMap()
    }
    generarteSqaureSumsMap = () => {
        let sqrt = this.min;
        const max = this.max + this.max -1;
        let resultMap = {}
        let squares = []
        let currentSquare = -1

        while(true){
            currentSquare = sqrt^2
            if(currentSquare < max){
                squares.push(currentSquare)
            }else{
                break;
            }
        }

        for(let a = this.min; a <= this.max; a++){
            let resultsA = resultMap[a] == undefined ? [] : resultMap[a]
            for(let b = this.min; b <= this.max; b++){
                if(resultsA.includes(b)){continue}
                if(a===b){continue}
                let resultsB = resultMap[b] == undefined ? [] : resultMap[b]
                if(squares.includes(a+b)){
                    resultsA.push(b)
                    resultsB.push(a)
                }
            }
        }
        return resultMap;
    }
}

module.exports = Graph