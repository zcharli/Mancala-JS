'use strict';

angular.module('myApp.gameboard', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  console.log("route load")
  $routeProvider.when('/gameboard', {
    templateUrl: 'gameboard/gameboard.html',
    controller: 'MancalaBoardCtrl'
  });
}])

.controller('MancalaBoardCtrl', ['$scope','GameLogic', function($scope, GameLogic) {
  console.log(GameLogic)

  $scope.gameSettings = {
    numberOfStones: 6,
    mancalaHole:6
  };

  $scope.gameBoardEvents = {
    gameStonesChanged: function() {
      console.log($scope.gameSettings.mancalaHole+" > "+
          2*($scope.gameSettings.numberOfStones-1)+" ")

      if($scope.gameSettings.mancalaHole < 2*($scope.gameSettings.numberOfStones-1)) {
        $scope.gameSettings.mancalaHole -= 1;
        console.log($scope.gameSettings.mancalaHole)
      } else if($scope.gameSettings.mancalaHole < $scope.gameSettings.numberOfStones - 1) {
        $scope.gameSettings.mancalaHole += 1
      }
    },
    gameHolesChanged: function() {
      console.log("Rebuilding board")
      //$scope.$apply(function(){
      //  $scope.gameSettings.mancalaHoleArray()
      //});
    }
  };

  $scope.gameHoleStates = {
    blueHoles: function(){

    },
    redHoles: function() {

    }
  }

  $scope.getGameUIStates = {
    blueMancalaHoles: function() {
      var holes = new Array($scope.gameSettings.mancalaHole);
      //holes[1] = 2;
      return holes;
    },
    redMancalaHoles: function() {
      var holes = new Array($scope.gameSettings.mancalaHole);
      //holes[0]= 14;
      return holes;
    }
  }

  $scope.cellClicked = function(playerColor, cellNumber) {
    console.log(playerColor)
    console.log(cellNumber)
  }
}]);
