// jshint esversion: 6

const SkeletonModel = require('./skeleton-model');

/**
 * Kinect 2 skeleton model
 */
class Kinect2SkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "SpineMid",
			tree: KINECT2_SKELETON_MODEL,
			jointTranslator: mapKinect2toBVH
		});
	}
}

KINECT2_SKELETON_MODEL =
{
	"SpineShoulder": {
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
	"SpineBase": {
        "HipLeft": {
    		"KneeLeft": {
    			"AnkleLeft": {
    				"FootLeft": {}
    			}
    		},
        },
        "HipRight": {
    		"KneeRight": {
    			"AnkleRight": {
    				"FootRight": {}
    			}
    		}
        }
	}
};

//nb: because kinect describes joints and bvh is more about limbs, the names
//in the BVH side are the limbs that relate to the joint you would land on while
//traversing from the root outward.
KINECT2_TO_BVH_LIMB_NAMES = {
    "SpineMid": "Spine",
    "SpineBase": "Hips",
    "SpineShoulder": "Chest",
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
    "HipLeft": "LeftHip",
    "HipRight": "RightHip"
};

function mapKinect2toBVH(k2name) {
	return KINECT2_TO_BVH_LIMB_NAMES[k2name];
}

KINECT2_SKELETON_MODEL_SIMPLIFIED = Object.keys(KINECT2_SKELETON_MODEL).reduce((p, item)=>{
	p[item] = {};
	return p;
},{});

module.exports = Kinect2SkeletonModel;
