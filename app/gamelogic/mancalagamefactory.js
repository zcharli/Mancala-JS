/**
 * Created by CZL on 2/25/2016.
 */
'use strict';

angular.module('mancalagamefactory', [])
    .factory('MancalaGameFactory', function (PlayerFactory) {
        /**
         * Representation
         * [bscore, b , b, b, ..., r, r ,r, rscore]
         * The board is represented like the following concatinated array
         * [ 0, 1, 2, 3, 4, 5]
         * [ 6, 7, 8, 9, 10, 11]
         */
        class MancalaGameLogic {
            constructor(stones, pots, players) {
                this.numStones = stones;
                this.numPots = pots;
                this.numPlayers = players;
                this.playersPlaying = [];
                // Important Indexes
                this.bluePotStartIndex = 1;
                this.bluePotEndIndex = this.bluePotStartIndex + this.numPots;
                this.redPotStartIndex = this.bluePotEndIndex;
                this.redPotEndIndex = this.redPotStartIndex + this.numPots;
                this.bluePotsArray = new Array(this.numPots).fill(this.numStones);
                this.redPotsArray = new Array(this.numPots).fill(this.numStones);
                this.blueScoreIndex = 0;
                this.redScoreIndex = this.redPotEndIndex;
                for (let i = 0; i < this.numPlayers; ++i)
                    this.playersPlaying.push(PlayerFactory.newPlayer(i))

                // Generate a random turn, 0 is Blue, 1 is Red
                this.currentTurn = Math.floor(Math.random() * 2);
                this.gameOver = false;
                this.currentState = Array.prototype.concat.apply([], [[0], this.bluePotsArray,
                    this.redPotsArray, [0]]);
                this.printDebug()
                //this.redPots = this.currentState.slice(this.redPotStartIndex, this.redPotEndIndex);
                //this.bluePots = this.currentState.slice(this.bluePotStartIndex, this.bluePotEndIndex);
                if (this.numPlayers === 0) this.startAiPlayers();
                if (this.numPlayers === 1) this.startVersusAi();
            }

            /**
             * Makes a move for any player and updates the board state
             * @param player is the player is player, AI or real
             * @param cellNumber is the pot number on the player's side
             * @returns {boolean} if the move was successful
             */
            makeMove(player, cellNumber) {
                let modelCellMove = player * this.numPots + 1 + cellNumber;

                if (this.currentState[modelCellMove] === 0) return false;
                let lastStonePlacement = this.placeStones(modelCellMove, this.currentState[modelCellMove]);
                //this.printDebug();
                if(player === 0 && lastStonePlacement === this.blueScoreIndex) return true;
                if(player === 1 && lastStonePlacement === this.redScoreIndex) return true;
                if(player === 0 && this.currentState[lastStonePlacement] === 1) {
                    // Check lastStone in Blue
                    if(this.bluePotStartIndex <= lastStonePlacement && lastStonePlacement < this.bluePotEndIndex) {
                        this.takeOpponentsStones(lastStonePlacement, player);
                    }
                }else if(player === 1 && this.currentState[lastStonePlacement] === 1) {
                    // Check lastStone in Red
                    if(this.redPotStartIndex <= lastStonePlacement && lastStonePlacement < this.redPotEndIndex) {
                        this.takeOpponentsStones(lastStonePlacement, player);
                    }
                }
                // Switch the turn up
                this.currentTurn = Math.abs(this.currentTurn - 1);
                //console.log(this.currentTurn)
                return true;
            }

            /**
             * Take the stones from one pot and put then on the next ones until
             * we run out of stones
             * @param startPot is index of the current pot to take the stones from
             * @param stonesInHand is the number of stones we have
             * @return {number} the last final move
             */
            placeStones(startPot, stonesInHand) {
                let nextPot = 0,
                    nextMove = null,
                    finalMove;
                // Take the stones out of the start pot
                this.currentState[startPot] = 0;

                if (startPot >= this.redPotStartIndex) {
                    // Loop increasing on red pots, then wrap
                    nextPot = startPot + 1;
                    nextMove = x => nextPot++;
                    while (stonesInHand != 0) {
                        if (nextPot >= this.currentState.length) {
                            // Time to wrap around to blue pots and loop decreasing
                            nextPot = this.bluePotEndIndex - 1;
                            nextMove = x => nextPot--;
                        } else if (nextPot === -1) {
                            // Wrapped around on the other side, going back to red
                            nextPot = this.redPotStartIndex;
                            nextMove = x => nextPot++;
                        }
                        // We switch next move based on the location of the array
                        this.currentState[nextMove()] += 1;
                        --stonesInHand;
                    }
                } else {
                    // Loop decreasing on blue pots, then wrap
                    nextPot = startPot - 1;
                    nextMove = x => nextPot--;
                    while (stonesInHand != 0) {
                        if (nextPot < 0) {
                            // Time to wrap around red and loop increasing
                            nextPot = this.redPotStartIndex;
                            nextMove = x => nextPot++;
                        } else if (nextPot === this.currentState.length) {
                            // Wrapped around twice, going back to blue
                            nextPot = this.bluePotEndIndex - 1;
                            nextMove = x => nextPot--;
                        }
                        this.currentState[nextMove()] += 1
                        --stonesInHand;
                    }

                }
                // Check if the last pot is a home pot
                finalMove = nextPot;
                nextMove();
                if (nextPot > finalMove) return --finalMove;
                else return ++finalMove;
            }

            takeOpponentsStones(index, player) {
                if(player === 0) {
                    let potToTakeFrom = index + this.numPots;
                    this.currentState[this.blueScoreIndex] += this.currentState[potToTakeFrom];
                    this.currentState[potToTakeFrom] = 0;
                } else {
                    let potToTakeFrom = index - this.numPots;
                    this.currentState[this.redScoreIndex] += this.currentState[potToTakeFrom];
                    this.currentState[potToTakeFrom] = 0;
                }
            }

            getPlayerTurn() {
                return this.currentTurn;
            }

            startVersusAi() {
                console.log("See if you can beat the computer!")

            }

            startAiPlayers() {
                console.log("Let the AI battle begin!")
            }

            bluePots() {
                return this.currentState.slice(this.bluePotStartIndex, this.bluePotEndIndex);
            }

            redPots() {
                return this.currentState.slice(this.redPotStartIndex, this.redPotEndIndex);
            }

            get blueScore() {
                return this.currentState[this.blueScoreIndex];
            }

            get redScore() {
                return this.currentState[this.redScoreIndex];
            }

            printDebug() {
                console.log(this.currentState)
                console.log("bstart: " + this.bluePotStartIndex + " bend: " + this.bluePotEndIndex +
                    "rstart: " + this.redPotStartIndex + " rend: " + this.redPotEndIndex);
            }

            conl(msg) {
                console.log(msg)
            }
        }

        return {
            newGame: function (numStones, numPots, numPlayers) {
                return new MancalaGameLogic(numStones, numPots, numPlayers)
            }
        }
    });
