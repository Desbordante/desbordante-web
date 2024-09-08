module.exports = async () => {
  const serverProtocol = process.env.SERVER_PROTOCOL;
  const serverIP = process.env.SERVER_IP;
  const serverPort = process.env.SERVER_PORT;

  const cmsProtocol = process.env.CMS_PROTOCOL;
  const cmsIP = process.env.CMS_IP;
  const cmsPort = process.env.CMS_PORT;

  const serverURL = `${serverProtocol}://${serverIP}`;
  const serverGraphQLEndpoint = `${serverURL}/graphql`;
  const serverProxyURL = '/api/backend';

  const cmsURL = `${cmsProtocol}://${cmsIP}`;
  const cmsGraphQLEndpoint = `${cmsURL}/graphql`;
  const cmsProxyURL = '/api/cms';

  return [
    {
      source: `${serverProxyURL}/:path*`,
      destination: `${serverGraphQLEndpoint}/:path*`,
    },
    {
      source: `${cmsProxyURL}/uploads/:path*`,
      destination: `${cmsURL}/uploads/:path*`,
    },
    {
      source: `${cmsProxyURL}/:path*`,
      destination: `${cmsGraphQLEndpoint}/:path*`,
    },
  ]
};
