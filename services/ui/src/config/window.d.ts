import { Config } from "./config";

declare global {
  interface Window {
    __config__?: Config;
  }
}

export {}; 