'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.gameboard',
    'mancalagamefactory',
    'minmaxnodefactory',
    'playerfactory',
    'uiComponents',
    'myApp.view2',
    'myApp.version'
]).
config(['$routeProvider', function ($routeProvider) {
    //console.log(GameLogic)
    $routeProvider.otherwise({redirectTo: '/gameboard'});
}]);
