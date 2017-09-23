"use strict";
// jshint esversion: 6
Object.defineProperty(exports, "__esModule", { value: true });
const SkeletonModel_1 = require("../build/SkeletonModel");
/**
 * A simplified kinectJSON model for testing
 */
class TwoJointSkeletonModel extends SkeletonModel_1.default {
    constructor() {
        super({
            name: "shoulder",
            tree: { "hand": {} },
            jointTranslator: function (name) { return name; }
        });
    }
}
exports.default = TwoJointSkeletonModel;
//# sourceMappingURL=two-joint-skeleton-model.js.map