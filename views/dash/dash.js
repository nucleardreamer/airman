window.angular.module('airman')
.controller('dashController', function ($rootScope, $scope, $window, $state, oak, _, settings) {
  $scope.settings = settings
  $rootScope.$on('status', function (e, status) {
    console.log('status', status)
    $scope.status = status
    var uptime = status.Uptime
    let upD = parseInt((uptime / 1000) / 86400)
    let upH = parseInt((uptime / 1000 - 86400 * upD) / 3600)
    let upM = parseInt((uptime / 1000 - 86400 * upD - 3600 * upH) / 60)
    let upS = parseInt((uptime / 1000 - 86400 * upD - 3600 * upH - 60 * upM))
    $scope.status.uptime = String(upD + '/' + ((upH < 10) ? '0' + upH : upH) + ':' + ((upM < 10) ? '0' + upM : upM) + ':' + ((upS < 10) ? '0' + upS : upS))

    let boardtemp = status.CPUTemp
    $scope.cpu = String(boardtemp.toFixed(1) + '°C / ' + ((boardtemp * 9 / 5) + 32.0).toFixed(1) + '°F')
  })
})
