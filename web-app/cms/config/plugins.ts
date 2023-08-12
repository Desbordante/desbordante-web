import path from 'path';

export default ({ env }) => ({
  graphql: {
    enabled: true,
    config: {
      generateArtifacts: true,
      shadowCRUD: true,
      defaultLimit: 100,
      artifacts: {
        schema: path.join(__dirname, '..', '..', 'schema.graphql'),
      },
      apolloServer: {
        introspection: true,
      },
    },
  },
});
