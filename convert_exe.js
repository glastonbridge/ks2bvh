#!/usr/bin/env node
// jshint esversion: 6
require('source-map-support').install();

const SkeletonConverter = require('./build/SkeletonConverter').default;
const Kinect1SkeletonModel = require('./build/Kinect1SkeletonModel').default;
const fs = require('fs');
const process = require('process');

let skeletonModel = new Kinect1SkeletonModel();
let converter = new SkeletonConverter({skeletonModel: skeletonModel});

console.log(JSON.stringify(process.argv));

let jsonSkeletons = JSON.parse(fs.readFileSync(process.argv[2]));

console.log("Parsed input");

for (var i = 0; i < jsonSkeletons.length; ++i) {
	console.log(jsonSkeletons[i].Skeletons.length);
	if (jsonSkeletons[i].Skeletons && jsonSkeletons[i].Skeletons.length>0) {
		break;
	}
}

if (i >= jsonSkeletons.length) {
	console.error("No suitable frames found for motion capturing");
	process.exit(1);
}

converter.captureInitialJoints(jsonSkeletons[i]);
for (i = 0; i < jsonSkeletons.length; ++i) {
	converter.convert(jsonSkeletons[i]);
}

const bvhString = converter.getBVH();

fs.writeFileSync(process.argv[3],bvhString);
