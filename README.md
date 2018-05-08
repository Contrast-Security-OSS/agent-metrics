# Agent Metrics Site

This is a little node app that can be used to study the output of an agent log in a more efficient way. It visually represents agent activity amongst many dimensions. It also has advanced analytics collected for Assess data. More Protect features will come eventually.

To use it, you'll need node, npm, and a bunch of libraries from npm. It uses a file generated by agents called an "Agent Metrics Format", or .amf. 

## Generating AMF files for visualizing
To generate it with the Java Agent, run the following command:

`java -jar contrast.jar analyze-log /path/to/contrast-debug.log amf`

This will generate a file, javaaagent-1XXXXX.amf in the current directory. This .amf file will contain all the evidence generated by the log file to be visualized by agent-metrics, and more!

## Installing the Agent Metrics app

The first time you use it, you'll have to run these commands in the cloned directory:

	npm install gulp-less
	npm install browser-sync
	npm install gulp-header
	npm install gulp-clean-css
	npm install gulp-rename
	npm install gulp-uglify
	npm install gulp-clean
	npm install gulp-decompress
	npm install gulp-concat

## Running the Agent Metrics app

Once the node modules are installed, you can just run:

`gulp dev --amf /path/to/javaagent-1XXX.amf`

This run will only contain data for the log generated from the given time.