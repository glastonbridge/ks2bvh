KinectJson to BVH converter
===

A script intended to be used with [KinectJson](https://github.com/readysaltedcode/art-of-computer-science/tree/master/KinectJSON)

Very very early access alpha code. Produced By Alex Shaw at Glastonbridge for the Pain[Byte] ballet's VR component, produced by Genevieve Smith-Nunes of [ReadySaltedCode](http://readysaltedcode.org/).

Written using node, TypeScript and THREE.js

Prerequisites
---
There's no nice installer yet, so you'll have to just go ahead
1. install [nodejs](https://nodejs.org)
2. clone this git repository
3. in the repository's root directory, type `npm install`

Usage
---
1. Use the `slurp.html` provided with KinectJson to generate some JSON mocap. Save its output to `somemocap.json` in the `ks2bvh` directory
2. run the script in the `ks2bvh` directory by invoking `node convert_exe.js somemocap.json somemocap.bvh`
3. you now have a file `somemocap.bvh` that you can use with Blender or other software packages
