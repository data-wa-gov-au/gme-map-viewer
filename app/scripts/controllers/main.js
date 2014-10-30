'use strict';

/**
 * @ngdoc function
 * @name mapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mapApp
 */
angular.module('mapApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
