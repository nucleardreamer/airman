'use strict'

window.oak.webFrame.setVisualZoomLevelLimits(1, 1)

window.reload = function () {
  window.oak.reload()
}

window.getScope = function () {
  let s = window.angular.element(document.getElementsByTagName('wrapper')).scope()
  return s
}

let app = window.angular
  .module('airman', [
    'ngAnimate',
    'ui.router'
  ])
  .constant('apiBase', 'http://10.1.0.134')
  .constant('oak', window.oak)
  // use lodash in controllers
  .constant('_', window.lodash)
  // use lodash in views
  .run(function ($rootScope) {
    $rootScope._ = window.lodash
  })

app.config(function (
  $sceDelegateProvider,
  $stateProvider,
  $urlRouterProvider,
  oak,
  _
) {
  $sceDelegateProvider.resourceUrlWhitelist(['self', '**'])
  $stateProvider
    .state('dash', {
      url: '/',
      controller: 'dashController',
      templateUrl: '/tmpl/dash/dash',
      resolve: {
        settings: function ($http, apiBase) {
          return $http({
            method: 'GET',
            url: `${apiBase}/getSettings`
          })
        }
      }
      // onEnter: function (oak, _) {
      //   // on enter
      // }
    })

  $urlRouterProvider.otherwise('/')
})

window.angular.module('airman')
.controller('mainController', function mainController ($rootScope, $scope, $http, $interval, oak, apiBase) {
  $scope.settings = false
  $interval(function () {
    $http({
      method: 'GET',
      url: `${apiBase}/getStatus`
    }).then(function (res) {
      $rootScope.$broadcast('status', res.data)
    })
  }, 1000)
  oak.ready()
})
