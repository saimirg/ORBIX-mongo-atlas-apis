const qr = require('qr-image');

exports = async function(payload) {
      const paymenturl = "https://orbixplay.com/pricing?client_reference_id="+context.user.custom_data.deviceid;
   // const deviceid = "AA:AA:AA:AA:AA:AA"
    if (!paymenturl) {
        // Return an error response if the query parameter is missing
        return {
            statusCode: 400,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ error: 'Query parameter is missing.' })
        };
    }
    
    console.log(JSON.stringify(context.user.custom_data.deviceid));

    try {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymenturl)}`;

        // Directly use the URL of the generated QR code
        return {
            
          "qr_payment_url": qrCodeUrl
            
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
