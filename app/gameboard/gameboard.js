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
            mancalaPots: 6,
            players: 2
        };

        let mancalaGame = MancalaGameFactory
            .newGame($scope.gameSettings.numberOfStones,
                $scope.gameSettings.mancalaPots,
                $scope.gameSettings.players);
        $scope.mancalaGame = mancalaGame;

        $scope.gameBoardEvents = {
            gameStonesChanged: function () {
                console.log("Rebuilding board")
                if ($scope.gameSettings.mancalaPots >= $scope.gameSettings.numberOfStones - 1) {
                    $scope.gameSettings.mancalaPots -= 1;
                } else if ($scope.gameSettings.mancalaPots < $scope.gameSettings.numberOfStones - 1) {
                    $scope.gameSettings.mancalaPots += 1;
                }
                mancalaGame = MancalaGameFactory
                    .newGame($scope.gameSettings.numberOfStones,
                        $scope.gameSettings.mancalaPots,
                        $scope.gameSettings.players);
            },
            gameStartNew: function () {
                console.log("Rebuilding board")
                mancalaGame = MancalaGameFactory
                    .newGame($scope.gameSettings.numberOfStones,
                        $scope.gameSettings.mancalaPots,
                        $scope.gameSettings.players);
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
                return mancalaGame.redPots;
            },
            redMancalaHoles: function () {
                return mancalaGame.bluePots;
            },
            blueHomePotScore: function () {
                return mancalaGame.blueScore;
            },
            redHomePotScore: function() {
                return mancalaGame.redScore;
            },
            playerTurn: mancalaGame.getPlayerTurn()
        }

        $scope.cellClicked = function (player, cellNumber) {
            if (player != $scope.getGameUIStates.playerTurn) return;
            console.log(player)
            console.log(cellNumber)
            console.log(mancalaGame.getPlayerTurn());
            mancalaGame.makeMove(player, cellNumber)
            $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
        }
    }]);
