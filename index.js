var ojc = require("ojc").compile;
var lu = require("loader-utils");
var path = require("path");

// Compiler
module.exports = function OJ(source,map) {
    // Compilation-specific caching
    if(typeof this._compilation.ojc == "undefined") {
        this._compilation.ojc = {
            cache: {},
            state: {}
        };
    }

    var ojcData = this._compilation.ojc;

    // Header
    var header = [
        // Import the runtime
        "var oj = require('!!ojc/src/runtime')",
    ].join("\n");

    // OJ is cool like this.
    this.cacheable(true);

    // We must be able to be sync.
    var cb = this.async();
    if(!cb) {
        throw new Error([
            "The OJ loader must run in async manners.",
            "Check your config/invocation."
        ].join(" "));
    }

    if(typeof ojcData.cache[this.resourcePath] != "undefined") {
        // In order to avoid re-complication, return the cached object.
        var out = ojcData.cache[this.resourcePath];
        cb(null, out.code, out.map);
    } else {
        // The query should be - almost! - the OJ options
        var options = lu.parseQuery(this.query);

        // Compiler state. Use previous one if possible
        // `this` keeps changing, so I need another way...
        options.state = ojcData.state;

        // Source map and file
        var rawFile = this.resourcePath.replace(this.options.context, "");
        if(rawFile.charAt(0)) rawFile = rawFile.substr(1);
        options.files = [{
            path: rawFile,
            contents: source
        }];

        // SourceMap?
        if(this.sourceMap) {
            options["source-map-file"]=true;
            options["source-map-root"]=this.options.context;
        }

        // Mimimize?
        if(this.minimize) {
            options.squeeze = true;
        }

        // Compiler options
        [
            "warn-unused-ivars",
            "warn-unknown-ivars",
            "warn-unknown-selectors",
            "warn-this-in-methods"
        ].forEach(function(k,v){
            options[v] = options[v] || true;
        });

        // Do it.
        var _this = this;
        ojc(options, function(err, result){
            if(err) {
                cb(err);
            } else {
                for(var i in result.warnings) {
                    var warning = result.warnings[i];
                    _this.emitWarning(warning);
                }
                ojcData.state = result.state;
                ojcData.cache[_this.resourcePath] = {
                    code: header+result.code,
                    map: result.map
                }
                cb(err, header+result.code, result.map);
            }
        });

        // Backwards assignment
        this._compilation.ojc = ojcData;
    }
};
