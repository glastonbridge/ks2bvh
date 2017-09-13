// jshint esversion: 6

const THREE = require('three');
const RotationalFrame = require('./rotational-skeleton-frame');

class SkeletonConverter {
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
	recursivelyCaptureLimbs(parent, subskeleton, joints, parentOffset, indent) {
		var isp = this.INDENT_BY.repeat(indent);
		var isp2 = this.INDENT_BY.repeat(indent+1);
		var definition = "";
		const self = this;
		if (parent === null) {
			// this is the root
			// Note that we need to go into reverse as well as forward for the root (see above)
			definition += "ROOT "+subskeleton.translatedName()+"\n";
			definition += "{\n";
			definition += writeOffset(1, {X:0,Y:0,Z:0}, {X:0,Y:0,Z:0},this.INDENT_BY);
			definition += "  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n";
			subskeleton.children().forEach((subskeleton2) => {
				definition += this.recursivelyCaptureLimbs(subskeleton, subskeleton2,joints, joints[subskeleton.name].Position,2);
			});
			definition += "}\n";
		} else if (subskeleton.isEndSite()) {
			definition += isp +"End Site\n";
			definition += isp +"{\n";
			console.log("EndSite:"+subskeleton.name+", P:"+JSON.stringify(joints[subskeleton.name].Position));
			definition += writeOffset(indent+1, joints[subskeleton.name].Position, parentOffset,self.INDENT_BY);
			definition += isp +"}\n";
		} else {
			definition += isp+"JOINT "+subskeleton.translatedName() + "\n";
			definition += isp +"{\n";
			definition += writeOffset(indent+1, joints[subskeleton.name].Position, parentOffset,self.INDENT_BY);
			definition += isp2 + "CHANNELS 3 Zrotation Xrotation Yrotation\n";
			subskeleton.children().forEach(function(subskeleton2) {
				definition += self.recursivelyCaptureLimbs(subskeleton,subskeleton2, joints, joints[subskeleton.name].Position, indent +1);
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
		definition += this.recursivelyCaptureLimbs(null,root,joints, rootOffset,2);

		definition += "MOTION\n";
		definition += "Frames: " + this.goodFrames.length + "\n";
		definition += "Frame Time: .0083333\n";
		return definition;
	}


    recursivelyMoveJoints(subskeleton, joints, parentRotation) {
		var definition = "";
		const self = this;
		if (!parentRotation) parentRotation = new THREE.Quaternion();
        let children = subskeleton.children();
        var rot;
        if (children.length === 0) {
            return definition;
        } else if (children.length ===1) {
            let subsub = children[0];
            rot = getRotationBetweenJoints(
                getJointVec(subskeleton.name, subsub.name, joints),
                getJointVec(subskeleton.name, subsub.name, this.originalJoints),
                parentRotation);
        } else if (children.length >=2) {
            let rot1 = getRotationBetweenJoints(
                getJointVec(subskeleton.name, children[0].name, joints),
                getJointVec(subskeleton.name, children[0].name, this.originalJoints),
                parentRotation);
            let rot2 = getRotationBetweenJoints(
                getJointVec(subskeleton.name, children[1].name, joints),
                getJointVec(subskeleton.name, children[1].name, this.originalJoints),
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
            //throw new Error("A subskeleton can have 0, 1, or 2 children. Subskeleton \""+subskeleton.name+"\" had "+children.length);
        }

        console.log("Three for sub "+subskeleton.name);
        var angleMult = 180/Math.PI; // really?
        definition += angleMult * rot.y + " " + angleMult * rot.x + " " + angleMult * rot.z + " ";
        definition = children.reduce((def, subsub) => {
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

function getJointVec (jointStart, jointEnd, jointDictionary) {
	let posStart = jointDictionary[jointStart].Position;
	let posEnd = jointDictionary[jointEnd].Position;
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
    if (parentRotation) {
       globalRotation.copy(parentRotation);
    }
	globalRotation.multiply(quat);

	return {x:eul._x,y:eul._y,z:eul._z,q:quat,globalRotation:globalRotation};
};
