/* Licence key request form. Posts to the licence server, which emails the key. */
(function () {
  "use strict";

  var API = "https://earnest-patience-production-3919.up.railway.app/public/request-trial";
  var EMAIL = "soham.perpetual@gmail.com";

  var form = document.getElementById("licence-form");
  if (!form) return;
  var btn = document.getElementById("licence-submit");
  var btnLabel = btn.querySelector("span");
  var note = document.getElementById("licence-note");

  // Builds the message with DOM nodes. parts: strings, or [tag, text] pairs.
  function para(parts) {
    var p = document.createElement("p");
    parts.forEach(function (part) {
      if (typeof part === "string") { p.appendChild(document.createTextNode(part)); return; }
      var el = document.createElement(part[0]);
      el.textContent = part[1];
      if (part[0] === "a") el.href = "mailto:" + EMAIL;
      p.appendChild(el);
    });
    return p;
  }

  function show(kind, title, paras) {
    note.className = "note note--" + kind;
    note.textContent = "";
    var h = document.createElement("h3");
    h.textContent = title;
    note.appendChild(h);
    paras.forEach(function (p) { note.appendChild(para(p)); });
    note.hidden = false;
  }

  function reset() {
    btn.disabled = false;
    btnLabel.textContent = "Send me a licence key";
  }

  // Mapped from the reasons the API actually returns, so the message matches
  // the real cause rather than a generic failure.
  function messageFor(data) {
    switch (data.reason) {
      case "invalid_email":
        return ["error", "That address does not look right", [["Check it for typos and try again."]]];
      case "disposable_email":
        return ["error", "Disposable addresses are not accepted",
          [["Please use an address you will still have in a year. The key is tied to it, and it is how you would reach support."]]];
      case "rate_limited": {
        var mins = Math.ceil((data.retry_after_seconds || 3600) / 60);
        return ["warn", "Too many requests",
          [["Please try again in about " + mins + " minute" + (mins === 1 ? "" : "s") + "."]]];
      }
      default:
        return ["error", "Something went wrong", [["Please try again, or email ", ["a", EMAIL], "."]]];
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("email").value.trim();
    if (!email) { document.getElementById("email").focus(); return; }

    btn.disabled = true;
    btnLabel.textContent = "Sending…";
    note.hidden = true;

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        name: document.getElementById("name").value.trim() || null,
        organisation: document.getElementById("org").value.trim() || null
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          form.hidden = true;
          show("ok", "Check your inbox", [
            data.resent
              ? ["A key had already been issued to ", ["strong", email], ", so it has been sent again."]
              : ["Your licence key is on its way to ", ["strong", email], "."],
            [["strong", "Look in your spam or junk folder."], " The email comes from ", ["code", EMAIL],
              ", and because it is sent from an ordinary Gmail account rather than a company domain, filters often put it there. Marking it as not spam helps future messages reach you."],
            ["Nothing after a few minutes? Submit the form again. It will re-send the same key rather than issue a new one."]
          ]);
        } else {
          var m = messageFor(data);
          show(m[0], m[1], m[2]);
          reset();
        }
      })
      .catch(function () {
        show("error", "Could not reach the licence server", [
          ["Check your connection and try again. If it keeps failing, email ", ["a", EMAIL], " and a key will be sent by hand."]
        ]);
        reset();
      });
  });
})();
