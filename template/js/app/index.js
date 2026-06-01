import { getPlatform } from "./api";

const platform = document.getElementById("platform");
if (platform) platform.textContent = getPlatform();
