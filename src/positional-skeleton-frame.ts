//jshint esversion:6

import THREE = require('three');
import SkeletonModel from "./SkeletonModel";
import {KinectJoint} from "./KinectTypes";

/**
 * Sample usage:
 *   var frame = SkeletonFrameFactory.getFrame(kinectFrame.Joints)
 *   function recurseFrame(subtree) {
 *     doSomethingWithRotation(subtree.getRotation());
 *     subtree.children().forEach((child) => {recurseFrame(child)});
 *   }
 *   recurseFrame(frame)
 */
export default class PositionalFrame {
    skeletonModel: SkeletonModel;
    frameJoints : Array<KinectJoint>;
	constructor(skeletonModel : SkeletonModel,frameJoints : Array<KinectJoint>) {
		this.skeletonModel = skeletonModel;
		this.frameJoints = frameJoints;
	}

	getJointDirection() {
		var vec = this.getAverageChildPosition();
		vec.sub(this.getJointPosition());
		vec.normalize();
		return vec;
	}

	getJointPosition() {
		var jointPosition = this.frameJoints[this.skeletonModel.name].Position;
		return new THREE.Vector3(
			jointPosition.X,
			jointPosition.Y,
			jointPosition.Z
		);
	}

	getAverageChildPosition() {
		if (this.skeletonModel.isEndSite()) {
			throw new Error("End site can't have a rotation");
		}
		var children = this.skeletonModel.children();
		var average = children.reduce((v, item) => {
			var jointPosition = this.frameJoints[this.skeletonModel.name].Position;
			v.add(new THREE.Vector3(jointPosition.X,jointPosition.Y,jointPosition.Z));
		}, THREE.Vector3());
		return average;
	}

	getChild(childName) {
		return new PositionalFrame(this.skeletonModel.getSubSkeleton(childName), this.frameJoints);
	}

	children() {
		var children = this.skeletonModel.children();
		return children.map((item)=>{
			return new PositionalFrame(item,this.frameJoints);
		});
	}


	getChildNames() {
		return this.skeletonModel.getChildNames();
	}
}
