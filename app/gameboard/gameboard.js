'use strict';

angular.module('myApp.gameboard', ['ngRoute', 'ngAnimate','ngSanitize', 'mgcrea.ngStrap', 'nvd3'])
    .config(['$routeProvider', function ($routeProvider, $popover) {
        $routeProvider.when('/gameboard', {
            templateUrl: 'gameboard/gameboard.html',
            controller: 'MancalaBoardCtrl'
        });
    }])

    .controller('MancalaBoardCtrl', ['$scope', '$timeout', '$tooltip','MancalaGameFactory', function ($scope, $timeout, $tooltip, MancalaGameFactory) {
        //console.log($compile);
        $scope.gameSettings = {
            numberOfStones: 4,
            mancalaPots: 5,
            players: 2,
            maxDepth: 8,
            showHeuristic: false,
            showAiPlayer: false,
            gameOver: false,
            alphaBeta: true,
            heuristicPairing: {
                redPlayer: "1",
                bluePlayer: "2"
            }
        };

        $scope.moveString = "";
        $scope.gamePlaying = "Playing...";
        $scope.winnerMessage = "";
        $scope.blueScore = "";
        $scope.redScore = "";

        $scope.whatChanged = new Array($scope.gameSettings.mancalaPots* 2 + 4);
        let mancalaGame = MancalaGameFactory
            .newGame($scope.gameSettings.numberOfStones,
                $scope.gameSettings.mancalaPots,
                $scope.gameSettings.players,
                $scope.gameSettings.heuristicPairing,
                $scope.gameSettings.alphaBeta
            );

        // Set up game variables
        $scope.mancalaGame = mancalaGame;
        $scope.bluePotArray = [];
        $scope.redPotArray = [];
        $scope.playerName = "";
        $scope.movesMadeByInGame = 0;
        $scope.gameBoardEvents = {
            newGame: function () {
                console.log($scope.gameSettings.alphaBeta)
                if(!$scope.gameSettings.mancalaPots || !$scope.gameSettings.players) return;
                if($scope.gameSettings.players == 0) {
                    $scope.gameSettings.showHeuristic = true;
                } else {
                    $scope.gameSettings.showHeuristic = false;
                }

                if($scope.gameSettings.players == 1) {
                    $scope.gameSettings.showAiPlayer = true;
                } else {
                    $scope.gameSettings.showAiPlayer = false;
                }

                $scope.gameSettings.gameOver = false;
                $scope.movesMadeByInGame = 0;
                $scope.nvd3Data = [];
                $scope.moveString = "";
                $scope.gamePlaying = "Playing...";
                $scope.winnerMessage = "";
                $scope.blueScore = "";
                $scope.redScore = "";

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
                console.log($scope.gameSettings.heuristicPairing)
                mancalaGame = MancalaGameFactory
                    .newGame($scope.gameSettings.numberOfStones,
                        $scope.gameSettings.mancalaPots,
                        $scope.gameSettings.players,
                        $scope.gameSettings.maxDepth,
                        $scope.gameSettings.heuristicPairing,
                        $scope.gameSettings.alphaBeta
                    );
                $scope.mancalaGame = mancalaGame;
                $scope.getGameUIStates.playerTurn = $scope.mancalaGame.getPlayerTurn();
                $scope.whatChanged = new Array($scope.gameSettings.mancalaPots* 2 + 4);
                $scope.getGameUIStates.printPlayerTurn();
            }
        };

        $scope.determineAiMoves = function () {
            console.log("Moving AI");
            let playerTurn = $scope.mancalaGame.getPlayerTurn();
            let playerNum = $scope.mancalaGame.numPlayers;
            if (playerNum == 1) {
                if (playerTurn == 0) {
                    $scope.moveString = $timeout($scope.moveAiPlayer, 0, true, 0).then(() => {
                        $scope.checkWinner();
                    });
                }
            } else if (playerNum == 0) {
                $scope.moveAiPlayer(playerTurn);
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
            $scope.checkWinner();
            $scope.getGameUIStates.printPlayerTurn();
            return true;
        };

        $scope.logMove = function(player, real) {
            let lastMove = $scope.mancalaGame.lastMove;
            let playerNum = $scope.gameSettings.players;
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
            if(lastMove.jackpot) {
                moveString += "A jackpot was hit, taking "+lastMove.jackpot+"<br>stones for himself.";
            }
            lastMove.moveString = moveString;
            $scope.createNVD3Data(lastMove);

        };

        $scope.getGameUIStates = {
            heuristicChanged: function(e) {
                console.log(e)
            },
            updatePotsChanged: function() {
                let gameRef = $scope.mancalaGame;
                let changedArray = gameRef.whatChanged;
                console.log(changedArray);

                if(changedArray[gameRef.blueLeftScoreIndex] != 0) {
                    $scope.getGameUIStates.showTimer("bs-l",
                        String(changedArray[gameRef.blueLeftScoreIndex]),
                        "top");
                }
                if(changedArray[gameRef.blueRightScoreIndex] != 0) {
                    $scope.getGameUIStates.showTimer("bs-r",
                        String(changedArray[gameRef.blueRightScoreIndex]),
                        "top");
                }
                if(changedArray[gameRef.redLeftScoreIndex] != 0) {
                    $scope.getGameUIStates.showTimer("rs-l",
                        String(changedArray[gameRef.redLeftScoreIndex]),
                        "bottom");
                }
                if(changedArray[gameRef.redRightScoreIndex] != 0) {
                    $scope.getGameUIStates.showTimer("rs-r",
                        String(changedArray[gameRef.redRightScoreIndex]),
                        "bottom");
                }

                for(let i = gameRef.bluePotStartIndex; i < gameRef.bluePotEndIndex; ++i) {
                    if(changedArray[i] != 0) {
                        $scope.getGameUIStates.showTimer("bs-"+(i-gameRef.bluePotStartIndex),
                            String(changedArray[i]),
                            "top");
                    }
                }

                for(let i = gameRef.redPotStartIndex; i < gameRef.redPotEndIndex; ++i) {
                    if(changedArray[i] != 0) {
                        console.log("rs-"+(i-gameRef.redPotStartIndex))
                        $scope.getGameUIStates.showTimer("rs-"+(i-gameRef.redPotStartIndex),
                            String(changedArray[i]),
                            "bottom");
                    }
                }

            },
            showTimer: function(id, changedText, placement) {
                $timeout(function () {
                    var target = $("#" + id);
                    var myTooltip = $tooltip(target, {
                        title:changedText,
                        trigger:'manual',
                        placement:placement,
                    });
                    myTooltip.$promise.then(function () {
                        myTooltip.show();
                    });

                    $timeout(function () {
                        myTooltip.$promise.then(function () {
                            myTooltip.hide();
                        });
                    }, 2000);
                }, 50);
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
            printPlayerTurn: function() {
                let playerTurn = $scope.mancalaGame.getPlayerTurn();
                if(playerTurn == 0) {
                    $scope.playerName = "Blue";
                } else {
                    $scope.playerName = "Red";
                }
            },
            isGameOver: function() {
                return $scope.mancalaGame.gameOver;
            },
            makeOpponentsMove: function() {
                $scope.determineAiMoves();
            },
            isRedTurn: function() {
              return $scope.mancalaGame.getPlayerTurn() == 1;
            },
            cellChanged: function(index , player) {
                //console.log(index)
                return $scope.movesMadeByInGame;
            },
            isSingleAiPlayerMove: function() {
                console.log($scope.mancalaGame.getPlayerTurn())
                return $scope.mancalaGame.getPlayerTurn() == 1;
            },
            playerTurn: $scope.mancalaGame.getPlayerTurn()
        };

        $scope.checkWinner = function() {
            if ($scope.mancalaGame.gameOver) {
                console.log("Game over");
                let blueScore = $scope.mancalaGame.blueScoreTotalEndScore;
                let redScore = $scope.mancalaGame.redScoreTotalEndScore;
                console.log("The final score is red: " + redScore + " and blue: "+blueScore);
                $scope.blueScore = blueScore;
                $scope.redScore = redScore;
                $scope.gameSettings.gameOver = true;
                if (redScore < blueScore) {
                    console.log("Winner is blue");
                    $scope.winnerMessage = "Winner is blue!";
                    return 0;
                } else if (redScore > blueScore) {
                    console.log("Winner is red!");
                    $scope.winnerMessage = "Winner is red!";
                    return 1;
                } else {
                    console.log("Both players tied!");
                    $scope.winnerMessage = "Both players tied!";
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
            $scope.movesMadeByInGame++;
            if (numPlayers == 1) {
                if (playerTurn == 1) {
                    if (mancalaGame.makeMove(player, cellNumber, direction)) {
                        //++$scope.movesMadeByInGame;
                        $scope.getGameUIStates.blueMancalaHoles();
                        $scope.getGameUIStates.redMancalaHoles();
                        $scope.getGameUIStates.playerTurn = mancalaGame.getPlayerTurn();
                        //if ($scope.getGameUIStates.playerTurn == 0) {
                        //    $scope.getGameUIStates.printPlayerTurn();
                        //    $scope.determineAiMoves();
                        //}
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
            $scope.getGameUIStates.printPlayerTurn();
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
                    "axisLabelDistance": -20
                },
                clipEdge: true,
            }
        };

        $scope.createNVD3Data = function(input) {
            let color = "";

            if(input.playerTurn == 0) {
                color = "#3D86C6";
            } else {
                color = "#ED1E23";
            }
            $scope.nvd3Data.push({
                //"key": "Move " + input.movesMade,
                "key": input.moveString,
                "color": color,
                "values": [
                    {
                        "x": input.movesMade,
                        "y": input.nodeCount
                    }
                ]
            });
        };

        $scope.nvd3Data = [];
        $scope.getGameUIStates.printPlayerTurn();
    }]);