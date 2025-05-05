import Activity from "@/models/Activity";
import connectToDatabase from "@/lib/mongoose";
import { ActivityStatus, ActivityType } from "@/types/activity";

export const activityService = {
  // Get all activities
  getAll: async () => {
    await connectToDatabase();
    return Activity.find({ isActive: true })
      .populate("prospectId")
      .populate("addedBy")
      .sort({ createdAt: -1 });
  },

  // Get by ID
  getById: async (id: string) => {
    await connectToDatabase();
    return Activity.findById(id).populate("prospectId").populate("addedBy");
  },

  // Get by prospect
  getByProspect: async (prospectId: string) => {
    await connectToDatabase();
    return Activity.find({
      prospectId,
      isActive: true,
    })
      .populate("addedBy")
      .sort({ dueDate: 1 });
  },

  // Get by status
  getByStatus: async (status: ActivityStatus) => {
    await connectToDatabase();
    return Activity.find({
      status,
      isActive: true,
    })
      .populate("prospectId")
      .populate("addedBy")
      .sort({ dueDate: 1 });
  },

  // Get upcoming activities
  getUpcoming: async () => {
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
  },
};
