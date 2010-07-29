/*

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/**
 * CSS3Hacks namespace
 */
var CSS3Hacks = {

    STYLESHEET_ID: "__css3hacks__",

    IMPORT_REGEX: /@import ["'](.*)["'];/i,

    VARIABLES_REGEX: /@variables/i,

    VARIABLE_REGEX: /^\s*(.*)\s*:\s*(.*)\s*;\s*/i,

    VAR_REGEX: /var\(([^\)]+)\)/i,

    BR_REGEX: /[\s\n]border-radius/i,

    variables: {},

    init: function() {
        for (var s = 0; s < document.styleSheets.length; s++) {
            CSS3Hacks.process(document.styleSheets[s].href);
        }
    },

    process: function(file) {
        if (!file) {
            return;
        }

        CSS3Hacks.xhr.open("get", file, false);
        CSS3Hacks.xhr.send(null);
 
        if (CSS3Hacks.xhr.status != 0 && CSS3Hacks.xhr.status != 200) {
            return;
        }

        var css = CSS3Hacks.xhr.responseText.split("\n");
        var selector = "";
        for (var l = 0; l < css.length; l++) {
            // Process imports
            var import_res = CSS3Hacks.IMPORT_REGEX.exec(css[l]);
            if (import_res && import_res.length > 1 && import_res[1].length > 0) {
                var url = response.request.url;
                url = url.substring(0, url.lastIndexOf("/") + 1) + import_res[1];
                CSS3Hacks.process(url);
                continue;
            }

            // Process variables definition
            if (CSS3Hacks.VARIABLES_REGEX.test(css[l])) {
                while (css[++l].indexOf("}") == -1) {
                    var variable_res = CSS3Hacks.VARIABLE_REGEX.exec(css[l]);
                    if (variable_res) {
                        CSS3Hacks.variables[variable_res[1]] = variable_res[2];
                    }
                }
                continue;
            }

            // Process border radius
            var open = css[l].indexOf("{");
            if (open > 0) {
                selector = css[l].substring(0, open);
                selector = selector.replace(/^\s*/, '').replace(/\s*$/, '');
            }
            if (CSS3Hacks.BR_REGEX.test(css[l])) {
                CSS3Hacks.createCSS(selector,
                        css[l].replace(CSS3Hacks.BR_REGEX, "-moz-border-radius") +
                        css[l].replace(CSS3Hacks.BR_REGEX, "-webkit-border-radius") +
                        css[l].replace(CSS3Hacks.BR_REGEX, "-khtml-border-radius") +
                        "behavior: url(PIE.htc);");
            }

            // Process variables
            var var_res = CSS3Hacks.VAR_REGEX.exec(css[l]);
            if (var_res) {
                CSS3Hacks.createCSS(selector, css[l].replace(CSS3Hacks.VAR_REGEX,
                        CSS3Hacks.variables[var_res[1]]));
            }
        }
    },

    getRule: function(selectorText) {
        for ( var s = 0; s < document.styleSheets.length; s++) {
            var rules = document.styleSheets[s].rules
                    || document.styleSheets[s].cssRules;

            for ( var r = 0; r < rules.length; r++) {
                if (rules[r].selectorText == selectorText) {
                    return rules[r];
                }
            }
        }

        return null;
    },

    createCSS: function(selector, declaration) {
        var last = document.styleSheets[document.styleSheets.length - 1];
        if (typeof last.insertRule != "undefined") {
            last.insertRule(selector + "{" + declaration + "}", last.cssRules.length);
        } else if (typeof last.addRule != "undefined") {
            var parts = declaration.split(";");
            for (var i = 0; i < parts.length; i++ ) {
                last.addRule(selector, parts[i].trim() + ";");
            }
        }
    }

};

if (typeof XMLHttpRequest != "undefined") {
    CSS3Hacks.xhr = new XMLHttpRequest();
} else if (typeof ActiveXObject != "undefined") {
    CSS3Hacks.xhr = new ActiveXObject("Microsoft.XMLHTTP");
}

if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, ''); 
    }
}

