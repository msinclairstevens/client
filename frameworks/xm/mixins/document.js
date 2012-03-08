// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework
// Copyright: ©2011 OpenMFG LLC, d/b/a xTuple
// ==========================================================================
/*globals XM */

/** @mixin

  Applies a standard sequenctil document number for the record type. Requires
  that the ORM on the server side has mapped the number to a order sequence.

  @version 0.1
*/


XM.Document = {

  number: SC.Record.attr(String, {
    isRequired: YES,
    /** @private */
    defaultValue: function () {
      if(arguments[0].get('status') === SC.Record.READY_NEW) {
        return XM.Record.fetchNumber.call(arguments[0]);
      }
    }
  })
  
};

