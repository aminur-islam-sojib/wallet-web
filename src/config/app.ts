import packageJson from "../../package.json";

export const APP_INFO = {
  name: packageJson.name,
  version: packageJson.version,
  commit: process.env.NEXT_PUBLIC_GIT_SHA,
};
