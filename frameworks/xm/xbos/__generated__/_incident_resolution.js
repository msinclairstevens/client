// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

/**
  @class

  This code is automatically generated and will be over-written. Do not edit directly.

  @extends XM.Record
*/
XM._IncidentResolution = XM.Record.extend(
  /** @scope XM._IncidentResolution.prototype */ {
  
  className: 'XM.IncidentResolution',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": "MaintainIncidentResolutions",
      "read": "MaintainIncidentResolutions",
      "update": "MaintainIncidentResolutions",
      "delete": "MaintainIncidentResolutions"
    }
  },

  //..................................................
  // ATTRIBUTES
  //
  
  /**
    @type Number
  */
  guid: SC.Record.attr(Number),

  /**
    @type String
  */
  name: SC.Record.attr(String),

  /**
    @type Number
  */
  order: SC.Record.attr(Number),

  /**
    @type String
  */
  description: SC.Record.attr(String)

});