exports = async function(payload) {
  // Android TV
  const androidtvObj = {
    currentVersion: "0.58",
    notifyUpgrade: false,
    forceUpgrade: false,
  };

  // Firestick 
  const firestickObj = {
    currentVersion: "0.71",
    notifyUpgrade: false,
    forceUpgrade: false,
  };

  // Android AOSP STB
  const androidstbObj = {
    currentVersion: "0.82",
    notifyUpgrade: false,
    forceUpgrade: false,
  };

  // Default response object
  let responseObject = {
    currentVersion: "0",
    notifyUpgrade: false,
    forceUpgrade: false
  };

  // Values from payload
  let bodyApp_version = false;
  let bodyApp_name = false;
  let bodyAppid = null;

  if (payload.body && typeof payload.body.text === "function") {
    const bodyText = await payload.body.text();

    if (bodyText) {
      try {
        const parsedBody = JSON.parse(bodyText);
        bodyApp_version = parsedBody.app_version;
        bodyApp_name = parsedBody.app_name;
        bodyAppid = parsedBody.appid || null;
      } catch (error) {
        console.error("Error parsing JSON from payload body:", error);
      }
    }
  }

  if (bodyAppid === "androidtv") {
    if (bodyApp_version !== false && bodyApp_version < androidtvObj.currentVersion) {
      responseObject.notifyUpgrade = true;
      responseObject.forceUpgrade = androidtvObj.forceUpgrade;
      responseObject.currentVersion = androidtvObj.currentVersion;
    }
  } else if (bodyAppid === "firestick") {
    if (bodyApp_version !== false && bodyApp_version < firestickObj.currentVersion) {
      responseObject.notifyUpgrade = true;
      responseObject.forceUpgrade = firestickObj.forceUpgrade;
      responseObject.currentVersion = firestickObj.currentVersion;
    }
  } else if (bodyAppid === "androidstb") {
    if (bodyApp_version !== false && bodyApp_version < androidstbObj.currentVersion) {
      responseObject.notifyUpgrade = true;
      responseObject.forceUpgrade = androidstbObj.forceUpgrade;
      responseObject.currentVersion = androidstbObj.currentVersion;
    }
  }

  const collection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("devices");
  const whitelistCollection = context.services.get("mongodb-atlas").db("orbixplay_live").collection("whitelist");

  try {
    const customDataId = context.user.id;

    const device = await collection.aggregate([
      {
        $match: { mongo_user_id: customDataId }
      },
      {
        $lookup: {
          from: "playlists",
          localField: "deviceid",
          foreignField: "deviceid",
          as: "playlists"
        }
      },
      {
        $limit: 1
      }
    ]).toArray();

    if (device.length > 0) {
      const deviceData = device[0];

      if (deviceData.playlists && Array.isArray(deviceData.playlists)) {
        deviceData.playlists = deviceData.playlists.filter(playlist => !playlist.isHidden);
      }

      const whitelistHost = await whitelistCollection.find().toArray();
      const whitelistHosts = whitelistHost.map(item => item.host);

      deviceData.playlists = deviceData.playlists.map(playlist => {
        const existingWhitelist = typeof playlist.whitelist === 'boolean'
          ? playlist.whitelist
          : whitelistHosts.includes(playlist.url);
        return {
          ...playlist,
          whitelist: existingWhitelist
        };
      });

      deviceData.proxy_url = "https://proxy1.orbixplay.com/";
      deviceData.hasNewVersion = responseObject.notifyUpgrade;
      deviceData.newversion = responseObject.currentVersion;
      deviceData.forceUpgrade = responseObject.forceUpgrade;

      return deviceData;
    } else {
      console.log('No device found with the given ID.');
      return null;
    }
  } catch (e) {
    console.error('Error querying device by ID:', e);
    throw e;
  }
};
