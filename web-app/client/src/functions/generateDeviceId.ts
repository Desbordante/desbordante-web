const { ClientJS } = require("clientjs");

const client = new ClientJS();

export default function () {
  const result = {
    fingerprint: client.getFingerprint(),
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
  return window.btoa(JSON.stringify(result));
}
