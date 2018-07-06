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
            this.getAccounts(this.props.metaAccountId, this.props.accountId, this.props.propertyId, this.props.profileId);
        }
    }
    componentWillReceiveProps(nextprops){
        if(nextprops.propertyId !== this.props.propertyId){
            this.getAccounts(nextprops.metaAccountId, nextprops.accountId, nextprops.propertyId, nextprops.profileId);
        }
    }

    getAccounts(id, accountId, propertyId, profileId){
        Axios.get(`/api/v1/ga/goal?webPropertyId=${propertyId}&accountId=${accountId}&metaAccountId=${id}&profileId=${profileId}`)
            .then(res => {
                const accountNames = res.data.map(acc => ({'key': acc.id, 'value': acc.id, 'text': acc.id + ' - ' +acc.name})).sort((a,b)=>{
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
                <Dropdown disabled placeholder={'Please Choose a Property'}/>
            )
        } else {
            return(
                <Dropdown search selection onChange={this.props.handleAccountChange} placeholder={'Select a Goal'} options={this.state.accountNames}/>
            )
        }
    }
}

export default accountBrowser