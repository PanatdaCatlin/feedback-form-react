import React, {Component} from 'react';
import {Button, Form, Grid, Header, Image, Message, Segment} from 'semantic-ui-react'
import './App.css';

class Login extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            isLoading: false,
            loggedIn: false,
            message: null,
            status: false,
            numTries: 0,
            username: '',
            password: ''
        }
    }


    handleChange = (e, {name, value}) => this.setState({[name]: value});

    render() {
        return (
            <div className='login-form'>
                {/*
      Heads up! The styles below are necessary for the correct render of this example.
      You can do same with CSS, the main idea is that all the elements up to the `Grid`
      below must have a height of 100%.
    */}
                <style>{`
      body > div,
      body > div > div,
      body > div > div > div.login-form {
        height: 100%;
      }
    `}</style>
                <Grid textAlign='center' style={{height: '100%'}} verticalAlign='middle'>
                    <Grid.Column style={{maxWidth: 450}}>
                        <Header as='h2' color='teal' textAlign='center'>
                            <Image src='/logo.png'/> Restricted Application
                        </Header>
                        <Form size='large' loading={this.props.isLoading} onSubmit={()=>this.props.handleLogin(this.state.username, this.state.password)}>
                            <Segment stacked>
                                <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address'
                                            name={'username'} value={this.state.username} onChange={this.handleChange}/>
                                <Form.Input
                                    name={'password'}
                                    value={this.state.password}
                                    onChange={this.handleChange}
                                    fluid
                                    icon='lock'
                                    iconPosition='left'
                                    placeholder='Password'
                                    type='password'
                                />

                                <Button color='teal' fluid size='large'>
                                    Login
                                </Button>
                            </Segment>
                        </Form>
                        {this.props.message ?
                            <Message negative={!this.props.status} positive={this.props.status}>
                                {this.props.message}
                            </Message>
                            : null
                        }

                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default Login;
