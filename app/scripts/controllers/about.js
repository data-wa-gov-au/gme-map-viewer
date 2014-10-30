'use strict';

/**
 * @ngdoc function
 * @name mapApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mapApp
 */
angular.module('mapApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
