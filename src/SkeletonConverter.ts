// jshint esversion: 6

import THREE = require('three');

import SkeletonModel from "./SkeletonModel";

import {SkeletonFrame, KinectJoint, KinectVector} from "./KinectTypes";

export interface JointMap {
    [other: string] : KinectJoint
}

export default class SkeletonConverter {
    INDENT_BY : string;
    skeletonModel : SkeletonModel;
    goodFrames : Array<string>;
    originalJoints? : JointMap;
	constructor(options) {
		this.INDENT_BY = "  ";
		this.skeletonModel = options.skeletonModel;
		this.goodFrames = [];
	}

	/**
	 * The initial limb capture assumes no rotation
     * For each joint
     *   if it has no parent
     *     write the root
     *   else if it has children
     *     write child joint
     *       repeat for children
     *   else if it has no children
     *     write end joint
	 */
	recursivelyCaptureLimbs(subskeleton : SkeletonModel, joints : JointMap, parentOffset : KinectVector, indent:number) {
		var isp = this.INDENT_BY.repeat(indent);
		var isp2 = this.INDENT_BY.repeat(indent+1);
		var definition = "";
		const self = this;
        let myOffset = offsetOfJoint(subskeleton, joints);
		if (subskeleton.isRoot()) {
			definition += isp + "ROOT "+subskeleton.name+"\n";
			definition += isp + "{\n";
			definition += writeOffset(indent+1, myOffset, parentOffset,this.INDENT_BY);
			definition += isp2 + "CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n";
        } else {
            definition += isp+"JOINT "+subskeleton.name + "\n";
			definition += isp +"{\n";
			definition += writeOffset(indent+1, offsetOfJoint(subskeleton, joints), parentOffset,self.INDENT_BY);
            definition += isp2 + "CHANNELS 3 Zrotation Xrotation Yrotation\n";
        }

        if (subskeleton.isEndSite()) {
            definition += isp2 +"End Site\n";
			definition += isp2 +"{\n";
			//console.log("EndSite:"+subskeleton.name+", P:"+JSON.stringify(joints[subskeleton.name].Position));
			definition += writeOffset(indent+2, offsetOfJointEnd(subskeleton, joints), parentOffset,self.INDENT_BY); // TODO: end sites for all children
			definition += isp2 +"}\n";
        } else {
			subskeleton.children().forEach((subskeleton2) => {
				definition += this.recursivelyCaptureLimbs(subskeleton2,joints, myOffset,indent+1);
			});
        }
        definition += isp +"}\n";

		return definition;
	}

	captureInitialJoints(frame : SkeletonFrame) {
		this.originalJoints = dictionarifyJoints(frame.Skeletons[0].Joints);
	}

	getBVHHeader() {
		if (!this.originalJoints) {
			throw new Error("You must call captureInitialJoints on a frame before you can write out the header with the initial state");
		}
		var joints = this.originalJoints;

		console.log("XXX "+ this.skeletonModel);
		var root = this.skeletonModel;
		var rootOffset = {X:0,Y:0,Z:0};

		var definition = "HIERARCHY\n";
		definition += this.recursivelyCaptureLimbs(root,joints, rootOffset,0);

		definition += "MOTION\n";
		definition += "Frames: " + this.goodFrames.length + "\n";
		definition += "Frame Time: .0083333\n";
		return definition;
	}


    recursivelyMoveJoints(subskeleton, joints, parentRotation?) {
		var definition = "";
		const self = this;
		if (!parentRotation) parentRotation = new THREE.Quaternion();
        let bones = subskeleton.translatedPoints();
        var rot;
        if (bones.length === 0) {
            return definition;
        } else if (bones.length ===1) {
            throw new Error("Bones have a minimum of two ends. "+subskeleton.name+" had none.");
        } else if (bones.length ===2) {
            let subsub = bones[0];
            rot = getRotationBetweenJoints(
                getJointVec(bones[0], bones[1], joints),
                getJointVec(bones[0], bones[1], this.originalJoints),
                parentRotation);
        } else if (bones.length >2) {
            let rot1 = getRotationBetweenJoints(
                getJointVec(bones[0], bones[1], joints),
                getJointVec(bones[0], bones[1], this.originalJoints),
                parentRotation);
            let rot2 = getRotationBetweenJoints(
                getJointVec(bones[0], bones[2], joints),
                getJointVec(bones[0], bones[2], this.originalJoints),
                parentRotation);
            let quat = new THREE.Quaternion();
            THREE.Quaternion.slerp(rot1.q, rot2.q,quat, 0.5);
        	var eul = new THREE.Euler();
        	eul.setFromQuaternion(quat, "ZXY");

        	var globalRotation = new THREE.Quaternion();
            if (parentRotation) {
               globalRotation.copy(parentRotation);
            }
        	globalRotation.multiply(quat);
            rot = {x: eul._x, y: eul._y, z: eul._z, globalRotation:globalRotation};
        } else {

        }

        console.log("Three for sub "+subskeleton.name);
        var angleMult = 180/Math.PI; // really?
        definition += angleMult * rot.y + " " + angleMult * rot.x + " " + angleMult * rot.z + " ";
        definition = subskeleton.children().reduce((def, subsub) => {
            return def + self.recursivelyMoveJoints(subsub, joints, rot.globalRotation);
        }, definition);
        return definition;
    }

