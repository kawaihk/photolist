import gql from 'graphql-tag';

export default gql`
mutation updatePicture ($input: UpdatePictureInput!) {
  updatePicture(input: $input) {
    id
    name
    visibility
    owner
    createdAt
    __typename
    file {
      region
      bucket
      key
      __typename
    }
  }
}`;
