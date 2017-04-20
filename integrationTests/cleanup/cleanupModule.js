pumlhorse.module('cleanup')
    .function('createCleanupFunction', createCleanupFunction)
    .function('logOnTimeout', logOnTimeout)
    .function('changeValueSync', changeValueSync)
    ;


function createCleanupFunction($scope, $logger) {
    $scope._cleanup(() => new Promise((resolve, reject) => { setTimeout(resolve, 10)})
        .then(() => $logger.log('Cleanup finished')));
}

let cleanupVal = 'test';
function logOnTimeout($logger) {
    return new Promise((resolve, reject) => { setTimeout(() => {
        $logger.log(cleanupVal);
        resolve();
    }), 10})
}

function changeValueSync() {
    cleanupVal = 'new value';
}