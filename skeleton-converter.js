// jshint esversion: 6

const THREE = require('three');

class SkeletonConverter {
	constructor(options) {
		this.INDENT_BY = "  ";
		this.skeletonModel = options.skeletonModel;
		this.goodFrames = [];
	}

	/**
	 * Conceptually, BVH defines the limbs while Kinect defines the start and end points,
	 * so we use two subskeletons and the joint between them
	 * we should have three cases: Root, endsite, and other.
	 */
	recursivelyCaptureLimbs(subskeleton1, subskeleton2, joints, parentOffset, indent, isRoot) {
		var isp = this.INDENT_BY.repeat(indent);
		var isp2 = this.INDENT_BY.repeat(indent+1);
		var definition = "";
		const self = this;
		console.log("capturing "+ subskeleton1.name);
		if (subskeleton1 === null) {
			// this is the root
			// Note that we need to go into reverse as well as forward for the root (see above)
			definition += "ROOT "+subskeleton2.translatedName()+"\n";
			definition += "{\n";
			definition += writeOffset(1, {X:0,Y:0,Z:0}, {X:0,Y:0,Z:0},this.INDENT_BY);
			definition += "  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n";
			subskeleton2.children().forEach((subskeleton3) => {
				definition += this.recursivelyCaptureLimbs(subskeleton2, subskeleton3,joints, joints[subskeleton2.name].Position,2);
			});
			definition += "}\n";
		} else if (subskeleton2 === null) {
			definition += isp +"End Site\n";
			definition += isp +"{\n";
			console.log("J:"+subskeleton1.name+", P:"+JSON.stringify(joints[subskeleton1.name].Position));
			definition += writeOffset(indent+1, joints[subskeleton1.name].Position, parentOffset,self.INDENT_BY);
			definition += isp +"}\n";
		} else {
			definition += isp+"JOINT "+subskeleton2.translatedName() + "\n";
			definition += isp +"{\n";
			definition += writeOffset(indent+1, joints[subskeleton2.name].Position, parentOffset,self.INDENT_BY);
			definition += isp2 + "CHANNELS 3 Zrotation Xrotation Yrotation\n";
			if (subskeleton2.isEndSite()) {
				definition += self.recursivelyCaptureLimbs(subskeleton2,null, joints, joints[subskeleton1.name].Position, indent +1);
			}
			subskeleton2.children().forEach(function(subskeleton3) {
				definition += self.recursivelyCaptureLimbs(subskeleton2,subskeleton3, joints, joints[subskeleton2.name].Position, indent +1);
			});
			definition += isp +"}\n";
		}
		return definition;
	}

	captureInitialJoints(frame) {
		this.originalJoints = dictionarifyJoints(frame.Skeletons[0].Joints);
	}

	getBVHHeader() {
		if (!this.originalJoints) {
			throw new Error("You must call captureInitialJoints on a frame before you can write out the header with the initial state");
		}
		var joints = this.originalJoints;

		console.log("XXX "+ this.skeletonModel);
		var root = this.skeletonModel;
		var rootOffset = joints[root.name].Position;

		var definition = "HIERARCHY\n";
		definition += this.recursivelyCaptureLimbs(root,null,joints, rootOffset,2);

		definition += "MOTION\n";
		definition += "Frames: " + this.goodFrames.length + "\n";
		definition += "Frame Time: .0083333\n";
		return definition;
	}

	recursivelyMoveJoints (frameJoints, subskeleton, subSkeletonStartJoint, parentRotation) {
		var definition = "";
		const self = this;
		if (!parentRotation) parentRotation = new THREE.Quaternion();
		if (subSkeletonStartJoint) {
			// The root joint has no reference position to rotate from.
			// This is like saying < rotating to > is not a global rotation of 180 but
			// only the rotation of its composite lines by 180. it might be a bad idea
			var rot = getRotationBetweenJoints(
				getJointVec(subSkeletonStartJoint.name, subskeleton.name, frameJoints),
				getJointVec(subSkeletonStartJoint.name, subskeleton.name, this.originalJoints),
				parentRotation);
			var angleMult = 180/Math.PI; // really?
			definition += angleMult * rot.y + " " + angleMult * rot.x + " " + angleMult * rot.z + " ";
		} else {
			// TODO: translate the root joint, even though we're not rotating it
			definition += "0 0 0 ";
		}
		subskeleton.children().forEach(function(subsub) {
			definition += self.recursivelyMoveJoints(frameJoints, subsub, subskeleton, rot ? rot.globalRotation : parentRotation);
		});

		return definition;
	}


	convert (frame) {
		if (frame.Skeletons.length <1) return undefined;
		var joints = dictionarifyJoints(frame.Skeletons[0].Joints);
		var newFrame = this.recursivelyMoveJoints(joints, this.skeletonModel);
		this.goodFrames.push(newFrame);
		return newFrame;
	}

	getBVH() {
		return this.getBVHHeader() + this.goodFrames.join("\n");
	}
}

module.exports = SkeletonConverter;

// Utility functions


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

function getJointVec (jointStart, jointEnd, jointDictionary) {
	var posStart = jointDictionary[jointStart].Position;
	var posEnd = jointDictionary[jointEnd].Position;
	var jointVec = new THREE.Vector3(posEnd.X-posStart.X, posEnd.Y-posStart.Y, posEnd.Z-posStart.Z).normalize();

	//console.log(jointStart + " -> " + jointEnd + " = " +jointVec);
	return jointVec.normalize();
}


function dictionarifyJoints(joints) {
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
	globalRotation.copy(parentRotation);
	globalRotation.multiply(quat);

	return {x:eul._x,y:eul._y,z:eul._z,globalRotation:globalRotation};
};
