/* eslint-disable */
// adapted from https://github.com/amiller-gh/currentScript-polyfill/blob/master/currentScript.js
// added support for Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1620505
function getCurrentScript () {
  // IE 8-10 support script readyState
  // IE 11+ support stack trace
  // Firefox supports err.fileName
  try {
    throw new Error();
  }
  catch (err) {
    // Find the second match for the "at" string to get file src url from stack.
    // Specifically works with the format of stack traces in IE.
    var i = 0,
      stackDetails = (/.*at [^(]*\((.*):(.+):(.+)\)$/ig).exec(err.stack),
      scriptLocation = err.fileName || (stackDetails && stackDetails[1]) || false,
      line = (stackDetails && stackDetails[2]) || false,
      currentLocation = document.location.href.replace(document.location.hash, ''),
      pageSource,
      inlineScriptSourceRegExp,
      inlineScriptSource,
      scripts = document.getElementsByTagName('script'); // Live NodeList collection

    if (scriptLocation === currentLocation) {
      pageSource = document.documentElement.outerHTML;
      inlineScriptSourceRegExp = new RegExp('(?:[^\\n]+?\\n){0,' + (line - 2) + '}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*', 'i');
      inlineScriptSource = pageSource.replace(inlineScriptSourceRegExp, '$1').trim();
    }

    for (; i < scripts.length; i++) {
      // If ready state is interactive, return the script tag
      if (scripts[i].readyState === 'interactive') {
        return scripts[i];
      }

      // If src matches, return the script tag
      if (scripts[i].src === scriptLocation) {
        return scripts[i];
      }

      // If inline source matches, return the script tag
      if (
        scriptLocation === currentLocation &&
        scripts[i].innerHTML &&
        scripts[i].innerHTML.trim() === inlineScriptSource
      ) {
        return scripts[i];
      }
    }

    // If no match, return null
    return null;
  }
}

var currentScript = 'currentScript';
// for backward compatibility, because previously we directly included the polyfill
if (!(currentScript in document)) {
  Object.defineProperty(document, currentScript, { get: getCurrentScript })
}

module.exports = getCurrentScript
