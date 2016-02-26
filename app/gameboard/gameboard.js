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
    mancalaHole:6,
    mancalaHoleArray: function() {

      return new Array($scope.gameSettings.mancalaHole)
    }
  };

  $scope.gameBoardEvents = {
    gameStonesChanged: function() {
      console.log($scope.numberOfStones);
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
      holes[4] = 2;
      return holes;
    },
    redMancalaHoles: function() {
      var holes = new Array($scope.gameSettings.mancalaHole);
      holes[0]= 14;
      return holes;
    }
  }

  $scope.cellClicked = function(playerColor, cellNumber) {
    console.log(playerColor)
    console.log(cellNumber)
  }
}]);
