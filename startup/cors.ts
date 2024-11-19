import cors from "cors";
import { Express } from "express";

export function initCORS(app: Express) {
  // const option = {
  //   origin: [`https://${process.env.HOST}`, `http://${process.env.HOST}`, `${process.env.HOST}`, 'https://pivitle.netlify.app/'],
  //   methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
  //   credentials: true, // enable set cookie
  // };
  app.use(cors());
};