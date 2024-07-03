//https://www.mongodb.com/docs/atlas/app-services/authentication/custom-function/
//remoteIPAddress: context.request.remoteIPAddress,
//    httpUserAgent: context.request.httpUserAgent,
    

// exports = async function onNewCustomFunctionUser(user) {
 
//    // This is the user's internal account ID that was generated by your app
//   const internalId = user.id;
  
//   console.log(JSON.stringify(context));

//   // This is the external ID returned from the authentication function
//   const customFunctionIdentity = user.identities.find((id) => {
//     return id.provider_type === "custom-function";
//   });
  
//   const externalId = customFunctionIdentity.id;

//   // Create a custom device data document for the device
//   const mdb = context.services.get("mongodb-atlas");
//   const users = mdb.db("orbixplay_live").collection("devices");
//   const transactions = mdb.db("orbixplay_live").collection("transactions");
  
//   // Create a new Date object for the current date and time
//   const createdAt = new Date();
  
//   // Create a new Date object for the license end date, 7 days in the future
//   const licenseEndDate = new Date(createdAt.getTime()); // Clone the current date
//   licenseEndDate.setDate(createdAt.getDate() + 7); // Add 7 days to the cloned date
 
//   // add vpn license end date
//    const licenseVpnEndDate = new Date(createdAt.getTime()); // Clone the current date
//   licenseVpnEndDate.setDate(createdAt.getDate() + 7); // Add 7 days to the cloned date

//   // Insert a new user into the 'devices' collection with the appropriate fields
//   return await users.insertOne({
//     mongo_user_id: internalId,
//     deviceid: externalId,
//     created_at: createdAt,
//     playlists: [],
//     //remoteIPAddress: context.request.remoteIPAddress,
//     license_end_date: licenseEndDate,
//     vpn_license_end_date: licenseVpnEndDate,
//     package_name: "Free Trial",
//     // Add any other data you want to include
//   });
// };
exports = async function onNewCustomFunctionUser(user) {
   // console.log("Context Object: ", JSON.stringify(context, null, 2));
  const internalId = user.id;

  console.log(JSON.stringify(context));

  // This is the external ID returned from the authentication function
  const customFunctionIdentity = user.identities.find((id) => {
    return id.provider_type === "custom-function";
  });

  const externalId = customFunctionIdentity.id;
  const mdb = context.services.get("mongodb-atlas");
  const users = mdb.db("orbixplay_live").collection("devices");
  const transactions = mdb.db("orbixplay_live").collection("transactions");

  // Create a new Date object for the current date and time
  const createdAt = new Date();

  // Create a new Date object for the license end date, 7 days in the future
  const licenseEndDate = new Date(createdAt.getTime()); // Clone the current date
  licenseEndDate.setDate(createdAt.getDate() + 7); // Add 7 days to the cloned date

  // Add VPN license end date
  const licenseVpnEndDate = new Date(createdAt.getTime()); // Clone the current date
  licenseVpnEndDate.setDate(createdAt.getDate() + 7); // Add 7 days to the cloned date

  // Insert a new user into the 'devices' collection with the appropriate fields
  const userInsertResult = await users.insertOne({
    mongo_user_id: internalId,
    deviceid: externalId,
    created_at: createdAt,
    playlists: [],
    license_end_date: licenseEndDate,
    vpn_license_end_date: licenseVpnEndDate,
    package_name: "Free Trial",
  });

  // Insert a new transaction into the 'transactions' collection
  const transactionInsertResult = await transactions.insertOne({
    deviceid: externalId,
    created_transaction_time: createdAt,
    package_expiration_time: licenseEndDate,
    transactionId: null, 
    package_name: "Free Trial",
    price: 0, 
  });

  return { userInsertResult, transactionInsertResult };
};
