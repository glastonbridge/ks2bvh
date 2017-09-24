// jshint esversion: 6

const SkeletonModel = require('./skeleton-model');

/**
 * Kinect 2 skeleton model
 */
class Kinect2SkeletonModel0 extends SkeletonModel {
	constructor() {
		super({
			name: "SpineBase",
			tree: KINECT2_SKELETON_MODEL,
			jointTranslator: mapKinect2toBVH,
			isRoot: true
		});
	}
}

KINECT2_SKELETON_MODEL =
{
	"SpineMid": {
		"Neck": {
			"Head": {}
		},
		"ShoulderLeft": {
			"ElbowLeft": {
				"WristLeft": {
					"HandLeft": {}
				}
			}
		},
		"ShoulderRight": {
			"ElbowRight": {
				"WristRight": {
					"HandRight": {}
				}
			}
		}
	},
	"KneeLeft": {
		"AnkleLeft": {
			"FootLeft": {}
		}
	},
	"KneeRight": {
		"AnkleRight": {
			"FootRight": {}
		}
	}
};


KINECT2_TO_BVH_LIMB_NAMES = {
    "SpineBase": "Hips",
    "SpineMid": "Chest",
    "Neck": "Neck",
    "Head": "Head",
    "ShoulderLeft": "LeftCollar",
    "ElbowLeft": "LeftUpArm",
    "WristLeft": "LeftLowArm",
    "HandLeft": "LeftHand",
    "ShoulderRight": "RightCollar",
    "ElbowRight": "RightUpArm",
    "WristRight": "RightLowArm",
    "HandRight": "RightHand",
    "KneeLeft": "LeftUpLeg",
    "AnkleLeft": "LeftLowLeg",
    "FootLeft": "LeftFoot",
    "KneeRight": "RightUpLeg",
    "AnkleRight": "RightLowLeg",
    "FootRight": "RightFoot",
};

function mapKinect2toBVH(k2name) {
	return KINECT2_TO_BVH_LIMB_NAMES[k2name];
}

module.exports = Kinect2SkeletonModel;
