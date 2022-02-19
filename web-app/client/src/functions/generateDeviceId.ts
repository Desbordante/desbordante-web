import fingerprintJS from "@fingerprintjs/fingerprintjs";

const fpPromise = fingerprintJS.load();

export default async function () {
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}
