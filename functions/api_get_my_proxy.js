// Assuming this function is defined within the MongoDB Realm Functions environment
exports = async function(payload) {
  // Access the 'devices' collection from the 'orbix_live' database
  
  // console.log(payload.body.text());
  // console.log("--------------------------------");
  // console.log(payload.body);

  // console.log(payload);
  // console.log(JSON.stringify(payload));
  
  // console.log(context.user);
  
  // console.log("===================================");
  // console.log(JSON.stringify(context.user));
  
  // console.log("===================================");
  // console.log(context.user.id);
  // console.log("===================================");
  // console.log(context.user.id);
  
  const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices");
  
  
  try {
    // Query for a single record where _id matches the provided ID
    
    const customDataId = context.user.id;

    const query = { mongo_user_id: customDataId };
    const device = await collection.findOne();

    
    if (device) {
      // If a device is found, return it
      console.log('Device found:', device);
      
      device.proxy_url = "https://proxy1.orbixplay.com/"
      
      return device;
    } else {
      // If no device is found, return a message indicating such
      console.log('No device found with the given ID.');
      return null;
    }
  } catch (e) {
    // If there's an error in the query, log it and optionally handle it
    console.error('Error querying device by ID:', e);
    throw e; // Rethrow or handle as appropriate
  }
};

// Usage of this function within the MongoDB Realm would require passing the custom ID as an argument
// For example, assuming the custom ID is stored in context.user.custom_data.id for the calling user:
// exports(context.user.custom_data.id).then(device => console.log(device));
