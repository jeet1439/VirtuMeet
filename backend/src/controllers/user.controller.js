import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from 'dotenv';
dotenv.config();

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide username and password" });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: "1h" });

        user.token = token;
        await user.save();

        res.status(httpStatus.OK).json({ message: "Login successful", token });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
    }
};


const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required" });
  }

  try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
          name,
          username,
          password: hashedPassword
      });

      await newUser.save();

      res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
  } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${error.message}` });
  }
};

export { login, register };