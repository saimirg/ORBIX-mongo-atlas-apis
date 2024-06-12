exports = async function(changeEvent) {
  const { fullDocument } = changeEvent;

  if (!fullDocument) {
    console.error("No document found in change event");
    return;
  }

  const mongoUserId = fullDocument.mongo_user_id; 
  try {
    const deleteUserResult = await context.functions.execute("deleteAppUser", mongoUserId);
    console.log("User deleted successfully:", deleteUserResult);
  } catch (err) {
    console.error("Failed to delete user:", err);
  }
};
