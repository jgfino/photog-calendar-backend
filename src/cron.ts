import cron from "node-cron";
import UserModel from "./schema/UserSchema";
import jwt from "jsonwebtoken";
import axios from "axios";

// Remove expired refresh tokens once a day
cron.schedule("0 0 * * *", async () => {
  try {
    for await (const doc of UserModel.find({}, "_id refreshTokens")) {
      doc.refreshTokens = doc.refreshTokens.filter((token) => {
        try {
          jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
          return true;
        } catch (e) {
          return false;
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
});

// Refresh user discord data every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    for await (const doc of UserModel.find(
      {},
      "_id discordAccessToken discordRefreshToken discordAccessTokenExpiry username discriminator avatar"
    )) {
      if (doc.discordAccessTokenExpiry < new Date()) {
        const axiosResponse = await axios.post(
          "https://discord.com/api/oauth2/token",
          new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: doc.discordRefreshToken,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn,
        } = axiosResponse.data;

        const expires = new Date(
          new Date().getTime() + Number(expiresIn) * 1000 - 10000
        );

        doc.discordAccessToken = accessToken;
        doc.discordAccessTokenExpiry = expires;
        doc.discordRefreshToken = refreshToken;
        await doc.save();
      }

      const user = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          authorization: `Bearer ${doc.discordAccessToken}`,
        },
      });

      const { username, discriminator, avatar } = user.data;

      doc.username = username;
      doc.discriminator = discriminator;
      doc.avatar = avatar;

      await doc.save();
    }
  } catch (e) {
    console.log(e);
  }
});
