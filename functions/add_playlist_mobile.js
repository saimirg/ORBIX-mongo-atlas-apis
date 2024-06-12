
exports = async function (payload, response) {
    console.log('Received Payload:', JSON.stringify(payload, null, 2));
    const requestBody = JSON.parse(payload.body.text()); // Parse JSON directly
    console.log('Extracted Request Body:', JSON.stringify(requestBody, null, 2));
    const { deviceid, url, username, password, playlistName } = requestBody;
    console.log('Extracted Device ID:', deviceid);
    if (!deviceid) {
        response.setStatusCode(400);
        response.setHeader('Content-Type', 'application/json');
        response.setBody(JSON.stringify({ error: 'Device ID is missing.' }));
        return;
    }
    const devicesCollection = context.services.get('mongodb-atlas').db('orbixplay_live').collection('devices');
    const playlistsCollection = context.services.get('mongodb-atlas').db('orbixplay_live').collection('playlists');

    try {
        const deviceExists = await devicesCollection.findOne({ deviceid: deviceid });
        if (!deviceExists) {
            throw new Error('Device not found.');
        }

        // Create a new playlist object
        const newPlaylist = {
            deviceid: deviceid,
            url: url,
            username: username,
            password: password,
            playlistName: playlistName,
            isHidden: false,
            hide_playlist_info: false,
            playlist_added_at: new Date(),
            source: "mobile"
        };

        // Insert the new playlist document into the playlists collection
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
