// ==========================================================================
// Project:   xTuple Postbooks - Business Management System Framework        
// Copyright: ©2012 OpenMFG LLC, d/b/a xTuple                             
// ==========================================================================

/*globals XM */

sc_require('mixins/_project_task');

/**
  @class

  @extends XT.Record
*/
XM.ProjectTask = XT.Record.extend(XM._ProjectTask,
  /** @scope XM.ProjectTask.prototype */ {

  // .................................................
  // CALCULATED PROPERTIES
  //
  
  /**
    @field
    @type Number
  */
  balanceHours: function() {
    var value = this.get('budgetedHours') - this.get('actualHours');
    return value;
  }.property('budgetedHours','actualHours'),


  /**
    @field
    @type Number
  */
  balanceExpenses: function() {
    var value = this.get('budgetedExpenses') - this.get('actualExpenses');
    return value;
  }.property('budgetedExpenses','actualExpenses'),
  
  //..................................................
  // METHODS
  //

  //..................................................
  // OBSERVERS
  //

});
