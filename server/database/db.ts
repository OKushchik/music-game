import mongoose from "mongoose";
import {env} from "../utils/configService";

const connectToDB = async (): Promise<void> => {
  try {
    const mongoUri = env.MONGO_DB_KEY;
    if (!mongoUri) {
      throw new Error("MONGO_DB_KEY is not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("mongodb is connected successfully !");
  } catch (error) {
    console.error("Mongodb connection failed", error);
    process.exit(1);
  }
};

export default connectToDB;

