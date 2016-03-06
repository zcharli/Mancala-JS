'use strict';

angular.module('myApp.gameboard', ['ngRoute', 'ngAnimate', 'mgcrea.ngStrap'])
    .config(['$routeProvider', function ($routeProvider, $popover) {
        $routeProvider.when('/gameboard', {
            templateUrl: 'gameboard/gameboard.html',
            controller: 'MancalaBoardCtrl'
        });
        console.log($popover)
    }])

    .controller('MancalaBoardCtrl', ['$scope', '$timeout', 'MancalaGameFactory', function ($scope, $timeout, MancalaGameFactory) {
        //console.log($compile);
        $scope.gameSettings = {
            numberOfStones: 2,
            mancalaPots: 2,
            players: 2
        };

        let mancalaGame = MancalaGameFactory
            .newGame($scope.gameSettings.numberOfStones,
                $scope.gameSettings.mancalaPots,
                $scope.gameSettings.players);

        // Set up game variables
        $scope.mancalaGame = mancalaGame;
        $scope.bluePotArray = [];
        $scope.redPotArray = [];

        $scope.gameBoardEvents = {
            newGame: function () {
                console.log("Rebuilding board");
                if ($scope.gameSettings.mancalaPots >= 2 * ($scope.gameSettings.numberOfStones - 1) &&
                    $scope.gameSettings.mancalaPots - 1 > 2) {
                    console.log("deduct pots");
                    $scope.gameSettings.mancalaPots -= 1;
                } else if ($scope.gameSettings.mancalaPots < $scope.gameSettings.numberOfStones - 1) {
                    $scope.gameSettings.mancalaPots += 1;
                }

                mancalaGame = MancalaGameFactory
                    .newGame($scope.gameSettings.numberOfStones,
                        $scope.gameSettings.mancalaPots,
                        $scope.gameSettings.players);
                $scope.mancalaGame = mancalaGame;
                $scope.getGameUIStates.playerTurn = $scope.mancalaGame.getPlayerTurn();
                if ($scope.gameSettings.players != 2) {
                    // Timer to set up both players to play
                    $scope.determineAiMoves();
                }
            }
        };

        $scope.determineAiMoves = function () {
            console.log("Moving AI");
            let playerTurn = $scope.mancalaGame.getPlayerTurn();
            let playerNum = $scope.mancalaGame.numPlayers;
            if (playerNum == 1) {
                if (playerTurn == 0) {
                    $scope.moveString = $timeout($scope.moveAiPlayer, 0, true, 0);
                }
            } else if (playerNum === 0) {
                $scope.moveString = $timeout($scope.moveAiPlayer, 0, true, playerNum).then(() => {
                    if ($scope.checkWinner() != -1) {
                        $scope.determineAiMoves();
                    }
                });
            }
        };

        $scope.moveAiPlayer = function (player) {

            if (mancalaGame.computeAiMove(player)) {
                $scope.getGameUIStates.blueMancalaHoles();
                $scope.getGameUIStates.redMancalaHoles();
                $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
                console.log("Blue finished made a move now its turn: " + mancalaGame.getPlayerTurn());
            }
            let lastMove = $scope.mancalaGame.lastMove;
            let playerTurn = $scope.getGameUIStates.playerTurn;
            let playerNum = $scope.gameSettings.players;
            let moveString = "The AI player ";
            if (player === 0) {
                moveString += "Blue, ";
            } else {
                moveString += "Red, ";
            }
            moveString += "has made a move on his pot " + lastMove.move + " in ";
            if (lastMove.direction === 0) {
                moveString += "the left direction.";
            } else {
                moveString += "the right direction.";
            }

            if ($scope.checkWinner() == -1) {
                if (playerNum == 0) {
                    $scope.determineAiMoves();
                } else if (playerNum == 1) {
                    if (playerTurn == 0) {
                        $scope.determineAiMoves();
                    }
                }
            }

            return moveString;
        };

        $scope.getGameUIStates = {
            blueMancalaHoles: function () {
                //console.log($scope.mancalaGame.bluePots);
                $scope.bluePotArray.length = 0;
                $scope.mancalaGame.bluePots().forEach(item =>
                    $scope.bluePotArray.push(item));
                return $scope.bluePotArray;
            },
            redMancalaHoles: function () {
                //console.log(mancalaGame.redPots);
                $scope.redPotArray.length = 0;
                $scope.mancalaGame.redPots().forEach(item =>
                    $scope.redPotArray.push(item));
                return $scope.redPotArray;
            },
            blueLeftScorePot: function () {
                return $scope.mancalaGame.blueLeftScore;
            },
            blueRightScorePot: function () {
                return $scope.mancalaGame.blueRightScore;
            },
            redLeftScorePot: function () {
                return $scope.mancalaGame.redLeftScore;
            },
            redRightScorePot: function () {
                return $scope.mancalaGame.redRightScore;
            },
            playerTurn: $scope.mancalaGame.getPlayerTurn()
        };

        $scope.checkWinner = function() {
            if ($scope.mancalaGame.gameOver) {
                console.log("Game over");
                if($scope.mancalaGame.winner === 0) {
                    console.log("Winner is blue");
                    return 0;
                } else {
                    console.log("Winner is red!");
                    return 1;
                }
            }
            return -1;
        };

        $scope.cellClicked = function (player, cellNumber, direction) {
            console.log("Cell clicked");
            let numPlayers = $scope.gameSettings.players;
            let playerTurn = $scope.mancalaGame.getPlayerTurn();
            if (player != $scope.getGameUIStates.playerTurn) return;
            console.log(numPlayers);
            if (numPlayers == 1) {
                if (playerTurn == 1) {
                    if (mancalaGame.makeMove(player, cellNumber, direction)) {
                        $scope.getGameUIStates.blueMancalaHoles();
                        $scope.getGameUIStates.redMancalaHoles();
                        $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
                        if ($scope.getGameUIStates.playerTurn == 0) {
                            $scope.determineAiMoves();
                        }
                    }
                }
            } else if (numPlayers == 2) {
                if (mancalaGame.makeMove(player, cellNumber, direction)) {
                    $scope.getGameUIStates.blueMancalaHoles();
                    $scope.getGameUIStates.redMancalaHoles();
                    $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
                }
            }
            $scope.checkWinner();
        };

    }]);
