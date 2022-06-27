import axios from "axios";
import { catchAsync } from "../error/catchAsync";
import UserModel from "../schema/UserSchema";
import jwt, { TokenExpiredError } from "jsonwebtoken";

/**
 * Login or create a new user based on the access code received
 */
export const loginOrCreate = catchAsync(async (req, res, next) => {
  const code = req.body.code as string;

  console.log(code);

  if (code) {
    try {
      const axiosResponse = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID!,
          client_secret: process.env.DISCORD_CLIENT_SECRET!,
          code,
          grant_type: "authorization_code",
          redirect_uri: process.env.DISCORD_OAUTH_REDIRECT!,
          scope: "identify",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
      } = axiosResponse.data;

      const discordUser = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const { id, username, discriminator, avatar } = discordUser.data;

      let user = await UserModel.findOne({ discordID: id });
      let newUser = false;

      const expires = new Date(
        new Date().getTime() + Number(expiresIn) * 1000 - 10000
      );

      if (user) {
        // Update user
        user.username = username;
        user.discriminator = discriminator;
        user.avatar = avatar;
        user.discordAccessToken = accessToken;
        user.discordRefreshToken = refreshToken;
        user.discordAccessTokenExpiry = expires;
        await user.save();
      } else {
        // Create new user
        newUser = true;
        user = await UserModel.create({
          discordID: id,
          name: username,
          username,
          discriminator,
          avatar,
          accessToken,
          refreshToken,
          accessTokenExpiry: expires,
        });
      }

      const tokens = await generateTokens(user.id);
      res.status(200).send({ tokens, newUser });
    } catch (e) {
      console.log(`There was an error logging in/signing up: ${e}`);
    }
  } else {
    res.status(400).send({ message: "No authorization code provided" });
  }
});

export const logOut = catchAsync(async (req, res, next) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return res.status(400).send("Invalid token");
    }

    const userID = (jwt.decode(token) as jwt.JwtPayload).userID;

    // Remove the refresh token associated with this session
    await UserModel.updateOne(
      { _id: userID },
      { $pullAll: { refreshTokens: [token] } }
    );
    res.status(200).send({ message: "User logged out successfully" });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ message: "There was an error logging out. Please try again" });
  }
});

/***
 * Refresh tokens given access and refresh tokens
 */
export const tokens = catchAsync(async (req, res, next) => {
  try {
    const tokens = await refreshTokens(req.body.refreshToken);
    res.status(200).send(tokens);
  } catch (err: any) {
    res.status(400).send({ message: err.message });
  }
});

/**
 * Refresh tokens using a refresh token
 * @param refreshToken The refresh token to use
 * @returns The user ID and new tokens
 */
const refreshTokens = async (refreshToken: string) => {
  let decoded: jwt.JwtPayload;

  try {
    // Verify the refresh token (cannot be expired)
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as jwt.JwtPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new Error("Refresh token as expired. Please re-authenticate");
    } else {
      throw new Error("Invalid refresh token");
    }
  }

  const userID: string = decoded.userID;
  const user = await UserModel.findById(userID);

  if (!user) {
    throw new Error("Invalid user ID in token");
  }

  // Make sure this is a valid refresh token we've seen before and remove it since it has been used
  if (user.refreshTokens.includes(refreshToken)) {
    await user.updateOne({ $pullAll: { refreshTokens: [refreshToken] } });
    return generateTokens(userID);
  } else {
    throw new Error("Invalid refresh token");
  }
};

/**
 * Generate access and refresh tokens
 * @param userID The user ID to generate tokens for
 * @returns user ID, access token, refresh token
 */
const generateTokens = async (userID: string) => {
  const body = { userID };
  const user = await UserModel.findById(userID);

  if (!user) {
    throw new Error("User not found");
  }

  const refreshToken = jwt.sign(body, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7 days",
  });

  const accessToken = jwt.sign(body, process.env.JWT_SECRET!, {
    expiresIn: "1 minute",
  });

  await user.updateOne({ $addToSet: { refreshTokens: refreshToken } });

  return {
    id: userID,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};
