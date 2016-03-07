/**
 * Created by CZL on 2/25/2016.
 */
'use strict';

angular.module('mancalagamefactory', [])
    .factory('MancalaGameFactory', function (PlayerFactory, MinMaxAlgorithm) {
        /**
         * Representation
         * [bscore, b , b, b, bscore, rscore, r, r ,r, rscore]
         * The board is represented like the following concatinated array
         * [ 0, 1, 2, 3, 4, 5]
         * [ 6, 7, 8, 9, 10, 11]
         */
        class MancalaGameLogic {
            constructor(stones, pots, players, depth) {
                this.maxDepth = depth;
                this.blueRemainingPotScore = 0, this.redRemainingPotScore = 0;
                this.numStones = stones;
                this.numPots = pots;
                this.numPlayers = players;
                this.playersPlaying = [];
                // Important Indexes
                this.bluePotStartIndex = 1;
                this.bluePotEndIndex = this.bluePotStartIndex + this.numPots;
                this.redPotStartIndex = this.bluePotEndIndex + 2;
                this.redPotEndIndex = this.redPotStartIndex + this.numPots;
                this.bluePotsArray = new Array(this.numPots).fill(this.numStones);
                this.redPotsArray = new Array(this.numPots).fill(this.numStones);
                this.blueLeftScoreIndex = 0;
                this.blueRightScoreIndex = this.bluePotEndIndex;
                this.redLeftScoreIndex = this.blueRightScoreIndex + 1;
                this.redRightScoreIndex = this.redPotEndIndex;
                for (let i = 0; i < this.numPlayers; ++i)
                    this.playersPlaying.push(PlayerFactory.newPlayer(i))

                // Generate a random turn, 0 is Blue, 1 is Red
                this.currentTurn = Math.floor(Math.random() * 2);
                this.gameOver = false;
                this.currentState = Array.prototype.concat.apply([], [[0], this.bluePotsArray,
                    [0], [0], this.redPotsArray, [0]]);
                this.printDebug();
                if (this.numPlayers == 0) {

                    this.blueBot = MinMaxAlgorithm.newMancalaMinMaxAlgorithm(this.currentState, this.maxDepth, 0,
                        this, this.heuristicTwo);
                    this.redBot = MinMaxAlgorithm.newMancalaMinMaxAlgorithm(this.currentState, this.maxDepth, 1,
                        this, this.heuristicOne);
                }
                if (this.numPlayers == 1) {
                    this.conl(this);
                    this.blueBot = MinMaxAlgorithm.newMancalaMinMaxAlgorithm(this.currentState, this.maxDepth, 0,
                        this, this.heuristicOne);
                }
                this.lastMove = {};
            }

            /**
             * Makes a move for any player and updates the board state
             * @param player is the player is player, AI or real
             * @param cellNumber is the pot number on the player's side
             * @param direction is the chosen direction to play
             * @returns {boolean} if the move was successful
             */
            makeMove(player, cellNumber, direction) {
                if (this.gameOver) return false;
                let modelCellMove = player === 0 ? this.bluePotStartIndex + cellNumber
                    : this.redPotStartIndex + cellNumber;

                if (this.currentState[modelCellMove] === 0) return false;
                let lastStonePlacement = this.placeStones(modelCellMove, this.currentState[modelCellMove],
                    player, direction);

                if (player === 0 && (lastStonePlacement === this.blueLeftScoreIndex
                    || lastStonePlacement === this.blueRightScoreIndex)) return true;
                if (player === 1 && (lastStonePlacement === this.redLeftScoreIndex
                    || lastStonePlacement === this.redRightScoreIndex)) return true;

                if (player === 0 && this.currentState[lastStonePlacement] === 1) {
                    // Check lastStone in Blue
                    if (this.bluePotStartIndex <= lastStonePlacement && lastStonePlacement < this.bluePotEndIndex) {
                        this.takeOpponentsStones(lastStonePlacement, player, cellNumber);
                    }
                } else if (player === 1 && this.currentState[lastStonePlacement] === 1) {
                    // Check lastStone in Red
                    if (this.redPotStartIndex <= lastStonePlacement && lastStonePlacement < this.redPotEndIndex) {
                        this.takeOpponentsStones(lastStonePlacement, player, cellNumber);
                    }
                }
                let itsOverOnBlueSide = true;
                let itsOverOnRedSide = true;
                for (let i = this.bluePotStartIndex; i < this.bluePotEndIndex; ++i) {
                    itsOverOnBlueSide  = this.currentState[i] === 0 && itsOverOnBlueSide;
                }

                for (let i = this.redPotStartIndex; i < this.redPotEndIndex; ++i) {
                    itsOverOnRedSide  = this.currentState[i] === 0 && itsOverOnRedSide;
                }
                this.gameOver = itsOverOnRedSide || itsOverOnBlueSide;


                if (this.gameOver) {
                    console.log("Game is over.");
                    return false;
                }

                // Switch the turn up
                this.currentTurn = Math.abs(this.currentTurn - 1);
                console.log(this.currentTurn)
                return true;
            }

            /**
             * Take the stones from one pot and put then on the next ones until
             * we run out of stones
             * @param startPot is index of the current pot to take the stones from
             * @param stonesInHand is the number of stones we have
             * @param player who wanted to play (2)
             * @param direction for the direction to place stones
             * @return {number} the last final move
             */
            placeStones(startPot, stonesInHand, player, direction) {
                let nextPot = 0, nextMove = null, finalMove;
                let incrementer = x => nextPot++;
                let decrementer = x => nextPot--;
                // determine direction
                if (direction == 0) {
                    // Go left
                    nextMove = decrementer;
                    nextPot = startPot - 1;
                } else {
                    // Go right
                    nextMove = incrementer;
                    nextPot = startPot + 1;
                }
                // Take the stones out of the start pot
                this.currentState[startPot] = 0;

                if (startPot >= this.redPotStartIndex) {
                    // Loop increasing on red pots, then wrap
                    while (stonesInHand != 0) {
                        if (nextPot >= this.currentState.length && direction == 1) {
                            nextPot = this.bluePotEndIndex - 1;
                            nextMove = decrementer;
                        } else if (nextPot < this.bluePotStartIndex && direction == 1) {
                            nextPot = this.redLeftScoreIndex;
                            nextMove = incrementer;
                        } else if (nextPot == this.blueRightScoreIndex && direction == 0) {
                            nextPot = this.bluePotStartIndex;
                            nextMove = incrementer;
                        } else if (nextPot + 1 == this.blueRightScoreIndex && direction == 0) {
                            this.currentState[nextMove()] += 1;
                            --stonesInHand;
                            nextPot = this.redRightScoreIndex;
                            nextMove = decrementer;
                            continue;
                        }
                        if (player === 0){
                            console.log("Something bad happened to red's side...");
                        }
                        if (player == 1 && (nextPot === this.blueLeftScoreIndex
                            || nextPot === this.blueRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        // We switch next move based on the location of the array
                        this.currentState[nextMove()] += 1;
                        --stonesInHand;
                    }
                } else {
                    // Loop decreasing on blue pots, then wrap
                    while (stonesInHand != 0) {
                        if (nextPot < 0 && direction == 0) {
                            // Time to wrap around red and loop increasing
                            nextPot = this.redPotStartIndex;
                            nextMove = incrementer;
                        } else if (nextPot === this.redRightScoreIndex && direction == 0) {
                            // Wrapped around twice, going back to blue
                            nextPot = this.blueRightScoreIndex;
                            nextMove = decrementer;
                        } else if (nextPot == this.redLeftScoreIndex && direction == 1) {
                            nextPot = this.redPotEndIndex - 1;
                            nextMove = decrementer;
                        } else if (nextPot - 1 == this.redLeftScoreIndex && direction == 1) {
                            this.currentState[nextMove()] += 1;
                            --stonesInHand;
                            nextPot = this.blueLeftScoreIndex;
                            nextMove = incrementer;
                            continue;
                        }
                        if (player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        if (player == 1){
                            console.log("Something bad happened on the blue side.")
                        }
                        this.currentState[nextMove()] += 1;
                        --stonesInHand;
                    }
                }
                // Check if the last pot is a home pot
                finalMove = nextPot;
                nextMove();
                if (nextPot > finalMove) return --finalMove;
                else return ++finalMove;
            }

            computeAiMove(player) {
                console.log("See if you can beat the computer!")
                if (this.numPlayers == 1 && player === 0) {
                    let bestMove = this.blueBot.findBestMove(this.currentState);
                    console.log("blue made move...");
                    console.log(bestMove);
                    this.lastMove = bestMove;
                    return this.makeMove(0, bestMove.move, bestMove.direction);
                } else if (this.numPlayers == 0) {
                    if (player === 0) {
                        let bestMove = this.blueBot.findBestMove(this.currentState);
                        console.log("red made move...");
                        console.log(bestMove);
                        this.lastMove = bestMove;
                        return this.makeMove(0, bestMove.move, bestMove.direction);
                    } else {
                        let bestMove = this.redBot.findBestMove(this.currentState);
                        console.log("blue made move...");
                        console.log(bestMove);
                        this.lastMove = bestMove;
                        return this.makeMove(0, bestMove.move, bestMove.direction);
                    }
                }
                return false;
            }

            /**
             * Takes the opponents stone from his opposite side when we land on the case
             * where the last stone is put in a zero stone pot
             * @param index is the index to of the row to take
             * @param player is the player profiting
             * @param cellNumber is the cell number of the player's row
             */
            takeOpponentsStones(index, player, cellNumber) {
                let closestPot = 0;
                if (player === 0) {
                    console.log("Blue Player made a jackpot move!");
                    // Taking from red
                    closestPot = cellNumber > this.numPots / 2 ? this.blueRightScoreIndex
                        : this.blueLeftScoreIndex;
                    let potToTakeFrom = index + this.numPots + 2; // Two score pots in between
                    this.currentState[closestPot] += this.currentState[potToTakeFrom];
                    this.currentState[potToTakeFrom] = 0;
                } else {
                    console.log("Red Player made a jackpot move!");
                    // Taking from blue
                    closestPot = cellNumber > this.numPots / 2 ? this.redRightScoreIndex
                        : this.redLeftScoreIndex;
                    let potToTakeFrom = index - this.numPots - 2;
                    this.currentState[closestPot] += this.currentState[potToTakeFrom];
                    this.currentState[potToTakeFrom] = 0;
                }
            }

            getPlayerTurn() {
                return this.currentTurn;
            }

            heuristicOne(state, player) {
                let myStones = 0, theirStones = 0;
                if (player === 1) {
                    for (let i = this.redLeftScoreIndex; i <= this.redRightScoreIndex; ++i) {
                        myStones += state[i];
                    }
                    for (let i = 0; i <= this.blueRightScoreIndex; ++i) {
                        theirStones += state[i];
                    }
                    return myStones - theirStones;
                } else {
                    for (let i = 0; i <= this.blueRightScoreIndex; ++i) {
                        myStones += state[i];
                    }
                    for (let i = this.redLeftScoreIndex; i <= this.redRightScoreIndex; ++i) {
                        theirStones += state[i];
                    }
                    return myStones - theirStones;
                }
            }

            heuristicTwo(state, player) {
                let myStones = 0, theirStones = 0, myScore = 0, theirScore = 0;
                if (player === 1) {
                    for (let i = this.redPotStartIndex + 1; i < this.numPots + this.redPotStartIndex - 1; ++i) {
                        myStones += state[i];
                    }
                    myStones += state[this.redPotStartIndex] * 2 + state[this.redPotEndIndex - 1] * 2;
                    for (let i = this.bluePotStartIndex + 1; i < this.numPots - 1; ++i) {
                        theirStones += state[i];
                    }
                    theirStones += (state[this.bluePotEndIndex - 1] + state[this.bluePotStartIndex]) * 2;
                    myScore = (state[this.redRightScoreIndex] + state[this.redLeftScoreIndex]) * 4;
                    theirScore = (state[this.blueRightScoreIndex] + state[this.blueLeftScoreIndex]) * 4;
                    return (myScore - theirScore) + (myStones - theirStones);
                } else {
                    for (let i = this.redPotStartIndex + 1; i < this.numPots - 1; ++i) {
                        theirStones += state[i];
                    }
                    theirStones += (state[this.redPotEndIndex - 1] + state[this.redPotStartIndex]) * 2;
                    for (let i = this.bluePotStartIndex + 1; i < this.numPots - 1; ++i) {
                        myStones += state[i];
                    }
                    myStones += (state[this.bluePotStartIndex] + state[this.redPotEndIndex - 1]) * 2;
                    myScore = (state[this.blueRightScoreIndex] + state[this.blueLeftScoreIndex]) * 4;
                    theirScore = (state[this.redRightScoreIndex] + state[this.redLeftScoreIndex]) * 4;
                    return (myScore - theirScore) + (myStones - theirStones);
                }
            }

            bluePots() {
                return this.currentState.slice(this.bluePotStartIndex, this.bluePotEndIndex);
            }

            redPots() {
                return this.currentState.slice(this.redPotStartIndex, this.redPotEndIndex);
            }

            get blueLeftScore() {
                return this.currentState[this.blueLeftScoreIndex];
            }

            get blueRightScore() {
                return this.currentState[this.blueRightScoreIndex];
            }

            get redLeftScore() {
                return this.currentState[this.redLeftScoreIndex];
            }

            get redRightScore() {
                return this.currentState[this.redRightScoreIndex];
            }

            get blueScoreTotalEndScore() {
                this.blueRemainingPotScore = 0;
                for(let i = this.bluePotStartIndex; i < this.bluePotEndIndex; ++i) {
                    this.blueRemainingPotScore += this.currentState[i];
                }
                return this.blueLeftScore + this.blueRightScore + this.blueRemainingPotScore;
            }

            get redScoreTotalEndScore() {
                this.redRemainingPotScore = 0;
                for(let i = this.redPotStartIndex; i < this.redPotEndIndex; ++i) {
                    this.redRemainingPotScore += this.currentState[i];
                }
                console.log(this.bluePotEndIndex)
                console.log(this.redPotEndIndex)
                console.log(this.currentState[this.redRightScoreIndex]);
                return this.redLeftScore + this.redRightScore + this.redRemainingPotScore;
            }

            printDebug() {
                this.conl(this.playersPlaying);
                console.log(this.currentState);
                console.log("bstart: " + this.bluePotStartIndex + " bend: " + this.bluePotEndIndex +
                    "rstart: " + this.redPotStartIndex + " rend: " + this.redPotEndIndex);
            }

            conl(msg) {
                console.log(msg)
            }
        }

        return {
            newGame: function (numStones, numPots, numPlayers, depth) {
                return new MancalaGameLogic(numStones, numPots, numPlayers, depth)
            }
        }
    });
