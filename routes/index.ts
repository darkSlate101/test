import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import transformationRoadmapRoutes from "./TransformationRoadmap.routes";
import projectRoutes from "./Project.routes";
import progressBoardRoutes from "./ProgressBoard.routes";
import roadmapRoutes from "./Roadmap.routes";
import groupsRoutes from "./Groups.routes";
import teamRoutes from './Teams.routes';
import chatRoutes from './Chat.routes';
import DOJORoutes from './DOJO.routes';
import configurationsRoutes from './configurations.routes';
import notificationsRoutes from './Notifications.routes';
import AIRoutes from './AI.routes';
import CardRoutes from './Card/Card.routes';
import tagRoutes from './Tag.routes';
import FunctionsRoutes from './Functions.routes';
import milestoneRoutes from './Milestone.routes';

import commonLogsRoutes from "./CommonLogs.routes";
import staticRoutes from './static.routes';
import { Express } from "express";
import errorHandler from "../middlewares/errorHandler";

export function initRoutes(app: Express) {
  app.use("/api/user", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/tag", tagRoutes);
  app.use("/api/functions", FunctionsRoutes);
  app.use("/api/milestone", milestoneRoutes);
  app.use("/api/card", CardRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/progressBoard", progressBoardRoutes);
  app.use("/api/roadmap", roadmapRoutes);
  app.use("/api/transformationRoadmap", transformationRoadmapRoutes);
  app.use("/api/DOJO", DOJORoutes);
  app.use("/api/AI", AIRoutes);
  app.use("/api/configurations", configurationsRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/groups", groupsRoutes);
  app.use("/api/commonLogs", commonLogsRoutes);
  app.use("/api/static", staticRoutes);
  app.use("/api/healthcheck", (req, res) => res.send("OK"));
  app.use(errorHandler);
};