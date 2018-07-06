import React, {Component} from 'react';
import { Dropdown } from 'semantic-ui-react';
import Axios from 'axios';

class accountBrowser extends Component{
    constructor(props){
        super(props);
        this.state = {
            accountNames: null
        }
    }
    componentWillMount(){
            this.getAccounts();
    }

    getAccounts(){
        Axios.get('/api/v1/auth/accounts')
            .then(res => {
                const accountNames = res.data.accounts.map(acc => ({'key': acc.account, 'value': acc.account, 'text': acc.email})).sort((a,b)=>{
                    if (a.text < b.text)
                        return -1;
                    if (a.text > b.text)
                        return 1;
                    return 0;
                });
                this.setState({accounts:res.data, accountNames:accountNames});
            })
            .catch(err=>alert(err));
    }



    render() {
        if(!this.state.accountNames){
            return(
                <Dropdown disabled placeholder={'Please Log In'}/>
            )
        } else {
            return(
                <Dropdown search selection onChange={this.props.handleAccountChange} placeholder={'Select an Account'} options={this.state.accountNames}/>
            )
        }
    }
}

export default accountBrowser