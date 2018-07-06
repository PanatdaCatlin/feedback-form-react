import React from 'react';
import { Container, Divider, Grid, Header, Image, List, Segment } from 'semantic-ui-react'
import {Link} from 'react-router-dom';

const footer = () => {
    return(
        <Segment
            inverted
            vertical
            style={{ margin: '5em 0em 0em', padding: '5em 0em' }}
        >
            <Container textAlign='center'>
                <Grid  divided inverted stackable textAlign={'center'}>
                    <Grid.Row >
                        <Grid.Column width={3}>
                            <Header inverted as='h4' content='Tools' />
                            <List link inverted>
                                <List.Item as={Link} to={''}>Attribution Analysis</List.Item>
                                <List.Item as={Link} to={''}>BigQuery Funnel Generator</List.Item>
                                <List.Item as={Link} to={''}>Integrity Checker</List.Item>
                                <List.Item as={Link} to={''}>Filter Manager</List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Header inverted as='h4' content='Support' />
                            <List link inverted>
                                <List.Item as={Link} to={''}>Documentation</List.Item>
                                <List.Item as={Link} to={''}>Submit Feedback</List.Item>
                            </List>
                        </Grid.Column>
                        <Grid.Column width={3}>
                            <Header inverted as='h4' content='Wheelhouse Analytics' />
                            <p>AI-Driven Turnkey Insight Generation Solutions stored in the Blockchain</p>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                <Divider inverted section />
                <Image
                    centered
                    size='mini'
                    src='/logo.png'
                />
                {/*<List horizontal inverted divided link>*/}
                    {/*<List.Item as='a' href='#'>Site Map</List.Item>*/}
                    {/*<List.Item as='a' href='#'>Contact Us</List.Item>*/}
                    {/*<List.Item as='a' href='#'>Terms and Conditions</List.Item>*/}
                    {/*<List.Item as='a' href='#'>Privacy Policy</List.Item>*/}
                {/*</List>*/}
            </Container>
        </Segment>
    );
};

export default footer;