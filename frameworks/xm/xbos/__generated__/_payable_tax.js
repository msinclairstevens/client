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
XM._PayableTax = XM.Record.extend(
  /** @scope XM._PayableTax.prototype */ {
  
  className: 'XM.PayableTax',

  

  // .................................................
  // PRIVILEGES
  //

  privileges: {
    "all": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false
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
    @type XM.Payable
  */
  payable: SC.Record.toOne('XM.Payable'),

  /**
    @type XM.TaxType
  */
  taxType: SC.Record.toOne('XM.TaxType'),

  /**
    @type XM.TaxCode
  */
  taxCode: SC.Record.toOne('XM.TaxCode'),

  /**
    @type Number
  */
  basis: SC.Record.attr(Number),

  /**
    @type XM.TaxCode
  */
  basisTaxCode: SC.Record.toOne('XM.TaxCode'),

  /**
    @type Number
  */
  sequence: SC.Record.attr(Number),

  /**
    @type Number
  */
  percent: SC.Record.attr(Number),

  /**
    @type Number
  */
  amount: SC.Record.attr(Number),

  /**
    @type Number
  */
  tax: SC.Record.attr(Number),

  /**
    @type Date
  */
  documentDate: SC.Record.attr(SC.DateTime, {
    format: '%Y-%m-%d'
  }),

  /**
    @type Date
  */
  distributionDate: SC.Record.attr(SC.DateTime, {
    format: '%Y-%m-%d'
  }),

  /**
    @type XM.Currency
  */
  currency: SC.Record.toOne('XM.Currency'),

  /**
    @type Number
  */
  currencyRate: SC.Record.attr(Number),

  /**
    @type Number
  */
  journalNumber: SC.Record.attr(Number)

});