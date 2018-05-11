import { SkeletonFrame, KinectVector, KinectJoint } from './KinectTypes';
import SkeletonModel from './SkeletonModel';
import { dictionarifyJoints, JointMap } from './Utils'

export class MeasuredFrame {
    [joint: string]: {
        jointType: string,
        sum: JointLengthsAcrossFrames
    }
}

export type SubJointLengths = Array<number>;
export type JointLengthsAcrossFrames = Array<SubJointLengths>;

function getDistanceBetweenJoints(jointStart: KinectVector, jointEnd: KinectVector) {
    return Math.sqrt(["X", "Y", "Z"].reduce((l, i) => {
        return l + Math.pow(jointEnd[i] - jointStart[i], 2);
    }, 0));
}

function recursivelyMeasureLimbs(subskeleton: SkeletonModel, joints: JointMap, measuredFrame: MeasuredFrame): void {
    let kinectNames = subskeleton.translatedPoints();
    let myOffset: KinectVector = joints[kinectNames[0]].Position;
    let myLengths: SubJointLengths = kinectNames.slice(1).map(joint => getDistanceBetweenJoints(myOffset, joints[joint].Position));
    if (measuredFrame[subskeleton.name]) {
        measuredFrame[subskeleton.name].sum.push(myLengths);
        //console.log("adding "+ myLengths);
        //console.log("measuredFrame " + measuredFrame[subskeleton.name].sum);
    } else {
        measuredFrame[subskeleton.name] = {
            sum: [myLengths],
            jointType: subskeleton.name
        };
    }
    subskeleton.children().forEach((subskeleton2) => {
        recursivelyMeasureLimbs(subskeleton2, joints, measuredFrame);
    });
}

function measure(skeletonModel: SkeletonModel, frame: SkeletonFrame, accumulator: MeasuredFrame) {
    recursivelyMeasureLimbs(skeletonModel, dictionarifyJoints(frame.Skeletons[0].Joints), accumulator);
}

export default function SkeletonRegulariser(skeletonModel: SkeletonModel, jsonSkeletons: Array<SkeletonFrame>) :SkeletonFrame {
    let measuredFrame = {};
    for (let i = 0; i < jsonSkeletons.length; ++i) {
        if (jsonSkeletons[i].Skeletons && jsonSkeletons[i].Skeletons.length > 0) {
            measure(skeletonModel,jsonSkeletons[i], measuredFrame);
        }
    }

    let limbLengths = Object.keys(measuredFrame).reduce((limbs, limbName) => {
        limbs[limbName] = removeOutliersAndAverage(measuredFrame[limbName].sum);
        return limbs;
    }, {});

    pairLeftsAndRights(limbLengths);

    Object.keys(limbLengths).forEach(limb => console.log("Limb " + limb + " is " + limbLengths[limb] + " long"));

    let initialFrame :SkeletonFrame = { Skeletons: [{Joints: reconstituteLimbs(skeletonModel, limbLengths)}] };
    return initialFrame;
}

const pairLeftsAndRights = function(limbs) {
    Object.keys(limbs).forEach((item) => {
        if (item.includes("Left")) {
            let rightem = item.replace("Left", "Right");
            let lhses = limbs[item];
            let rhses = limbs[rightem];
            if (lhses.length != rhses.length) {
                throw new Error("How is it possible that the number of items in " + item + " doesn't equal the number of items in " + rightem + "?");
            }
            let sums = [];
            for (let i = 0; i < lhses.length; ++i) {
                sums.push((lhses[i] + rhses[i]) / 2);
            }
            limbs[item] = sums;
            limbs[rightem] = sums;
        }
    });
};

const removeOutliersAndAverage = function(jointLengthsAcrossFrames) {
    //first, convert from a frame-by-frame array of subjoint arrays, to a subjoint-by-subjoint array of frame-by-frame arrays
    let frameLengthsAcrossSubJoints = jointLengthsAcrossFrames.reduce((acc, joint) => {
        joint.forEach((subjointLength, i) => {
            acc[i] ? acc[i].push(subjointLength) : acc[i] = [subjointLength];
            return acc;
        });
        return acc;
    }, []);
    let frameMeans = frameLengthsAcrossSubJoints.map(frames => {
        return frames.reduce((acc, length) => acc + length, 0) / frames.length;
    });
    let deviationOrdered = frameLengthsAcrossSubJoints.map((frames, sjI) => {
        return frames.sort((a, b) => Math.abs(a - frameMeans[sjI]) - Math.abs(b - frameMeans[sjI]));
    });
    deviationOrdered.forEach(subjoint => { return subjoint.splice(subjoint.length * 0.75); });
    let frameMeans2 = frameLengthsAcrossSubJoints.map(frames => {
        return frames.reduce((acc, length) => acc + length, 0) / frames.length;
    });
    return frameMeans2;
};

const sumOffsets = (a, b) : KinectVector => {
    return { X: a.X+b.X, Y: a.Y+b.Y, Z: a.Z+b.Z};
};

const multiplyVecByLength = (unitVec, length) => {
    return { X: unitVec.x * length, Y: unitVec.y * length, Z: unitVec.z * length };
};

function reconstituteLimbs(skeletonModel, measurements, offset?) {
    if (!offset) offset = { X: 0, Y: 0, Z: 0 };
    let kinectJoints = skeletonModel.translatedPoints();
    let directions = skeletonModel.getDefaultJointDefaultPoseDirection();
    let kinectData :Array<KinectJoint> = [{ jointType: kinectJoints[0], Position: offset }];
    console.log("directions is size "+directions.length);
    skeletonModel.children().forEach((subskeleton, i) => {
        console.log("subskeleton "+i+" is "+subskeleton.name);
        let newOffset = multiplyVecByLength(directions[i], measurements[subskeleton.name]);
        kinectData.concat(reconstituteLimbs(subskeleton, measurements, sumOffsets(offset, newOffset)));
    });
    if (skeletonModel.isEndSite()) {
        let newOffset = multiplyVecByLength(directions[0], measurements[skeletonModel.name]);
        kinectData.push({ jointType: kinectJoints[1], Position: sumOffsets(offset, newOffset) });
    }
    return kinectData;
};
