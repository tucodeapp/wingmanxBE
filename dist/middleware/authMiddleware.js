"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = require("../models/userModel");
const validateEnv_1 = __importDefault(require("../utils/validateEnv"));
exports.protect = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, validateEnv_1.default.JWT_SECRET);
            // Get user from token
            //@ts-ignore
            req.user = await userModel_1.UserSchema.findById(decoded.id).select("-password");
            next();
        }
        catch (error) {
            console.log(error);
            res.status(401).json({
                success: false,
                message: "Not authorised",
            });
        }
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Not authorised. No token",
        });
    }
});
