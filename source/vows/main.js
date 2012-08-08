#!/usr/bin/env node

/*jshint trailing:true, indent:2, strict:true, curly:true,
  plusplus:true, immed:true, eqeqeq:true, forin:true, latedef:true,
  newcap:true, noarg:true, undef:true */
/*global XVOWS:true, XT:true, XM:true, setTimeout:true,
  clearTimeout:true, _fs:true, _util:true, _path:true, Backbone:true,
  BackboneRelational:true, vows:true, assert:true, _:true, io:true,
  program:true, require:true, process:true, __dirname:true, console:true */

// native
_fs             = require("fs");
_path           = require("path");
_util           = require("util");

// third-party
Backbone            = require("backbone");
BackboneRelational  = require("backbone-relational");
vows                = require("vows");
assert              = require("assert");
_                   = require("underscore");
io                  = require("socket.io-client");
program             = require("commander");
require("tinycolor"); /*tinycolor*/

//......................................
// COMMAND LINE PARSING
(function () {
  "use strict";
  var tests = function (val) {
    return val.split(" ").map(String);
  };
  program
    .option("--spec", "Use the spec reporter")
    .option("-t, --tests [tests]", "Specify space-separated string of test names", tests, ["*"])
    .option("-u, --user [user]", "The database user", "admin")
    .option("-p, --password [password]", "The database user's password", "admin")
    .option("-o, --organization [organization]", "The database user's organization", "production")
    .option("-h, --host [host]", "The datasource hostname/url/ip", "bigiron.xtuple.com")
    .option("-P, --port [port]", "The datasource port", 9000, parseInt)
    .parse(process.argv);
  if (program.spec) {
    var spec = require(_path.join(__dirname, "node_modules/vows/lib/vows/reporters/spec"));
    var suite = require(_path.join(__dirname, "node_modules/vows/lib/vows/suite")).Suite.prototype;
    suite.ext_run = suite.run;
    suite.run = function () {
      return suite.ext_run.call(this, {reporter: spec});
    };
  }
}());
//......................................
// XVOWS IS THE GLOBAL NAMESPACE AVAILABLE
// FOR SHARING VOWS SPECIFIC INFORMATION
// AND FUNCTIONALITY
XVOWS = {};
XVOWS.wait = 10000;

/**
  Creates a working model and automatically checks state
  is `READY_NEW` and a valid `id` immediately afterward.

  Note: This function assumes the `id` is fetched automatically.
  For models with manually created ids such as 'XM.UserAccount',
  create a topic manually.

  @param {String|Object} Model
  @param {Object} Vows
*/
XVOWS.create = function (model, vows) {
  "use strict";
  vows = vows || {};
  var context = {
    topic: function () {
      var that = this,
        timeoutId,
        Klass,
        auto_regex = XM.Document.AUTO_NUMBER + "|" + XM.Document.AUTO_OVERRIDE_NUMBER,
        callback = function (model, value) {
          if (model instanceof XM.Document && model.numberPolicy.match(auto_regex)) {
            // Check that the AUTO...NUMBER property has been set.
            if (model.get(model.documentKey) && model.id) {
              clearTimeout(timeoutId);
              model.off('change:' + model.documentKey, callback);
              model.off('change:id', callback);
              that.callback(null, model);
            }
          } else {
            clearTimeout(timeoutId);
            model.off('change:id', callback);
            that.callback(null, model);
          }
        };

      if (typeof model === 'string') {
        Klass = Backbone.Relational.store.getObjectByName(model);
        model = new Klass();
      }
      model.on('change:id', callback);
      // Add an event handler when using a model with an AUTO...NUMBER.
      if (model instanceof XM.Document && model.numberPolicy.match(auto_regex)) {
        model.on('change:' + model.documentKey, callback);
      }
      model.initialize(null, {isNew: true});

      // If we don't hear back, keep going
      timeoutId = setTimeout(function () {
        that.callback(null, model);
      }, XVOWS.wait);
    },
    'Status is `READY_NEW`': function (model) {
      assert.equal(model.getStatusString(), 'READY_NEW');
    },
    'ID is valid': function (model) {
      assert.isNumber(model.id);
    }
  };

  // Add in any other passed vows
  _.extend(context, vows);
  return context;
};

/**
  Saves the working model and automatically checks state
  is `READY_CLEAN` immediately afterward.

  @param {String|Object} Model
  @param {Object} Vows
*/
XVOWS.save = function (model, vows) {
  "use strict";
  vows = vows || {};
  var context = {
    topic: function () {
      var that = this,
        timeoutId,
        callback = function () {
          var status = model.getStatus(),
            K = XM.Model;
          if (status === K.READY_CLEAN) {
            clearTimeout(timeoutId);
            model.off('statusChange', callback);
            that.callback(null, model);
          }
        };
      model.on('statusChange', callback);
      model.save();

      // If we don't hear back, keep going
      timeoutId = setTimeout(function () {
        that.callback(null, model);
      }, XVOWS.wait);
    },
    'Status is `READY_CLEAN`': function (model) {
      assert.equal(model.getStatusString(), 'READY_CLEAN');
    }
  };

  // Add in any other passed vows
  _.extend(context, vows);
  return context;
};

