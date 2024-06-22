import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
const DATABASEURL = process.env.DATABASEURL || "";
const JWT_SECRET = process.env.JWT_SECRET || "";

// COOKIES TIMEOUT
const ACCESS_TOKEN_COOKIES_TIMEOUT = 24 * 60 * 60 * 1000;         // In milliseconds 24 hours
const REFRESH_TOKEN_COOKIES_TIMEOUT = 7 * 24 * 60 * 60 * 1000;   // In milliseconds 7days

// JWT TIMEOUT
const JWT_ACCESS_TOKEN_TIMEOUT = '24h'; // In Minutes 24hours
const JWT_REFRESH_TOKEN_TIMEOUT = '7d'; // In Minutes 7days

// JWT SECRETS
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "";
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || "";

const appConstants = {  
    PORT,
    DATABASEURL,
    JWT_SECRET,

    REFRESH_TOKEN_COOKIES_TIMEOUT,
    ACCESS_TOKEN_COOKIES_TIMEOUT,

    JWT_ACCESS_TOKEN_TIMEOUT,
    JWT_REFRESH_TOKEN_TIMEOUT,

    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,

    
}

export default appConstants;