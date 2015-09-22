var React = require('react');
var toolbelt = require('../utils/toolbelt');
var imageHelpers = require('../helpers/images');
var ActionCreators = require('../actions/actionCreators');
var LocationAutocomplete = require('./locationAutocomplete.jsx');
var Avatar = require('./avatar.jsx');
var ProfileLocation = require('./profileLocation.jsx');

var SAVE_BUTTON_STATES = ['Save', 'Saving', 'Saved'];
var ADD_BUTTON_STATES = ['Add', 'Adding', 'Added'];

module.exports = React.createClass({

  displayName: 'EditPerson',

  getInitialState: function() {
    return {
      saveButtonText: this.props.isNewUser ?
                        ADD_BUTTON_STATES[0] :
                        SAVE_BUTTON_STATES[0],
      error: '',

      inviteTeamMember: this.props.inviteTeamMember,
      isNewUser: false,

      userId: this.props._id,
      email: this.props.email,
      name: this.props.name,
      location: this.props.location,
      tz: this.props.tz,
      avatar: this.props.avatar
    };
  },

  handleChange: function(name, value) {
    var newState = {};
    newState[name] = value;
    this.setState(newState);
  },

  handleLocationChange: function(location, tz) {
    this.setState({
      location: location,
      tz: tz || this.state.tz
    });
  },

  handleClickSave: function(e) {
    var BUTTON_STATES = this.state.isNewUser ?
                          ADD_BUTTON_STATES :
                          SAVE_BUTTON_STATES;

    this.setState({ saveButtonText: BUTTON_STATES[1] });

    var data = toolbelt.extend(this.state, { teamId: this.props.teamId });
    delete data.error;
    delete data.saveButtonText;


    var createOrUpdateUser = this.state.isNewUser ?
                              ActionCreators.addNewTeamMember(data) :
                              ActionCreators.saveUserInfo(this.state.userId, data);

    createOrUpdateUser
      .then(function(res) {

        this.setState({
          isNewUser: false,
          error: '', // clear the error
          saveButtonText: BUTTON_STATES[2]
        });

        setTimeout(function() {
          this.setState({ saveButtonText: SAVE_BUTTON_STATES[0] });
        }.bind(this), 4000);

      }.bind(this), function(err) {
        this.setState({
          error: err.message,
          saveButtonText: BUTTON_STATES[0]
        });
      }.bind(this));
  },

  onImageLoadError: function(e) {
    this.setState({ avatar: null });
  },

  handleClickUseGravatar: function(e) {
    ActionCreators.getGravatar(this.state.email)
      .then(function(avatar) {
        if (avatar)
          this.setState({ avatar: avatar + '&d=404' });
      }.bind(this), function(err) {
        this.setState({ error: err.message });
      }.bind(this));
  },

  handleCheckUserEmail: function() {
    ActionCreators.getUserByEmail(this.state.email, this.props.teamId)
      .then(function(response) {
        // if message, then no user found!
        if (response.message) {
          this.setState({ isNewUser: true, isExistingUser: false });
          this.handleClickUseGravatar();
        } else {
          // set limited user data
          var user = response;
          this.setState({
            userId: user._id,
            name: user.name,
            avatar: user.avatar,
            location: user.location,
            tz: user.tz,
            isExistingUser: true,
            isNewUser: false
          });
        }
      }.bind(this))
      .catch(function(err) {
        this.setState({
          error: err.message,
          isNewUser: false,
          isExistingUser: false
        });
      }.bind(this));
  },

  render: function() {

    var nameLink = {
      value: this.state.name,
      requestChange: this.handleChange.bind(null, 'name')
    };

    var emailLink = {
      value: this.state.email,
      requestChange: this.handleChange.bind(null, 'email')
    };

    var avatarLink = {
      value: this.state.avatar,
      requestChange: this.handleChange.bind(null, 'avatar')
    };

    // isNewUser
    if (this.state.inviteTeamMember && !this.state.isNewUser && !this.state.isExistingUser) {
      return (
        <div className="edit-person">
          <p>Enter your teammate's email address:</p>
          <div className="edit-person--row">
            <input type="text"
                   name="email"
                   valueLink={emailLink}
                   placeholder="E-mail" />
          </div>
          <div className="edit-person--row">
            <button className="cta"
                    onClick={this.handleCheckUserEmail}>
              Next
            </button>
          </div>
          { this.state.error &&
              <p className="edit-person--row error">{this.state.error}</p>
          }
        </div>
      );
    }

    return (
      <div className="edit-person">

        { this.state.isNewUser && (
          <p className="txt-center">
            Add your teammate's information <br/>
            or wait for them to add it!
          </p>
        )}

        <div className="edit-person--row">
          { this.state.avatar ? (
              <Avatar avatar={this.state.avatar || imageHelpers.DEFAULT_AVATAR}
                      onImageLoadError={this.onImageLoadError}
                      size="large" />
            ) : (
              <div className="add-image-placeholder">
                <small>Add image below</small>
              </div>
            )
          }
        </div>

        { this.state.isNewUser ? (
          <div>

            <div className="edit-person--row">
              <input type="text"
                     name="name"
                     valueLink={nameLink}
                     placeholder="Name" />
            </div>

            <div className="edit-person--row">
              <LocationAutocomplete {...this.props}
                                    handleChange={this.handleLocationChange} />
              <span className="edit-person--timezone-display">
                {this.state.tz}
              </span>
            </div>

            <div className="edit-person--row">
              <button onClick={this.handleClickSave}>
                {this.state.saveButtonText}
              </button>
            </div>

          </div>
        ) : (
          <div className="edit-person--row">

            <h3 className="txt-center">{this.state.name}</h3>

            <ProfileLocation location={this.state.location}
                             tz={this.state.tz}
                             time={new Date().valueOf()}
                             timeFormat={this.props.timeFormat} />

           <div className="edit-person--row txt-center">
              <button onClick={this.handleClickSave}>
                Add to team
              </button>
            </div>

          </div>
        )}



        { this.state.error &&
            <p className="edit-person--row error">{this.state.error}</p>
        }

      </div>
    );
  }
});

/*
<div className="edit-person--row">
  <input type="text"
         name="avatar"
         valueLink={avatarLink}
         placeholder="Avatar URL" />
</div>

<div className="edit-person--row">
  <button onClick={this.handleClickUseGravatar}>
    Use Gravatar
  </button>
</div>
*/
