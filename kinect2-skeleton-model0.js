// jshint esversion: 6

const SkeletonModel = require('./skeleton-model');

/**
 * Kinect 2 skeleton model
 */
class Kinect2SkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "SpineMid",
			tree: KINECT2_SKELETON_MODEL_SIMPLIFIED,
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
		"SpineShoulder": {
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
		}
	},
	"SpineBase": {
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
	}
};

//nb: because kinect describes joints and bvh is more about limbs, the names
//in the BVH side are the limbs that relate to the joint you would land on while
//traversing from the root outward.
KINECT2_TO_BVH_LIMB_NAMES = {
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
};

function mapKinect2toBVH(k2name) {
	return KINECT2_TO_BVH_LIMB_NAMES[k2name];
}

function reductio(depth, obj) {
    if (depth === 0) return {};
    else return Object.keys(obj).reduce((p, item)=>{
    	p[item]=reductio(depth-1,obj[item]);
    	return p;
    },{});
}

KINECT2_SKELETON_MODEL_SIMPLIFIED = reductio(3,KINECT2_SKELETON_MODEL);

module.exports = Kinect2SkeletonModel;
