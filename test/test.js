// jshint esversion: 6

const SimpleSkeletonModel = require('../simple-skeleton-model');
const SkeletonConverter = require('../skeleton-converter');
const assert = require('assert');
describe('Convert', function() {
  it('should convert a rotation about 90 degrees to euclidian form', function() {
		let skeletonModel = new SimpleSkeletonModel();
		let converter = new SkeletonConverter({skeletonModel: skeletonModel});
		let jsonSkeletons = [{
			Skeletons: [{Joints: [{
				JointType: "shoulder", Position: {"X":0.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "hand", Position: {"X":1.0,"Y":0.0,"Z":0.0}
			}]}]
		},{
			Skeletons: [{Joints: [{
				JointType: "shoulder", Position: {"X":0.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "hand", Position: {"X":0.0,"Y":1.0,"Z":0.0}
			}]}]
		}];
		converter.captureInitialJoints(jsonSkeletons[0]);
		for (var i = 0; i < jsonSkeletons.length; ++i) {
			converter.convert(jsonSkeletons[i]);
		}

const bvhString = converter.getBVH();
console.log(bvhString);

		const simpleBVHFile =
`HIERARCHY
ROOT shoulder
{
  OFFSET 0 0 0
  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
    End Site
    {
      OFFSET 1 0 0
    }
}
MOTION
Frames: 2
Frame Time: .0083333
0 0 0 0 0 0 `+
"\n0 0 0 0 0 -89.99999999999999 "; // if this looks weird, it's because atom (quite sensibly) trims trailing whitespace

		assert.equal(simpleBVHFile,bvhString);
  });
});
