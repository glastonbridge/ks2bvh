import SkeletonModel from "../build/SkeletonModel";

/**
 * A simplified kinectJSON model for testing.
 * For complex joints, we need to be able to traverse the tree naively,
 * but also
 */
export default class ComplexJointSkeletonModel extends SkeletonModel {
	constructor() {
        let myTree = {"RightUpLeg":{},"LeftUpLeg":{}, "Spine":{}};
		super({
			name: "Hips",
			tree: myTree,
			jointTranslator: function(name) {
                if      (name == "Hips")    return ["SpineBottom","LeftHip","RightHip"];
                else if (name == "Spine")   return ["SpineBottom", "SpineTop"];
                else if (name == "RightUpLeg")   return ["RightHip", "RightKnee"];
                else if (name == "LeftUpLeg")   return ["LeftHip", "LeftKnee"];
                else                        return [];
            },
            rootLimb: "Hips"
		});
	}
}
