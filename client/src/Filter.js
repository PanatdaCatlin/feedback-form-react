import React, {Component} from 'react'
import {Header, Message, Button, Icon, Container, Table, Modal, Dimmer, Loader} from 'semantic-ui-react'
import Axios from 'axios'
import ReactJson from 'react-json-view'

class Filter extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            accountID: '60544531',
            isLoading: false,
        }
    }

    handleSubmit = () => {
        this.setState({isLoading: true})
        Axios.post('/v1/filter/accountPermissions', {accountID: this.state.accountID})
            .then((res) => {
                console.log(res.data)
                this.setState({permissions: res.data, isLoading: false})
            })
            .catch(e => alert(e))
    };
    handleGetUpdates = () => {
        this.setState({isLoading: true})
        Axios.post('/v1/filter/management', {accountID: this.state.accountID})
            .then((res) => {
                console.log(res.data)
                this.setState({updates: res.data, isLoading: false})
            })
            .catch(e => alert(e))
    };
    updateFilter = (filter, i) => {
        const targetUpdate = this.state.updates.updates[i];
        this.setState({targetFilter: filter, targetUpdate: targetUpdate, showModal: true})
    };
    handleUpdateSubmit = () => {
        this.setState({isLoading: true})
        Axios.post('/v1/filter/updateFilter', {update: this.state.targetUpdate})
            .then(res => {
                    this.setState({verifiedUpdate: res.data, isLoading: false})
                    // this.handleGetUpdates()
                }
            )
            .catch(e => alert(e))
    };
    handleVerify = () => {
        this.setState({showModal: false, verifiedUpdate: null})
        this.handleGetUpdates()
    }

    render() {
        return (
            <Container id="mainContent">
                <Modal
                    open={this.state.showModal}
                    onClose={() => this.setState({showModal: false})}
                    size='small'
                    basic
                >
                    <Dimmer active={this.state.isLoading}>
                        <Loader/>
                    </Dimmer>
                    {this.state.verifiedUpdate ?
                        <div>
                            <Header content='Update'/>
                            <Modal.Content>
                                <h3>Verify Update</h3>
                                {<ReactJson theme="monokai" src={this.state.verifiedUpdate} name='UPDATED'/>}
                                <br/>
                            </Modal.Content>
                            <Modal.Actions>
                                {this.state.verifiedUpdate.id === this.state.targetUpdate.filterId && this.state.verifiedUpdate.id === this.state.targetFilter.id ?
                                    <Message positive>

                                        <Message.Header>Verification Success</Message.Header>
                                        <p>Target Filter ID matches Current Fiter ID and Updated Filter ID</p>
                                    </Message>
                                    :
                                    <Message negative>
                                        <Message.Header>Verification Failure</Message.Header>
                                        <p>Target Filter ID does not match Current Fiter ID and Updated Filter ID</p>
                                        <p>If you're seeing this message, contact aditya@wheelhousedmg.com and stop
                                            using this tool</p>
                                    </Message>
                                }
                                <Button color='red' onClick={() => alert('Contact aditya@wheelhousedmg.com')} inverted>
                                    <Icon name='remove'/> Update Failed
                                </Button>
                                <Button color='green' onClick={this.handleVerify} inverted>
                                    <Icon name='checkmark'/> Success
                                </Button>
                            </Modal.Actions>
                        </div>
                        :
                        <div>
                            <Modal.Content>
                                <h3>Update filter for {}</h3>
                                {<ReactJson src={this.state.targetFilter} theme="monokai" name='current'/>}
                                <br/>
                                {<ReactJson src={this.state.targetUpdate} theme="monokai" name='update'/>}
                                <br/>
                            </Modal.Content>
                            {this.state.targetFilter && (this.state.targetFilter.id === this.state.targetUpdate.filterId) ?
                                < Modal.Actions>
                                    <Message positive>

                                        <Message.Header>Verification Success</Message.Header>
                                        <p>Target Filter ID matches Current Fiter ID</p>
                                    </Message>
                                    < Button color='red' onClick={() => this.setState({showModal: false})} inverted>
                                        <Icon name='remove'/> Cancel
                                    </Button>
                                    <Button color='green' onClick={this.handleUpdateSubmit} inverted>
                                        <Icon name='checkmark'/> Update
                                    </Button>
                                </Modal.Actions>
                                :
                                <Message negative>
                                    <Message.Header>Verification Error</Message.Header>
                                    <p>Target Filter ID does not Match Current Fiter ID</p>
                                </Message>
                            }
                        </div>
                    }

                </Modal>
                <br/>
                <Header as='h1'>Filter Management</Header>
                <Button loading={this.state.isLoading} disabled={this.state.isLoading} onClick={this.handleSubmit}>Get
                    Account Permissions</Button>
                <Button loading={this.state.isLoading} disabled={this.state.isLoading} onClick={this.handleGetUpdates}>Get
                    Filters to Update</Button>

                {this.state.updates ?
                    <div>
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Account Name</Table.HeaderCell>
                                    <Table.HeaderCell>Filter Name</Table.HeaderCell>
                                    <Table.HeaderCell>Filter Type</Table.HeaderCell>
                                    <Table.HeaderCell>Filter Field</Table.HeaderCell>
                                    <Table.HeaderCell>Filter Rule</Table.HeaderCell>
                                    <Table.HeaderCell>Update & Verify</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {this.state.updates.updated ? this.state.updates.updated.map((filter, i) => (
                                    <Table.Row>
                                        <Table.Cell>{filter.accountName}</Table.Cell>
                                        <Table.Cell>{filter.name}</Table.Cell>
                                        <Table.Cell>{filter.type}</Table.Cell>
                                        <Table.Cell>{filter.excludeDetails.field}</Table.Cell>
                                        <Table.Cell>{filter.excludeDetails.expressionValue}</Table.Cell>
                                        <Table.Cell>
                                            <Icon name='checkmark' color='green'/>
                                        </Table.Cell>
                                    </Table.Row>
                                )) : null
                                }
                                {this.state.updates.toUpdate.map((filter, i) => (
                                    <Table.Row>
                                        <Table.Cell>{filter.accountName}</Table.Cell>
                                        <Table.Cell>{filter.name}</Table.Cell>
                                        <Table.Cell>{filter.type}</Table.Cell>
                                        <Table.Cell>{filter.excludeDetails.field}</Table.Cell>
                                        <Table.Cell>{filter.excludeDetails.expressionValue}</Table.Cell>
                                        <Table.Cell>
                                            <Button color='red' onClick={() => this.updateFilter(filter, i)}
                                                    disabled={!filter.canEdit || this.state.isLoading}
                                                    loading={this.state.isLoading}>UPDATE</Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                        <Table>
                            <Table.Header>
                                <Table.HeaderCell>
                                    Accounts without Wheelhouse IP Filters
                                </Table.HeaderCell>
                            </Table.Header>
                            <Table.Body>
                                {this.state.updates.missingFilter ?
                                    this.state.updates.missingFilter.map(account => (
                                        <Table.Row>{account.name}</Table.Row>
                                    ))
                                    : null}
                            </Table.Body>
                        </Table>
                    </div>
                    : null}
                {this.state.permissions ?
                    <Table>
                        {this.state.permissions.map(row => (
                            <Table.Row>
                                {row.map(cell => <Table.Cell>{cell}</Table.Cell>)}
                            </Table.Row>
                        ))}
                    </Table>
                    : null}
            </Container>
        )
    }
}

export default Filter