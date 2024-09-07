"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/register", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.post("/forgetPassword", userController_1.forgetPassword);
router.post("/reset-password/:token", userController_1.resetPassword);
router.get("/confirm-email/:token", userController_1.confirmEmail);
router.get("/currentUser", authMiddleware_1.protect, userController_1.getCurrentUser);
exports.default = router;
