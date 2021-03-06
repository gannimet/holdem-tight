// Karma configuration
// Generated on Fri Oct 31 2014 19:43:01 GMT+0100 (CET)

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/tooltipster/js/jquery.tooltipster.min.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/alertify-js/build/alertify.min.js',
        './node_modules/phantomjs-polyfill/bind-polyfill.js',
        {
            pattern: 'static/html/*.html',
            watched: false
        },
        'src/client/js/controllers/controllers.js',
        'src/client/js/controllers/*.js',
        'src/client/js/services/services.js',
        'src/client/js/services/*.js',
        'src/client/js/directives/directives.js',
        'src/client/js/directives/*.js',
        'src/client/js/filters/filters.js',
        'src/client/js/filters/*.js',
        'src/client/js/constants/constants.js',
        'src/client/js/constants/*.js',
        'src/client/js/app.js',
        'src/client/tests/**/*.js'
    ],

    proxies: {
        '/img/': 'http://localhost:3000/img/'
    },

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'static/html/*.html': ['ng-html2js'],
        'src/client/js/**/*.js': ['coverage']
    },

    ngHtml2JsPreprocessor: {
        moduleName: 'templates',
        stripPrefix: 'static'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'coverage'],

    coverageReporter: {
        type: 'html',
        dir: 'coverage/'
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [/*'Chrome'*/'PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
    
  });
};
