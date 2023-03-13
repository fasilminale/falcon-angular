module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular','karma-typescript'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-typescript')
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false
      }
    },
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    karmaTypescriptConfig: {
      reports:
        {
          "lcovonly": {
            "directory": "coverage",
            "filename": "lcov.info",
            "subdirectory": "lcov"
          }
        }
    },
    reporters: ['progress','kjhtml','karma-typescript'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    captureTimeout: 21000000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout : 21000000,
    browserNoActivityTimeout : 21000000
  });
};
