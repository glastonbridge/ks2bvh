import {KinectJoint} from './KinectTypes';

export function dictionarifyJoints(joints: Array<KinectJoint>): JointMap {
    var jointDictionary = {};
    joints.forEach(function(joint) {
        jointDictionary[joint.JointType] = joint;
    });
    return jointDictionary;
}


export interface JointMap {
    [other: string]: KinectJoint
}
