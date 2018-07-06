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
        if(this.props.propertyId){
            this.getAccounts(this.props.metaAccountId, this.props.accountId, this.props.propertyId);
        }
    }
    componentWillReceiveProps(nextprops){
        if(nextprops.propertyId !== this.props.propertyId){
            this.getAccounts(nextprops.metaAccountId, nextprops.accountId, nextprops.propertyId);
        }
    }

    getAccounts(id, accountId, propertyId){
        Axios.get(`/api/v1/ga/account/${id}/${accountId}/${propertyId}`)
            .then(res => {
                const accountNames = res.data.map(acc => ({'key': acc.id, 'value': acc.id, 'text': acc.name})).sort((a,b)=>{
                    if (a.text < b.text)
                        return -1;
                    if (a.text > b.text)
                        return 1;
                    return 0;
                });
                this.setState({accounts:res.data, accountNames:accountNames})
                console.log(accountNames)
            })
            .catch(err=>alert(err));
    }



    render() {
        if(!this.state.accountNames || !this.props.propertyId){
            return(
                <Dropdown disabled placeholder={'Please Choose a View'}/>
            )
        } else {
            return(
                <Dropdown search selection onChange={this.props.handleAccountChange} placeholder={'Select a View'} options={this.state.accountNames}/>
            )
        }
    }
}

export default accountBrowser