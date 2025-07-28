import userModel from "../models/userModel.js";

export async function getUserData(req, res) {
  try {
    const userId = req.user?.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      userData: {
        name: user.name,
        isAccountVerified: user.is_account_verified,
      },
    });
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
