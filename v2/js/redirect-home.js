(function () {
  var path = location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/v2" || path === "/v2/index.html") {
    location.replace("/" + location.search + location.hash);
  }
})();
