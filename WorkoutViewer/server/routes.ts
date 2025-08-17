import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExerciseSchema, insertWorkoutDaySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Workout Days Routes
  app.get("/api/workout-days", async (req, res) => {
    try {
      const workoutDays = await storage.getWorkoutDays();
      res.json(workoutDays);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout days" });
    }
  });

  app.get("/api/workout-days/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const workoutDay = await storage.getWorkoutDayWithExercises(id);
      
      if (!workoutDay) {
        return res.status(404).json({ message: "Workout day not found" });
      }
      
      res.json(workoutDay);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout day" });
    }
  });

  app.post("/api/workout-days", async (req, res) => {
    try {
      const result = insertWorkoutDaySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid workout day data", errors: result.error.errors });
      }

      const workoutDay = await storage.createWorkoutDay(result.data);
      res.status(201).json(workoutDay);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workout day" });
    }
  });

  app.patch("/api/workout-days/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertWorkoutDaySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid workout day data", errors: result.error.errors });
      }

      const workoutDay = await storage.updateWorkoutDay(id, result.data);
      if (!workoutDay) {
        return res.status(404).json({ message: "Workout day not found" });
      }

      res.json(workoutDay);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workout day" });
    }
  });

  // Exercise Routes
  app.get("/api/exercises/:workoutDayId", async (req, res) => {
    try {
      const { workoutDayId } = req.params;
      const exercises = await storage.getExercisesByWorkoutDay(workoutDayId);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const result = insertExerciseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid exercise data", errors: result.error.errors });
      }

      const exercise = await storage.createExercise(result.data);
      res.status(201).json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  app.patch("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertExerciseSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid exercise data", errors: result.error.errors });
      }

      const exercise = await storage.updateExercise(id, result.data);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  app.delete("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExercise(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