/**
  Check before updating the working model that the state is `READY_CLEAN`.

  @param {String|Object} Model
  @param {Object} Vows
*/
XVOWS.update = function (model, vows) {
  "use strict";
  vows = vows || {};
  var context = {
    topic: function () {
      return model;
    },
    'Status is `READY_CLEAN`': function (model) {
      assert.equal(model.getStatusString(), 'READY_CLEAN');
    }
  };

  // Add in any other passed vows
  _.extend(context, vows);
  return context;
};

/**
  Destorys the working model and automatically checks state
  is `DESTROYED_CLEAN` immediately afterward.

  @param {Object} Vows
*/
XVOWS.destroy = function (model, vows, obj) {
  "use strict";
  vows = vows || {};
  var context = {
    topic: function () {
      var that = this,
        timeoutId,
        callback = function () {
          var status = model.getStatus(),
            K = XM.Model;
          if (status === K.DESTROYED_CLEAN) {
            clearTimeout(timeoutId);
            model.off('statusChange', callback);
            that.callback(null, model);
          }
        };
      model.on('statusChange', callback);
      model.destroy();

      // If we don't hear back, keep going
      timeoutId = setTimeout(function () {
        that.callback(null, model);
      }, XVOWS.wait);
    },
    'Status is `DESTROYED_CLEAN`': function (model) {
      assert.equal(model.getStatusString(), 'DESTROYED_CLEAN');
    }
  };
  // Add in any other passed vows
  _.extend(context, vows);
  return context;
};

// PROCESS ANY INCOMING ARGS REAL QUICK
(function () {
  "use strict";
  XVOWS.args = program.tests;
  XVOWS.console = function () {
    var args = XT.$A(arguments);
    args.unshift("[XVOWS] ".yellow);
    console.log.apply(console, args);
    if (XVOWS.outfile && XVOWS.outfile.writeable) {
      XVOWS.log(args);
    }
  };
}());
//......................................
// INCLUDE ALL THE NECESSARY XT FRAMEWORK
// DEPENDENCIES
[
  "foundation",
  "error",
  "log",
  "datasource",
  "math",
  "request",
  "response",
  "session",
  "locale",
  "ext/proto/string",
  "ext/string",
  "ext/model",
  "ext/collection",
  "ext/startup_task",
  "en/strings"
].map(function (path) {
  "use strict";
  return _path.join(__dirname, "../xt", path) + ".js";
}).forEach(function (path) {
  "use strict";
  require(path);
});
// CRUSH QUIET SMASH AND DESTROY ANY NORMAL OUTPUT FOR NOW
// ...actually just...pipe it to some file...
(function () {
  "use strict";
  XVOWS.log = XT.log = function () {
    var out = XT.$A(arguments).map(function (arg) {
      return typeof arg === "string" ? arg: _util.inspect(arg, true, 3);
    }).join('\n');
    if (XVOWS.outfile && XVOWS.outfile.writable) {
      XVOWS.outfile.write("%@\n".f(out), "utf8");
    } else {
      XVOWS.outfile = _fs.createWriteStream(_path.join(__dirname, "run.log"), {
        flags: "a",
        encoding: "utf8"
      });
      XVOWS.outfile.on("error", function (err) {
        throw err;
      });
      XVOWS.outfile.write("\n[ENTRY] started %@\n".f((new Date()).toLocaleString()));
      // write the first output that caused this to open
      // the stream to begin with
      XVOWS.outfile.write("%@\n".f(out));
    }
  };

  // make sure on process SIGINT that we catch it and
  // properly close the pipe
  process.on("SIGINT", function () {
    //console.log("\n"); // to clear the line
    //XVOWS.console("caught SIGINT waiting for logfile to drain");
    process.on("EXIT", function () {
      XVOWS.console("all done, see ya");
    });
    XVOWS.outfile.on("close", function () {
      //XVOWS.console("all done, see ya");
      process.exit(0);
    });
    XVOWS.outfile.destroySoon();
  });
}());
//......................................
// INCLUDE ALL THE NECESSARY XM FRAMEWORK
// DEPENDENCIES
//
// HANEOUS ABOMINATION TO KEEP BACKBONE-
// RELATIONAL FROM BOMBING...
Backbone.XM = XM;
// LOAD ALL MODELS
//
// TO PRESERVE LOAD ORDER WE HACK THIS INTO
// UGLY OBLIVION BUT BY GOLLY IT F*@&$@# WORKS
require("./lib/fake_enyo");
// GRAB THE LOAD ORDER WE WANT TO PRESERVE
// FROM THE package.js FILE IN MODELS
require(_path.join(__dirname, "../xm/models", "package.js"));
// GRAB THE CRM MODULE
require(_path.join(__dirname, "../xm/modules", "crm.js"));
// GRAB THE STARTUP TASKS
require(_path.join(__dirname, "../xm", "startup.js"));

