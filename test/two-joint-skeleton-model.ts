// jshint esversion: 6

import SkeletonModel from "../build/SkeletonModel";

/**
 * A simplified kinectJSON model for testing
 */
export default class TwoJointSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "shoulder",
			tree: {},
			jointTranslator: function(name :string) : Array<string> {
                return name=="shoulder"?["shoulder","hand"]:[];
            },
            rootLimb: "shoulder"
		});
	}
}
