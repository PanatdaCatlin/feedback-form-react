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
        if(this.props.accountId){
            this.getProperties(this.props.metaAccountId, this.props.accountId);
        }
    }
    componentWillReceiveProps(nextprops){
        if(nextprops.accountId !== this.props.accountId){
            this.getProperties(nextprops.metaAccountId, nextprops.accountId);
        }
    }

    getProperties(id, accountId){
        this.setState({accounts:null, accountNames:null});
        Axios.get(`/api/v1/ga/account/${id}/${accountId}`)
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
        if(!this.state.accountNames || !this.props.accountId){
            return(
                <Dropdown disabled placeholder={'Please Choose a Property'}/>
            )
        } else {
            return(
                <Dropdown search selection onChange={this.props.handleAccountChange} placeholder={'Select a Property'} options={this.state.accountNames}/>
            )
        }
    }
}

export default accountBrowser