//console.log(_util.inspect(XT.getStartupManager().get("tasks")));
//console.log(_util.inspect(Backbone));
//console.log(_util.inspect(XM.Model));
//console.log(_util.inspect(XT));
//console.log(_util.inspect(XM));

(function () {
  "use strict";
  // for when a session is retrieved or needs to be
  // selected and completes...
  var selectionDone = function () {
    // register a callback for when startup tasks are completed
    XVOWS.console("session acquired, starting tasks");
    XT.getStartupManager().registerCallback(XVOWS.begin);
    XT.getStartupManager().start();
  };

  XVOWS.console("connecting to the datasource");
  XT.dataSource.datasourceUrl = program.host;
  XT.dataSource.datasourcePort = program.port;
  XT.dataSource.connect(function () {
    XT.session.acquireSession({
      username: program.user,
      password: program.password,
      organization: program.organization
    }, function (result) {
      if (result.code === 1) {
        // force new session, always
        XT.session.selectSession("FORCE_NEW_SESSION", selectionDone);
      } else if (result.code === 4) {
        // we're ok? not sure how but, whatever...
        selectionDone();
      } else {
        throw new Error("could not acquire valid session");
      }
    });
  });
}());

XVOWS.findAllTests = function () {
  "use strict";
  var path = _path.join(__dirname, "tests");
  var tests = XVOWS.tests = {};
  _fs.readdirSync(path).filter(function (file) {
    return _path.extname(file) === ".js" ? true: false;
  }).forEach(function (file) {
    tests[file] = _path.join(__dirname, "tests", file);
  });
};

XVOWS.begin = function () {
  "use strict";
  XVOWS.console("all startup tasks completed");
  XVOWS.console("searching for available tests");

  XVOWS.findAllTests();

  XVOWS.console("found %@ total".f((Object.keys(XVOWS.tests)).length));

  // were there special requests from the command line

  if (XVOWS.args.length === 1 && XVOWS.args[0] === "*") {
    // running all available tests
  } else if (XVOWS.args.length >= 1) {
    XVOWS.args.map(function (file) {
      return _path.extname(file) === ".js" ? file: file + ".js";
    }).forEach(function (file) {
      XVOWS.addTest(file);
    });
  } else {
    throw new Error("cannot figure out what to do");
  }

  // start testing
  XVOWS.start();
};

XVOWS.addTest = function (file) {
  "use strict";
  if (!this.toRun) {
    this.toRun = [];
  }
  this.toRun.push(file);
};

XVOWS.start = function () {
  "use strict";
  if (this.isStarted) {
    return false;
  }

  XVOWS.console("starting tests");

  this.isStarted = true;

  var run = this.toRun || [];
  var tests = this.tests;
  var testNames = Object.keys(tests);
  var len = testNames.length;

  if (run.length <= 0) {
    if (len > 0) {

      XVOWS.console("running all tests");

      this.toRun = run = testNames;
    } else {

      XVOWS.console("no tests to run");

      return this.finish();
    }
  } else {
    XVOWS.console("running %@ tests".f(run.length));
  }

  this.next();
};

XVOWS.finish = function () {
  "use strict";
  XVOWS.console("testing finished");
  process.emit("SIGINT"); // let the log cleanup
};

XVOWS.next = function (waited) {
  "use strict";
  if (!waited) {
    // this is only necessary because of a delay by vows
    // when it finally determines its batch is complete
    // TODO: if it can/does emit an event detectable
    // on completion this should be modified to use that
    // because this is just plain sloppy
    return setTimeout(XVOWS.nexted, 300);
  }

  var run = this.toRun;
  var tests = this.tests;
  var running;


  if (this.running) {
    console.log("\r"); // to break it up some
    XVOWS.console("finished running %@".f(this.running).red);
    this.running = null;
  }

  if (!run || run.length <= 0) {
    return this.finish();
  }

  while (true && run.length > 0) {
    running = run.shift();
    if (!running || !tests[running]) {
      XVOWS.console("could not run test %@, skipping".f(running));
      running = false;
    } else {
      this.running = running;
      console.log("\n"); // to break it up some
      XVOWS.console("running %@\n".f(running).red);
      running = tests[running];
      break;
    }
  }

  if (running) {
    require(running);
  } else { this.finish(); }
};

XVOWS.nexted = _.bind(XVOWS.next, XVOWS, [true]);