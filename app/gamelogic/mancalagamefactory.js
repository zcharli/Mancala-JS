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
                this.blueScorePot = 0;
                this.redScorePot = 0;
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
                this.redPots = this.currentState.slice(this.redPotStartIndex, this.redPotEndIndex);
                this.bluePots = this.currentState.slice(this.bluePotStartIndex, this.bluePotEndIndex);
                if (this.numPlayers == 0) this.startAiPlayers();
                if (this.numPlayers == 1) this.startVersusAi();
            }

            makeMove(player, cellNumber) {
                let modelCellMove = player * this.numPots + 1 + cellNumber;
                if (this.currentState[modelCellMove] == 0) return false;
                let lastStonePlacement = this.placeStones(modelCellMove, this.currentState[modelCellMove]);
                this.printDebug();

                // Switch the turn up
                this.currentTurn = Math.abs(this.currentTurn - 1);
                return true;
            }

            /**
             * Take the stones from one pot and put then on the next ones until
             * we run out of stones
             * @param startPot is index of the current pot to take the stones from
             * @param stonesInHand is the number of stones we have
             * @return the last final move
             */
            placeStones(startPot, stonesInHand) {
                let nextPot = 0,
                    nextMove = null,
                    finalMove = 0;

                if (startPot >= this.redPotStartIndex) {
                    // Loop increasing on red pots, then wrap
                    nextPot = startPot + 1;
                    nextMove = x => nextPot++;
                    while (stonesInHand != 0) {
                        if (nextPot >= this.currentState.length) {
                            // Time to wrap around to blue pots and loop decreasing
                            nextPot = this.bluePotEndIndex - 1;
                            nextMove = x => nextPot--;
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
                            nextPot = this.redPotStartIndex;
                            nextMove = x => nextPot++;
                        }
                        console.log(nextPot);
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
                return this.bluePots
            }

            redPots() {
                return this.redPots
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
        }

        return {
            newGame: function (numStones, numPots, numPlayers) {
                return new MancalaGameLogic(numStones, numPots, numPlayers)
            }
        }
    });
