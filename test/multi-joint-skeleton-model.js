"use strict";
// jshint esversion: 6
Object.defineProperty(exports, "__esModule", { value: true });
const SkeletonModel_1 = require("../build/SkeletonModel");
/**
 * A simplified kinectJSON model for testing
 */
class MultiJointSkeletonModel extends SkeletonModel_1.default {
    constructor() {
        super({
            name: "shoulder",
            tree: { "LeftArm": { "LeftHand": {} }, "RightArm": { "RightHand": {} } },
            jointTranslator: function (name) { return name; }
        });
    }
}
exports.default = MultiJointSkeletonModel;
//# sourceMappingURL=multi-joint-skeleton-model.js.map