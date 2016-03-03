/**
 * Created by CZL on 2/25/2016.
 */
'use strict';

angular.module('mancalagamefactory', [])
    .factory('MancalaGameFactory', function (PlayerFactory) {
        /**
         * Representation
         * [bscore, b , b, b, bscore, rscore, r, r ,r, rscore]
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
                let modelCellMove = player === 0 ? this.bluePotStartIndex + cellNumber
                    : this.redPotStartIndex + cellNumber;

                if (this.currentState[modelCellMove] === 0) return false;
                let lastStonePlacement = this.placeStones(modelCellMove, this.currentState[modelCellMove], player);
                //this.printDebug();
                if(player === 0 && (lastStonePlacement === this.blueLeftScoreIndex
                    || lastStonePlacement === this.blueRightScoreIndex)) return true;
                if(player === 1 && (lastStonePlacement === this.redLeftScoreIndex
                    ||lastStonePlacement === this.redRightScoreIndex)) return true;

                if(player === 0 && this.currentState[lastStonePlacement] === 1) {
                    // Check lastStone in Blue
                    if(this.bluePotStartIndex <= lastStonePlacement && lastStonePlacement < this.bluePotEndIndex) {
                        this.takeOpponentsStones(lastStonePlacement, player, cellNumber);
                    }
                }else if(player === 1 && this.currentState[lastStonePlacement] === 1) {
                    // Check lastStone in Red
                    if(this.redPotStartIndex <= lastStonePlacement && lastStonePlacement < this.redPotEndIndex) {
                        this.takeOpponentsStones(lastStonePlacement, player, cellNumber);
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
            placeStones(startPot, stonesInHand, player) {
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
                            nextPot = this.blueRightScoreIndex;
                            nextMove = x => nextPot--;
                        } else if (nextPot === -1) {
                            // Wrapped around on the other side, going back to red
                            nextPot = this.redLeftScoreIndex;
                            nextMove = x => nextPot++;
                        }
                        if(player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        else if(player == 1 && (nextPot === this.blueLeftScoreIndex
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
                    nextPot = startPot - 1;
                    nextMove = x => nextPot--;
                    while (stonesInHand != 0) {
                        if (nextPot < 0) {
                            // Time to wrap around red and loop increasing
                            nextPot = this.redLeftScoreIndex;
                            nextMove = x => nextPot++;
                        } else if (nextPot === this.currentState.length) {
                            // Wrapped around twice, going back to blue
                            nextPot = this.blueRightScoreIndex;
                            nextMove = x => nextPot--;
                        }
                        if(player === 0 && (nextPot === this.redLeftScoreIndex
                            || nextPot === this.redRightScoreIndex)) {
                            nextMove();
                            continue;
                        }
                        else if(player == 1 && (nextPot === this.blueLeftScoreIndex
                            || nextPot === this.blueRightScoreIndex)) {
                            nextMove();
                            continue;
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

            takeOpponentsStones(index, player, cellNumber) {
                let closestPot =  0;
                if(player === 0) {
                    // Taking from red
                    closestPot = cellNumber > this.numPots / 2 ? this.blueRightScoreIndex
                        : this.blueLeftScoreIndex;
                    let potToTakeFrom = index + this.numPots + 2; // Two score pots in between
                    this.currentState[closestPot] += this.currentState[potToTakeFrom];
                    this.currentState[potToTakeFrom] = 0;
                } else {
                    // Taking from blue
                    closestPot = cellNumber > this.numPots / 2 ? this.redRightScoreIndex
                        : this.redLeftScoreIndex;
                    let potToTakeFrom = index - this.numPots - 2;
                    this.currentState[closestPot] += this.currentState[potToTakeFrom];
                    this.currentState[potToTakeFrom] = 0;
                };
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
