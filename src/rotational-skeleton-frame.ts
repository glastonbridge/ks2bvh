// jshint esversion: 6

//TODO: we never finished migrating to this way of working

const THREE = require('three');
import PositionalFrame from './positional-skeleton-frame';
import {KinectSkeleton} from "./KinectTypes";

export class RotationalFrame {
    private originalPosition : KinectSkeleton;
    private framePosition : KinectSkeleton;
    private parentRotation : any; // TODO: get a three.js type package
    private rotationQuaternion : any;
	constructor(originalPosition, framePosition, parentRotation) {
		if (!parentRotation) {
			parentRotation = new THREE.Quaternion();
		}
		this.originalPosition = originalPosition;
		this.framePosition = framePosition;
		this.parentRotation = new THREE.Quaternion();
		this.parentRotation.copy(parentRotation);
		//this.rotationQuaternion = this.getRotationQuaternion();
		//this.parentRotation.multiply(this.rotationQuaternion);
	}
/*
	getRotationQuaternion() {
		this.frameJointPosition.applyQuaternion(this.parentRotation.inverse());

		// get a quaternion representing the angle between the two joints

		var quat = new THREE.Quaternion();
		quat.setFromUnitVectors(
			this.originalPosition.getJointVec(),
		 	this.framePosition.getJointVec());

		return quat;

	}

	getRotationEuler() {

		var eul = new THREE.Euler();
		eul.setFromQuaternion(this.rotationQuaternion, "ZXY");
		return {x:eul._x,y:eul._y,z:eul._z};
	}

	children() {
		var children = this.skeletonModel.getChildNames();
		return children.map((name)=>{
			return new RotationalFrame(
				this.originalPosition.getChild(name),
				this.framePosition.getChild(name),
				this.parentRotation
			);
		});
	}
}

class SkeletonFrameFactory {
	constructor(skeletonModel,joints) {
		this.skeletonModel = skeletonModel;
		this.originalJoints = originalJoints;
	}
	getPositionalFrame(joints) {
		return new PositionalFrame(this.skeletonModel, joints);
	}
	getOriginalPositionalFrame() {
		return new PositionalFrame(this.skeletonModel, this.originalJoints);
	}
	getRotationalFrame(joints) {
		return new RotationalFrame(getOriginalPositionalFrame(), getPositionalFrame());
	}*/
}

//RotationalFrame.Factory = SkeletonFrameFactory;
