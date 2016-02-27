/**
 * Created by CZL on 2/25/2016.
 */
'use strict';

angular.module('mancalagamefactory', [])
.factory('MancalaGameFactory', function(PlayerFactory) {

    class MancalaGameLogic {
        constructor(stones, pots, players) {
            this.numStones = stones;
            this.numPots = pots;
            this.numPlayers = players;
            this.playersPlaying = [];
            this.blueScorePot = 0;
            this.redScorePot = 0;
            this.bluePotsArray = new Array(this.numPots).fill(this.numStones);
            this.redPotsArray = new Array(this.numPots).fill(this.numStones);
            for(let i=0;i<this.numPlayers;++i)
                this.playersPlaying.push(PlayerFactory.newPlayer(i))
            // Generate a random turn, 0 is Blue, 1 is Red
            this.currentTurn = Math.floor(Math.random()*2);
            this.gameOver = false;

            if(this.numPlayers == 0) this.startAiPlayers();
            if(this.numPlayers == 1) this.startVersusAi();
        }

        test() {
            this.redPotsArray[3] = 5;
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
    }

    return {
        newGame: function(numStones, numPots, numPlayers) {
            return new MancalaGameLogic(numStones, numPots, numPlayers)
        }
    }
});
