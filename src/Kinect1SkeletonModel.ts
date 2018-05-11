// jshint esversion: 6

import SkeletonModel, { Vector3 } from './SkeletonModel';

/**
 * Kinect 2 skeleton model
 */
export default class Kinect1SkeletonModel extends SkeletonModel {
    constructor() {
        super({
            name: "Hips",
            tree: GAMERIG_SKELETON_MODEL,
            jointTranslator: mapBvhToKinect1,
            rootLimb: "Hips",
            jointRotationAxes: GAMERIG_JOINT_ROTATION_AXES,
            getDefaultJointDefaultPoseDirection: getGamerigPoseDirections
        });
    }
}

const getGamerigPoseDirections = function() :Vector3 {
    let vecArrArr = GAMERIG_POSE_DIRECTIONS[this.name] ;
    console.log("Looking at "+this.name);
    return vecArrArr.map(vecArr=>{return { x: vecArr[0], y: vecArr[1], z: vecArr[2]};});
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
    "RightUpLeg": {
        "RightLeg": {
            "RightFoot": {}
        }
    },
    "LeftUpLeg": {
        "LeftLeg": {
            "LeftFoot": {}
        }
    }
}

const GAMERIG_JOINT_ROTATION_AXES = {
    "RightArm": "YZ",
    "RightForeArm": "YZ",
    "LeftArm": "YZ",
    "LeftForeArm": "YZ",

    "RightUpLeg": "XY",
    "RightLeg": "XY",
    "LeftUpLeg": "XY",
    "LeftLeg": "XY",
    "LeftFoot": "XY"
}

function mapBvhToKinect1(name: string): string[] {
    const BVHToKinectMap: { [limb: string]: Array<string> } = {
        "Hips": ["HipCenter", "HipLeft", "HipRight"],
        "SpineL": ["HipCenter", "Spine"],
        "SpineH": ["Spine", "ShoulderCenter", "ShoulderLeft", "ShoulderRight"],
        "Neck": ["ShoulderCenter", "ShoulderCenter"],
        "Head": ["ShoulderCenter", "Head"],
        "RightShoulder": ["ShoulderCenter", "ShoulderRight"],
        "RightArm": ["ShoulderRight", "ElbowRight"],
        "RightForeArm": ["ElbowRight", "WristRight"],
        "RightHand": ["WristRight", "HandRight"],

        "LeftShoulder": ["ShoulderCenter", "ShoulderLeft"],
        "LeftArm": ["ShoulderLeft", "ElbowLeft"],
        "LeftForeArm": ["ElbowLeft", "WristLeft"],
        "LeftHand": ["WristLeft", "HandLeft"],

        "RightUpLeg": ["HipRight", "KneeRight"],
        "RightLeg": ["KneeRight", "AnkleRight"],
        "RightFoot": ["AnkleRight", "FootRight"],
        "LeftUpLeg": ["HipLeft", "KneeLeft"],
        "LeftLeg": ["KneeLeft", "AnkleLeft"],
        "LeftFoot": ["AnkleLeft", "FootLeft"],
    }

    if (!BVHToKinectMap[name]) throw new Error("Model has no member " + name);
    return BVHToKinectMap[name];
}

const sin10 = Math.sin(10*Math.PI/180);
const cos10 = Math.cos(10*Math.PI/180);

const STAY_PUT = [0,0,0];
const DUE_RIGHT = [-1,0,0];
const DUE_LEFT = [-1,0,0];
const DUE_UP = [0,1,0];
const DUE_DOWN = [0,-1,0];

const GAMERIG_POSE_DIRECTIONS = {
    "Hips": [STAY_PUT,DUE_LEFT,DUE_RIGHT],
    "SpineL": [DUE_UP],
    "SpineH": [DUE_UP,[sin10,cos10,0],[-sin10,cos10,0]],
    "Neck": [0,0,0],
    "Head": DUE_UP,
    "RightShoulder": DUE_RIGHT,
    "RightArm":DUE_RIGHT,
    "RightForeArm": DUE_RIGHT,
    "RightHand": DUE_RIGHT,

    "LeftShoulder": DUE_LEFT,
    "LeftArm": DUE_LEFT,
    "LeftForeArm": DUE_LEFT,
    "LeftHand": DUE_LEFT,

    "RightUpLeg": DUE_DOWN,
    "RightLeg": DUE_DOWN,
    "RightFoot": DUE_DOWN,
    "LeftUpLeg": DUE_DOWN,
    "LeftLeg":DUE_DOWN,
    "LeftFoot": DUE_DOWN,
}
