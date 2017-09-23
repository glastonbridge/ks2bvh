import SkeletonModel from "../build/SkeletonModel";

/**
 * A simplified kinectJSON model for testing
 */
export default class MetaJointSkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "SpineBottom",
			tree: {"LeftHip":{"LeftKnee":{}},"RightHip":{"RightKnee":{}}, "SpineTop":{}},
			jointTranslator: function(name) {return name;}, // no-op
            metaGroups: {"Hips": ["LeftHip","RightHip","SpineBottom"], "Spine": ["SpineBottom","SpineTop"]}
		});
	}
}
