import React, {Component} from 'react'
import {Header, Loader, List, Segment, Button, Icon, Label, Table} from 'semantic-ui-react'
import Axios from 'axios'
import AccountBrowser from './Components/accountBrowser';
import ReactJson from 'react-json-view'


class Integrity extends Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAccountChange = this.handleAccountChange.bind(this);
        this.state = {
            accountId: null,
            viewTests: [
                {
                    name: 'Default', category: 'View', results: [], test: (view) => {
                        return view.defaultPage !== ''
                    }
                },
                {
                    name: 'E-Commerce Tracking', category: 'View', results: [], test: (view) => {
                        return view.eCommerceTracking
                    }
                },
                {
                    name: 'Enhanced E-Commerce Enabled', category: 'View', results: [], test: (view) => {
                        return view.enhancedECommerceTracking
                    }
                },
                {
                    name: 'Known Bot Exclusions', category: 'View', results: [], test: (view) => {
                        return view.botFilteringEnabled
                    }
                },
                {
                    name: 'Site Search Parameters', category: 'View', results: [], test: (view) => {
                        return view.siteSearchQueryParameters !== ''
                    }
                },
                {
                    name: 'Unnecessary Tracking Parameters', category: 'View', results: [], test: (view) => {
                        return view.excludeQueryParameters !== ''
                    }
                },

                {
                    name: 'Debug', category: 'View', results: [], test: (view) => {
                        return view.name.match(/debug/gi)
                    }
                },
                {
                    name: 'Reporting', category: 'View', results: [], test: (view) => {
                        return view.name.match(/(master|report|primary)/gi)
                    }
                },
                {
                    name: 'Test', category: 'View', results: [], test: (view) => {
                        return view.name.match(/test/gi)
                    }
                },
                {
                    name: 'Unfiltered', category: 'View', results: [], test: (view) => {
                        return view.name.match(/(unfilter)|(no filter)/gi)
                    }
                },
                {
                    name: 'User ID', category: 'View', results: [0, 1, 0, 0], test: (view) => {
                        return view.name.match(/id/gi)
                    }
                },
            ],
            filterTests: [
                {
                    name: 'Exclude Filters', category: 'Filter', results: [], test: (filters) => {
                        return filters.map(filter => filter.type === 'EXCLUDE' ? filter.name : null).filter(a => a != null)
                    }
                },
                {
                    name: 'Include Filters', category: 'Filter', results: [], test: (filters) => {
                        return filters.map(filter => filter.type === 'INCLUDE' ? filter.name : null).filter(a => a != null)
                    }
                },
                {
                    name: 'IP Filters', category: 'Filter', results: [], test: (filters) => {
                        return filters.map(filter => filter.type === 'EXCLUDE' && (filter.excludeDetails.matchType === 'GEO_IP_ADDRESS' || filter.excludeDetails.field === 'GEO_IP_ADDRESS') ? filter.name : null).filter(a => a != null)
                    }
                },
                {
                    name: 'Lowercase Filters', category: 'Filter', results: [], test: (filters) => {
                        return filters.map(filter => filter.type === 'LOWERCASE' ? filter.name : null).filter(a => a != null)
                    }
                },
            ]
        }
    }

    handleSubmit = () => {
        Axios.post('/v1/integrity/views', {accountId: this.state.accountId})
            .then((res) => {
                console.log(res.data);
                this.setState({views: res.data.items})
                let allResults = []
                this.state.viewTests.map(test => {
                    test.results = this.state.views.map(view => test.test(view))
                    allResults.push(test);
                });
                console.log(allResults)
                this.setState({viewTests: allResults})
                const propIds = Array.from(new Set(this.state.views.map(view => view.webPropertyId)))
                this.setState({properties: propIds})
                Axios.post('/v1/integrity/customDimMet', {accountId: this.state.accountId, propIds: propIds})
                    .then((res) => {
                        this.setState({customDimMet: res.data.items})

                    })
                    .catch(e => alert(e));
            })
            .catch(e => {
                alert(e)
            });

        Axios.post('/v1/integrity/filters', {accountId: this.state.accountId})
            .then((res) => {
                this.setState({filters: res.data.items})
                console.log(res.data.items);
                let allResults = []
                this.state.filterTests.map(test => {
                    test.results = test.test(this.state.filters)
                    allResults.push(test);
                });
                this.setState({filterTests: allResults})

            })
            .catch(e => {
                alert(e)
            });
    };

    handleAccountChange = (e, {value}) => {
        this.setState({accountId: value})
    };

    render() {
        return (
            <div id="mainContent" style={{padding: '2em'}}>
                <br/>
                <Header as='h1'>Integrity Checker</Header>
                <Header as='h3'>Choose an Account</Header>
                <AccountBrowser loggedIn={this.props.loggedIn} handleAccountChange={this.handleAccountChange}/> {' '}
                <Button disabled={!this.state.accountId} primary onClick={this.handleSubmit}>Analyze</Button>
                <br/>
                <br/>
                <br/>
                {this.state.views ?
                    <div>
                        <Header as='h3'>Report</Header>
                        <Header as='h4'>Views</Header>
                        <Table celled fixed selectable definition>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Tests</Table.HeaderCell>
                                    {/*<Table.HeaderCell>Rollup</Table.HeaderCell>*/}
                                    {this.state.views.map(view => <Table.HeaderCell><br/>{view.name} <a
                                        href={view.websiteUrl}>{view.websiteUrl}</a><Label>{view.webPropertyId}</Label></Table.HeaderCell>)}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {this.state.viewTests.map(test => (
                                    <Table.Row>
                                        <Table.Cell>{test.name}</Table.Cell>
                                        {test.results.length === 0 ?
                                            this.state.views.map(view => (
                                                <Table.Cell><Loader active inline/></Table.Cell>))
                                            :
                                            test.results.map(result => <Table.Cell>{<Icon size='large'
                                                                                          name={result ? 'checkmark' : 'remove'}
                                                                                          color={result ? 'green' : 'red'}/>}</Table.Cell>)
                                        }
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                        <Segment>
                            <ReactJson collapsed name={'views'} src={this.state.views}/>
                        </Segment>
                    </div>
                    : null}
                {this.state.filters ?
                    <div>
                        <br/>
                        <Header as='h4'>Filters</Header>
                        <Table definition selectable>
                            <Table.Body>
                                {this.state.filterTests.map(filterTest => (
                                    <Table.Row>
                                        <Table.Cell>{filterTest.name}</Table.Cell>
                                        <Table.Cell>{filterTest.results.join(', ')}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                        <Segment>
                            <ReactJson collapsed name={'filters'} src={this.state.filters}/>
                        </Segment>
                    </div>
                    : null}
                {this.state.customDimMet ?
                    <div>
                        <br/>
                        <Header as='h4'>Custom Dimensions & Metrics</Header>
                        <Table definition selectable celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Tests</Table.HeaderCell>
                                    {/*<Table.HeaderCell>Rollup</Table.HeaderCell>*/}
                                    {Object.keys(this.state.customDimMet.customDimension).map(key =>
                                        <Table.HeaderCell><br/>{key} </Table.HeaderCell>)}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>Custom Dimensions</Table.Cell>
                                    {Object.keys(this.state.customDimMet.customDimension).map(key => (
                                        <Table.Cell>
                                            <List>
                                                {this.state.customDimMet.customDimension[key].map(dim => (
                                                    <List.Item>{dim.name}</List.Item>
                                                ))}
                                            </List>
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>Custom Dimensions</Table.Cell>
                                    {Object.keys(this.state.customDimMet.customMetrics).map(key => (
                                        <Table.Cell>
                                            <List>
                                                {this.state.customDimMet.customMetrics[key].map(met => (
                                                    <List.Item>{met.name}</List.Item>
                                                ))}
                                            </List>
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            </Table.Body>
                        </Table>
                        <Segment>
                            <ReactJson collapsed name={'Custom Dim & Met'} src={this.state.customDimMet}/>
                        </Segment>
                    </div>
                    : null}
            </div>
        )
    }
}

export default Integrity