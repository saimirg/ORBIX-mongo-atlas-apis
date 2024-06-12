// Assuming this function is defined within the MongoDB Realm Functions environment
exports = async function(payload) {
  // Access the 'devices' collection from the 'orbix_live' database
  
  const theBody = JSON.parse(payload.body.text());
  
  const {playlistName} = theBody;
  console.log(payload.body.text());
  console.log("-------------------------------- ", playlistName);
 
  
  const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices");
  
  
  try {
    // Query for a single record where _id matches the provided ID
    
    const customDataId = context.user.id;

    const query = { mongo_user_id: customDataId };
    //const device = await collection.findOne();
    
    const playlistUpdate = await collection.updateOne(
                              {
                               mongo_user_id: customDataId // Match the document by _id
                              },
                              {
                                $set: { "playlists.$[elem].isHidden": true } // Set isHidden to true for the matching playlist
                              },
                              {
                                arrayFilters: [{ "elem.playlistName": playlistName }] // Condition for matching the specific playlist
                              }
                            );
    

    
    if (playlistUpdate) {
      // If a device is found, return it
      console.log('playlistUpdate found:', playlistUpdate);
      
      //device.proxy_url = "https://proxy1.orbixplay.com/"
      
      return playlistUpdate;
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
