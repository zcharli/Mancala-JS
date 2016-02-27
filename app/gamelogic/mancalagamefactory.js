/**
 * Created by CZL on 2/25/2016.
 */
'use strict';

angular.module('mancalagamefactory', [])
    .factory('MancalaGameFactory', function (PlayerFactory) {

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
                this.bluePotEndIndex = this.bluePotStartIndex + this.numStones;
                this.redPotStartIndex = this.bluePotEndIndex + 1;
                this.redPotEndIndex = this.redPotStartIndex + this.numPots;
                this.bluePotsArray = new Array(this.numPots).fill(this.numStones);
                this.redPotsArray = new Array(this.numPots).fill(this.numStones);
                this.blueScoreIndex = 0;
                this.redScoreIndex = this.bluePotEndIndex;
                for (let i = 0; i < this.numPlayers; ++i)
                    this.playersPlaying.push(PlayerFactory.newPlayer(i))

                // Generate a random turn, 0 is Blue, 1 is Red
                this.currentTurn = Math.floor(Math.random() * 2);
                this.gameOver = false;
                this.currentState = Array.prototype.concat.apply([], [[0], this.bluePotsArray,
                    [0], this.redPotsArray]);

                if (this.numPlayers == 0) this.startAiPlayers();
                if (this.numPlayers == 1) this.startVersusAi();
            }

            makeMove(player, cellNumber) {


                // Switch the turn up
                this.currentTurn = Math.abs(this.currentTurn - 1);
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

            get bluePots() {
                return this.currentState.slice(this.bluePotStartIndex, this.bluePotEndIndex);
            }

            get redPots() {
                return this.currentState.slice(this.redPotStartIndex, this.redPotEndIndex);
            }

            get blueScore() {
                return this.currentState[this.blueScoreIndex];
            }

            get redScore() {
                return this.currentState[this.redScoreIndex];
            }
        }

        return {
            newGame: function (numStones, numPots, numPlayers) {
                return new MancalaGameLogic(numStones, numPots, numPlayers)
            }
        }
    });
