"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/', projectController_1.getProjects);
router.get('/:id', projectController_1.getProjectById);
router.post('/', authMiddleware_1.protect, projectController_1.createProject);
router.put('/:id/like', authMiddleware_1.protect, projectController_1.likeProject);
router.post('/:id/comment', authMiddleware_1.protect, projectController_1.commentProject);
exports.default = router;
