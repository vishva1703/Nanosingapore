import api from "./api";

export const signInWithGoogleAPI = (idToken) => {
  return api.post("auth/sign-in-with-google", {
    idToken,
    platform: "android",
  });
};
