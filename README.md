# Agent Metrics Site

This is a little node app that can be used to study the output of an agent log analysis. The first time you use it, you'll have to run these commands:

`npm install gulp-less
npm install browser-sync
npm install gulp-header
npm install gulp-clean-css
npm install gulp-rename
npm install gulp-uglify
npm install gulp-clean
npm install gulp-decompress`

From that point forward, you can just run:

`gulp dev --dir <dir with artifacts>`

## Using the Source Files

After cloning the repo take a look at the `gulpfile.js` and check out the tasks available:
* `gulp` The default task will compile the LESS and JS into the `dist` directory and minify the output, and it will copy all vendor libraries from `bower_components` into the `vendor` directory
* `gulp dev` The dev task will serve up a local version of the template and will watch the LESS, JS, and HTML files for changes and reload the browser windo automatically

To update dependencies, run `bower update` and then run `gulp copy` to copy the updated dependencies into the `vendor` directory

