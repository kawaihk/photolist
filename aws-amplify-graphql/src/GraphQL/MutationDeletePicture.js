import gql from 'graphql-tag';

export default gql`
mutation ($id: ID!) {
  deletePicture(input: {id:$id}) {
    id
  }
}`;
