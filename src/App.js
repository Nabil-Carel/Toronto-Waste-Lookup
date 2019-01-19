import "./App.css";

import React, { Component } from "react";
import { faSearch, faSpinner, faStar } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faSearch,faStar,faSpinner);

const api =
  "https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000";





class Instructions extends React.Component {
  constructor(props){
    super(props);


    this.decodeHTML = this.decodeHTML.bind(this);
    this.favouritesHandler = this.favouritesHandler.bind(this);

  }

  shouldComponentUpdate(nextProps,nextState){
    return this.props.favouredStatus !== nextProps.favouredStatus;

  }


  decodeHTML(html) {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  favouritesHandler(obj){
    let currentFavouredObj = this.props.getFavoured();

    if(currentFavouredObj[obj.title]){
      const index = this.props.getFavourites().indexOf(obj);
      let currentFavourites = this.props.getFavourites();
      currentFavourites.splice(index,1);
      this.props.updateFavourites(currentFavourites);
      currentFavouredObj[obj.title] = false;
      this.props.setFavoured(currentFavouredObj);
    }
    else{
      const favourite = this.props.getSearchResults()[this.props.getSearchResults().indexOf(obj)];

      this.props.setFavourites(favourite);
      currentFavouredObj[obj.title] = true;
      this.props.setFavoured(currentFavouredObj);
    }




  }



  render() {
    return (
      <div className="wrapper">
        <div className="title">
        <FontAwesomeIcon
        icon={faStar}
        id="icon"
        style={{
          color:this.props.getFavoured()[this.props.item.title] ? "rgb(35, 167, 35)": "grey"

        }}
        onClick={() => this.favouritesHandler(this.props.item)} />
        <p id="title">{this.props.title}</p>
        </div>


        <div className="body" dangerouslySetInnerHTML={{ __html: this.decodeHTML(this.props.text) }} />
      </div>
    );

  }

}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wasteInfo: null,
      isLoading: false,
      userInput: "",
      searchResults: [],
      favourites: [],
      favoured:{}
    };
    this.handleChange = this.handleChange.bind(this);
    this.setFilteredResults = this.setFilteredResults.bind(this);
    this.filterResults = this.filterResults.bind(this);
    this.clickEvent = this.clickEvent.bind(this);
    this.setFavourites = this.setFavourites.bind(this);
    this.getFavourites = this.getFavourites.bind(this);
    this.updateFavourites = this.updateFavourites.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
    this.getFavoured = this.getFavoured.bind(this);
    this.setFavoured = this.setFavoured.bind(this);
    this.renderMultipleInstructions = this.renderMultipleInstructions.bind(this);
    this.enterPressed  = this.enterPressed.bind(this);
  }


  componentDidMount() {
    this.setState({ isLoading: true });

    fetch(api)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Something went wrong ...");
        }
      })
      .then(data =>
        this.setState({
          wasteInfo: data,
          isLoading: false,
          error: null
        })
      )
      .catch(error =>
        this.setState({
          error: error,
          isLoading: false
        })
      );
      document.addEventListener("keydown",this.enterPressed);
  }

  componentWillUnmount(){
    document.removeEventListener("keydown",this.enterPressed);
  }



  getFavoured(){
    return this.state.favoured;
  }

  setFavoured(obj){
    this.setState({
      favoured:obj
    })
  }
  setFilteredResults(state) {
    this.setState({
      searchResults: state
    });
  }

  filterResults(input) {
    let lowerCaseInput = input.toLowerCase();
    let results = this.state.wasteInfo.filter(element =>
      element.keywords.includes(lowerCaseInput)
    );
    return results;
  }

  //add a new value to favourites array
  setFavourites( value){
    this.setState({
      favourites:[...this.state.favourites,value]
    });
  }

  //set a new array as favourites
  updateFavourites(array){
    this.setState({
      favourites:array
    })
  }

  getFavourites(){
    return this.state.favourites;
  }




  getSearchResults(){
    return this.state.searchResults;
  }



  handleChange(event) {
    this.setState({
      userInput: event.target.value,
      searchResults:[]
    });

  }

  clickEvent(input) {
    const results = this.filterResults(input);
    this.setFilteredResults(results);
  }

  enterPressed(event) {

    let code = event.keyCode || event.which;
    if(code === 13) {
       this.clickEvent(this.state.userInput);
    }
  }

  renderMultipleInstructions(array){
    const results = array.map((elem)=>{

      if(!this.state.favoured.hasOwnProperty(elem.title)){
        let tempObj = this.state.favoured;
        tempObj[elem.title]=false;
        this.setState({
          favoured:tempObj
        })
      }
      return (

          <Instructions
          text={elem.body}
          title={elem.title}
          favouredStatus={this.state.favoured[elem.title]}
          isFavourite={this.state.favourites.indexOf(elem) >= 0}
          item ={elem}
          setFavourites={this.setFavourites}
          getFavourites = {this.getFavourites}
          getSearchResults ={this.getSearchResults}
          updateFavourites = {this.updateFavourites}
          setFavoured={this.setFavoured}
          getFavoured={this.getFavoured}
          />
      )
      });

      return results;

  }

  render() {

    const instructions = this.renderMultipleInstructions(this.state.searchResults);
    const favourites = this.renderMultipleInstructions(this.state.favourites);

    const regex = /\w+/gm;
    const regexTest = regex.test(this.state.userInput);
    if (this.state.isLoading) {
      return (
        <div style={{"font-size":"2.5rem"}}>
        <FontAwesomeIcon icon="spinner" className="fas fa-spinner fa-pulse fa- 10x loadingIcon"
        />
        </div>
        );
    }
    return (
      <div className="App">
        <header className="App-header"><h1>Toronto Waste Lookup</h1></header>

        <div class="search-container" id="search">
          <input
            type="text"

            name="search"
            value={this.state.input}
            onChange={this.handleChange}

          />
          <button style={{"background-color":"rgb(35, 167, 35)"}}

            onClick={() => this.clickEvent(this.state.userInput)}

          >
            <FontAwesomeIcon icon="search" rotation="90" style={{color:"white"}} size="lg" />
          </button>
        </div>
        <div>{regexTest ? instructions: null}</div>
        <div className="favourites">
          <h2  style={{color:"rgb(35, 167, 35)","display":"flex","align-items":"flex-start"}}>{this.state.favourites.length > 0?"Favourites":null}</h2>
          <div>{this.state.favourites.length > 0 ? favourites: null}</div>
        </div>



      </div>
    );
  }
}

export default App;
