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
        //console.log(MancalaGameFactory.newGame(6, 6))
        $scope.gameSettings = {
            numberOfStones: 6,
            mancalaPots: 6,
            players: 2
        };
        let mancalaGame = MancalaGameFactory
            .newGame($scope.gameSettings.numberOfStones,
                     $scope.gameSettings.mancalaPots,
                     $scope.gameSettings.players);


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
                return mancalaGame.redPotsArray;
            },
            redMancalaHoles: function () {
                return mancalaGame.bluePotsArray;
            },
            playerTurn: mancalaGame.getPlayerTurn()
        }

        $scope.cellClicked = function (playerColor, cellNumber) {
            console.log(playerColor)
            console.log(cellNumber)
            console.log(mancalaGame.getPlayerTurn());
        }
    }]);
