import { IncomingHttpHeaders } from "http";
import createContext from "../../graphql/context";

export const getContext = async () => {
    const headers: IncomingHttpHeaders = {} as unknown as IncomingHttpHeaders;
    headers["x-request-id"] =
        "bc6e5ac3-54fd-4041-93b2-a0a5e7dd7405:203313997::4d756056-a2d3-4ea5-8f15-4a72f2689d09";
    headers["x-device"] =
        "eyJkZXZpY2VJRCI6ImJjNmU1YWMzLTU0ZmQtNDA0MS05M2IyLWEwYTVlN2RkNzQwNToyMDMzMTM5OTciLCJ1c2VyQWdlbnQiOiJNb3ppbGxhLzUuMCAoWDExOyBMaW51eCB4ODZfNjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85OC4wLjQ3NTguMTAyIFNhZmFyaS81MzcuMzYiLCJicm93c2VyIjoiQ2hyb21lIiwiZW5naW5lIjoiQmxpbmsiLCJvcyI6IkxpbnV4Iiwib3NWZXJzaW9uIjoieDg2XzY0IiwiY3B1IjoiYW1kNjQiLCJzY3JlZW4iOiJDdXJyZW50IFJlc29sdXRpb246IDE5MjB4MTA4MCwgQXZhaWxhYmxlIFJlc29sdXRpb246IDE5MjB4MTA1MywgQ29sb3IgRGVwdGg6IDI0LCBEZXZpY2UgWERQSTogdW5kZWZpbmVkLCBEZXZpY2UgWURQSTogdW5kZWZpbmVkIiwicGx1Z2lucyI6IlBERiBWaWV3ZXIsIENocm9tZSBQREYgVmlld2VyLCBDaHJvbWl1bSBQREYgVmlld2VyLCBNaWNyb3NvZnQgRWRnZSBQREYgVmlld2VyLCBXZWJLaXQgYnVpbHQtaW4gUERGIiwidGltZVpvbmUiOiIrMDMiLCJsYW5ndWFnZSI6ImVuLVVTIn0=";
    return await createContext(headers);
};
