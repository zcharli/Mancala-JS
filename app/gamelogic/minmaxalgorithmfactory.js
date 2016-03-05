/**
 * Created by Ziqiao Charlie Li on 2/26/2016.
 */
'use strict';

angular.module('minmaxalgorithmfactory', [])
    .factory('MinMaxAlgorithm', function() {

        /**
         * Min Max node
         *  0 - max
         *  1 - min layer
         */
        class MinMaxNode {
            constructor(state, depth, parent, heuristic, minMaxLayer, anotherMove, termNode) {
                this.state = state;
                this.depth = depth;
                //this.hash = this.getHashCode();
                this.parent = parent;
                this.heuristicValue = heuristic;
                this.minMaxLayer = minMaxLayer;
                this.chainMoves = anotherMove;
                this.isTerminalNode = termNode;
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
            
            generateNode(cellNumber, direction, node, lastMinMaxLayer) {
                let copiedState = null, state = node.state, thisMinMaxLayer = !lastMinMaxLayer,
                    anotherMove = false, terminalNode = true;
                let modelCellMove = this.player === 0 ? this.bluePotStartIndex + cellNumber
                    : this.redPotStartIndex + cellNumber;
                //console.log(state)
                if (state[modelCellMove] === 0) false; // Not a true move

                copiedState = angular.copy(state, copiedState)

                // Sets another maximizing layer
                if(node.chainMoves) {
                    thisMinMaxLayer = lastMinMaxLayer
                }

                // Make the play
                let lastStonePlacement = this.calculateMoveState(modelCellMove, copiedState[modelCellMove],
                    direction, copiedState);

                // Check if this play has ended the game
                if(this.player == 0) {
                    for(let i = this.bluePotStartIndex; i < this.bluePotEndIndex; ++i) {
                        terminalNode = copiedState[i] === 0 && terminalNode;
                        if(!terminalNode) break;
                    }
                } else {
                    for(let i = this.redPotStartIndex; i < this.redPotEndIndex; ++i) {
                        terminalNode = copiedState[i] === 0 && terminalNode;
                        if(!terminalNode) break;
                    }
                }

                // Check either player if they can play again
                if(this.player === 0 && (lastStonePlacement === this.blueLeftScoreIndex
                    || lastStonePlacement === this.blueRightScoreIndex)) {
                    anotherMove = true;
                }
                if(this.player === 1 && (lastStonePlacement === this.redLeftScoreIndex
                    ||lastStonePlacement === this.redRightScoreIndex)) {
                    anotherMove = true;
                }

                // Check either player if they landed on a jackpot
                if(this.player === 0 && copiedState[lastStonePlacement] === 1) {
                    // Check lastStone in Blue
                    if(this.bluePotStartIndex <= lastStonePlacement && lastStonePlacement < this.bluePotEndIndex) {
                        this.updateScore(lastStonePlacement, this.player, cellNumber, copiedState);
                    }
                }else if(this.player === 1 && copiedState[lastStonePlacement] === 1) {
                    // Check lastStone in Red
                    if(this.redPotStartIndex <= lastStonePlacement && lastStonePlacement < this.redPotEndIndex) {
                        this.updateScore(lastStonePlacement, this.player, cellNumber, copiedState);
                    }
                }
                //console.log(copiedState)
                return new MinMaxNode(state, node.depth + 1, node, 0, thisMinMaxLayer, anotherMove, terminalNode);
            }

            getHeuristicValue(state) {
                if(this.player == 0) {
                    // Blue
                    return state[this.blueLeftScoreIndex] + state[this.blueRightScoreIndex];
                } else {
                    return state[this.redLeftScoreIndex] + state[this.redRightScoreIndex];
                }
            }

            produce(node, minMax) {
                let nodeStates = [], newNode = null;

                for(let i = 0; i < this.numPots; ++i) {
                    // Generate move for left
                    newNode = this.generateNode(i, 0, node, minMax);
                    if(!newNode) continue
                    nodeStates.push(newNode);
                    // Generate move for right
                    newNode = this.generateNode(i, 1, node, minMax);
                    nodeStates.push(newNode);
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
                let currentNode = new MinMaxNode(state, 0, null, 0, true, false);
                return this.miniMax(currentNode, this.maxPly, true);
            }

            miniMax(node, depth, maximizingPlayer) {
                if(depth == 0 || node.isTerminalNode) {
                    return node.heuristicValue;
                }
                if(maximizingPlayer) {
                    let bestValue = Number.NEGATIVE_INFINITY;
                    for(let child of this.prodSystem.produce(node,maximizingPlayer)) {
                        let currentValue = this.miniMax(child, depth - 1, child.minMaxLayer);
                        bestValue = Math.max(bestValue, currentValue);
                    }
                    return bestValue;
                } else {
                    let bestValue = Number.POSITIVE_INFINITY;
                    for(let child of this.prodSystem.produce(node,maximizingPlayer)) {
                        let currentValue = this.miniMax(child, depth - 1, child.minMaxLayer);
                        bestValue = Math.min(bestValue, currentValue);
                    }
                    return bestValue;
                }

            }
        }

        return {
            newMancalaMinMaxAlgorithm: function(state, maxDepth, player, game) {
                return new MinMaxAlgorithm(state, maxDepth, player, game);
            }
        }
    });
