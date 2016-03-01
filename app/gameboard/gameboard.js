'use strict';

angular.module('myApp.gameboard', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        console.log("route load")
        $routeProvider.when('/gameboard', {
            templateUrl: 'gameboard/gameboard.html',
            controller: 'MancalaBoardCtrl'
        });
    }])

    .controller('MancalaBoardCtrl', ['$scope', 'MancalaGameFactory', function ($scope, MancalaGameFactory) {

        $scope.gameSettings = {
            numberOfStones: 6,
            mancalaPots: 5,
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
            gameStonesChanged: function () {
                console.log("Rebuilding board")
                if ($scope.gameSettings.mancalaPots >= 2*($scope.gameSettings.numberOfStones-1) &&
                    $scope.gameSettings.mancalaPots - 1 > 2) {
                    console.log("deduct pots")
                    $scope.gameSettings.mancalaPots -= 1;
                } else if ($scope.gameSettings.mancalaPots < $scope.gameSettings.numberOfStones - 1) {
                    $scope.gameSettings.mancalaPots += 1;
                }

                mancalaGame = MancalaGameFactory
                    .newGame($scope.gameSettings.numberOfStones,
                        $scope.gameSettings.mancalaPots,
                        $scope.gameSettings.players);
                $scope.mancalaGame = mancalaGame;
            },
            gameStartNew: function () {
                console.log("Rebuilding board")
                mancalaGame = MancalaGameFactory
                    .newGame($scope.gameSettings.numberOfStones,
                        $scope.gameSettings.mancalaPots,
                        $scope.gameSettings.players);
                $scope.mancalaGame = mancalaGame;
            },
        };

        $scope.gameHoleStates = {
            blueHoles: function () {

            },
            redHoles: function () {

            }
        }

        $scope.getGameUIStates = {
            blueMancalaHoles: function () {
                //console.log($scope.mancalaGame.bluePots);
                $scope.bluePotArray.length = 0;
                $scope.mancalaGame.bluePots().forEach(item => $scope.bluePotArray.push(item));
                return $scope.bluePotArray;
            },
            redMancalaHoles: function () {
                //console.log(mancalaGame.redPots);
                $scope.redPotArray.length = 0;
                $scope.mancalaGame.redPots().forEach(item => $scope.redPotArray.push(item));
                return $scope.redPotArray;
            },
            blueHomePotScore: function () {
                return $scope.mancalaGame.blueScore;
            },
            redHomePotScore: function() {
                return $scope.mancalaGame.redScore;
            },
            playerTurn: $scope.mancalaGame.getPlayerTurn()
        }

        $scope.cellClicked = function (player, cellNumber) {
            if (player != $scope.getGameUIStates.playerTurn) return;
            //console.log(player)
            //console.log(cellNumber)

            if(mancalaGame.makeMove(player, cellNumber)) {
                $scope.getGameUIStates.blueMancalaHoles();
                $scope.getGameUIStates.redMancalaHoles();
                $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
            }

        }
    }]);
