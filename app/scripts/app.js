'use strict';

// @TODO Multiple features in an info window
// @TODO Is there a way to sniff the layer object / HTML to determine if it is a raster or vector?
//      If the opacity function knows which it is then it must be somewhere?
// @TODO Google Analytics hooks
// @TODO Sharing buttons
// @TODO Search icon button on the end of the search box
// @TODO A quick search-for-features-in-layer demo
// @TODO Process a passed mapId
// @TODO Login code
// @TODO Unfuck the Angular code
// @TODO Use the Angular Generator to make proper controllers, views, et cetera
// @TODO Unfuck the Google Maps code in index.html
// @TODO Subtly indicate if an unchecked folder has layers turned on
// @TODO Test in other browsers
// @TODO Test on mobile devices
// @TODO Why is the Google Maps loady code (for initing the search box) running twice?
// @TODO Clean up the errors affecting `grunt build`

/**
 * @ngdoc overview
 * @name mapApp
 * @description
 * # mapApp
 *
 * Main module of the application.
 */
/*angular
  .module('mapApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });*/


var mapId = "09372590152434720789-00913315481290556980";
var apiKey = "AIzaSyAMg8RJ-xC8SsHNsVe9sAhzOj3WnXVpJlo";

var module = angular.module('mapApp', ['ngMaterial', 'ngSanitize', 'RecursionHelper']);

module.controller("AppCtrl", function($scope, $http, $sanitize) {
  $http.get('https://www.googleapis.com/mapsengine/v1/maps/' + mapId + '/published?key=' + apiKey).
    success(function(data, status, headers, config) {
      function initCheckedLayers(contents) {
        angular.forEach(contents, function(value, key) {
          value["checked"] = false;

          if(value["type"] === "folder") {
            if(value["visibility"] === "defaultOn") {
              value["checked"] = true;
            }

            value["contents"] = initCheckedLayers(value["contents"]);

            // if(value["expandable"] === false) {
              var folderChecked = false;
              angular.forEach(value["contents"], function(value, key) {
                if(value["checked"] === true) {
                  folderChecked = true;
                }
              });

              if(value["name"] == "Imagery") {
                // console.log("Imagery", value);
              }

              if(folderChecked === true) {
                // console.log("Contents checked", value["name"]);
              } else {
                // console.log("Contents NOT checked", value["name"]);
              }

              if(value["checked"] === true) {
                // console.log("Folder item checked", value["name"]);
              }
              value["checked"] = folderChecked;
            // }
          } else if(value["visibility"] === "defaultOn") {
            value["checked"] = true;

            if(value["checked"] === true) {
              // console.log("Item checked", value["name"]);
            }
          }
        })

        return contents;
      };

      data["contents"] = initCheckedLayers(data["contents"]);
      // console.log(data);

      $scope.mapTree = data;

      var map = document.querySelector('my-google-map');
      var defaultViewport = $scope.mapTree.defaultViewport;
      var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(defaultViewport[1], defaultViewport[0]),
                                                new google.maps.LatLng(defaultViewport[3], defaultViewport[2]))
      map.map.fitBounds(bounds);
    }).
    error(function(data, status, headers, config) {
      console.log("Error loading map definition.");
    });
});

// module.directive("googleMapsEngineLayer", function() {
//     return {
//         restrict: "E",
//         scope: {},
//         link: function(scope, element, attrs) {
//           scope.name = attrs.name;
//           scope.mapId = attrs.mapid;
//           scope.layerKey = attrs.layerkey;
//         },
//         template:
//           '<md-checkbox ng-click="click()" ng-model="clicked" aria-label="Toggle layer visiblity">' +
//             '{{ name }}' +
//           '</md-checkbox>',
//         controller: function($scope, $element) {
//          $scope.click = function() {
//            if($scope.layer === undefined) {
//              $scope.layer = new google.maps.visualization.MapsEngineLayer({
//                mapId: $scope.mapId,
//                layerKey: $scope.layerKey,
//                map: document.querySelector('my-google-map').getMap()
//              });
//            }
//
//            if(!$scope.clicked) {
//              $scope.layer.setMap(document.querySelector('my-google-map').getMap());
//            } else {
//              $scope.layer.setMap(null);
//            }
//          }
//         }
//     };
// });

module.directive("mapTree", function(RecursionHelper) {
    return {
        restrict: "E",
        scope: {family: '='},
        template:
            '<ul>' +
                '<div ng-repeat="child in family">' +
                  '<li>' +
                      '<md-checkbox ng-model="child.checked" ng-change="click(child)" aria-label="{{child.name}}">' +
                        '{{child.name}}' +
                      '</md-checkbox>' +

                      '<md-slider ng-if="(child.type == \'layer\' || child.expandable === false) && child.checked && child.type != \'kmlLink\'" ng-model="child.opacity" ng-change="slider(child)" step="0.1" min="0" max="1" aria-label="Layer opacity">' +

                      '</md-slider>' +

                      '<div ng-if="child.expandable" ng-show="child.checked" class="map-tree-folder">' +
                          '<map-tree family="child.contents"></map-tree>' +
                      '</div>' +
                  '</li>' +
                '</div>' +
            '</ul>',
        compile: function(element) {
            return RecursionHelper.compile(element, function(scope, iElement, iAttrs, controller, transcludeFn){
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        },
        controller: function($scope, $element) {
            $scope.layers = [];

            $scope.slider = function(choice) {
              // console.log(choice.opacity, 1 - choice.opacity);
              // console.log("slider", choice.opacity, choice);
              // console.log($scope.layers);

              function setLayerOpacity(choice, opacity) {
                if($scope.layers[choice.key] !== undefined) {
                  // console.log("Set layer opacity", opacity, choice);
                  $scope.layers[choice.key].setOpacity(opacity);
                }
              }

              if(choice.type == "folder") {
                angular.forEach(choice.contents, function(value, key) {
                  setLayerOpacity(value, choice.opacity);
                });
              } else if(choice.type == "layer") {
                setLayerOpacity(choice, choice.opacity);
              }
            };

            $scope.click = function(choice) {
              $scope.toggleLayer(choice);
            };

            $scope.toggleLayer = function(choice) {
              // console.log("toggleLayer", choice);

              function toggleMapsEngineLayer(choice) {
                if($scope.layers[choice.key] === undefined) {
                  $scope.layers[choice.key] = new google.maps.visualization.MapsEngineLayer({
                    mapId: mapId,
                    layerKey: choice.key,
                    map: document.querySelector('my-google-map').getMap()
                  });
                  // console.log("Turn on " + choice.name + " (" + choice.key + ")");
                } else {
                  if($scope.layers[choice.key].getMap() === null) {
                    $scope.layers[choice.key].setMap(document.querySelector('my-google-map').getMap());
                  } else {
                    $scope.layers[choice.key].setMap(null);
                  }
                }
              }

              if(choice.type === "folder") {
                angular.forEach(choice.contents, function(c) {
                  toggleMapsEngineLayer(c);
                });
              } else if(choice.type === "layer") {
                toggleMapsEngineLayer(choice);
              }
            };


            // Init Layers
            if($scope.family !== undefined) {
              // console.log("$scope.family", $scope.family);
              angular.forEach($scope.family, function(value, key) {
                if(value["checked"] === true) {
                  $scope.toggleLayer(value);
                }
              });
            }
        }
    };
});
