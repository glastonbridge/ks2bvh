
export interface SkeletonConfiguration {
    name : string,
    jointTranslator: (name: string)=>Array<string>,
    tree: object,
    rootLimb : string,
    jointRotationAxes: {[joint: string] : string},
    getDefaultJointDefaultPoseDirection: ()=>Vector3
}

// There are two other definitions of Vector3
// The one in KinectTypes is strictly for defining Microsoft-style vectors (capital X Y Z)
// There is also THREE.js vectors, which are a more heavyweight class (though it should implement this type if necessary)
export interface Vector3 {
    x: number,
    y: number,
    z: number
}

/**
 * skeletonConfiguration.tree should be an object tree in the format {limbName: {childLimbName1: {...}}}
 * Note that the Kinect skeleton format is interested primarily
 * in JOINTS (vertices), whereas the BVH is interested in LIMBS (edges).
 * A BVH limb starts at its offset relative to its parent, and is extended to
 * the offset of its child, or to an end site.
 *
 * Note to self: originally the internal format was based on the source Kinect data, but I decided
 * that with more complex transforms it would be simpler to traverse the destination skeleton,
 * and treat the input Kinect skeleton as viable data.
 */
export default class SkeletonModel {
    name: string;
    rootLimb: string;
    tree: object;
    jointTranslator: (string)=>Array<string>;
    jointRotationAxes: {[joint:string] : string};
    getDefaultJointDefaultPoseDirection: () => Vector3;
	constructor(skeletonConfiguration : SkeletonConfiguration) {
        Object.keys(skeletonConfiguration).forEach((k)=> {
            this[k] = skeletonConfiguration[k];
        });
	}
	getSubSkeleton(jointName) {
		if (!this.tree[jointName]) {
			return undefined;
		}
		return new SkeletonModel({
			name:jointName,
			tree: this.tree[jointName],
			jointTranslator: this.jointTranslator,
            rootLimb: this.rootLimb,
            jointRotationAxes: this.jointRotationAxes,
            getDefaultJointDefaultPoseDirection: this.getDefaultJointDefaultPoseDirection
		});
	}
	translatedPoints() {
		return this.jointTranslator(this.name);
	}
	children() {
		const parent = this;
		return this.getChildNames().map(function(j) {return parent.getSubSkeleton(j)});
	}

	getChildNames() : string[] {
		return Object.keys(this.tree);
	}

    getRotationAxes() : string {
        return this.name in this.jointRotationAxes ? this.jointRotationAxes[this.name] : "XYZ";
    }

	isEndSite() {
		return Object.keys(this.tree).length == 0;
	}
    isRoot() {
        return this.name == this.rootLimb;
    }


}

const defaultJointDefaultPoseDirection = function() : Vector3 {
        return {x:0,y:0,z:0}; // Default pose direction is nowhere! Subclass this
    }
