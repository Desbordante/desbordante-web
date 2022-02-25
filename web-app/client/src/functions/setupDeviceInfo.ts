const { ClientJS } = require("clientjs");
const { v4: uuidv4 } = require("uuid");

const client = new ClientJS();

export function generateDeviceInfo() {
  const deviceAttributes = {
    deviceID: `${uuidv4()}:${client.getFingerprint()}`,
    userAgent: client.getUserAgent(),
    browser: client.getBrowser(),
    engine: client.getEngine(),
    os: client.getOS(),
    osVersion: client.getOSVersion(),
    device: client.getDevice(),
    cpu: client.getCPU(),
    screen: client.getScreenPrint(),
    plugins: client.getPlugins(),
    timeZone: client.getTimeZone(),
    language: client.getLanguage(),
  };
  const deviceInfo = JSON.stringify(deviceAttributes);
  const { deviceID } = deviceAttributes;

  return { deviceID, deviceInfoBase64: window.btoa(deviceInfo) };
}

export default function setupDeviceInfo() {
  if (
    !localStorage.getItem("deviceInfo") ||
    !localStorage.getItem("deviceID")
  ) {
    const { deviceID, deviceInfoBase64 } = generateDeviceInfo();
    localStorage.setItem("deviceID", deviceID);
    localStorage.setItem("deviceInfo", deviceInfoBase64);
  }
}
