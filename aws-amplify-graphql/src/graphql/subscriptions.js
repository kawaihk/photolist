/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePicture = /* GraphQL */ `
  subscription OnCreatePicture(
    $filter: ModelSubscriptionPictureFilterInput
    $owner: String
  ) {
    onCreatePicture(filter: $filter, owner: $owner) {
      id
      name
      owner
      visibility
      file {
        bucket
        region
        key
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdatePicture = /* GraphQL */ `
  subscription OnUpdatePicture(
    $filter: ModelSubscriptionPictureFilterInput
    $owner: String
  ) {
    onUpdatePicture(filter: $filter, owner: $owner) {
      id
      name
      owner
      visibility
      file {
        bucket
        region
        key
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeletePicture = /* GraphQL */ `
  subscription OnDeletePicture(
    $filter: ModelSubscriptionPictureFilterInput
    $owner: String
  ) {
    onDeletePicture(filter: $filter, owner: $owner) {
      id
      name
      owner
      visibility
      file {
        bucket
        region
        key
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
