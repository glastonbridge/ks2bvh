
export interface SkeletonConfiguration {
    name : string,
    jointTranslator: (name: string)=>Array<string>,
    tree: object
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
    tree: object;
    jointTranslator: (string)=>Array<string>;
	constructor(skeletonConfiguration : SkeletonConfiguration) {
		this.name = skeletonConfiguration.name;
		this.tree = skeletonConfiguration.tree || {};
		this.jointTranslator = skeletonConfiguration.jointTranslator;
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
	translatedPoints() {
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
