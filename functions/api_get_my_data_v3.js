exports = async function(payload) {
  

  
  //keto ndryshohen manualisth kur kemi version te ri
  //Android TV
  const androidtvObj = {
        currentVersion : "0.34",
        notifyUpgrade : false,
        forceUpgrade : false,
  }
  
  //Firestick 
  const firestickObj = {
        currentVersion : "0.37",
        notifyUpgrade : false,
        forceUpgrade : false,
  }
  
  //Android AOSP STB
  const androidstbObj = {
        currentVersion : "0.37",
        notifyUpgrade : false,
        forceUpgrade : false,
  }
  
  //response Object
  let responseObject =   {  
        currentVersion : "0",
        notifyUpgrade : false,
        forceUpgrade : false
  }
  
  
  //vlerat qe vijne nga device body request
  let bodyApp_version = false; 
  let bodyApp_name = false;
  let bodyAppid = null;

  // Check if payload.body is present and has a text method
  if (payload.body && typeof payload.body.text === "function") {
    const bodyText = await payload.body.text();
  
    // Additional safety check to ensure bodyText is not empty
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
  
  if(bodyAppid == "androidtv") {
    // Notify for upgrade if app_version is defined and less than currentVersion
    if (bodyApp_version !== false && bodyApp_version < androidtvObj.currentVersion) {
        responseObject.notifyUpgrade = true;
        responseObject.forceUpgrade = androidtvObj.forceUpgrade;
        responseObject.currentVersion = androidtvObj.currentVersion;
    }
  }
  else
  if(bodyAppid == "firestick") {
    
    if (bodyApp_version !== false && bodyApp_version < firestickObj.currentVersion) {
        responseObject.notifyUpgrade = true;
        responseObject.forceUpgrade = firestickObj.forceUpgrade;
        responseObject.currentVersion = firestickObj.currentVersion;
    }
  }
  else
  if(bodyAppid == "androidstb") {
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

    // Using aggregation to fetch device info and associated playlists
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

    // Check if any device document was returned
    if (device.length > 0) {
      const deviceData = device[0];
      
      // Filter out playlists items where isHidden is true
      if (deviceData.playlists && Array.isArray(deviceData.playlists)) {
        deviceData.playlists = deviceData.playlists.filter(playlist => !playlist.isHidden);
      }
      // checking for whitelist 
       const whitelistHost = await whitelistCollection.find().toArray();
        const whitelistHosts = whitelistHost.map(item => item.host);

        deviceData.playlists = deviceData.playlists.map(playlist => {
          return {
            ...playlist,
            whitelist: whitelistHosts.includes(playlist.url)
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
