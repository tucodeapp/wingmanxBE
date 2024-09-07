"use strict";
//@ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmail = exports.resetPassword = exports.forgetPassword = exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = require("../models/userModel");
const nodemailer_1 = __importDefault(require("nodemailer"));
// @desc   Register new user
// @route  POST /api/users/register
// @access Public
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    // Validate information
    if (!name || !email || !password) {
        res.status(400).json({
            error: "Please add all necessary information!",
        });
    }
    // Check if user exits
    const userExists = yield userModel_1.UserSchema.findOne({ email });
    if (userExists) {
        res.status(400).json({
            message: "User already exists. Please try again",
            success: false,
        });
    }
    // Hash password
    const salt = yield bcrypt_1.default.genSalt(10);
    const hashedPassword = yield bcrypt_1.default.hash(password, salt);
    // Create user
    const user = yield userModel_1.UserSchema.create({
        name,
        email,
        password: hashedPassword,
    });
    if (user) {
        const token = generateToken(user._id);
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            success: true,
            message: "User has been created",
            token,
        });
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "arturasnetzet@gmail.com",
                pass: "vlbx bzaq paun bkkl",
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Please confirm your email",
            html: `<h1>Confirm your password</h1>
    <p>Click on the following link to Confirm your password:</p>
    <a href="http://localhost:5001/confirm-email/${token}">http://localhost:5001/confirm-email/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a confirm email, please ignore this email.</p>`,
        };
        try {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).send({ message: err.message });
                }
                res.status(200).send({
                    message: "Confirmation link sent to your email",
                    success: true,
                });
            });
        }
        catch (err) {
            res.status(500).send({ message: err.message });
        }
    }
    else {
        res.status(400).json({
            message: "Invalid user data. Please try again",
            success: false,
        });
    }
}));
// @desc   Authenticate a user
// @route  POST /api/users/login
// @access Public
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Check for user email
    const user = yield userModel_1.UserSchema.findOne({ email });
    if (user && (yield bcrypt_1.default.compare(password, user.password))) {
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            success: true,
            message: "Logged in successfully",
            token: generateToken(user._id),
        });
    }
    else {
        res.status(400).json({
            message: "Invalid credentials. Please try again",
            success: false,
        });
    }
}));
// @desc   Get user data
// @route  GET /api/users/currentUser
// @access Private
exports.getCurrentUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        success: true,
        user: req.user,
    });
}));
// Generate JWT
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
// @desc   Send a password reset link
// @route  POST /api/users/forgetPassword
// @access Public
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.UserSchema.findOne({ email });
    if (!user) {
        res.status(400).json({
            message: "No account associated with this email",
            success: false,
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: user === null || user === void 0 ? void 0 : user._id }, process.env.JWT_SECRET, {
        expiresIn: "10m",
    });
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: "arturasnetzet@gmail.com",
            pass: "vlbx bzaq paun bkkl",
        },
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Reset Password",
        html: `<h1>Reset Your Password</h1>
  <p>Click on the following link to reset your password:</p>
  <a href="http://localhost:5173/reset-password/${token}">http://localhost:5173/reset-password/${token}</a>
  <p>The link will expire in 10 minutes.</p>
  <p>If you didn't request a password reset, please ignore this email.</p>`,
    };
    try {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).send({ message: err.message });
            }
            res
                .status(200)
                .send({ message: "Reset link sent to your email", success: true });
        });
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
});
exports.forgetPassword = forgetPassword;
// @desc   Reset password
// @route  POST /api/users/resetPassword:token
// @access Private
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Logic for reset password
});
exports.resetPassword = resetPassword;
// @desc   Sent confirm email
// @route  GET /api/users/confirm-email/:token
// @access Public
const confirmEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = jsonwebtoken_1.default.verify(req.params.token, process.env.JWT_SECRET);
        const user = yield userModel_1.UserSchema.findByIdAndUpdate(id, { isVerified: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res
            .status(200)
            .json({ message: "Email confirmed successfully", success: true, user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
});
exports.confirmEmail = confirmEmail;
