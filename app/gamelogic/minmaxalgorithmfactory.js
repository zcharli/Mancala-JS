/**
 * Created by Ziqiao Charlie Li on 2/26/2016.
 */
'use strict';

angular.module('minmaxalgorithmfactory', [])
    .factory('MinMaxAlgorithm', function() {

        class MinMaxNode {
            constructor(state, depth) {
                this.state = state;
                this.depth = depth;
                this.hash = this.getHashCode();
            }

            getHashCode() {
                let hash = 0, i, len = this.state;
                if (this.state === 0) return hash;
                for (i = 0; i < len; i++) {
                    hash  = ((hash << 5) - hash) + this.state[i];
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            }
        }

        class MinMaxAlgorithm {
            constructor(currentState, maxDepth) {
                this.root = new MinMaxNode(currentState, 0);
                this.maxPly = maxDepth;
            }

            findBestMove(state) {
                let depth = 0, stack = [], currentNode;
                currentNode = new MinMaxNode(state, depth);
                stack.push(currentNode);
                // Begin MiniMax
                while(stack.length > 0) {
                    currentNode = stack.pop();

                }
            }

            calculateHeuristicValue(state) {

            }
        }

        return {
            newMancalaMinMaxAlgorithm: function(state) {
                return new MinMaxAlgorithm(state);
            }
        }
    });
