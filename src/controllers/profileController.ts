import { catchAsync } from "../error/catchAsync";
import UserModel from "../schema/UserSchema";

export const editProfile = catchAsync(async (req, res, next) => {
  const { name, bio, insta, website } = req.body;

  const user = await UserModel.findByIdAndUpdate(
    req.user?.userID,
    {
      name,
      bio,
      insta,
      website,
    },
    { runValidators: true }
  );

  if (!user) {
    return res.status(400).send({ message: "User information not found" });
  }

  res.status(200).send({ message: "User info updated successfully" });
});

export const getProfile = catchAsync(async (req, res, next) => {
  const id = req.params.id ?? req.user?.userID;
  const user = await UserModel.findById(
    id,
    "_id name bio insta website username discriminator avatar"
  );
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.status(200).send(user);
});
