const qr = require('qr-image');

exports = async function(payload) {
    // Extract the query parameter from the payload
    //const queryParams = payload.query;
    //const dataToEncode = "queryParams.yourParameter; // Replace 'yourParameter' with the name of your query parameter";
    // const playlisturl = "https://stitch-statichosting-prod.s3.amazonaws.com/64b90239e73af885920de2e0/orbixplayform.html?client_reference_id="+context.user.custom_data.deviceid;
       const playlisturl = "https://my-list.orbixplay.com/?client_reference_id="+context.user.custom_data.deviceid;

    if (!playlisturl) {
        // Return an error response if the query parameter is missing
        return {
            statusCode: 400,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ error: 'Query parameter is missing.' })
        };
    }
    
    console.log(JSON.stringify(context.user.custom_data.deviceid));

    try {
        // Construct the URL for the external QR code API
        // Replace 'https://api.qrserver.com/v1/create-qr-code/' with the URL of the QR code service you choose
        const qrCodeUrl = `https://getplaylistqr.orbixplay.com?url=${encodeURIComponent(playlisturl)}`;

        // Directly use the URL of the generated QR code
        return {
            
          "qr_playlist_url": qrCodeUrl
            
        };
    } catch (error) {
        // Return an error response
        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ error: 'Error requesting QR code: ' + error.message })
        };
    }
};
