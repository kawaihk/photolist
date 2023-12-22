import React, { Component } from "react";
import { graphql, compose } from 'react-apollo';
import { QueryListPictures, MutationDeletePicture, MutationUpdatePicture } from "../GraphQL";
import { Icon, Table, Button, Loader } from 'semantic-ui-react'
import { Storage, Auth } from 'aws-amplify';
import { v4 as uuid } from 'uuid';

class AllPhotos extends Component {
    constructor(props) {
        super(props);

        this.state = {
            photos: [],
            isEditing: false,
            editingID: '',
            editFormState: [],
        };

        this.handleChange = this.handleChange.bind(this);
    }

    setEditInput(key, value) {
        const editFormState = {...this.state.editFormState, [key]: value };
        this.setState( {editFormState: editFormState});
    }

    handleChange(field, event) {
        const { target: { value, files } } = event;
        const [file,] = files || [];
        this.setState({
            [field]: file || value
        });
    }

    async handleDownload({ visibility: level, file }) {
        try {
            const { bucket, region, key } = file;
            const [, , keyWithoutPrefix] = /([^/]+\/){2}(.*)$/.exec(key) || key;

            const url = await Storage.get(keyWithoutPrefix, { bucket, region, level });

            window.open(url);
        } catch (err) {
            console.error(err);
        }
    }


    async handleDelete( photo ) {
        try {
            this.setState(
                this.props.deletePicture(photo)
            )
        } catch (err) {
            console.error(err);
        }
    }

    async handleUpdate( photo ) {
        try {
            const updatePhoto = {
                id: photo.id,
                name: photo.name,
                visibility: photo.visibility,
                owner: photo.owner,
                createdAt: photo.createdAt,
                file: {
                  region: photo.file.region,
                  bucket: photo.file.bucket,
                  key: photo.file.key,
                }
            };
            this.setState(
                this.props.onUpdatePicture(updatePhoto)
            )
        } catch (err) {
            console.error(err);
        }
    }

    async onEditButtonClick( photo) {
        const id = photo.id
        const isEditing = this.state.isEditing;
        if (isEditing) {
            const editPhoto = {...photo};
            editPhoto.name = !(this.state.editFormState.name === '' || this.state.editFormState.name === undefined) ? this.state.editFormState.name : photo.name;
            const { bucket, region } = this.props.options;
            const {file: selectedFile } = this.state;
            let file;
            if (selectedFile) {
                const visibility = 'private';
                const { identityId } = await Auth.currentCredentials();
                const { name: fileName, type: mimeType } = selectedFile;
                const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName);
    
                const key = `${visibility}/${identityId}/${uuid()}${extension && '.'}${extension}`;
    
                file = {
                    bucket: bucket,
                    key: key,
                    region: region,
                    mimeType: mimeType,
                    localUri: selectedFile,
                };

                editPhoto.file = file;
            }
            await this.handleUpdate(editPhoto);
        }
        this.setState({isEditing: !isEditing});
        this.setState({editID: id});
    };

    render() {

        return (
            <React.Fragment>
                <Table celled={true}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell><Icon name={'key'} /> PhotoId</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'info'} />Friendly name</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'eye'} />Visibility</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'user'} />Owner</Table.HeaderCell>
                            <Table.HeaderCell><Icon name={'calendar'} />Created at</Table.HeaderCell>
                            <Table.HeaderCell> <Icon name={'download'} />Download</Table.HeaderCell>
                            <Table.HeaderCell> <Icon name={'delete'} />Delete</Table.HeaderCell>
                            <Table.HeaderCell> <Icon name={'redo'} />Update</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.props.photos && this.props.photos.items && [].concat(this.props.photos.items).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(photo => (
                            <Table.Row key={photo.id}>
                                <Table.Cell>{photo.file && photo.id}</Table.Cell>
                                <Table.Cell>
                                {this.state.isEditing && photo.id === this.state.editID ? 
                                (<>
                                    <input
                                        onChange={(event) => this.setEditInput('name', event.target.value)}
                                        defaultValue={photo.name}
                                        placeholder={photo.name}
                                      />
                                </>
                                ) : (
                                  <>  {photo.name} </>
                                )}
                                    
                                </Table.Cell>
                                <Table.Cell>{photo.visibility}</Table.Cell>
                                <Table.Cell>{photo.owner}</Table.Cell>
                                <Table.Cell>{photo.file && photo.createdAt}</Table.Cell>
                                <Table.Cell>
                                {this.state.isEditing && photo.id === this.state.editID ? 
                                (
                                <>  
                                    <input type="file" 
                                        onChange={this.handleChange.bind(this, 'file')} 
                                        defaultValue={photo.file.name}
                                        placeholder={photo.file.name}
                                    /> 
                                </>                               
                                ) : (
                                <>
                                    {photo.file? <Button icon labelPosition="right" onClick={this.handleDownload.bind(this, photo)}><Icon name="download" />Download</Button> : <Loader inline='centered' active size="tiny" />}
                                </>
                                )}
                                </Table.Cell>
                                <Table.Cell><Button icon labelPosition="right" onClick={this.handleDelete.bind(this, photo)}><Icon name="delete" />Delete</Button></Table.Cell>
                                <Table.Cell><Button icon labelPosition="right" onClick={this.onEditButtonClick.bind(this, photo)}>
                                    {this.state.isEditing && photo.id === this.state.editID ?
                                        (
                                        <><Icon name="save" />Save</>
                                        ) : (
                                        <><Icon name="edit" />Edit</>
                                    )}
                                </Button></Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }

}

export default compose(
    graphql(
    QueryListPictures,
    {
        options: {
            fetchPolicy: 'cache-and-network',
        },
        props: ({ data: { listPictures: photos } }) => ({
            photos,
        })
    }),
    graphql(
    MutationDeletePicture,
    {
        options: {
            update: (proxy, { data: { deletePicture: photo } }) => {
                const query = QueryListPictures;
                const data = proxy.readQuery({ query });
                data.listPictures.items = [
                    ...data.listPictures.items.filter((e) => e.id !== photo.id)
                ];
                proxy.writeQuery({ query, data });
            }
        },
        props: ({ ownProps, mutate }) => ({
            deletePicture: photo => mutate({
                variables: { id: photo.id },
                optimisticResponse: () => ({
                    deletePicture: 
                        { ...photo, __typename: 'Picture' } 
                }),
            }),
        }),
    }),
    graphql(
        MutationUpdatePicture,
        {
            options: {
                update: (proxy, { data: { updatePicture } }) => {
                    const query = QueryListPictures;
                    const data = proxy.readQuery({ query });
                    data.listPictures.items = [
                        ...data.listPictures.items.filter((e) => e.id !== updatePicture.id),
                        updatePicture,
                    ];
                    proxy.writeQuery({ query, data });
                }
            },
            props: props => ({
                onUpdatePicture: photo => 
                    props.mutate({
                        variables: {input: photo},
                        optimisticResponse: () => ({
                            updatePicture: 
                            { ...photo,
                              __typename: 'Picture',
                              file: { ...photo.file,
                                      __typename: 'S3Object',
                              }
                        }
                    }),
                }), 
            }),
        })    
)(AllPhotos);
