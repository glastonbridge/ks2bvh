// jshint esversion: 6

const SkeletonModel = require('./skeleton-model');

/**
 * A simplified kinectJSON model for testing
 */
class SimpleSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "shoulder",
			tree: {"LeftArm":{"LeftHand":{}},"RightArm":{"RightHand":{}}},
			jointTranslator: function(name) {return name;}, // no-op
			rootLimbJoints: ["shoulder","LeftArm","RightArm"]
		});
	}
}

module.exports = SimpleSkeletonModel;
