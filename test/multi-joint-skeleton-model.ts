// jshint esversion: 6

import SkeletonModel from '../build/SkeletonModel';

/**
 * A simplified kinectJSON model for testing
 */
export default class MultiJointSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "shoulder",
			tree: {"LeftArm":{"LeftHand":{}},"RightArm":{"RightHand":{}}},
			jointTranslator: function(name :string) : Array<string> {return [name];}
		});
	}
}