	convert (frame) {
		if (frame.Skeletons.length <1) return undefined;
		var joints = dictionarifyJoints(frame.Skeletons[0].Joints);
        // initial position of root doesn't change (yet)
		var newFrame = "0 0 0 "+this.recursivelyMoveJoints(this.skeletonModel, joints);
		this.goodFrames.push(newFrame);
		return newFrame;
	}

	getBVH() {
		return this.getBVHHeader() + this.goodFrames.join("\n");
	}
}


// Utility functions


function offsetOfJoint(subskeleton : SkeletonModel, joints: JointMap) : KinectVector {
    let searchPoint : string = subskeleton.translatedPoints()[0];
    if (!joints[searchPoint]) throw new Error("Joint map does not contain joint "+ searchPoint + " for skeleton "+subskeleton.name);
    return joints[searchPoint].Position;
}

function offsetOfJointEnd(subskeleton : SkeletonModel, joints: JointMap) : KinectVector {
    // TODO: fill out for all points
    let searchPoint : string = subskeleton.translatedPoints()[1];
    if (!joints[searchPoint]) throw new Error("Joint map does not contain joint "+ searchPoint + " for skeleton "+subskeleton.name);
    return joints[searchPoint].Position;
}

function writeOffset(indent, position,parentPosition, indentString) {
	if (!indentString) {
		indentString = parentPosition;
		parentPosition = {X:0,Y:0,Z:0};
	}
	return indentString.repeat(indent) + "OFFSET "+
		(position.X-parentPosition.X)+ " "+
		(position.Y-parentPosition.Y)+ " "+
		(position.Z-parentPosition.Z)+"\n";
}

function getNormalVec (jointStart, jointEnd1, jointEnd2, jointDictionary) {
    let vec1 = getJointVec(jointStart, jointEnd1, jointDictionary);
    let vec2 = getJointVec(jointStart, jointEnd2, jointDictionary);
    var norm = new THREE.Vector3();
    norm.crossVectors(vec1, vec2);
    console.log("Vec1: "+JSON.stringify(vec1));
    console.log("Vec2: "+JSON.stringify(vec2));
    console.log("Norm: "+JSON.stringify(norm));
    return norm.normalize();
}

function getJointVec (jointStart: string, jointEnd: string, jointDictionary: JointMap) {
    if (!jointDictionary[jointStart]) throw new Error("Start joint "+jointStart+" does not exist");
    if (!jointDictionary[jointEnd]) throw new Error("End joint "+jointEnd+" does not exist");
	let posStart = jointDictionary[jointStart].Position;
	let posEnd = jointDictionary[jointEnd].Position;
	var jointVec = new THREE.Vector3(posEnd.X-posStart.X, posEnd.Y-posStart.Y, posEnd.Z-posStart.Z).normalize();

	//console.log(jointStart + " -> " + jointEnd + " = " +jointVec);
	return jointVec.normalize();
}


function dictionarifyJoints(joints : Array<KinectJoint>) : JointMap {
	var jointDictionary = {};
	joints.forEach(function(joint) {
		jointDictionary[joint.JointType] = joint;
	});
	return jointDictionary;
}


var getRotationBetweenJoints = function(threeJointOriginal_in, threeJoint1_in, parentRotation) {
	if (!threeJointOriginal_in) throw new Error("No orig");
	if (!threeJoint1_in) throw new Error("No 1");

	// rotate joint1 by -parentRotation, so that it is in the same reference frame
	// as jointOriginal would have been

	var threeJoint1 = new THREE.Vector3();
	threeJoint1.copy(threeJoint1_in);
	var threeJointOriginal = new THREE.Vector3();
	threeJointOriginal.copy(threeJointOriginal_in);
	threeJoint1.applyQuaternion(parentRotation.inverse());

	// get a quaternion representing the angle between the two joints

	var quat = new THREE.Quaternion();
	quat.setFromUnitVectors(threeJointOriginal, threeJoint1);

	// convert the vector to x, y, z rotations

	var eul = new THREE.Euler();
	eul.setFromQuaternion(quat, "ZXY");

	// add our new rotation to the parent rotation, so that we know where children
	// are going to be rotated to

	var globalRotation = new THREE.Quaternion();
    if (parentRotation) {
       globalRotation.copy(parentRotation);
    }
	globalRotation.multiply(quat);

	return {x:eul._x,y:eul._y,z:eul._z,q:quat,globalRotation:globalRotation};
};
