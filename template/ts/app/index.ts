import { getBackendStatus, getPlatform } from "./api";

const platform = document.getElementById("platform");
if (platform) platform.textContent = getPlatform();

const backendStatus = document.getElementById("backend-status");
if (backendStatus) backendStatus.textContent = await getBackendStatus();
