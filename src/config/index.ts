import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "config.env" });

export const mongoUser: string = process.env.MONGO_USER as string;
export const emailName: string = process.env.FROM_NAME as string;
export const fromEmail: string = process.env.FROM_EMAIL as string;
export const mongoPwd: string = process.env.MONGO_PASSWORD as string;
export const dbName: string = process.env.DB_NAME as string;
export const mongoUri: string = process.env.MONGO_URI as string;
export const prodMongoUri: string = process.env.MONGO_URI_PROD as string;
export const port: number | string = process.env.PORT as string;
export const googleClientId: string = process.env.GOOGLE_CLIENT_ID as string;
export const googleClientSecret: string = process.env
  .GOOGLE_CLIENT_SECRET as string;
export const nodeEnv: "dev" | "prod" =
  (process.env.NODE_ENV as "dev" | "prod") ?? "dev";
export const frontendUrl: string = process.env.FRONTEND_URL as string;
export const accessKeyId: string = process.env.ACCESS_KEY_ID as string;
export const secretAccessKey: string = process.env.SECRET_ACCESS_KEY as string;
export const region: string = process.env.REGION as string;
