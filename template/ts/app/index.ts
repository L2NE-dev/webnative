import { getBackendStatus, getPlatform } from "./api";

const platform = document.getElementById("platform");
if (platform) platform.textContent = getPlatform();

const backendStatus = document.querySelector(".backend-status");
if (backendStatus) backendStatus.innerHTML = await getBackendStatus();
