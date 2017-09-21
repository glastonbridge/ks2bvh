// jshint esversion: 6

const SkeletonModel = require('./skeleton-model');

/**
 * A simplified kinectJSON model for testing
 */
class SimpleSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "shoulder",
			tree: {"hand":{}},
			jointTranslator: function(name) {return name;}, // no-op
			rootLimbJoints: ["shoulder","hand"]
		});
	}
}

module.exports = SimpleSkeletonModel;
