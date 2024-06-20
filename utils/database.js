import mongoose from "mongoose";
import appConstants from "../constants/index.js";


  const DATABASEURL = appConstants.DATABASEURL;

  let connected = false;


  const connectDb = async () => {
    
    if(!DATABASEURL) {
        throw new Error("No database url");
    }

    mongoose.set("strictQuery", true);

    if(connected) {
        console.log("Connection already established")
        return;
    }
  
      try {
          mongoose.connect(DATABASEURL);
          connected = true;
          console.log("Database connected established")
      } catch (error) {
          throw new Error("Error: ", error);
      } finally {
      }
  }


  export default connectDb;