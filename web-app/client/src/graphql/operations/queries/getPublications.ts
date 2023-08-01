import { cmsGql } from '@graphql/cmsGqlTag';

export const GET_PUBLICATIONS = cmsGql`
  query getPublications {
    prPublications(filters: {}, sort: ["date:desc"]) {
      data {
        id
        attributes {
          title
          date
          language {
            data {
              attributes {
                title
                abbreviation
                color
              }
            }
          }
          link {
            data {
              attributes {
                href
                platform {
                  data {
                    attributes {
                      title
                      icon {
                        data {
                          attributes {
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
    
    sciencePublications(filters: {}, sort: ["date:desc"]) {
      data {
        id
        attributes {
          title
          venue
          href
          cite
          date
        }
      }
    }
  }
`;
