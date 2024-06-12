// This function is the endpoint's request handler.
exports = async function() {
  const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices");

   // Define the query for documents missing the 'license_end_date' field
  const query = { "license_end_date": { "$exists": false } };
  
  // Define the update operation to add the 'license_end_date' field
  const update = {
    "$set": { "license_end_date": new Date("2999-11-13T22:55:53.126Z") }
  };
  
  // Execute the updateMany operation
  try {
    const result = await collection.updateMany(query, update);
    console.log(`Successfully updated ${result.modifiedCount} documents.`);
    return { msg: `Successfully updated ${result.modifiedCount} documents.` };
  } catch (err) {
    console.error(`Failed to update documents: ${err}`);
    return { error: err.message };
  }
  
  

  
};
