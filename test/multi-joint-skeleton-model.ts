// jshint esversion: 6

import SkeletonModel from '../build/SkeletonModel';

/**
 * A simplified kinectJSON model for testing
 */
export default class MultiJointSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "shoulder",
			tree: {"LeftArm":{},"RightArm":{}},
			jointTranslator: function(name :string) : Array<string> {
                switch (name) {
                case "shoulder":
                    return ["shoulder", "LeftArm", "RightArm"];
                case "LeftArm":
                    return ["LeftArm", "LeftHand"];
                case "RightArm":
                    return ["RightArm", "RightHand"];
                }
                return [name];
            },
            rootLimb: "shoulder"
		});
	}
}
