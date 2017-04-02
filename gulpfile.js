var asyn = require('async');
var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var argv = require('yargs').argv;
var fs = require('fs-extra');
var decompress = require('gulp-decompress');
var clean = require('gulp-clean');
var concat = require('gulp-concat');

// Set the banner content
var banner = [
	'/*!\n',
	' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
	' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
	' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
	' */\n',
	''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function ( taskDone ) {
	gulp.src('less/sb-admin-2.less')
		.pipe(less())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', taskDone);
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function ( taskDone ) {
	gulp.src('dist/css/sb-admin-2.css')
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', taskDone);
});

// Copy JS to dist
gulp.task('js', function ( taskDone ) {
	gulp.src(['js/sb-admin-2.js'])
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', taskDone);
});

// Minify JS
gulp.task('minify-js', ['js'], function ( taskDone ) {
	gulp.src('js/sb-admin-2.js')
		.pipe(uglify())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', taskDone);
});

gulp.task('minify-js-all', ['js'], function ( taskDone ) {
	gulp.src('js/*.js')
		.pipe(concat('all.js'))
		//.pipe(uglify())
		.pipe(header(banner, { pkg: pkg }))
		//.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', taskDone);
});

gulp.task('minify-js-dotnet', ['js'], function ( taskDone ) {
	gulp.src('js/dotnet/*.js')
		.pipe(concat('dotnet-all.js'))
		//.pipe(uglify())
		.pipe(header(banner, { pkg: pkg }))
		//.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', taskDone);
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function ( taskDone ) {
	asyn.parallel([
		function ( finish ) {
			gulp.src(['bower_components/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
				.pipe(gulp.dest('vendor/bootstrap'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/bootstrap-social/*.css', 'bower_components/bootstrap-social/*.less', 'bower_components/bootstrap-social/*.scss'])
				.pipe(gulp.dest('vendor/bootstrap-social'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/datatables/media/**/*'])
				.pipe(gulp.dest('vendor/datatables'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/datatables-plugins/integration/bootstrap/3/*'])
				.pipe(gulp.dest('vendor/datatables-plugins'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/datatables-responsive/css/*', 'bower_components/datatables-responsive/js/*'])
				.pipe(gulp.dest('vendor/datatables-responsive'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/flot/*.js'])
				.pipe(gulp.dest('vendor/flot'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/flot.tooltip/js/*.js'])
				.pipe(gulp.dest('vendor/flot-tooltip'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/font-awesome/**/*', '!bower_components/font-awesome/*.json', '!bower_components/font-awesome/.*'])
				.pipe(gulp.dest('vendor/font-awesome'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/jquery/dist/jquery.js', 'bower_components/jquery/dist/jquery.min.js'])
				.pipe(gulp.dest('vendor/jquery'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/metisMenu/dist/*'])
				.pipe(gulp.dest('vendor/metisMenu'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/morrisjs/*.js', 'bower_components/morrisjs/*.css', '!bower_components/morrisjs/Gruntfile.js'])
				.pipe(gulp.dest('vendor/morrisjs'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/raphael/raphael.js', 'bower_components/raphael/raphael.min.js'])
				.pipe(gulp.dest('vendor/raphael'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/ramda/dist/*.js'])
				.pipe(gulp.dest('vendor/ramda'))
				.on('finish', finish);
		},
		function ( finish ) {
			gulp.src(['bower_components/sammy/lib/min/sammy-latest.min.js', 'bower_components/sammy/lib/min/plugins/sammy.template-latest.min.js'])
				.pipe(gulp.dest('vendor/sammy'))
				.on('finish', finish);
		}
	], taskDone);
});

// import the data from the .amf file for use in the application
gulp.task('import-data-from-amf', function ( taskDone ) {
	if (argv.dir == undefined && argv.amf == undefined) {
		console.log('Please --dir <dir> or --amf <file> to specify a directory where .log/.json/.dat files are stored to visualize');
		process.exit(-1);
	}
	asyn.parallel([
		function ( done ) {
			gulp.src('app/tmp', {read: false}).pipe(clean()).on('finish', done);
		},
		function ( done ) {
			fs.mkdirs('data');
			if(argv.amf != undefined) {
				try {
					gulp.src(argv.amf).pipe(decompress({strip:0})).pipe(gulp.dest('data')).on('finish', done);
				} catch(err) {
					console.error(err);
					done();
				}
			} else if(argv.dir != undefined) {
				try {
					fs.copySync(argv.dir, 'data');
					console.log("success!");
				} catch (err) {
					console.error(err);
				}
				done();
			}
		}
	], taskDone);
});

// Watch files for changes and perform a reload
gulp.task('watch', function ( ) {
	gulp.watch('less/*.less', ['less']);
	gulp.watch('dist/css/*.css', ['minify-css']);
	gulp.watch('js/*.js', ['minify-js-all']);
	gulp.watch('js/dotnet/*.js', ['minify-js-dotnet']);
	// Reloads the browser whenever HTML or JS files change
	gulp.watch('pages/*.html', browserSync.reload);
	gulp.watch('dotnet/*.html', browserSync.reload);
	gulp.watch('dist/js/*.js', browserSync.reload);
});

// Build the project and launch the application in the browser
gulp.task('browserSync', ['minify-css', 'minify-js-all', 'minify-js-dotnet', 'copy', 'import-data-from-amf'], function ( ) {
	browserSync.init({
		server: {
			baseDir: '' }
	});
});

// Builds static file assets.
gulp.task('default', ['minify-css', 'minify-js', 'copy']);

// Dev task - build the project and run the watch task.
gulp.task('dev', ['browserSync', 'watch']);
