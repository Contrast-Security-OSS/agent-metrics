# Agent Metrics Site

This is a little node app that can be used to study the output of an agent log analysis. To use it, you'll need node, npm, and a bunch of libraries from npm.

The first time you use it, you'll have to run these commands in the cloned directory:

	npm install gulp-less
	npm install browser-sync
	npm install gulp-header
	npm install gulp-clean-css
	npm install gulp-rename
	npm install gulp-uglify
	npm install gulp-clean
	npm install gulp-decompress`

From that point forward, you can just run:

`gulp dev --dir <dir with artifacts>`