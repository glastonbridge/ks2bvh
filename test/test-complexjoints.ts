import {  test } from "mocha-typescript";

require("source-map-support").install();

import ComplexJointSkeletonModel from './complexjoint-skeleton-model';
import SkeletonConverter from '../build/SkeletonConverter';
import {SkeletonFrame} from "../build/KinectTypes";
import * as assert from "assert";

describe('Convert', () => {
  xit('should convert a rotation with several joints to an average of their euclidian position', function() {
		let skeletonModel = new ComplexJointSkeletonModel();
		let converter = new SkeletonConverter({skeletonModel: skeletonModel});
        // rotate body 90 degree turn
		let jsonSkeletons : Array<SkeletonFrame> = [{
			Skeletons: [{Joints: [{
				JointType: "SpineBottom", Position: {"X":0.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "LeftHip", Position: {"X":-1.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "RightHip", Position: {"X":1.0,"Y":0.0,"Z":0.0}
			},{
				JointType: "SpineTop", Position: {"X":0.0,"Y":1.0,"Z":0.0}
			},{
				JointType: "LeftKnee", Position: {"X":-1.0,"Y":-1.0,"Z":0.0}
			},{
				JointType: "RightKnee", Position: {"X":1.0,"Y":-1.0,"Z":0.0}
			}]}]
		},{
            Skeletons: [{Joints: [{
                JointType: "SpineBottom", Position: {"X":0.0,"Y":0.0,"Z":0.0}
            },{
                JointType: "LeftHip", Position: {"X":-1.0,"Y":0.0,"Z":0.0}
            },{
                JointType: "RightHip", Position: {"X":1.0,"Y":0.0,"Z":0.0}
            },{
                JointType: "SpineTop", Position: {"X":0.0,"Y":1.0,"Z":0.0}
            },{
                JointType: "LeftKnee", Position: {"X":-1.0,"Y":-1.0,"Z":0.0}
            },{
                JointType: "RightKnee", Position: {"X":1.0,"Y":-1.0,"Z":0.0}
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
ROOT SpineBottom
{
  OFFSET 0 0 0
  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
  JOINT Hips
  {
    OFFSET 0 0 0
    CHANNELS 3 Zrotation Xrotation Yrotation
    JOINT LeftHip
    {
      OFFSET -1 0 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      End Site
      {
        OFFSET 0 -1 0
      }
    }
    JOINT RightHip
    {
      OFFSET 1 0 0
      CHANNELS 3 Zrotation Xrotation Yrotation
      End Site
      {
        OFFSET 0 -1 0
      }
    }
  }
  JOINT Spine
  {
    CHANNELS 3 Zrotation Xrotation Yrotation
    OFFSET 0 0 0
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
