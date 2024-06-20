import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
const DATABASEURL = process.env.DATABASEURL || "";
const JWT_SECRET = process.env.JWT_SECRET || "";


const appConstants = {  
    PORT,
    DATABASEURL,
    JWT_SECRET,
}

export default appConstants;