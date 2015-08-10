module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			jQuery: {
				files: [
					{
						expand: true,
						src: 'bower_components/jquery/dist/jquery.min.*',
						dest: 'static/js/',
						flatten: true
					}
				]
			},
			bootstrap: {
				files: [
					{
						expand: true,
						src: 'bower_components/bootstrap/dist/css/*.min.css',
						dest: 'static/css/',
						flatten: true
					}, {
						expand: true,
						src: 'bower_components/bootstrap/dist/js/bootstrap.min.js',
						dest: 'static/js/',
						flatten: true
					}, {
						expand: true,
						src: 'bower_components/bootstrap/dist/fonts/*',
						dest: 'static/fonts/',
						flatten: true
					}
				]
			},
			alertify: {
				files: [
					{
						expand: true,
						src: 'bower_components/alertify-js/build/css/alertify.css',
						dest: 'static/css/',
						flatten: true
					}, {
						expand: true,
						src: 'bower_components/alertify-js/build/css/themes/bootstrap.css',
						dest: 'static/css/',
						flatten: true,
						rename: function(dest, src) {
							return 'static/css/alertify-bootstrap.css';
						}
					}, {
						expand: true,
						src: 'bower_components/alertify-js/build/alertify.min.js',
						dest: 'static/js/',
						flatten: true
					}
				]
			},
			tooltipster: {
				files: [
					{
						expand: true,
						src: 'bower_components/tooltipster/css/tooltipster.css',
						dest: 'static/css/',
						flatten: true
					}, {
						expand: true,
						src: 'bower_components/tooltipster/css/themes/tooltipster-light.css',
						dest: 'static/css/',
						flatten: true
					}, {
						expand: true,
						src: 'bower_components/tooltipster/js/jquery.tooltipster.min.js',
						dest: 'static/js/',
						flatten: true
					}
				]
			},
			angular: {
				files: [
					{
						expand: true,
						cwd: 'bower_components/angular/',
						src: ['angular.min.js', 'angular.min.js.map'],
						dest: 'static/js/',
						flatten: true
					}
				]
			},
			angular_route: {
				files: [
					{
						expand: true,
						cwd: 'bower_components/angular-route/',
						src: ['angular-route.min.js', 'angular-route.min.js.map'],
						dest: 'static/js/',
						flatten: true
					}
				]
			},
			angular_animate: {
				files: [
					{
						expand: true,
						cwd: 'bower_components/angular-animate/',
						src: ['angular-animate.min.js', 'angular-animate.min.js.map'],
						dest: 'static/js/',
						flatten: true
					}
				]
			},
			angular_bootstrap: {
				files: [
					{
						expand: true,
						cwd: 'bower_components/angular-bootstrap/',
						src: ['ui-bootstrap-tpls.min.js'],
						dest: 'static/js/',
						flatten: true
					}
				]
			}
		},
		jshint: {
			all: ['Gruntfile.js', 'src/**/*.js']
		},
		less: {
			development: {
				files: {
					'static/css/custom.css': 'src/client/less/custom.less'
				}
			}
		},
		watch: {
			sripts: {
				files: [
					'Gruntfile.js',
					'src/client/js/**/*.js',
					'src/client/less/**/*.less',
					'src/server/**/*.js',
					'src/client/tests/**/*.js',
					'src/server/views/**/*.jade'
				],
				tasks: ['build']
			}
		},
		concat: {
			options: {
				separator: ';',
				sourceMap: true,
				sourceMapName: 'static/js/holdemApp.js.concat.map'
			},
			build: {
				src: [
					/*'src/client/js/app.js',
					'src/client/js/controllers.js',
					'src/client/js/directives.js',
					'src/client/js/filters.js',
					'src/client/js/services.js',
					'src/client/js/constants.js'*/
					'src/client/js/app.js',
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
				],
				dest: 'static/js/holdemApp.js'
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				sourceMapIn: 'static/js/holdemApp.js.concat.map'
			},
			build: {
				files: {
					'static/js/holdemApp.min.js': ['<%= concat.build.dest %>']
				}
			}
		},
		clean: {
			concatenated: ['static/js/holdemApp.js', 'static/js/holdemApp.js.concat.map'],
			allStaticFiles: ['static/css/*', 'static/fonts/*', 'static/js/*']
		},
		jsdoc: {
			dist: {
				src: ['src/client/js/**/*.js'],
				options: {
					destination: 'doc'
				}
			}
		},
		jade: {
			compile: {
				options: {
					pretty: true,
					client: false
				},
				files: [
					{
						cwd: 'src/server/views/',
						src: '**/*.jade',
						dest: 'static/html/',
						expand: true,
						ext: '.html'
					}
				]
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['src/server/tests/**/*.js']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-mocha-test');

	var buildTasks = ['copy', 'jshint', 'concat', 'uglify', 'less', 'clean:concatenated', 'jade'];

	grunt.registerTask('build', buildTasks);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('doc', ['jsdoc']);
	grunt.registerTask('test', ['karma:unit']);
	grunt.registerTask('test-frontend', ['karma:unit']);
	grunt.registerTask('test-backend', ['mochaTest']);
};
