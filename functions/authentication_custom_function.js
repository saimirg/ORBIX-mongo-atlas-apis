  //exports = (loginPayload) => {
// exports = async function(loginPayload) {
//   // arg could be the deviceid you're searching for
//   const deviceIdToFind = loginPayload.deviceid;
  
//   console.log(JSON.stringify(loginPayload));

//   if(deviceIdToFind) 
//     return {"id": deviceIdToFind, "name":deviceIdToFind};
//   else
//     throw new Error(`Authentication failed, missing deviceIdToFind`);

// };



exports = async function(loginPayload) {
  // Ensure the loginPayload has a deviceid
  const deviceIdToFind = loginPayload.deviceid;
  if (!deviceIdToFind) {
    throw new Error(`Authentication failed, missing deviceId`);
  }
  
  console.log(`Received loginPayload: ${JSON.stringify(loginPayload)}`);
  
  // Add a timestamp to the loginPayload
  loginPayload.timestamp = new Date();
  
  // Connect to the MongoDB collection
  const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices_data");
  
  // Update or insert the document based on deviceid
  try {
    const result = await collection.updateOne(
      { deviceid: deviceIdToFind }, // Filter document by deviceid
      { $set: loginPayload },      // Set loginPayload fields in the document
      { upsert: true }             // Insert a new document if one doesn't exist
    );
    
    console.log(`Update or insert result: ${JSON.stringify(result)}`);
    //return { status: "success", message: "Login data processed successfully." };
    return {"id": deviceIdToFind, "name":deviceIdToFind};
  } catch (error) {
    console.error(`Failed to process login data: ${error}`);
    return { status: "error", message: error.message };
  }
};


