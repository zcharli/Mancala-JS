/**
 * Created by Ziqiao Charlie Li on 2/26/2016.
 */
'use strict';

angular.module('minmaxalgorithmfactory', [])
    .factory('MinMaxAlgorithm', function () {

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
                    hash = ((hash << 5) - hash) + this.state[i];
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            }
        }

        class MancalaProductionSystem {
            constructor(constraints, player, heuristicFunc) {
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
                this.heuristic = heuristicFunc;
            }

            calculateMoveState(startPot, stonesInHand, direction, state, player) {
                let nextPot = 0, nextMove = null, finalMove;

                // determine direction
                if (direction == 0) {
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
                        if (player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        else if (player == 1 && (nextPot === this.blueLeftScoreIndex
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
                        if (player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        else if (player == 1 && (nextPot === this.blueLeftScoreIndex
                            || nextPot === this.blueRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        state[nextMove()] += 1;
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
                let closestPot = 0, scoreTaken = 0;
                if (player === 0) {
                    // Taking from red
                    closestPot = cellNumber > this.numPots / 2 ? this.blueRightScoreIndex
                        : this.blueLeftScoreIndex;
                    let potToTakeFrom = index + this.numPots + 2; // Two score pots in between
                    scoreTaken = state[potToTakeFrom];
                    state[closestPot] += scoreTaken;
                    state[potToTakeFrom] = 0;
                } else {
                    // Taking from blue
                    closestPot = cellNumber > this.numPots / 2 ? this.redRightScoreIndex
                        : this.redLeftScoreIndex;
                    let potToTakeFrom = index - this.numPots - 2;
                    scoreTaken = state[potToTakeFrom];
                    state[closestPot] += scoreTaken;
                    state[potToTakeFrom] = 0;
                }
                return scoreTaken;
            }

            generateNode(cellNumber, direction, node, lastMinMaxLayer, player) {
                let copiedState = null, state = node.state, thisMinMaxLayer = !lastMinMaxLayer,
                    anotherMove = false, terminalNode = true, heuristicValue = 0;
                let modelCellMove = player === 0 ? this.bluePotStartIndex + cellNumber
                    : this.redPotStartIndex + cellNumber;
                //console.log(state)
                if (state[modelCellMove] === 0) return false; // Not a true move

                copiedState = angular.copy(state, copiedState);

                // Sets another maximizing layer
                if (node.chainMoves) {
                    thisMinMaxLayer = lastMinMaxLayer;
                    //heuristicValue += 1;
                }

                // Make the play
                let lastStonePlacement = this.calculateMoveState(modelCellMove, copiedState[modelCellMove],
                    direction, copiedState, player);

                // Check if this play has ended the game
                if (player == 0) {
                    for (let i = this.bluePotStartIndex; i < this.bluePotEndIndex; ++i) {
                        terminalNode = copiedState[i] === 0 && terminalNode;
                        if (!terminalNode) break;
                    }
                } else {
                    for (let i = this.redPotStartIndex; i < this.redPotEndIndex; ++i) {
                        terminalNode = copiedState[i] === 0 && terminalNode;
                        if (!terminalNode) break;
                    }
                }

                // Check either player if they can play again
                if (player === 0 && (lastStonePlacement === this.blueLeftScoreIndex
                    || lastStonePlacement === this.blueRightScoreIndex)) {
                    anotherMove = true;
                    //heuristicValue += 1;
                }
                if (player === 1 && (lastStonePlacement === this.redLeftScoreIndex
                    || lastStonePlacement === this.redRightScoreIndex)) {
                    anotherMove = true;
                    //heuristicValue += 1;
                }

                // Check either player if they landed on a jackpot
                if (player === 0 && copiedState[lastStonePlacement] === 1) {
                    // Check lastStone in Blue
                    if (this.bluePotStartIndex <= lastStonePlacement && lastStonePlacement < this.bluePotEndIndex) {
                        this.updateScore(lastStonePlacement, player, cellNumber, copiedState);
                    }
                } else if (player === 1 && copiedState[lastStonePlacement] === 1) {
                    // Check lastStone in Red
                    if (this.redPotStartIndex <= lastStonePlacement && lastStonePlacement < this.redPotEndIndex) {
                        this.updateScore(lastStonePlacement, player, cellNumber, copiedState);
                    }
                }
                //console.log(copiedState)
                heuristicValue += this.heuristic.call(this, copiedState, player);
                return new MinMaxNode(copiedState, node.depth + 1, node, heuristicValue, thisMinMaxLayer, anotherMove, terminalNode);
            };

            getHeuristicValue(state, player) {
                if (player == 0) {
                    // Blue
                    return state[this.blueLeftScoreIndex] + state[this.blueRightScoreIndex];
                } else {
                    return state[this.redLeftScoreIndex] + state[this.redRightScoreIndex];
                }
            };

            produce(node, minMax, player) {
                let newMoveStates = [], newNode = null;

                for (let i = 0; i < this.numPots; ++i) {
                    // Generate move for left
                    newNode = this.generateNode(i, 0, node, minMax, player);
                    if (!newNode) continue;
                    newMoveStates.push({node: newNode, direction: 0, move: i});
                    // Generate move for right
                    newNode = this.generateNode(i, 0, node, minMax, player);
                    newMoveStates.push({node: newNode, direction: 1, move: i});
                }
                console.log(newMoveStates);
                return newMoveStates;
            }
        }

        class MinMaxAlgorithm {
            constructor(currentState, maxDepth, player, mancalaGame, heuristicFunc) {
                this.root = new MinMaxNode(currentState, 0);
                this.maxPly = maxDepth;
                this.prodSystem = new MancalaProductionSystem(mancalaGame, player, heuristicFunc);
                this.game = mancalaGame;
                this.player = player;
                this.nodeCount = 0;
            }

            findBestMove(state) {
                let currentNode = new MinMaxNode(state, 0, null, 0, true, false);
                let firstEncapMoveState = {node: currentNode, direction: null};
                return this.miniMax(firstEncapMoveState, this.maxPly, true);
            }

            miniMax(moveState, depth, maximizingPlayer) {
                if (depth == 0 || moveState.node.isTerminalNode) {
                    return moveState;
                }
                if (maximizingPlayer) {
                    let bestValue = {node: {heuristicValue: Number.NEGATIVE_INFINITY}};
                    for (let child of this.prodSystem.produce(moveState.node, maximizingPlayer, this.player)) {
                        let curMoveState = this.miniMax(child, depth - 1, child.node.minMaxLayer);
                        bestValue = bestValue.node.heuristicValue >= curMoveState.node.heuristicValue ?
                            bestValue : curMoveState;
                    }
                    //console.log("maximizing best value: " + bestValue.node.heuristicValue +
                    //    " with move " + bestValue.move + " with direction " + bestValue.direction);
                    return bestValue;
                } else {
                    let bestValue = {node: {heuristicValue: Number.POSITIVE_INFINITY}};
                    for (let child of this.prodSystem.produce(moveState.node, maximizingPlayer, Math.abs(this.player - 1))) {
                        let curMoveState = this.miniMax(child, depth - 1, child.node.minMaxLayer);
                        bestValue = bestValue.node.heuristicValue <= curMoveState.node.heuristicValue ?
                            bestValue : curMoveState;
                    }
                    //console.log("minimizing best value: " + bestValue.node.heuristicValue +
                    //    " with move " + bestValue.move + " with direction " + bestValue.direction);
                    return bestValue;
                }
            }
        }

        return {
            newMancalaMinMaxAlgorithm: function (state, maxDepth, player, game, heuristicFunction) {
                return new MinMaxAlgorithm(state, maxDepth, player, game, heuristicFunction);
            }
        }
    });
