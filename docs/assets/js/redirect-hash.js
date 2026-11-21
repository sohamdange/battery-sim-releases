/*
 * Used by the redirect layout when a moved page had in-page links (#name) that
 * were shared. Sends #name to the matching section of the new page, using the
 * map in data-map, before the plain meta refresh (which drops the #name) runs.
 */
(function () {
  "use strict";
  var s = document.currentScript;
  var target = s.getAttribute("data-target");
  var map = {};
  try { map = JSON.parse(s.getAttribute("data-map") || "{}"); } catch (e) { map = {}; }
  var hash = location.hash.replace(/^#/, "");
  if (hash && Object.prototype.hasOwnProperty.call(map, hash)) {
    location.replace(target.split("#")[0] + "#" + map[hash]);
  }
})();
