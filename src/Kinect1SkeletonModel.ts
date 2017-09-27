// jshint esversion: 6

import SkeletonModel from './SkeletonModel';

/**
 * Kinect 2 skeleton model
 */
export default class Kinect1SkeletonModel extends SkeletonModel {
	constructor() {
		super({
			name: "Hips",
			tree: GAMERIG_SKELETON_MODEL,
			jointTranslator: mapBvhToKinect1,
            rootLimb:"Hips"
		});
	}
}

const GAMERIG_SKELETON_MODEL = {
        "SpineL": {
            "SpineH": {
                "Neck": {
                    "Head": {}
                },
                "RightShoulder": {
                    "RightArm": {
                        "RightForeArm": {
                            "RightHand": {}
                        }
                    }
                },
                "LeftShoulder": {
                    "LeftArm": {
                        "LeftForeArm": {
                            "LeftHand": {}
                        }
                    }
                }
            }
        },
        "RightUpLeg" : {
            "RightLeg": {
                "RightFoot": {}
            }
        },
        "LeftUpLeg" : {
            "LeftLeg": {
                "LeftFoot": {}
            }
        }
}

function mapBvhToKinect1(name: string) : string[] {
    const BVHToKinectMap : {[limb: string] : Array<string>} = {
        "Hips": ["HipCenter","HipLeft","HipRight"],
        "SpineL": ["HipCenter","Spine"],
        "SpineH": ["Spine", "ShoulderCenter"],
        "Neck": ["ShoulderCenter","ShoulderCenter"],
        "Head": ["ShoulderCenter", "Head"],
        "RightShoulder": ["ShoulderCenter","ShoulderRight"],
        "RightArm": ["ShoulderRight","ElbowRight"],
        "RightForeArm": ["ElbowRight","WristRight"],
        "RightHand": ["WristRight","HandRight"],

        "LeftShoulder": ["ShoulderCenter","ShoulderLeft"],
        "LeftArm": ["ShoulderLeft","ElbowLeft"],
        "LeftForeArm": ["ElbowLeft","WristLeft"],
        "LeftHand": ["WristLeft","HandLeft"],

        "RightUpLeg": ["HipRight","KneeRight"],
        "RightLeg": ["KneeRight","AnkleRight"],
        "RightFoot": ["AnkleRight","FootRight"],
        "LeftUpLeg": ["HipLeft","KneeLeft"],
        "LeftLeg": ["KneeLeft","AnkleLeft"],
        "LeftFoot": ["AnkleLeft","FootLeft"],


    }
    if (!BVHToKinectMap[name]) throw new Error ("Model has no member "+name);
    return BVHToKinectMap[name];
}
