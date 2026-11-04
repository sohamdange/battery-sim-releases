/*
 * Live release details from the GitHub Releases API.
 * Kept in this one file so that the guard workflow flags any change to it.
 *
 * App releases are tagged v*, add-on releases addon-*. They are told apart by
 * tag, never by GitHub's "latest" flag, so publishing an add-on can never
 * replace the app's download button.
 *
 * Pages mark elements with data-rel="..." and this script fills them in. Every
 * element keeps its server-rendered fallback (a link to the release page) if
 * the API cannot be reached. API text is only ever inserted with textContent.
 *
 *   app-version, app-date, app-size      text
 *   app-download                         <a> href -> installer
 *   app-page                             <a> href -> release page
 *   app-notes                            <ul> filled with release notes
 *   addon-name, addon-date, addon-size   text
 *   addon-download                       <a> href -> add-on zip
 *   addon-listing                        <a> href -> add-on .json listing
 *   addon-sources                        <a> href -> sources zip
 *   addon-page                           <a> href -> release page
 *   addon-checksums                      <tbody> filled with file / size / SHA-256
 *   history                              <ol> filled with app release history
 */
(function () {
  "use strict";

  var API = "https://api.github.com/repos/sohamdange/battery-sim-releases/releases?per_page=50";
  var CACHE_KEY = "bss-releases-v1";
  var CACHE_MS = 10 * 60 * 1000;

  if (!document.querySelector("[data-rel]")) return;

  function all(name) {
    return Array.prototype.slice.call(document.querySelectorAll('[data-rel="' + name + '"]'));
  }
  function setText(name, value) {
    if (!value) return;
    all(name).forEach(function (el) { el.textContent = value; el.hidden = false; });
  }
  function setHref(name, value) {
    if (!value) return;
    all(name).forEach(function (el) { el.href = value; el.hidden = false; });
  }
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }
  function fmtSize(bytes) {
    if (!bytes) return "";
    return (bytes / (1024 * 1024)).toFixed(0) + " MB";
  }
  function asset(rel, test) {
    return (rel.assets || []).filter(function (a) { return test(a.name.toLowerCase()); })[0];
  }

  // Plain-text note lines from a release body: drops headings and tables,
  // strips list markers and bold markers.
  function noteLines(body) {
    return (body || "").split(/\r?\n/).map(function (l) { return l.trim(); })
      .filter(function (l) { return l && !/^#/.test(l) && !/^\|/.test(l); })
      .map(function (l) { return l.replace(/^[-*]\s+/, "").replace(/\*\*/g, ""); });
  }

  function fillList(ul, lines, max) {
    ul.textContent = "";
    lines.slice(0, max || lines.length).forEach(function (line) {
      var li = document.createElement("li");
      li.textContent = line;
      ul.appendChild(li);
    });
    ul.hidden = false;
  }

  function render(releases) {
    var published = releases.filter(function (r) { return !r.draft && !r.prerelease; });
    var apps = published.filter(function (r) {
      return /^v\d/.test(r.tag_name) && asset(r, function (n) { return /\.exe$/.test(n); });
    });
    var addons = published.filter(function (r) { return /^addon-/.test(r.tag_name); });

    var app = apps[0];
    if (app) {
      var exe = asset(app, function (n) { return /\.exe$/.test(n); });
      setText("app-version", app.tag_name);
      setText("app-date", fmtDate(app.published_at));
      setText("app-size", fmtSize(exe.size));
      setHref("app-download", exe.browser_download_url);
      setHref("app-page", app.html_url);
      all("app-notes").forEach(function (ul) { fillList(ul, noteLines(app.body), 6); });
    }

    var addon = addons[0];
    if (addon) {
      var zip = asset(addon, function (n) { return /\.zip$/.test(n) && !/-sources\.zip$/.test(n); });
      var listing = asset(addon, function (n) { return /\.json$/.test(n); });
      var sources = asset(addon, function (n) { return /-sources\.zip$/.test(n); });
      setText("addon-name", addon.name);
      setText("addon-date", fmtDate(addon.published_at));
      if (zip) {
        setText("addon-size", fmtSize(zip.size));
        setHref("addon-download", zip.browser_download_url);
      }
      if (listing) setHref("addon-listing", listing.browser_download_url);
      if (sources) setHref("addon-sources", sources.browser_download_url);
      setHref("addon-page", addon.html_url);

      // Checksum table rows in the release notes: | `file` | size | `sha256` |
      var rows = [];
      (addon.body || "").split(/\r?\n/).forEach(function (l) {
        var m = l.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*`([0-9a-f]{64})`\s*\|/i);
        if (m) rows.push(m.slice(1));
      });
      if (rows.length) {
        all("addon-checksums").forEach(function (tbody) {
          tbody.textContent = "";
          rows.forEach(function (r) {
            var tr = document.createElement("tr");
            r.forEach(function (cell, i) {
              var td = document.createElement("td");
              if (i !== 1) {
                var code = document.createElement("code");
                code.textContent = cell;
                td.appendChild(code);
              } else {
                td.textContent = cell;
              }
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
          tbody.hidden = false;
        });
      }
    }

    all("history").forEach(function (ol) {
      ol.textContent = "";
      apps.slice(0, 12).forEach(function (r, i) {
        var li = document.createElement("li");
        li.className = "history-item" + (i === 0 ? " is-latest" : "");
        var head = document.createElement("div");
        head.className = "history-head";
        var tag = document.createElement("a");
        tag.className = "history-tag";
        tag.href = r.html_url;
        tag.textContent = r.tag_name;
        var date = document.createElement("span");
        date.className = "history-date";
        date.textContent = fmtDate(r.published_at) + (i === 0 ? " · Latest" : "");
        head.appendChild(tag);
        head.appendChild(date);
        var ul = document.createElement("ul");
        ul.className = "history-notes";
        fillList(ul, noteLines(r.body), 6);
        li.appendChild(head);
        li.appendChild(ul);
        ol.appendChild(li);
      });
      ol.hidden = false;
    });

    document.documentElement.classList.add("releases-loaded");
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      return Date.now() - c.t < CACHE_MS ? c.d : null;
    } catch (e) { return null; }
  }
  function writeCache(d) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
  }

  var cached = readCache();
  if (cached) { render(cached); return; }

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      if (!Array.isArray(data)) return;
      // Keep only the fields used above, so the cache stays small.
      var slim = data.map(function (r) {
        return {
          tag_name: r.tag_name, name: r.name, body: r.body, html_url: r.html_url,
          published_at: r.published_at, draft: r.draft, prerelease: r.prerelease,
          assets: (r.assets || []).map(function (a) {
            return { name: a.name, size: a.size, browser_download_url: a.browser_download_url };
          })
        };
      });
      writeCache(slim);
      render(slim);
    })
    .catch(function () { /* fallbacks stay in place */ });
})();
