const deviceInfoString = `{
        "deviceID":"bc6e5ac3-54fd-4041-93b2-a0a5e7dd7405:203313997",
        "userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36",
        "browser":"Chrome","engine":"Blink",
        "os":"Linux",
        "osVersion":"x86_64","cpu":"amd64",
        "screen":"Current Resolution: 1920x1080, Available Resolution: 1920x1053, Color Depth: 24, Device XDPI: undefined, Device YDPI: undefined",
        "plugins":"PDF Viewer, Chrome PDF Viewer, Chromium PDF Viewer, Microsoft Edge PDF Viewer, WebKit built-in PDF",
        "timeZone":"+03",
        "language":"en-US"}`;

const deviceInfoBase64 = new Buffer(deviceInfoString).toString("base64");

export const mock = {
    deviceInfoString,
    deviceInfoBase64,
};
