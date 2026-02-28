export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = url.pathname.slice(1); // strip leading /

    // DocC root redirect: /docs/<package>/ or /docs/<package> should redirect
    // to the documentation page, not serve the bare SPA shell.
    const doccRootMatch =
      key.match(/^(docs\/[^/]+)\/?$/) ||
      (key === "" ? null : null);
    if (doccRootMatch) {
      const metaObj = await env.BUCKET.get(doccRootMatch[1] + "/metadata.json");
      if (metaObj) {
        const meta = await metaObj.json();
        const moduleName = meta.bundleDisplayName?.toLowerCase();
        if (moduleName) {
          return Response.redirect(
            url.origin + "/" + doccRootMatch[1] + "/documentation/" + moduleName,
            302,
          );
        }
      }
    }

    // If path is empty or ends with /, try index.html
    if (key === "" || key.endsWith("/")) {
      key = key + "index.html";
    }

    const object = await env.BUCKET.get(key);

    if (!object) {
      // Try with /index.html appended (for paths like /download without trailing slash)
      const indexKey = key + "/index.html";
      const indexObject = await env.BUCKET.get(indexKey);
      if (indexObject) {
        return respond(indexObject);
      }

      // DocC SPA fallback: for paths under docs/<package>/ that look like
      // navigation routes (no file extension), serve the package's index.html
      // so the DocC Vue SPA can handle client-side routing.
      const doccMatch = key.match(/^(docs\/[^/]+)\//);
      if (doccMatch && !hasFileExtension(key)) {
        const doccIndex = await env.BUCKET.get(doccMatch[1] + "/index.html");
        if (doccIndex) {
          return respond(doccIndex);
        }
      }

      // Serve site 404 page if it exists
      const notFound = await env.BUCKET.get("404.html");
      if (notFound) {
        const headers = new Headers();
        notFound.writeHttpMetadata(headers);
        headers.set("content-type", "text/html");
        return new Response(notFound.body, { status: 404, headers });
      }
      return new Response("Not Found", { status: 404 });
    }

    return respond(object);
  },
};

function hasFileExtension(path) {
  const lastSegment = path.split("/").pop() || "";
  return lastSegment.includes(".");
}

function respond(object) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set(
    "content-type",
    object.httpMetadata?.contentType || "application/octet-stream",
  );
  return new Response(object.body, { headers });
}
