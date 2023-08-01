import { cmsGql } from '@graphql/cmsGqlTag';

export const GET_TEAM_MEMBERS = cmsGql`
  query getTeamMembers {
    teamMembers(filters: {}, sort: ["displayPriority:desc", "fullName:asc"]) {
      data {
        id
        attributes {
          fullName
          position
          isActive
          description
          displayPriority
          links {
            data {
              id
              attributes {
                href
                platform {
                  data {
                    attributes {
                      title
                      icon {
                        data {
                          attributes {
                            width
                            height
                            alternativeText
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
