// Assuming this function is defined within the MongoDB Realm Functions environment
exports = async function(payload) {

  const currentVersion = "1.1.1";
  let notifyUpgrade = false;
  const forceUpgrade = true;
  
  
  let app_version = false, app_name = false;

  // Check if payload.body is present and has a text method
  if (payload.body && typeof payload.body.text === "function") {
    const bodyText = payload.body.text();
  
    // Additional safety check to ensure bodyText is not empty
    if (bodyText) {
      try {
        const parsedBody = JSON.parse(bodyText);
        app_version = parsedBody.app_version;
        app_name = parsedBody.app_name;
      } catch (error) {
        console.error("Error parsing JSON from payload body:", error);
        // In case of parsing error, app_version and app_name remain false
      }
    }
  }
  
  // Notify for upgrade if app_version is defined and less than currentVersion
  if (app_version !== false && app_version < currentVersion) {
     notifyUpgrade = false;
  } 
  
  // else {
  //   // Handle case where app_version is false or not less than currentVersion
  //   // This could include setting notifyUpgrade to false or other logic
  // }

  
  
  
  
  
  
  
  
  const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices");
  
  // const {app_version,app_name} = JSON.parse(payload.body.text());
  
  
  
  // if(app_version < currentVersion) {
  //   notifyUpgrade = true;
  // }
  
  
  
  try {
    // Query for a single record where _id matches the provided ID
    
    const customDataId = context.user.id;

    const query = { mongo_user_id: customDataId };
    const device = await collection.findOne();

    
    if (device) {
      // If a device is found, return it
      console.log('Device found:', device);
      
        // Filter out playlists items where isHidden is true
      if (device.playlists && Array.isArray(device.playlists)) {
        device.playlists = device.playlists.filter(playlist => !playlist.isHidden);
      }
      
      device.proxy_url = "https://proxy1.orbixplay.com/"
      
      device.hasNewVersion = notifyUpgrade;
      device.newversion = currentVersion;
      device.forceUpgrade = forceUpgrade;
      
      return device;
      //return [device];

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
