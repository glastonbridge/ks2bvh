
export interface KinectVector {
    X: number;
    Y: number;
    Z: number;
}

export interface KinectJoint {
    Position: KinectVector;
    [others: string] : any;
}

export interface KinectSkeleton {
        Joints: Array<KinectJoint>;
}

export interface SkeletonFrame {
    Skeletons: Array<KinectSkeleton>;
}
