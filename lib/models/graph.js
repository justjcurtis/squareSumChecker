class Graph{
    constructor(min, max){
        if(min == undefined){
            min = 1
        }
        else if(min < 1){
            min = 1
        }
        this.min = min;
        this.max = max;
        this.numbers = Array(max-min).fill(0).map((v, i) => i + min);

    }
}

module.exports = Graph