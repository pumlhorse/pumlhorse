pumlhorse.module('cleanup')
    .function('createCleanupFunction', createCleanupFunction);


function createCleanupFunction($scope, $logger) {
    $scope._cleanup(() => new Promise((resolve, reject) => { setTimeout(resolve, 10)})
        .then(() => $logger.log('Cleanup finished')));
}