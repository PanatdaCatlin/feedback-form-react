import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Container, Dropdown, Image, Menu} from 'semantic-ui-react'
import logo from './wh-logo.png';
import {Link} from 'react-router-dom';

class GlobalHeader extends Component {

    render() {
        return (
            <div>
                <Menu inverted>
                    <Container>
                        <Menu.Item onClick={() => this.props.history.push('/')} as='a' header>
                            <Image
                                size='mini'
                                src={logo}
                                style={{marginRight: '1.5em'}}
                            />
                            ANA Portal
                        </Menu.Item>
                        <Dropdown item simple text='Tools'>
                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to='/tools/attribution'>Attribution</Dropdown.Item>
                                <Dropdown.Item>BigQuery Funnel Generator</Dropdown.Item>
                                <Dropdown.Item as={Link} to='/tools/integrity'>Integrity
                                    Checker</Dropdown.Item>
                                <Dropdown.Item as={Link} to='/tools/filter'>Filter
                                    Manager</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Menu.Item as={Link} to={'/docs'}>Documentation</Menu.Item>
                        <Menu.Item as={Link} to={'/feedback'}>Feedback</Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item onClick={this.props.handleAuth} name={this.props.loggedIn ? 'Logout' : 'Login'}/>
                        </Menu.Menu>
                    </Container>
                </Menu>
            </div>
        );
    };
}

export default withRouter(GlobalHeader);