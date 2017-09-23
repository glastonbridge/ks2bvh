
export interface SkeletonConfiguration {
    name : string,
    jointTranslator: Function,
    tree: object,
    rootLimb: string
}

/**
 * skeletonConfiguration.tree should be an object tree in the format {limbName: {childLimbName1: {...}}}
 * Note that the internal skeleton model is based on the Kinect format, which is interested primarily
 * in JOINTS (vertices), whereas the BVH is interested in LIMBS (edges)
 */
export default class SkeletonModel {
    name: string;
    tree: object;
    jointTranslator: Function;
    rootLimb: string;
	constructor(skeletonConfiguration) {
		if (!skeletonConfiguration || typeof skeletonConfiguration !== "object") {
			throw new Error("You must pass in a configuration object to SkeletonModel constructor");
		} else if (!skeletonConfiguration.name || typeof skeletonConfiguration.name !== 'string') {
			throw new Error("All skeletons must have a name string");
		} else if (!skeletonConfiguration.jointTranslator || typeof skeletonConfiguration.jointTranslator !== 'function') {
			throw new Error("All skeletons must specify a translation function for mapping joint names");
		}
		this.name = skeletonConfiguration.name;
		this.tree = skeletonConfiguration.tree || {};
		this.jointTranslator = skeletonConfiguration.jointTranslator;
		this.rootLimb = skeletonConfiguration.rootLimb;
	}
	getSubSkeleton(jointName) {
		if (!this.tree[jointName]) {
			return undefined;
		}
		return new SkeletonModel({
			name:jointName,
			tree: this.tree[jointName],
			jointTranslator: this.jointTranslator
		});
	}
	translatedName() {
		return this.jointTranslator(this.name);
	}
	children() {
		const parent = this;
		return this.getChildNames().map(function(j) {return parent.getSubSkeleton(j)});
	}

	getChildNames() {
		return Object.keys(this.tree);
	}

	isEndSite() {
		return Object.keys(this.tree).length == 0;
	}

}
