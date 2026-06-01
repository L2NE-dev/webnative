function getPlatform() {
  return "Windows";
}

const platform = document.getElementById("platform");
if (platform) platform.textContent = getPlatform();
