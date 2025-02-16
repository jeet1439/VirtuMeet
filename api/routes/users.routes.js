import { Router } from "express";
import { login, register, verifyOTP } from "../controllers/user.controller.js";
const router = Router();

router.route('/login').post(login)
router.route("/register").post(register)
router.route("/verify-otp").post(verifyOTP)
router.route("/add_to_activity")
router.route("/get_all_activity")

export default router;