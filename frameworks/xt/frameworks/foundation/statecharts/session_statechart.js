/*globals XT Login */

sc_require('runtime/common');
sc_require('ext/statechart');
sc_require('ext/task_state');

/** @class

*/

XT.SESSION_ACQUIRED = XT.hex();

XT.SessionStatechart = XT.Statechart.extend(
  /** @scope XT.SessionStatechart.prototype */ {

  trace: YES,
  suppressStatechartWarnings: NO,
  rootState: XT.State.design({
    
    initialSubstate: "LOGGEDOUT",

    autoInitStatechart: NO,

    LOGGEDOUT: XT.State.design({
      
      reset: function() {
        Login.xtAnimate("loginBlock-reset");
        // XT.StatusImageController.deactivateCurrent();
        var o = this.get("owner");
        o.set("loginInputIsEnabled", YES);
        XT.MessageController.set("loadingStatus", "_failedLogin".loc());
        this.statechart.getState("LOGGINGIN").reset();
        o._shouldEnableLogin();
      },

      /** @private
        During initialization will perform the proper animations and
        events to show the login form. After the initialization of the
        application this cannot be run unless the entire application
        is restarted. 

        @todo Incomplete. Needs significant work. I won't like how
          tightly coupled this is to the view that now resides in the
          Postbooks namespace - should that be moved down?
      */
      showLogin: function() {
        // Login.showLogin();
        console.log('Did not handle XT.SessionStatechart#showLogin()');
        // Login.append();
        // Login.xtAnimate("mainBlock-show");
        // XT.MessageController.set("loadingStatus", "_needLogin".loc());
      }.handleEvents("needSession"),

      /**
        When logging in is enabled and the login button is clicked,
        the submit event will be fired and we will try to log in based
        as the user-input as it is currently.
      */
      tryToLogin: function() {
        if (XT.DataSource.get("serverIsAvailable")) {
          this.gotoState("LOGGINGIN");
        }
      }.handleEvents("submit"),

      LOGGINGIN: XT.TaskState.design({
        
        tasks: [
          { status: {
              message: "_loggingIn".loc(),
              property: "loadingStatus",
              image: "loading-user-icon" } },
          { target: "XT.Session",
            method: "set",
            args: ["loginInputIsEnabled",NO],
            complete: function() { return YES; } },
          { target: "XT.Session",
            method: "set",
            args: ["loginIsEnabled",NO],
            complete: function() { return YES; } },
          { target: "Login",
            method: "xtAnimate", 
            args: "loginBlock-login",
            complete: function() { return YES; } },
          { method: function() { 
            this.invokeLater(function() { XT.Session.statechart.sendEvent("loginSet"); }, 1000); 
            return YES; } },
          { hold: "loginSet" },
          { status: {
              image: "loading-user-icon",
              active: NO } },
          { method: "_acquireSessionId",
            target: "XT.Session",
            status: {
              message: "_acquiringSessionId".loc(),
              property: "loadingStatus",
              image: "loading-session-icon" },
            context: "XT.Session.statechart" },
          { hold: XT.SESSION_ACQUIRED },
          { status: {
              message: "_loginSuccess".loc(),
              property: "loadingStatus" } }
        ],
        complete: "LOGGEDIN",
        fail: "LOGGEDOUT"

      })
    }),

    /**
      The remainder of session specific login tasks are handled
      here.
    */
    LOGGEDIN: XT.TaskState.design({
      
      tasks: [

        // need to acquire a valid session id for this new session
        { method: "_writeSession",
          target: "XT.Session" }
             
      ],
      complete: function() {

        // make sure to notify the primary application statechart
        // that we've completed our login if it is waiting for us
        this.invokeLater(function() {
          XT.PostbooksStatechart.sendEvent(XT.WAIT_SIGNAL);
        }, 1500);
      },
      fail: function() {
        
        // on failure the entire application needs to fail
        XT.PostbooksStatechart.gotoState("ERROR");
      }
        
    })

  })

}) ;