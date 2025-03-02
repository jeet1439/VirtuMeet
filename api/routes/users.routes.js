import { Router } from "express";
import { login, register, verifyOTP, signout } from "../controllers/user.controller.js";
const router = Router();

router.route('/login').post(login)
router.route("/register").post(register)
router.route("/verify-otp").post(verifyOTP)
router.route('/signout').post(signout);

export default router;