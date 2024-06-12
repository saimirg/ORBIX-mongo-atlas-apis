// Assuming this function is defined within the MongoDB Realm Functions environment
exports = async function(payload) {
  
    const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices");

    const devices = await collection.find();
    return devices;
};

// Usage of this function within the MongoDB Realm would require passing the custom ID as an argument
// For example, assuming the custom ID is stored in context.user.custom_data.id for the calling user:
// exports(context.user.custom_data.id).then(device => console.log(device));
