exports = async function (payload, response) {
    // Log the entire payload for debugging
    console.log('Received Payload:', JSON.stringify(payload));
    const requestBody = payload.body.text();
    console.log('Extracted Request Body:', requestBody);
    const parsedPayload = JSON.parse(requestBody);
    const { url, host_code, username, password, playlistName, deviceid, hide_playlist_info } = parsedPayload.query;

    console.log('Extracted Device ID:', deviceid);

    // Check if device ID is missing
    if (!deviceid) {
        response.setStatusCode(400);
        response.setHeader('Content-Type', 'application/json');
        response.setBody(JSON.stringify({ error: 'Device ID is missing.' }));
        return;
    }

    // Access the MongoDB Atlas collections orbixplay_live orgibplay_beta
    const devicesCollection = context.services.get('mongodb-atlas').db('orbixplay_live').collection('devices');
    const playlistsCollection = context.services.get('mongodb-atlas').db('orbixplay_live').collection('playlists');

   try {
    const deviceExists = await devicesCollection.findOne({ deviceid });
    if (!deviceExists) {
        response.setStatusCode(404);
        response.setHeader('Content-Type', 'application/json');
        response.setBody(JSON.stringify({ error: 'Device not found.' }));
        return;
    }

    const newPlaylist = {
        deviceid,
        username,
        password,
        playlistName,
        isHidden: false,
        playlist_added_at: new Date(),
        source: "mobile"
    };

    if (host_code) {
        newPlaylist.host_code = host_code;
        newPlaylist.hide_playlist_info = true;
    } else {
        newPlaylist.url = url;
        newPlaylist.hide_playlist_info = hide_playlist_info;
    }

    const insertResult = await playlistsCollection.insertOne(newPlaylist);

    console.log('Insert Result:', insertResult);
    response.setStatusCode(200);
    response.setHeader('Content-Type', 'application/json');
    response.setBody(JSON.stringify({ message: `Successfully inserted new playlist for device with deviceid: ${deviceid}` }));
} catch (error) {
    console.error('Error inserting playlist:', error);
    response.setStatusCode(500);
    response.setHeader('Content-Type', 'application/json');
    response.setBody(JSON.stringify({ error: `Error inserting playlist: ${error.message}` }));
}
};
