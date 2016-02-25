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
  $scope.helloWorld = "Hellow World";
}]);
