// NO LONGER IN USE WITH DESIGN v2 - KEEP FOR NOW - DJFARRELLY
var React = require('react');
var timeUtils = require('../utils/time.js');
var AppDispatcher = require('../dispatchers/appDispatcher.js');
var ActionTypes = require('../actions/actionTypes.js');
var TimeSlider = require('./timeSlider.jsx');
var Branding = require('./branding.jsx');
var MeetingPlanner = require('./meetingPlanner.jsx');

module.exports = React.createClass({

  displayName: 'AppSidebar',

  handleFormatChange: function(e) {
    AppDispatcher.dispatchViewAction({
      actionType: ActionTypes.CHANGE_TIME_FORMAT,
      value: +e.target.dataset.value
    });
  },

  handleGotoCurrentTime: function(e) {
    AppDispatcher.dispatchViewAction({
      actionType: ActionTypes.USE_CURRENT_TIME
    });
  },

  handleManageTeam: function(e) {
    AppDispatcher.dispatchViewAction({
      actionType: ActionTypes.SHOW_VIEW,
      value: 'manage'
    });
  },

  render: function() {

    var format = this.props.timeFormat;
    var formatString = timeUtils.getFormatStringFor(this.props.timeFormat);
    var displayTime = this.props.time.format(formatString);

    return (
      <div className="app-sidebar">

        <Branding link={true} />

        <h2 className="app-sidebar--time">{displayTime}</h2>

        <TimeSlider time={this.props.time}
                    isCurrentTime={this.props.isCurrentTime} />

        <div className="app-sidebar--button-row">

          <div className="button-group app-sidebar--format-select">
            <button className={'small hollow ' + (format === 12 ? 'selected' : '')}
                    data-value="12"
                    onClick={this.handleFormatChange}>12</button>
            <button className={'small hollow ' + (format === 24 ? 'selected' : '')}
                    data-value="24"
                    onClick={this.handleFormatChange}>24</button>
          </div>

          <button className="small hollow"
                  disabled={this.props.isCurrentTime ? 'disabled' : ''}
                  onClick={this.handleGotoCurrentTime}>Now</button>
        </div>

        <MeetingPlanner {...this.props.meeting}
                        timeFormat={this.props.timeFormat}  />

        { this.props.isAdmin && (

            <div className="app-sidebar--button-row app-sidebar--admin">

              <button className="small hollow"
                      onClick={this.handleManageTeam}>Manage Team</button>

            </div>

        )}


      </div>
    );
  }
});
