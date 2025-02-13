import express from 'express';
import { createServer } from 'node:http';
import { connectToSocket } from './controllers/socketManeger.js';
import mongoose from 'mongoose';
import cors from 'cors';


import dotenv from 'dotenv';

dotenv.config();

import userRoutes from './routes/users.routes.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8080));
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRoutes);


app.get('/', (req, res) => {
    res.send("hello");
});

// console.log(process.env.MONGO_URL);

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MONGO CONNECTED: host: ${connectionDb.connection.host}`);
        
        server.listen(app.get("port"), () => {
            console.log(`Server listening on port ${app.get("port")}`);
        });

    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}
start();