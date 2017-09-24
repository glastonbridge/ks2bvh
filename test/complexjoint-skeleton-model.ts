import SkeletonModel from "../build/SkeletonModel";

/**
 * A simplified kinectJSON model for testing.
 * For complex joints, we need to be able to traverse the tree naively,
 * but also
 */
export default class ComplexJointSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "Hips",
			tree: {"RightUpLeg":{},"LeftUpLeg":{}, "Spine":{}},
			jointTranslator: function(name) {
                if      (name == "Hips")    return ["HipLeft","HipRight","SpineBottom"];
                else if (name == "Spine")   return ["SpineBottom", "SpineMid"];
                else                        return [name];
            } // no-op
		});
	}
}
