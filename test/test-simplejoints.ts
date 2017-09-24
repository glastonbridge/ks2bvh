// jshint esversion: 6

import TwoJointSkeletonModel from './two-joint-skeleton-model';
import MultiJointSkeletonModel from './multi-joint-skeleton-model';
import SkeletonConverter from '../build/SkeletonConverter';
import SkeletonModel from '../build/SkeletonModel';
import assert = require('assert');

describe('Convert', function() {
  it('should convert a rotation about 90 degrees to euclidian form', function() {
		let skeletonModel : SkeletonModel = new TwoJointSkeletonModel();
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
0 0 0 0 0 0 \n`+
"0 0 0 0 0 -89.99999999999999 "; // if this looks weird, it's because atom (quite sensibly) trims trailing whitespace

		assert.equal(simpleBVHFile,bvhString);
  });


  it('should convert a rotation with several joints to an average of their euclidian position', function() {
		let skeletonModel = new MultiJointSkeletonModel();
		let converter = new SkeletonConverter({skeletonModel: skeletonModel});
        // rotate body 90 degree turn
		let jsonSkeletons = [{
			Skeletons: [{Joints: [{
				JointType: "shoulder", Position: {"X":0.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "LeftArm", Position: {"X":-1.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "LeftHand", Position: {"X":-1.0,"Y":1.0,"Z":0.0}
			},{
				JointType: "RightArm", Position: {"X":1.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "RightHand", Position: {"X":1.0,"Y":1.0,"Z":0.0}
			}]}]
		},{
			Skeletons: [{Joints: [{
				JointType: "shoulder", Position: {"X":0.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "LeftArm", Position: {"X":0.0,"Y":0.0,"Z":1.0}
			},{
				JointType: "LeftHand", Position: {"X":0.0,"Y":1.0,"Z":1.0}
			},{
				JointType: "RightArm", Position: {"X":0.0,"Y":0.0,"Z":-1.0}
			},{
				JointType: "RightHand", Position: {"X":0.0,"Y":1.0,"Z":-1.0}
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
    JOINT LeftArm
    {
      OFFSET -1 0 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      End Site
      {
        OFFSET 0 1 0
      }
    }
    JOINT RightArm
    {
      OFFSET 1 0 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      End Site
      {
        OFFSET 0 1 0
      }
    }
}\n` +
`MOTION
Frames: 2
Frame Time: .0083333
0 0 0 0 0 0 0 0 0 0 0 0 \n` +
`0 0 0 -89.99999999999999 0 0 0 0 0 0 0 0 `;

		assert.equal(simpleBVHFile,bvhString);
  });
});
