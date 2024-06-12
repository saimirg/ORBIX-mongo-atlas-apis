exports = async function(mongoUserId) {
  const { app } = context;
  
  try {
    const adminUser = app.admin().auth.users;
    await adminUser.delete({ id: mongoUserId });
    return { success: true };
  } catch (err) {
    console.error("Failed to delete user from MongoDB App Services:", err);
    throw err;
  }
};
