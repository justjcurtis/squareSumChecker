# Square Sum Checker

## Overview
Square Sum Checker is a nodejs cli tool which tries to check (optimally) for paths from 1 to n where each pair of numbers (i, i+1) have a sum which is square.

~~It is currently believed that all sets which satisfy n >= 25 will return a valid path using all numbers in the set.~~

It has now been proven ([look here for more info](https://oeis.org/A090461)) than all sets of 1 to n where n >= 25 fall into this set. 

In the future I hope to make this tool able to accept user defined graph rules which will enable optimal generation & checking of paths through any type of graph rather than just a + b == x^2.

The creation of this project was inspired by [this video](https://www.youtube.com/watch?v=G1m7goLCJDY) on the topic from numberphile.

## Todos
- [x] Refactor to accept command line args as inputs for search max & start.
- [x] Implement saving of output as each solution is found.
- [x] Implement multi-threaded tree search using node workers for more efficient cpu usage.
    - [x] Handle each thread independently rather than in batches for even more efficient cpu usage.
- [x] Further optimise tree search with more sensible decisions for pathing instead of relying on simple heuristic.
- [ ] Re-add some heuristic optimisation if possible & effective.
- [ ] Add optimisations for using recent paths and/or recent path parts.
- [ ] Implement user defined graph rules eg a+b == x^3 etc.
