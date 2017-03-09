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
gulp.task('less', function ( cb ) {
	gulp.src('less/sb-admin-2.less')
		.pipe(less())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', cb);
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function ( cb ) {
	gulp.src('dist/css/sb-admin-2.css')
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', cb);
});

// Copy JS to dist
gulp.task('js', function ( cb ) {
	gulp.src(['js/sb-admin-2.js'])
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', cb);
});

// Minify JS
gulp.task('minify-js', ['js'], function ( cb ) {
	gulp.src('js/sb-admin-2.js')
		.pipe(uglify())
		.pipe(header(banner, { pkg: pkg }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.on('finish', cb);
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function ( cb ) {
	asyn.parallel([
		function ( done ) {
			gulp.src(['bower_components/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
				.pipe(gulp.dest('vendor/bootstrap'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/bootstrap-social/*.css', 'bower_components/bootstrap-social/*.less', 'bower_components/bootstrap-social/*.scss'])
				.pipe(gulp.dest('vendor/bootstrap-social'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/datatables/media/**/*'])
				.pipe(gulp.dest('vendor/datatables'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/datatables-plugins/integration/bootstrap/3/*'])
				.pipe(gulp.dest('vendor/datatables-plugins'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/datatables-responsive/css/*', 'bower_components/datatables-responsive/js/*'])
				.pipe(gulp.dest('vendor/datatables-responsive'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/flot/*.js'])
				.pipe(gulp.dest('vendor/flot'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/flot.tooltip/js/*.js'])
				.pipe(gulp.dest('vendor/flot-tooltip'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/font-awesome/**/*', '!bower_components/font-awesome/*.json', '!bower_components/font-awesome/.*'])
				.pipe(gulp.dest('vendor/font-awesome'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/jquery/dist/jquery.js', 'bower_components/jquery/dist/jquery.min.js'])
				.pipe(gulp.dest('vendor/jquery'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/metisMenu/dist/*'])
				.pipe(gulp.dest('vendor/metisMenu'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/morrisjs/*.js', 'bower_components/morrisjs/*.css', '!bower_components/morrisjs/Gruntfile.js'])
				.pipe(gulp.dest('vendor/morrisjs'))
				.on('end', done);
		},
		function ( done ) {
			gulp.src(['bower_components/raphael/raphael.js', 'bower_components/raphael/raphael.min.js'])
				.pipe(gulp.dest('vendor/raphael'))
				.on('end', done);
		}
	], cb);
});

gulp.task('data-files', function ( cb ) {
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
	], cb);
});

// Run everything
gulp.task('default', ['minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', ['minify-css', 'minify-js', 'copy', 'data-files'], function ( ) {
	browserSync.init({
		server: {
			baseDir: ''
		}
	});
});

// Dev task with browserSync and file watching
gulp.task('dev', ['browserSync'], function ( ) {
	gulp.watch('less/*.less', ['less']);
	gulp.watch('dist/css/*.css', ['minify-css']);
	gulp.watch('js/*.js', ['minify-js']);
	// Reloads the browser whenever HTML or JS files change
	gulp.watch('pages/*.html', browserSync.reload);
	gulp.watch('dist/js/*.js', browserSync.reload);
});

// ..................................................................................

// gulp.task('dev', ['browserSync', 'less', 'minify-css', 'js', 'minify-js'], function() {
//	if(argv.dir == undefined && argv.amf == undefined) {
//	   console.log('Please --dir <dir> or --amf <file> to specify a directory where .log/.json/.dat files are stored to visualize')
//	   process.exit(-1)
//	}
//	gulp.src('app/tmp', {read: false}).pipe(clean());
//	fs.mkdirs('data')
//	if(argv.amf != undefined) {
//	  try {
//		gulp.src(argv.amf).pipe(decompress({strip:0})).pipe(gulp.dest('data'))
//	  } catch(err) {
//		console.error(err)
//	  }
//	} else if(argv.dir != undefined) {
//	   try {
//		  fs.copySync(argv.dir, 'data')
//		  console.log("success!")
//	   } catch (err) {
//		  console.error(err)
//	   }
//	}
//	gulp.watch('less/*.less', ['less']);
//	gulp.watch('dist/css/*.css', ['minify-css']);
//	gulp.watch('js/*.js', ['minify-js']);
//	// Reloads the browser whenever HTML or JS files change
//	gulp.watch('pages/*.html', browserSync.reload);
//	gulp.watch('dist/js/*.js', browserSync.reload);
// });
