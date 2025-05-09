import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import "@/lib/firebase-admin";
import connectToMongoDB from "@/lib/mongoose";
import mongoose from "mongoose";
import { SalesPersonModel } from "@/models/SalesPerson";

const auth = getAuth();

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    // Handle params safely according to Next.js best practices - using await
    const resolvedParams = await Promise.resolve(context.params);
    const salespersonId = resolvedParams.id;

    console.log(`Attempting to delete salesperson with ID: ${salespersonId}`);

    // Check for force parameter in the URL - allows deletion even if not found
    const url = new URL(req.url);
    const forceDelete = url.searchParams.get("force") === "true";
    console.log(`Force delete mode: ${forceDelete ? "ON" : "OFF"}`);

    if (!salespersonId) {
      return NextResponse.json(
        { error: "Salesperson ID is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Start a MongoDB session for transactions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get models (using the correct import for SalesPerson)
      // Get the User model using a schema-less approach
      const UserModel =
        mongoose.models.User ||
        mongoose.model("User", new mongoose.Schema({}), "users");
      const ProspectModel =
        mongoose.models.Prospect ||
        mongoose.model("Prospect", new mongoose.Schema({}));
      const ActivityModel =
        mongoose.models.Activity ||
        mongoose.model("Activity", new mongoose.Schema({}));
      const ReminderModel =
        mongoose.models.Reminder ||
        mongoose.model("Reminder", new mongoose.Schema({}));

      // Get MongoDB salesperson information - start with direct _id search in salespersons collection
      console.log(
        "Searching for salesperson in MongoDB with ID:",
        salespersonId
      );
      let salesperson = null;
      let user = null;
      let firebaseUid = "";
      let firebaseAuthDeleted = false;

      // First, try direct MongoDB _id lookup in salespersons collection
      try {
        console.log("Trying direct _id search in 'salespersons' collection...");
        if (mongoose.Types.ObjectId.isValid(salespersonId)) {
          // Convert string ID to MongoDB ObjectId
          const objectId = new mongoose.Types.ObjectId(salespersonId);
          salesperson = await SalesPersonModel.findById(objectId).session(
            session
          );
          console.log(
            "Direct _id search result in salespersons:",
            salesperson ? "FOUND" : "Not found"
          );

          // If found in salespersons, also check users collection with the firebase_uid
          if (salesperson && salesperson.firebase_uid) {
            firebaseUid = salesperson.firebase_uid;
            user = await UserModel.findOne({
              firebase_uid: firebaseUid,
            }).session(session);
            console.log(
              "Search result in users collection:",
              user ? "FOUND" : "Not found"
            );
          }
        } else {
          console.log("ID is not a valid ObjectId format");
        }
      } catch (err) {
        console.error("Error during _id search:", err);
      }

      // If not found in salespersons, try in users collection
      if (!salesperson && !user) {
        console.log("Trying search in 'users' collection...");
        if (mongoose.Types.ObjectId.isValid(salespersonId)) {
          user = await UserModel.findById(
            new mongoose.Types.ObjectId(salespersonId)
          ).session(session);
        }

        if (!user) {
          // Try by firebase_uid in users collection
          user = await UserModel.findOne({
            firebase_uid: salespersonId,
          }).session(session);
        }

        if (user) {
          console.log("Found user in users collection:", user);
          // If we found the user, look for corresponding salesperson using firebase_uid
          firebaseUid = user.firebase_uid;
          salesperson = await SalesPersonModel.findOne({
            firebase_uid: user.firebase_uid,
          }).session(session);
          console.log(
            "Search result in salespersons collection using firebase_uid:",
            salesperson ? "FOUND" : "Not found"
          );
        }
      }

      // If direct _id search failed, try other fields in both collections
      if (!salesperson && !user) {
        console.log("Trying firebase_uid search in both collections...");
        salesperson = await SalesPersonModel.findOne({
          firebase_uid: salespersonId,
        }).session(session);

        if (salesperson) {
          firebaseUid = salesperson.firebase_uid;
          user = await UserModel.findOne({
            firebase_uid: salesperson.firebase_uid,
          }).session(session);
        } else {
          user = await UserModel.findOne({
            firebase_uid: salespersonId,
          }).session(session);

          if (user) {
            firebaseUid = user.firebase_uid;
            salesperson = await SalesPersonModel.findOne({
              firebase_uid: user.firebase_uid,
            }).session(session);
          }
        }
      }

      // If still not found, try by email if it looks like an email
      if (!salesperson && !user && salespersonId.includes("@")) {
        console.log("Trying email search in both collections...");
        salesperson = await SalesPersonModel.findOne({
          email: salespersonId,
        }).session(session);

        if (salesperson) {
          firebaseUid = salesperson.firebase_uid;
          user = await UserModel.findOne({
            firebase_uid: salesperson.firebase_uid,
          }).session(session);
        } else {
          user = await UserModel.findOne({
            email: salespersonId,
          }).session(session);

          if (user) {
            firebaseUid = user.firebase_uid;
            salesperson = await SalesPersonModel.findOne({
              firebase_uid: user.firebase_uid,
            }).session(session);
          }
        }
      }

      // Advanced debug: Directly query both collections if all else fails
      if ((!salesperson || !user) && forceDelete) {
        console.log(
          "Attempting low-level direct collection queries as a last resort..."
        );
        try {
          const db = mongoose.connection.db;
          if (db) {
            // Try salespersons collection
            if (!salesperson) {
              const salesCollection = db.collection("salespersons");
              const query = mongoose.Types.ObjectId.isValid(salespersonId)
                ? { _id: new mongoose.Types.ObjectId(salespersonId) }
                : { firebase_uid: salespersonId };

              const directSalespersonResult = await salesCollection.findOne(
                query
              );

              if (directSalespersonResult) {
                console.log(
                  "Found record in salespersons with direct collection access:",
                  directSalespersonResult
                );
                if (directSalespersonResult.firebase_uid) {
                  firebaseUid = directSalespersonResult.firebase_uid;
                }
              }
            }

            // Try users collection
            if (!user) {
              const usersCollection = db.collection("users");
              const userQuery = mongoose.Types.ObjectId.isValid(salespersonId)
                ? { _id: new mongoose.Types.ObjectId(salespersonId) }
                : firebaseUid
                ? { firebase_uid: firebaseUid }
                : { firebase_uid: salespersonId };

              const directUserResult = await usersCollection.findOne(userQuery);

              if (directUserResult) {
                console.log(
                  "Found record in users with direct collection access:",
                  directUserResult
                );
                if (directUserResult.firebase_uid && !firebaseUid) {
                  firebaseUid = directUserResult.firebase_uid;
                }
              }
            }
          }
        } catch (directErr) {
          console.error("Error during direct collection access:", directErr);
        }
      }

      console.log(
        "MongoDB search results:",
        `Salesperson: ${salesperson ? "Found" : "Not found"}`,
        `User: ${user ? "Found" : "Not found"}`
      );

      // If we found the salesperson in MongoDB, extract their firebase_uid if it exists
      if (salesperson) {
        console.log("Found salesperson:", {
          _id: salesperson._id.toString(),
          firebase_uid: salesperson.firebase_uid || "Not available",
          email: salesperson.email || "Not available",
          first_name: salesperson.first_name || "Not available",
          last_name: salesperson.last_name || "Not available",
        });

        // Save the firebase_uid for Firebase Auth deletion
        if (salesperson.firebase_uid) {
          firebaseUid = salesperson.firebase_uid;
        }
      }

      if (user) {
        console.log("Found user:", {
          _id: user._id.toString(),
          firebase_uid: user.firebase_uid || "Not available",
          email: user.email || "Not available",
        });

        // Save the firebase_uid for Firebase Auth deletion
        if (user.firebase_uid && !firebaseUid) {
          firebaseUid = user.firebase_uid;
        }
      }

      // Find all prospects assigned to this salesperson
      console.log(
        "Searching for prospects assigned to salesperson:",
        salespersonId
      );

      const prospects = await ProspectModel.find({
        $or: [
          { "assignedTo.id": salespersonId },
          { salespersonId: salespersonId },
          ...(firebaseUid
            ? [{ "assignedTo.id": firebaseUid }, { salespersonId: firebaseUid }]
            : []),
        ],
      }).session(session);

      console.log(
        `Found ${prospects.length} prospects assigned to salesperson ${salespersonId}`
      );

      // Only return 404 if we can't find the user and there are no prospects
      // AND force delete is not enabled
      if (!salesperson && !user && prospects.length === 0 && !forceDelete) {
        await session.abortTransaction();
        session.endSession();

        return NextResponse.json(
          {
            error:
              "Salesperson not found in any MongoDB collection and has no assigned prospects",
            message:
              "Use ?force=true query parameter to force delete this ID if needed",
          },
          { status: 404 }
        );
      }

      // If we're here, we either found something to delete or we're in force mode
      let deletedActivitiesCount = 0;
      let deletedRemindersCount = 0;
      let deletedProspectsCount = 0;
      let deletedUserRecordCount = 0;
      let deletedSalespersonRecordCount = 0;

      if (prospects.length > 0) {
        // Get all prospect IDs
        const prospectIds = prospects.map((prospect) => prospect._id);

        // 1. Delete all activities for these prospects
        const deletedActivities = await ActivityModel.deleteMany({
          prospectId: { $in: prospectIds },
        }).session(session);

        deletedActivitiesCount = deletedActivities.deletedCount;
        console.log(
          `Deleted ${deletedActivitiesCount} activities associated with prospects`
        );

        // 2. Delete all reminders for these prospects
        const deletedReminders = await ReminderModel.deleteMany({
          prospectId: { $in: prospectIds },
        }).session(session);

        deletedRemindersCount = deletedReminders.deletedCount;
        console.log(
          `Deleted ${deletedRemindersCount} reminders associated with prospects`
        );

        // 3. Delete all prospects assigned to the salesperson
        const deletedProspects = await ProspectModel.deleteMany({
          $or: [
            { "assignedTo.id": salespersonId },
            { salespersonId: salespersonId },
            ...(firebaseUid
              ? [
                  { "assignedTo.id": firebaseUid },
                  { salespersonId: firebaseUid },
                ]
              : []),
          ],
        }).session(session);

        deletedProspectsCount = deletedProspects.deletedCount;
        console.log(
          `Deleted ${deletedProspectsCount} prospects assigned to salesperson`
        );
      }

      // 4. Delete the salesperson from Firebase Auth (if found and has firebase_uid)
      if (firebaseUid) {
        try {
          await auth.deleteUser(firebaseUid);
          firebaseAuthDeleted = true;
          console.log(
            `Deleted user ${firebaseUid} from Firebase Authentication`
          );
        } catch (firebaseDeleteError) {
          console.error(
            "Error deleting from Firebase Auth:",
            firebaseDeleteError
          );
          console.log("Continuing with MongoDB deletion");
        }
      } else {
        console.log("No Firebase UID found to delete from Authentication");
      }

      // 5. Delete the salesperson records from MongoDB (both collections)

      // Delete from users collection
      if (user) {
        const userDeleteResult = await UserModel.deleteOne({
          _id: user._id,
        }).session(session);

        deletedUserRecordCount = userDeleteResult.deletedCount;
        console.log(
          `Deleted ${deletedUserRecordCount} user record from users collection`
        );
      } else if (firebaseUid) {
        // Try by firebase_uid in users collection
        const userDeleteResult = await UserModel.deleteOne({
          firebase_uid: firebaseUid,
        }).session(session);

        deletedUserRecordCount = userDeleteResult.deletedCount;
        console.log(
          `Deleted ${deletedUserRecordCount} user record by firebase_uid from users collection`
        );
      }

      // Delete from salespersons collection
      if (salesperson) {
        const salespersonDeleteResult = await SalesPersonModel.deleteOne({
          _id: salesperson._id,
        }).session(session);

        deletedSalespersonRecordCount = salespersonDeleteResult.deletedCount;
        console.log(
          `Deleted ${deletedSalespersonRecordCount} record from salespersons collection`
        );
      } else if (firebaseUid) {
        // Try by firebase_uid in salespersons collection
        const salespersonDeleteResult = await SalesPersonModel.deleteOne({
          firebase_uid: firebaseUid,
        }).session(session);

        deletedSalespersonRecordCount = salespersonDeleteResult.deletedCount;
        console.log(
          `Deleted ${deletedSalespersonRecordCount} record by firebase_uid from salespersons collection`
        );
      }

      // If we're in force mode and nothing was found to delete,
      // let's at least try to clean up by ID
      if (
        forceDelete &&
        deletedUserRecordCount === 0 &&
        deletedSalespersonRecordCount === 0 &&
        prospects.length === 0
      ) {
        try {
          console.log("Force delete mode: Attempting final cleanup...");

          // Prepare query conditions for force delete
          const queryConditions: Array<any> = [
            { firebase_uid: salespersonId },
            { email: salespersonId },
          ];

          // Only add ObjectId condition if valid
          if (mongoose.Types.ObjectId.isValid(salespersonId)) {
            queryConditions.push({
              _id: new mongoose.Types.ObjectId(salespersonId),
            });
          }

          // Try to delete from both collections with any possible ID format
          const forceDeleteUsersResult = await UserModel.deleteMany({
            $or: queryConditions,
          }).session(session);

          const forceDeleteSalespersonsResult =
            await SalesPersonModel.deleteMany({
              $or: queryConditions,
            }).session(session);

          if (forceDeleteUsersResult.deletedCount > 0) {
            deletedUserRecordCount = forceDeleteUsersResult.deletedCount;
            console.log(
              `Force deleted ${deletedUserRecordCount} records from users collection`
            );
          }

          if (forceDeleteSalespersonsResult.deletedCount > 0) {
            deletedSalespersonRecordCount =
              forceDeleteSalespersonsResult.deletedCount;
            console.log(
              `Force deleted ${deletedSalespersonRecordCount} records from salespersons collection`
            );
          }
        } catch (forceError) {
          console.error("Error during force delete:", forceError);
        }
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        success: true,
        message: forceDelete
          ? "Force delete completed - cleaned up any found records"
          : "Salesperson and all associated data deleted successfully",
        mongoDBUsers: deletedUserRecordCount > 0,
        mongoDBSalespersons: deletedSalespersonRecordCount > 0,
        firebaseAuth: firebaseAuthDeleted,
        prospectsDeleted: deletedProspectsCount,
        activitiesCount: deletedActivitiesCount,
        remindersCount: deletedRemindersCount,
        forceMode: forceDelete,
      });
    } catch (error) {
      // Abort transaction if an error occurs
      await session.abortTransaction();
      session.endSession();
      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error(`Error deleting salesperson:`, error);
    return NextResponse.json(
      {
        error: "Failed to delete salesperson and associated data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
