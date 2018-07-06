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
    componentDidMount(){
        if(this.props.metaAccountId){
            this.getAccounts(this.props.metaAccountId);
        }
    }
    componentWillReceiveProps(nextprops){
        if(nextprops.metaAccountId !== this.props.metaAccountId){
            this.getAccounts(nextprops.metaAccountId);
        }
    }

    getAccounts(id){
        Axios.get(`/api/v1/ga/account/${id}`)
            .then(res => {
                const accountNames = res.data.map(acc => ({'key': acc.id, 'value': acc.id, 'text': acc.name})).sort((a,b)=>{
                    if (a.text < b.text)
                        return -1;
                    if (a.text > b.text)
                        return 1;
                    return 0;
                });
                this.setState({accounts:res.data, accountNames:accountNames})
            })
            .catch(err=>alert(err));
    }



    render() {
        if(!this.state.accountNames){
            return(
                <Dropdown disabled placeholder={'Please Select a WH Account'}/>
            )
        } else {
            return(
                <Dropdown search selection onChange={this.props.handleAccountChange} placeholder={'Select an Account'} options={this.state.accountNames}/>
            )
        }
    }
}

export default accountBrowser