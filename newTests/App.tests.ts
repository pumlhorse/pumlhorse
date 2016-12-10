// import * as Proxyquire from 'proxyquire';

// describe('App', () => {
//     var yamlMock;
//     var mockScript;
//     var scriptMock;
//     var files;
//     var directories;
//     var loggerMock;
//     var sessionOutput;
//     var filterMock;
//     var settingsMock = {
//         addSetting: function () {}
//     }
//     beforeEach(() => {

//     });

//     function runProfile(profile: IProfile) {
//         var ProfileRunner = Proxyquire('../App', {
//             './promiseFs': fsMock,
//             './Script': scriptMock,
//             'pumlhorse-yamljs': yamlMock,
//             './filters': filterMock,
//             './settings': settingsMock,
//             '@noCallThru': true
//         }).ProfileRunner;

//         return new ProfileRunner(profile).run();
//     }

//     xdescribe('run profile', () => {
//         it('logs a message if no scripts are found', done => {
//             //Arrange


//             //Act
//             var promise = runProfile({
//                 include: ['.']
//             })

//             //Assert

//         });
//     });
// });