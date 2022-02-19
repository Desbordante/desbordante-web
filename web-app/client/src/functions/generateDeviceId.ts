import fingerprintJS from "@fingerprintjs/fingerprintjs";
import _ from "lodash";

const fpPromise = fingerprintJS.load();

export default async function () {
  const fp = await fpPromise;
  const result = _.pick(await fp.get(), ["visitorId", "components"]);
  return window.btoa(JSON.stringify(result));
}
