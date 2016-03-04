/**
 * Created by Ziqiao Charlie Li on 2/26/2016.
 */
'use strict';

angular.module('minmaxalgorithmfactory', [])
    .factory('MinMaxAlgorithm', function() {

        class MinMaxNode {
            constructor(state, depth, parent, heuristic) {
                this.state = state;
                this.depth = depth;
                this.hash = this.getHashCode();
                this.parent = parent;
                this.children = [];
                this.heuristicValue = heuristic;
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

        class MancalaProductionSystem {
            constructor(constraints, player) {
                this.numStones = constraints.numStones;
                this.numPots = constraints.numPots;
                this.bluePotStartIndex = 1;
                this.bluePotEndIndex = this.bluePotStartIndex + this.numPots;
                this.redPotStartIndex = this.bluePotEndIndex + 2;
                this.redPotEndIndex = this.redPotStartIndex + this.numPots;
                this.blueLeftScoreIndex = 0;
                this.blueRightScoreIndex = this.bluePotEndIndex;
                this.redLeftScoreIndex = this.blueRightScoreIndex + 1;
                this.redRightScoreIndex = this.redPotEndIndex;
                this.player = player;
            }

            calculateMoveState(startPot, stonesInHand, direction, state) {
                let nextPot = 0, nextMove = null, finalMove;

                // determine direction
                if(direction == 0) {
                    // Go left
                    nextMove = x => nextPot--;
                    nextPot = startPot - 1;
                } else {
                    // Go right
                    nextMove = x => nextPot++;
                    nextPot = startPot + 1;
                }
                // Take the stones out of the start pot
                state[startPot] = 0;

                if (startPot >= this.redPotStartIndex) {
                    // Loop increasing on red pots, then wrap
                    while (stonesInHand != 0) {
                        if (nextPot >= state.length) {
                            // Time to wrap around to blue pots and loop decreasing
                            nextPot = this.blueRightScoreIndex;
                            nextMove = x => nextPot--;
                        } else if (nextPot === -1) {
                            // Wrapped around on the other side, going back to red
                            nextPot = this.redLeftScoreIndex;
                            nextMove = x => nextPot++;
                        }
                        if(this.player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        else if(this.player == 1 && (nextPot === this.blueLeftScoreIndex
                            || nextPot === this.blueRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        // We switch next move based on the location of the array
                        state[nextMove()] += 1;
                        --stonesInHand;
                    }
                } else {
                    // Loop decreasing on blue pots, then wrap
                    while (stonesInHand != 0) {
                        if (nextPot < 0) {
                            // Time to wrap around red and loop increasing
                            nextPot = this.redLeftScoreIndex;
                            nextMove = x => nextPot++;
                        } else if (nextPot === state.length) {
                            // Wrapped around twice, going back to blue
                            nextPot = this.blueRightScoreIndex;
                            nextMove = x => nextPot--;
                        }
                        if(this.player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        else if(this.player == 1 && (nextPot === this.blueLeftScoreIndex
                            || nextPot === this.blueRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        state[nextMove()] += 1
                        --stonesInHand;
                    }

                }
                // Check if the last pot is a home pot
                finalMove = nextPot;
                nextMove();
                if (nextPot > finalMove) return --finalMove;
                else return ++finalMove;
            }

            updateScore(index, player, cellNumber, state) {
                let closestPot =  0;
                if(player === 0) {
                    // Taking from red
                    closestPot = cellNumber > this.numPots / 2 ? this.blueRightScoreIndex
                        : this.blueLeftScoreIndex;
                    let potToTakeFrom = index + this.numPots + 2; // Two score pots in between
                    state[closestPot] += state[potToTakeFrom];
                    state[potToTakeFrom] = 0;
                } else {
                    // Taking from blue
                    closestPot = cellNumber > this.numPots / 2 ? this.redRightScoreIndex
                        : this.redLeftScoreIndex;
                    let potToTakeFrom = index - this.numPots - 2;
                    state[closestPot] += state[potToTakeFrom];
                    state[potToTakeFrom] = 0;
                };
            }
            
            generateNode(cellNumber, direction, state) {
                let modelCellMove = this.player === 0 ? this.bluePotStartIndex + cellNumber
                    : this.redPotStartIndex + cellNumber;
                console.log(state)
                if (state[modelCellMove] === 0) false; // Not a true move

                let lastStonePlacement = this.calculateMoveState(modelCellMove, state[modelCellMove],
                    direction, state);
                //this.printDebug();
                if(this.player === 0 && (lastStonePlacement === this.blueLeftScoreIndex
                    || lastStonePlacement === this.blueRightScoreIndex)) return true; // Can play again
                if(this.player === 1 && (lastStonePlacement === this.redLeftScoreIndex
                    ||lastStonePlacement === this.redRightScoreIndex)) return true; // Can play again

                if(this.player === 0 && state[lastStonePlacement] === 1) {
                    // Check lastStone in Blue
                    if(this.bluePotStartIndex <= lastStonePlacement && lastStonePlacement < this.bluePotEndIndex) {
                        this.updateScore(lastStonePlacement, this.player, cellNumber, state);
                    }
                }else if(this.player === 1 && state[lastStonePlacement] === 1) {
                    // Check lastStone in Red
                    if(this.redPotStartIndex <= lastStonePlacement && lastStonePlacement < this.redPotEndIndex) {
                        this.updateScore(lastStonePlacement, this.player, cellNumber, state);
                    }
                }
                return state;
            }

            produce(node, forPlayer) {
                var nodeStates = [], copiedState = null, state = null, newNode = null;
                var newNodeDepth = node.depth + 1;
                for(let i = 0; i < this.numPots; ++i) {
                    copiedState = angular.copy(node.state, copiedState)
                    state = this.generateNode(i, 0, copiedState);
                    if(!state) continue
                    newNode = new MinMaxNode(state, newNodeDepth, node);
                    nodeStates.push(newNode);
                    node.children.push(newNode);
                    copiedState = angular.copy(node.state, copiedState)
                    state = this.generateNode(i, 1, copiedState);
                    newNode = new MinMaxNode(state, newNodeDepth, node);
                    nodeStates.push(newNode);
                    node.children.push(newNode);
                }
                return nodeStates;
            }
        }

        class MinMaxAlgorithm {
            constructor(currentState, maxDepth, player, mancalaGame) {
                this.root = new MinMaxNode(currentState, 0);
                this.maxPly = maxDepth;
                this.prodSystem = new MancalaProductionSystem(mancalaGame, player);
                this.game = mancalaGame;
                this.player = player;
            }

            findBestMove(state) {
                let depth = 0, stack = [], currentNode, bestValue,
                    nodes, maximize = true;
                currentNode = new MinMaxNode(state, depth);
                stack.push(currentNode);
                let test = currentNode;
                console.log(state)
                while(stack.length > 0) {
                    currentNode = stack.pop();
                    console.log(currentNode)
                    if(currentNode.depth == this.maxPly) continue;

                    if(currentNode.depth % 2) {
                        // Minimizing layer
                        bestValue = Number.MAX_VALUE;
                        nodes = this.prodSystem.produce(currentNode, this.player);
                        stack.concat(nodes);
                    } else {
                        // Maximizing layer
                        bestValue = Number.MIN_VALUE;
                        nodes = this.prodSystem.produce(currentNode, Math.abs(this.player - 1));
                        stack.concat(nodes);
                    }

                }
                console.log(test)
            }

            calculateHeuristicValue(state) {

            }
        }

        return {
            newMancalaMinMaxAlgorithm: function(state, maxDepth, player, game) {
                return new MinMaxAlgorithm(state, maxDepth, player, game);
            }
        }
    });
