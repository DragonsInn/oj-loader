var juicy = require("ohsojuicy");
var lu = require("loader-utils");
var path = require("path");
var merge = require("merge");

// Copied and modified from ojc/bin/ojc
function print_error(err) {
    function toString(e) {
        var result  = "";

        var file   = e.file   || e.filename;
        var line   = e.line   || e.lineNumber;
        var column = e.column || e.columnNumber || e.col;
        var reason = e.reason || e.description;

        if (file)   result += file;
        if (line)   result += ":" + line;
        if (column) result += ":" + column;
        if (reason) result += " " + reason;

        return result;
    }

    var strings;
    if (typeof err == "array") {
        strings = err.map(function(e) { return toString(e) });
    } else {
        strings = [ toString(err) ];
    }

    this.emitError(strings.join("\n"));
}

// Compiler
module.exports = function OJ(source,map) {
    // Compilation-specific caching and state keeping
    if(typeof this._compilation.ojc == "undefined") {
        this._compilation.ojc = {
            cache: {},
            state: {}
        };
        // This is a new compilation, so also add the middlewares.
        if(typeof this.options.oj == "object") {
            var ojo = this.options.oj;
            var keys = ["pre","post"];
            for(var n in keys) {
                var k = keys[n];
                if(typeof ojo[k] != "undefined") {
                    for(var i in ojo[k]) {
                        juicy.use(k+"-compile", ojo[k][i]);
                    }
                }
            }
        }
    }

    var ojcData = this._compilation.ojc;

    // Header
    var header = [
        // Import the runtime
        "var oj = require('!!"+require.resolve("ojc/src/runtime")+"')",
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

        // this might be present so use it.
        if(typeof this.options.oj == "object" && typeof this.options.oj.options == "object") {
            options = merge(options, this.options.oj.options);
        }

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
        juicy.compile(options, function(err, result){
            if(err) {
                print_error.call(_this, err);
                cb(new Error("Compilation failed!"));
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
