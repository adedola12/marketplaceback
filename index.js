import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import productRouter from "./routes/product.route.js";
import reviewRouter from "./routes/review.route.js";
import cors from "cors";
import connectDb from "./utils/database.js";
import appConstants from "./constants/index.js";
import path from "path";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://adlmmarketplace-git-main-adedola12s-projects.vercel.app",
  "https://www.adlmstudio.net",
  "https://accounts.google.com",
  "https://mernsite.firebaseapp.com",
];

// const corsOptions = {
//   origin: (origin, callback) => {

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// };

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://adlmmarketplace.vercel.app",
      "https://www.adlmstudio.net",
      "https://accounts.google.com",
      "https://mernsite.firebaseapp.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Origin",
      "X-Requested-With",
      "Accept",
      "x-client-key",
      "x-client-token",
      "x-client-secret",
      "Authorization",
    ],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/product", productRouter);
app.use("/api/review", reviewRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./../client/dist/index.html"));
// });

// START APPLICATION
connectDb()
  .then(() => {
    app.listen(process.env.PORT || appConstants.PORT, () => {
      console.log(`Server Running on port: ${appConstants.PORT}`);
    });
  })
  .catch((error) => console.log(error));
