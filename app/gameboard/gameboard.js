'use strict';

angular.module('myApp.gameboard', ['ngRoute', 'ngAnimate', 'mgcrea.ngStrap', 'nvd3'])
    .config(['$routeProvider', function ($routeProvider, $popover) {
        $routeProvider.when('/gameboard', {
            templateUrl: 'gameboard/gameboard.html',
            controller: 'MancalaBoardCtrl'
        });
        console.log($popover)
    }])

    .controller('MancalaBoardCtrl', ['$scope', '$timeout', '$sce','MancalaGameFactory', function ($scope, $timeout, $sce, MancalaGameFactory) {
        //console.log($compile);
        $scope.gameSettings = {
            numberOfStones: 3,
            mancalaPots: 3,
            players: 2,
            maxDepth: 8,
            showHeuristic: false
        };

        $scope.moveString = "";
        $scope.gamePlaying = "Playing...";
        $scope.whatChanged = new Array($scope.gameSettings.mancalaPots* 2 + 4);
        let mancalaGame = MancalaGameFactory
            .newGame($scope.gameSettings.numberOfStones,
                $scope.gameSettings.mancalaPots,
                $scope.gameSettings.players);

        // Set up game variables
        $scope.mancalaGame = mancalaGame;
        $scope.bluePotArray = [];
        $scope.redPotArray = [];
        //$scope.logBody = "";
        $scope.movesMadeByInGame = 0;
        $scope.gameBoardEvents = {
            newGame: function () {
                let heuristicPairing = {};
                if($scope.gameSettings.players == 0) {
                    $scope.gameSettings.showHeuristic = true;
                } else {
                    $scope.gameSettings.showHeuristic = false;
                }
                $scope.movesMadeByInGame = 0;
                $scope.nvd3Data = [];
                //$scope.logBody = ""
                //$scope.logBody = $sce.trustAsHtml("Rebuilding board<br>");
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
                        $scope.gameSettings.players,
                        $scope.gameSettings.maxDepth);
                $scope.mancalaGame = mancalaGame;
                $scope.getGameUIStates.playerTurn = $scope.mancalaGame.getPlayerTurn();
                if ($scope.gameSettings.players != 2) {
                    // Timer to set up both players to play
                    $scope.determineAiMoves();
                }
                $scope.whatChanged = new Array($scope.gameSettings.mancalaPots* 2 + 4);
            }
        };

        $scope.determineAiMoves = function () {
            console.log("Moving AI");
            let playerTurn = $scope.mancalaGame.getPlayerTurn();
            let playerNum = $scope.mancalaGame.numPlayers;
            if (playerNum == 1) {
                if (playerTurn == 0) {
                    $scope.moveString = $timeout($scope.moveAiPlayer, 0, true, 0).then(() => {

                    });
                }
            } else if (playerNum === 0) {
                $scope.moveString = $timeout($scope.moveAiPlayer, 0, true, playerNum).then(() => {
                    if ($scope.checkWinner() != -1) {
                        $scope.determineAiMoves().then(() => {

                        });
                    }
                });
            }
        };

        $scope.moveAiPlayer = function (player) {

            if (mancalaGame.computeAiMove(player)) {
                $scope.getGameUIStates.blueMancalaHoles();
                $scope.getGameUIStates.redMancalaHoles();
                $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
                $scope.logMove(player);
                $scope.getGameUIStates.updatePotsChanged();
            }
            let playerTurn = $scope.getGameUIStates.playerTurn;
            let playerNum = $scope.gameSettings.players;
            let winner = $scope.checkWinner();
            if (winner == -1) {
                if (playerNum == 0) {
                    $scope.determineAiMoves();
                } else if (playerNum == 1) {
                    if (playerTurn == 0) {
                        $scope.determineAiMoves();
                    }
                }
            }
            return true;
        };

        $scope.logMove = function(player, real) {
            let lastMove = $scope.mancalaGame.lastMove;
            let playerTurn = $scope.getGameUIStates.playerTurn;
            let playerNum = $scope.gameSettings.players;
            lastMove.playerTurn = playerTurn;
            lastMove.playerNum = playerNum;
            lastMove.movesMade = ++$scope.movesMadeByInGame;
            let moveString = "";
            if(real) {
                moveString += "The human player ";
            } else {
                moveString += "The AI player ";
            }
            if (player === 0) {
                moveString += "Blue, ";

            } else {
                moveString += "Red, ";
            }
            moveString += "has made a move<br> on his pot number " + (lastMove.move + 1) + " in ";
            if (lastMove.direction === 0) {
                moveString += "the left direction ";
            } else {
                moveString += "the right direction ";
            }
            moveString += "<br>while generating " + lastMove.nodeCount + " nodes.";
            lastMove.moveString = moveString;
            $scope.createNVD3Data(lastMove);
            //$scope.logBody += $sce.trustAsHtml(moveString);
        };

        $scope.getGameUIStates = {
            updatePotsChanged: function() {
              let changedArray = $scope.mancalaGame.whatChanged;
                console.log(changedArray)
            },
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
                let blueScore = $scope.mancalaGame.blueScoreTotalEndScore;
                let redScore = $scope.mancalaGame.redScoreTotalEndScore;
                console.log("The final score is red: " + redScore + " and blue: "+blueScore);
                if (redScore < blueScore) {
                    console.log("Winner is blue");
                    return 0;
                } else if (redScore > blueScore) {
                    console.log("Winner is red!");
                    return 1;
                } else {
                    console.log("Both players tied!")
                    return 2;
                }
            }
            return -1;
        };

        $scope.cellClicked = function (player, cellNumber, direction) {
            console.log("Cell clicked");
            let numPlayers = $scope.gameSettings.players;
            let playerTurn = $scope.mancalaGame.getPlayerTurn();
            if (player != $scope.getGameUIStates.playerTurn) return;
            //console.log(numPlayers);
            if (numPlayers == 1) {
                if (playerTurn == 1) {
                    if (mancalaGame.makeMove(player, cellNumber, direction)) {
                        //++$scope.movesMadeByInGame;
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
                    //++$scope.movesMadeByInGame;
                    $scope.getGameUIStates.blueMancalaHoles();
                    $scope.getGameUIStates.redMancalaHoles();
                    $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
                }
            }
            $scope.getGameUIStates.updatePotsChanged();
            $scope.checkWinner();
        };

        $scope.nvd3Options = {
            "chart": {
                "type": "multiBarChart",
                "height": 450,
                "margin": {
                    "top": 20,
                    "right": 20,
                    "bottom": 50,
                    "left": 55
                },
                "showValues": true,
                "duration": 500,
                "xAxis": {
                    "axisLabel": "Moves Made by AI"
                },
                "yAxis": {
                    "axisLabel": "Nodes Opened",
                    "axisLabelDistance": -10
                }
            }
        };

        $scope.createNVD3Data = function(input) {
            let color = "";
            let name = ""

            if(input.playerNum === 0) {
                color = "#ED1E23";
            } else {
                color = "#3D86C6";
            }
            $scope.nvd3Data.push({
                //"key": "Move " + input.movesMade,
                "key": input.moveString,
                "color": color,
                "classed":input.moveString,
                "values": [
                    {
                        "x": input.movesMade,
                        "y": input.nodeCount,
                    }
                ]
            });
        };

        $scope.nvd3Data = [];
    }]);