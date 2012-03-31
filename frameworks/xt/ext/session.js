// ==========================================================================
// Project:   xTuple PostBooks - xTuple Business Management Framework
// Copyright: ©2011 OpenMFG LLC, d/b/a xTuple
// ==========================================================================
/*globals XT */
sc_require('ext/store');
sc_require('ext/dispatch');
sc_require('ext/data_source');
/** @instance

An object that contains user login information for quick access at run time.

  @extends SC.Object
*/

XT.session = SC.Object.create({

  SETTINGS:             0x0100,
  PRIVILEGES:           0x0200,
  LOCALE:               0x0400,
  ALL:                  0x0100 | 0x0200 | 0x0400,

  privileges: null,
  
  store: function() {
    return XT.store;
  }.property().cacheable(),

  /**
  Loads session objects for settings, preferences and privileges into local memory.
  Types XT.session.SETTINGS, XT.session.LOCALE or types XT.session.PRIVILEGES
  can be passed as bitwise operators. If no arguments are passed the default is
  XT.session.ALL which will load all session objects.
  */
  load: function(types) {
    var self = this,
        store = this.get('store');
    
    if(types === undefined) types = this.ALL;

    if(types & this.PRIVILEGES) {
      var dispatch,
          callback = self.didFetchPrivileges,
        
      dispatch = XT.Dispatch.create({
        className: 'XT.Session',
        functionName: 'privileges',
        target: self,
        action: callback
      });

      store.dispatch(dispatch);
    }

    if(types & this.SETTINGS) {
      var dispatch,
          callback = self.didFetchSettings,
      
      dispatch = XT.Dispatch.create({
        className: 'XT.Session',
        functionName: 'settings',
        target: self,
        action: callback
      });

      store.dispatch(dispatch);
    }

    if(types & this.LOCALE) {
      var dispatch,
          callback = self.didFetchLocale
      
      dispatch = XT.Dispatch.create({
        className: 'XT.Session',
        functionName: 'locale',
        target: self,
        action: callback
      });

      store.dispatch(dispatch);
    }

    return YES;
  },

  didFetchSettings: function(error, response) {
    // Create an object for settings
    var that = this,
        settings = SC.Object.create({
          // Return false if property not found
          get: function(key) {
            for(prop in this) {
              if(prop === key) return this[prop];
            }

            return NO;
          },
          
          set: function(key, value) {
            this.get('changed').push(key);
            
            arguments.callee.base.apply(this, arguments);
          },
      
          changed: []
          
        });

    // Loop through the response and set a setting for each found
    response.forEach(function(item) {
      settings.set(item.setting, item.value);
    });

    settings.set('changed', []);
    
    // Attach the settings to the session object
    this.set('settings', settings);

    return YES
  },

  didFetchPrivileges: function(error, response) {
    // Create a special object for privileges where the get function returns NO if it can't find the key
    var privileges = SC.Object.create({
      get: function(key) {
        if(typeof key === 'boolean') return key;
        
        for(prop in this) {
          if(prop === key) return this[prop];
        }

        return NO;
      }
    });

    // Loop through the response and set a privilege for each found
    response.forEach(function(item) {
      privileges.set(item.privilege, item.isGranted);
    });

    // Attach the privileges to the session object
    this.set('privileges', privileges);

    return YES
  },

  didFetchLocale: function(error, response) {
    // Attach the locale to the session object
    this.set('locale', response);

    return YES
  },

  init: function() {
    arguments.callee.base.apply(this, arguments);
    XT.ready(function() { XT.session.load(); });
  }
  
});


