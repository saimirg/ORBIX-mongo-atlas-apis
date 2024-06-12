exports = async function(payload) {
  const originalDeviceId = context.user.custom_data.deviceid;
  console.log("originalDeviceId: ", originalDeviceId);

  const mongodb = context.services.get("mongodb-atlas");
  const db = mongodb.db("orbixplay_live");
  const devicecollection = db.collection("devices");
  const subscriptionCollection = db.collection("subscriptions");
  const packagesCollection = db.collection("packages");

  const deviceDocument = await devicecollection.findOne({ deviceid: originalDeviceId });

  // Check if the device document is found
  if (!deviceDocument) {
    console.log("Device ID not found in MongoDB:", originalDeviceId);
    // Respond to the webhook with a message about the missing device ID
    response.setStatusCode(404);
    response.setBody("Device ID not found");
    return [];
  }

  try {
    const subscriptionDocuments = await subscriptionCollection
      .aggregate([
        { $match: { deviceid: originalDeviceId } }, // Match subscriptions for the given deviceid
        {
          $lookup: {
            from: "packages", // Lookup packages collection
            localField: "package",
            foreignField: "_id",
            as: "package_info",
          },
        },
        { $unwind: "$package_info" }, // Unwind the package_info array
        {
          $project: {
            deviceid: 1,
            created_at: 1,
            start_time: 1,
            end_time: 1,
            "package_info._id": 1,
            "package_info.name": 1, // Include only the package name from package_info
            "package_info.duration": 1, // Include duration from package_info
            "package_info.unit": 1, // Include unit from package_info
            "package_info.price": 1, // Include price from package_info
          },
        },
        { $sort: { created_at: -1 } }, // Sort by created_at in ascending order
      ])
      .toArray();

    console.log("Subscription Documents:", JSON.stringify(subscriptionDocuments));
    return subscriptionDocuments;
  } catch (error) {
    console.log("Error fetching subscription documents:", error);
    response.setStatusCode(500);
    response.setBody("Error fetching subscription documents");
    return [];
  }
};
