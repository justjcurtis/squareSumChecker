# Square Sum Checker

## Overview
Square Sum Checker is a nodejs cli tool which tries to check (optimally) for paths from 1 to n where each pair of numbers (i, i+1) have a sum which is square.

It is currently believed that all sets which satisfy n >= 25 will return a valid path using all numbers in the set.

There is currently no number theory approach to either prove or disprove this conjecture. I created this tool to help provide data toward this end.

Hopefully, using this, I (or anyone else) will be able to find a set with an n > 25 (n=299 is currently this highest n checked afaik) that does not return a valid path.

The creation of this project was inspired by [this video](https://www.youtube.com/watch?v=G1m7goLCJDY) on the topic from numberphile.

## Todos
- Implement saving of output as each solution is found.
- Implement multi-threaded tree search using node workers for more efficient cpu usage.
- Refactor heuristic evaluation to "belong" to the vertex & connection classes where sensible.
- Further optimise tree search with more sensible decisions for pathing instead of relying on simple heuristic.
- Refine heuristic for better guessing in situations not yet seen or too complex to optimise algorithmically.
