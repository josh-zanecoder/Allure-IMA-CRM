import Activity from "@/models/Activity";
import connectToDatabase from "@/lib/mongoose";
import { ActivityStatus, ActivityType } from "@/types/activity";
// Pre-import all related models to ensure they're registered
import { UserModel } from "@/models/User";
import Prospect from "@/models/Prospect";

// Verify models are imported
console.log("Loaded models:", {
  User: !!UserModel,
  Prospect: !!Prospect,
  Activity: !!Activity,
});

export const activityService = {
  // Get all activities
  getAll: async () => {
    try {
      await connectToDatabase();

      // First check that the models are registered
      if (!UserModel || !Prospect || !Activity) {
        throw new Error(
          "One or more required models are not registered properly"
        );
      }

      const activities = await Activity.find({ isActive: true })
        .populate("prospectId")
        .populate("addedBy")
        .sort({ createdAt: -1 });

      console.log("activities count:", activities?.length || 0);

      return activities;
    } catch (error) {
      console.error("Error in activityService.getAll:", error);
      // Re-throw to let the API route handle the error appropriately
      throw error;
    }
  },

  // Get by ID
  getById: async (id: string) => {
    try {
      await connectToDatabase();
      return Activity.findById(id).populate("prospectId").populate("addedBy");
    } catch (error) {
      console.error(`Error in activityService.getById for ID ${id}:`, error);
      throw error;
    }
  },

  // Get by prospect
  getByProspect: async (prospectId: string) => {
    try {
      await connectToDatabase();
      return Activity.find({
        prospectId,
        isActive: true,
      })
        .populate("addedBy")
        .sort({ dueDate: 1 });
    } catch (error) {
      console.error(
        `Error in activityService.getByProspect for prospect ${prospectId}:`,
        error
      );
      throw error;
    }
  },

  // Get by status
  getByStatus: async (status: ActivityStatus) => {
    try {
      await connectToDatabase();
      return Activity.find({
        status,
        isActive: true,
      })
        .populate("prospectId")
        .populate("addedBy")
        .sort({ dueDate: 1 });
    } catch (error) {
      console.error(
        `Error in activityService.getByStatus for status ${status}:`,
        error
      );
      throw error;
    }
  },

  // Get upcoming activities
  getUpcoming: async () => {
    try {
      await connectToDatabase();
      const now = new Date();
      return Activity.find({
        dueDate: { $gte: now },
        status: ActivityStatus.PENDING,
        isActive: true,
      })
        .populate("prospectId")
        .populate("addedBy")
        .sort({ dueDate: 1 });
    } catch (error) {
      console.error("Error in activityService.getUpcoming:", error);
      throw error;
    }
  },
};
