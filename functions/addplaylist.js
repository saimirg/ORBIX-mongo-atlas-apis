// Function to be triggered by the custom HTTP endpoint
exports = async function(payload, response) {
    const collection = context.services.get("mongodb-atlas").db("orbix_live").collection("devices");

    // Parse the payload to JSON
    const body = EJSON.parse(payload.body.text());

    // Extracting data from the payload
    const { url, username, password } = body;

    // Extract the 'deviceid' from the query parameters
    const deviceid = payload.query.client_reference_id;

    // New playlist object to be added
    const newPlaylist = {
        url: url,
        username: username,
        password: password
    };

    console.log("body ", body);
    console.log("query", JSON.stringify(payload));

    try {
        // Update the document with the new playlist
        const updateResult = await collection.updateOne(
            { deviceId: deviceId }, // Filter to identify the correct document based on deviceId
            { $push: { playlists: newPlaylist } } // Push the new playlist to the playlists array
        );

        // Check if the document was successfully updated
        if (updateResult.modifiedCount === 0) {
            throw new Error("No document found with the provided deviceId or no change was made.");
        }

        // Return a success response
        response.setStatusCode(200);
        response.setBody(`Successfully updated document with deviceId: ${deviceId}`);
    } catch (error) {
        // Return an error response
        response.setStatusCode(500);
        response.setBody(`Error updating document: ${error.message}`);
    }
};
