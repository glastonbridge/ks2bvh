import {KinectVector} from './KinectTypes';

/**
 * Get the 3D rotation of two 3D points, but ignoring one angle.
 * This allows us to simulate a 2-dimensional joint
 */
export default function AngleOn2DPlane(a : KinectVector, b : KinectVector, plane : string) : number {
    if (plane.length != 2 || plane.match(/^[XYZ]{2}$/) == null) {
        throw new Error("Please specify two components of XYZ in the plane string");
    }
    let a2 = plane.split("").map((i) => {return a[i]});
    let b2 = plane.split("").map((i) => {return b[i]});
    let ang_a : number = Math.atan2(a2[1],a2[0]);
    let ang_b : number = Math.atan2(b2[1],b2[0]);
    let ang = ang_b - ang_a;
    return ang;
}
