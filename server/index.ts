import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getStapuboxSports, getStapuboxTournaments } from "./routes/stapubox";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/stapubox/sports", getStapuboxSports);
  app.get("/api/stapubox/tournaments", getStapuboxTournaments);

  return app;
}
export default createServer;