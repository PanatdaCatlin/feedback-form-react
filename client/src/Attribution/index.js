import _ from 'lodash';
import React, {Component} from 'react';
import {Icon, Message, Modal, Header, Form, Container, Table, Label, Statistic, Dropdown} from 'semantic-ui-react';
import Axios from 'axios';
import fileDownload from 'js-file-download';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Viz from 'viz.js';
import tableToCsv from 'node-table-to-csv';
// import {Sigma, EdgeShapes, RandomizeNodePositions, RelativeSize} from 'react-sigma';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import MetaAccountBrowser from '../Components/metaAccountBrowser';
import AccountBrowser from '../Components/accountBrowser';
import PropertyBrowswer from '../Components/propertyBrowser';
import ViewBrowser from '../Components/viewBrowser';
import GoalBrowser from '../Components/goalBrowser';

const start = moment().subtract(7, 'days');
const end = moment();
const localUrl = 'http://192.168.10.188:5001';
// const localUrl = 'http://127.0.0.1:5001';
const colorPal = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'].reverse();


const addCommas = (nStr) => {
    nStr += '';
    let x = nStr.split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};

class Attribution extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.state = {
            showTutorial: false,
            accountId: null,
            accountName: 'Model Comparison',
            metaAccountId: null,
            profileId: null,
            propertyId: null,
            startDate: start,
            message: null,
            messagep: 'This can take up to 5 minutes',
            error: false,
            endDate: end,
            metadata: {
                paths: null,
                allPaths: null,
                conversions: null
            },
            options: {
                showGraphs: false,
                showAdvanced: false,
            },
            query: {
                "cgp": 'default',
                "startDate": start.format('YYYY-MM-DD'),
                "endDate": end.format('YYYY-MM-DD'),
                "ids": null,
                "dimensions": "mcf:sourceMediumPath,mcf:campaignPath,mcf:conversionGoalNumber",
                "metrics": "mcf:totalConversions",
                "goalNumber": 1,
                "order": 2,
                "dm": 'default',
                "filter" : true
            },
            isLoading: false,
        };
    }

    componentDidMount() {
    }

    async handleSubmit() {
        this.setState({isLoading: true, message: 'Pulling Data', error: false});
        Axios.request({
            url: `/api/v1/attribution/report/${this.state.metaAccountId}`,
            method: 'post',
            headers: {Cookie: document.cookie},
            data: this.state.query,
            timeout: 5000000
        })
            .then((res) => {
                console.log(res);
                if (res.data) {
                    this.setState({isLoading: false, mcfData: res.data, error: false});
                    this.handleReporting();
                    let count = 0;
                    let paths = 0;
                    for (let i = 0; i < (res.data.json).length; i++) {
                        if (parseInt(res.data.json[i][2].primitiveValue) === parseInt(this.state.query.goalNumber)) {
                            count += parseInt(res.data.json[i][3].primitiveValue);
                            paths++;
                        }
                    }
                    this.setState({
                        metadata:
                            {
                                conversions: count,
                                paths: paths,
                                allPaths: (res.data.json).length
                            }
                    })
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.message.includes('401') && !this.state.loggedIn) {
                    alert('HTTP401: Please Log In First or Log out and log back in');
                    this.setState({isLoading: false, mcfData: null});
// TODO: HANDLE Logged In && acc token expired
                } else if (err.message.includes('401') && this.state.loggedIn) {
                    alert('HTTP401: Your Session has Expired, please log in again');
                    this.setState({isLoading: false, mcfData: null, loggedIn: false});
                } else {
                    this.setState({
                        isLoading: false,
                        message: err.response.data,
                        error: true,
                        messagep: null,
                        mcfData: null,
                        attributionData: null,
                        attributionTable: null,
                        attributionChart: null
                    });
                }
            });
    }

    handleChange(e) {
        let tempState = this.state.query;
        tempState[e.target.name] = e.target.value;
        this.setState({query: tempState});
    }

    handleStartChange(e) {
        let q = this.state.query;
        q.startDate = e.format('YYYY-MM-DD');
        this.setState({startDate: e, query: q});
    }

    handleEndChange(e) {
        let q = this.state.query;
        q.endDate = e.format('YYYY-MM-DD');
        this.setState({endDate: e, query: q});
    }

    async handleReporting() {
        this.setState({isLoading: true, message: 'Running Analysis Models'});
        const key = 'n8YKGEpSmLpQc2UtSFxvr6y6RpmFmiGM';
        const formData = {
            'order': this.state.query.order,
            'goal': this.state.query.goalNumber,
            'format': 'json',
            'key': key,
            'csv': this.state.mcfData.csv,
        };
        Axios.post(`/api/v1/attribution/report`,
            formData, {
                timeout: 300000
            })
            .then((res) => {
                if (res.data) {
                    let table = [];
                    let finalJson = {};
                    let chartobj = [];
                    let series = [];

                    _.map(res.data, (v, k) => {
                        let ch = JSON.parse(JSON.stringify(v));
                        _.map(ch, (val, key) => ch[key] = parseFloat((val * 100).toFixed(2)));
                        ch['name'] = k;
                        if (!k.match(/Removal/)) {
                            chartobj.push(ch);
                            // console.log(ch);
                            _.map(v, (val, key) => {
                                finalJson[key] ? finalJson[key] = [...finalJson[key], val] : finalJson[key] = [key, val]
                            })
                        }
                    });
                    _.map(finalJson, (v, k) => {
                        if (!(k.match(/Removal/))) {
                            series.push({field: k})
                        }
                    });
                    this.setState({
                        isLoading: false,
                        message: null,
                        report: {
                            accountName: this.state.accountName,
                            startDate: this.state.query.startDate,
                            endDate: this.state.query.endDate,
                        },
                        attributionData: res.data,
                        attributionTable: finalJson,
                        attributionChart: {chartSeries: series, data: chartobj}
                    });
                }
            })
            .catch((err) => {
                console.log('ERROR' + err.response.data);
                // alert(err);
                this.setState({isLoading: false, message: err.response.data, error: true, messagep: null});
            });
        if (this.state.options.showGraphs) {

            this.handleGraph();
            this.handleFullGraph();
            this.handleJsonGraph();
        }
    }

    async handleGraph() {
        const key = 'n8YKGEpSmLpQc2UtSFxvr6y6RpmFmiGM';
        Axios.get(`${localUrl}/api/v1/markov-graph?order=${this.state.query.order}&goal=${this.state.query.goalNumber}&trim=${'True'}&key=${key}&csv=${'http://192.168.30.204:4000/mcf.csv'}`,
            {
                timeout: 300000
            })
            .then((res) => {
                const graph = res.data;
                const graphSvg = Viz(graph);
                this.setState({graphSvg});
            })
            .catch((err) => {
                console.log(err)
            });
    }

    async handleJsonGraph() {
        const key = 'n8YKGEpSmLpQc2UtSFxvr6y6RpmFmiGM';
        Axios.get(`${localUrl}/api/v1/markov-graph-json?order=${this.state.query.order}&goal=${this.state.query.goalNumber}&trim=${'True'}&key=${key}&csv=${'http://192.168.30.204:4000/mcf.csv'}`.anchor({
            timeout: 300000
        }))
            .then((res) => {
                const graph = res.data;
                console.log(graph);
                this.setState({graph});
            })
            .catch((err) => {
                console.log(err)
            });
    }

    async handleFullGraph() {
        const key = 'n8YKGEpSmLpQc2UtSFxvr6y6RpmFmiGM';
        Axios.get(`${localUrl}/api/v1/markov-graph?order=${this.state.query.order}&goal=${this.state.query.goalNumber}&trim=${'False'}&key=${key}&csv=${'http://192.168.30.204:4000/mcf.csv'}`,
            {
                timeout: 300000
            })
            .then((res) => {
                const graph = res.data;
                const graphSvgFull = Viz(graph);
                this.setState({graphSvgFull});
            })
            .catch((err) => {
                console.log(err)
            });
    }

    //TODO: Put the selectors in another component
    //TODO: Refactor handlechanges for selectors better

    triggerProvGrouping = (e, {value}) => {
        let tempState = this.state.query;
        if (tempState['cgp'] === 'default') {
            tempState['cgp'] = 'providence';
        } else {
            tempState['cgp'] = 'default';
        }
        this.setState({query: tempState});
    };

    triggerDirectUnknown = (e, {value}) => {
        let tempState = this.state.query;
        if (tempState['dm'] === 'default') {
            tempState['dm'] = 'unknown';
        } else {
            tempState['dm'] = 'default';
        }
        this.setState({query: tempState});
    };
    triggerNullModel = (e, {value}) => {
        let tempState = this.state.query;
            tempState['filter'] = !tempState['filter'];
        this.setState({query: tempState});
    };

    triggerNullModel = (e, {value}) => {
        let tempState = this.state.query;
            tempState['filter'] = !tempState['filter'];
        this.setState({query: tempState});
    };

    handleMetaAccountChange = (e, {value}) => {
        let tempState = this.state.query;
        tempState['ids'] = null;
        this.setState({query: tempState});
        this.setState({
            metaAccountId: value,
            accountId: null,
            propertyId: null,
            query: tempState,
            profileId: null,
            attributionData: null,
            attributionTable: null,
            attributionChart: null
        })
    };
    handleAccountChange = (e, v) => {
        const value = v.value;
        let tempState = this.state.query;
        tempState['ids'] = null;
        this.setState({
            query: tempState,
            accountId: value,
            propertyId: null,
            query: tempState,
            profileId: null,
            attributionData: null,
            attributionTable: null,
            attributionChart: null
        });
        v.options.map((v) => {
            if (v.key === value) {
                this.setState({accountName: v.text})
            }
        })
    };
    handlePropertyChange = (e, {value}) => {
        let tempState = this.state.query;
        tempState['ids'] = null;
        this.setState({query: tempState});
        this.setState({
            propertyId: value, query: tempState, profileId: null, attributionData: null,
            attributionTable: null,
            attributionChart: null
        })
    };
    handleViewChange = (e, {value}) => {
        let tempState = this.state.query;
        tempState['ids'] = 'ga:' + value;
        this.setState({
            query: tempState, profileId: value, attributionData: null,
            attributionTable: null,
            attributionChart: null
        });
    };
    handleGoalChange = (e, {value}) => {
        let tempState = this.state.query;
        tempState['goalNumber'] = value;
        this.setState({
            query: tempState, attributionData: null,
            attributionTable: null,
            attributionChart: null
        });
    };

    renderReport() {
        if (this.state.attributionData && this.state.attributionTable) {
            return (
                <div style={{position: 'relative'}}>
                    <Dropdown style={{position: 'absolute', right: '0'}} icon='download' floating button
                              className='icon'>
                        <Dropdown.Menu>
                            <Dropdown.Item key='report_pdf' value='report_pdf' text='Report PDF'/>
                            <Dropdown.Item onClick={() => {
                                const table = tableToCsv(document.getElementById('reportTable').outerHTML);
                                console.log(table);
                                fileDownload(table, `Attribution_${this.state.report.accountName}_${this.state.report.startDate}-${this.state.report.endDate}.csv`);
                            }} key='attr_table_csv' value='attr_table_csv' text='Attribution Table CSV'/>
                            <Dropdown.Item onClick={() => fileDownload(this.state.mcfData.csv, `RawPaths_${this.state.report.accountName}_${this.state.report.startDate}-${this.state.report.endDate}.csv`)}
                                           key='raw_csv' value='raw_csv' text='Raw Path CSV'/>
                            <Dropdown.Item
                                onClick={() => fileDownload(JSON.stringify(this.state.mcfData.json), `RawPaths_${this.state.report.accountName}_${this.state.report.startDate}-${this.state.report.endDate}.json`)}
                                key='raw_json' value='raw_json' text='Raw Path JSON'/>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Header
                        as="h3">{`${this.state.report.accountName}`}<Header.Subheader>{` ${this.state.report.startDate} to ${this.state.report.endDate}`}</Header.Subheader></Header>
                    <BarChart width={document.getElementById('mainContent').offsetWidth} height={450}
                              data={this.state.attributionChart.data}
                              margin={{top: 5, right: 0, left: 0, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        {this.state.attributionChart.chartSeries.map((val, i) => (
                            <Bar dataKey={val.field} fill={colorPal[i]}/>
                        ))}
                    </BarChart>

                    <Table id='reportTable' definition selectable celled unstackable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Channel</Table.HeaderCell>
                                {_.map(this.state.attributionData, (v, k) => (
                                    k.match(/Removal/) ?

                                        null : <Table.HeaderCell>{k}</Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {
                                _.map(this.state.attributionTable, (v, k) => (
                                    <Table.Row>
                                        {_.map(v, (val) => (
                                            <Table.Cell>{isNaN(val) ? val : (val * 100).toFixed(2)}</Table.Cell>
                                        ))}
                                    </Table.Row>
                                ))
                            }
                        </Table.Body>
                    </Table>
                    <br/>
                    <br/>
                    <Statistic.Group size={'small'} widths={3}>
                        <Statistic>
                            <Statistic.Value>{addCommas(this.state.metadata.conversions)}</Statistic.Value>
                            <Statistic.Label>Conversions Analyzed</Statistic.Label>
                        </Statistic>
                        <Statistic>
                            <Statistic.Value>{addCommas(this.state.metadata.paths)}</Statistic.Value>
                            <Statistic.Label>Unique Paths Analyzed</Statistic.Label>
                        </Statistic>
                        <Statistic>
                            <Statistic.Value>{addCommas(this.state.metadata.allPaths)}</Statistic.Value>
                            <Statistic.Label>Paths Pulled</Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                    <br/>
                    <br/>
                </div>
            );
        } else {
            return null
        }
    }

    renderGraph() {
        if (this.state.graphSvgFull && this.state.graphSvg) {
            return (
                <div>
                    <div dangerouslySetInnerHTML={{__html: this.state.graphSvg}}/>
                    <div dangerouslySetInnerHTML={{__html: this.state.graphSvgFull}}/>
                </div>
            );
        } else if (this.state.graph && this.state.graphSvgFull && this.state.graphSvg) {
            return (
                <div>
                    <div dangerouslySetInnerHTML={{__html: this.state.graphSvg}}/>
                    <div dangerouslySetInnerHTML={{__html: this.state.graphSvgFull}}/>
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        return (
            <Container id="mainContent">
                <br/>
                <Header as="h1">Multi-Channel Attribution</Header>
                <Form onSubmit={this.handleSubmit} loading={this.state.isLoading}>
                    <Form.Group widths='equal'>
                        <Label>Start Date
                            <DatePicker selected={this.state.startDate} onChange={this.handleStartChange}
                                        dateFormat="YYYY-MM-DD"/>
                        </Label>
                        <Label>End Date
                            <DatePicker selected={this.state.endDate} onChange={this.handleEndChange}
                                        dateFormat="YYYY-MM-DD"/>
                        </Label>
                    </Form.Group>
                    <Form.Group>
                        {/*<Form.Input label={`Order: ${this.state.query.order}`} type="range" min={1} max={5}*/}
                        {/*value={this.state.query.order} name="order" onChange={this.handleChange}/>*/}
                        {/*<Form.Input label={`Goal`} pattern="^(0|[1-9][0-9]*)$" value={this.state.query.goalNumber}*/}
                        {/*name="goalNumber" onChange={this.handleChange}/>*/}
                        {/*<Form.Input label="GA ID" name="ids" value={this.state.query.ids} onChange={this.handleChange}/>*/}
                        <Form.Field>
                            <label>WH Account</label>
                            <MetaAccountBrowser
                                handleAccountChange={this.handleMetaAccountChange}/> {' '}
                        </Form.Field>
                        {this.state.metaAccountId ?

                            <Form.Field>
                                <label>Client Account</label>
                                <AccountBrowser metaAccountId={this.state.metaAccountId}
                                                handleAccountChange={this.handleAccountChange}/> {' '}
                            </Form.Field> : null}
                        {this.state.accountId ?
                            <Form.Field>
                                <label>Property</label>
                                <PropertyBrowswer metaAccountId={this.state.metaAccountId}
                                                  accountId={this.state.accountId}
                                                  handleAccountChange={this.handlePropertyChange}/> {' '}
                            </Form.Field>
                            : null}
                        {this.state.propertyId ?
                            <Form.Field>
                                <label>View</label>
                                <ViewBrowser metaAccountId={this.state.metaAccountId} propertyId={this.state.propertyId}
                                             accountId={this.state.accountId}
                                             handleAccountChange={this.handleViewChange}/> {' '}
                            </Form.Field>
                            : null}
                        {this.state.profileId ?
                            <Form.Field>
                                <label>Goal</label>
                                <GoalBrowser metaAccountId={this.state.metaAccountId} propertyId={this.state.propertyId}
                                             accountId={this.state.accountId} profileId={this.state.profileId}
                                             handleAccountChange={this.handleGoalChange}/> {' '}
                            </Form.Field>
                            : null}
                    </Form.Group>
                    <Modal trigger={<a>Advanced Settings</a>}>
                        <Modal.Content>
                            <Form>
                                <Header as='h4'>Presets</Header>

                                <Form.Button onClick={(e) => {
                                    e.preventDefault();
                                    let tempState = this.state.query;
                                    tempState['ids'] = 'ga:' + '110909631';
                                    tempState['cgp'] = 'providence';
                                    this.setState({
                                        query: tempState,
                                        propertyId: 'UA-51066651-1',
                                        accountId: '51066651',
                                        accountName: 'Providence Systems: Providence/Swedish Universal',
                                        metaAccountId: '118253190207892162542',
                                        profileId: '110909631'
                                    })
                                }}>Providence Preset</Form.Button>

                                <Header as='h4'>Channel Grouping Settings</Header>

                                <Form.Radio toggle label='Providence Channel Grouping'
                                            onChange={this.triggerProvGrouping}
                                            checked={this.state.query.cgp === 'providence'}/>
                                <Form.Radio toggle label='Direct as Unknown'
                                            onChange={this.triggerDirectUnknown}
                                            checked={this.state.query.dm === 'unknown'}/>

                                <Header as='h4'>Other Settings</Header>

                                <Form.Radio toggle label='Run Null Absorbing Model'
                                            onChange={this.triggerNullModel}
                                            checked={!this.state.query.filter}/>
                                <Form.Radio toggle label='Show Tutorial'/>
                            </Form>
                        </Modal.Content>
                    </Modal>

                    <br/>
                    <br/>
                    {/*TODO: Add custom channel groupings*/}
                    {/*TODO: Compare time periods*/}
                    <Form.Button primary type="submit" disabled={this.state.query.ids === null}>Run
                        Analysis</Form.Button>
                </Form>
                <br/>
                {this.state.message ?
                    <Message icon negative={this.state.error}>
                        <Icon name={this.state.error ? 'exclamation circle' : 'setting'} loading={!this.state.error}/>
                        <Message.Content>
                            <Message.Header>{this.state.message}</Message.Header>
                            {this.state.messagep}
                        </Message.Content>
                    </Message>
                    : null}
                {/* {<Button onClick={() => fileDownload(this.state.mcfData.csv, 'mcfData.csv')} disabled={this.state.mcfData ? false : true}>Download CSV</Button> } */}
                {/* {<Button onClick={() => fileDownload(JSON.stringify(this.state.mcfData.json), 'mcfData.json')} disabled={this.state.mcfData ? false : true}>Download JSON</Button>} */}
                {this.state.attributionData && this.state.attributionTable ?
                    <Header as="h2" disabled={this.state.mcfData ? false : true}>Attribution Report</Header> : null}
                {/* <Button onClick={() => this.handleGraph()} disabled={this.state.mcfData ? false : true}>Generate Attribution Graph </Button> */}
                {this.state.mcfData && this.state.mcfData.json && this.state.conversions ?
                    <div><strong>Paths:</strong> {(this.state.mcfData.json).length}<br/>
                        <strong>Conversions:</strong> {this.state.conversions}</div> : null}
                {this.renderReport()}

                {this.renderGraph()}
            </Container>
        );
    }
}

export default Attribution;