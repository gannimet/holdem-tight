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
						cwd: 'bower_components/alertify/themes/',
						src: ['alertify.core.css', 'alertify.bootstrap.css'],
						dest: 'static/css/',
						flatten: true
					}, {
						expand: true,
						src: 'bower_components/alertify/alertify.min.js',
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
				files: ['Gruntfile.js', 'src/client/js/**/*.js', 'src/client/less/**/*.less', 'src/server/**/*.js'],
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
					'src/client/js/app.js',
					'src/client/js/controllers.js',
					'src/client/js/directives.js',
					'src/client/js/filters.js',
					'src/client/js/services.js',
					'src/client/js/constants.js'
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsdoc');

	var buildTasks = ['copy', 'jshint', 'concat', 'uglify', 'less', 'clean:concatenated'];

	grunt.registerTask('build', buildTasks);
	grunt.registerTask('default', ['build']);
	grunt.registerTask('doc', ['jsdoc']);
};
