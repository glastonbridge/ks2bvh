// jshint esversion: 6

import SkeletonModel from "../build/SkeletonModel";

/**
 * A simplified kinectJSON model for testing
 */
export default class TwoJointSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "shoulder",
			tree: {"hand":{}},
			jointTranslator: function(name :string) : Array<string> {return [name];},
            rootLimb: "shoulder"
		});
	}
}
