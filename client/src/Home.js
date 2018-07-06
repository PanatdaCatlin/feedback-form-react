import React, {Component} from 'react';
import {Container, Header, Table} from 'semantic-ui-react';
import axios from 'axios';

class home extends Component {
    constructor(props){
        super(props);
        this.getAccounts = this.getAccounts.bind(this);
        this.state = {
            accounts: null
        }
    }
    componentWillMount() {
        this.getAccounts();
    }
    getAccounts = async () => {
        const res = await axios.get('/api/v1/auth/accounts');
        this.setState({accounts: res.data.accounts})
    };
    render() {

        return (

            <Container text style={{marginTop: '7em'}}>
                <Header as='h1'>Analytics Portal</Header>
                {this.state.accounts ?
                    <Table celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Account</Table.HeaderCell>
                                <Table.HeaderCell>Token Valid Until</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {this.state.accounts.map((v,k) => (
                                <Table.Row>
                                    <Table.Cell>{v.email}</Table.Cell>
                                    <Table.Cell>{(new Date(parseFloat(v.expiry))).toString()}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>

                    </Table>
                    :null}
            </Container>
        )
            ;
    }
}

export default home;