export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = url.pathname.slice(1); // strip leading /

    // DocC root redirect: any path under docs/ that has a metadata.json
    // should redirect to /documentation/<module> instead of serving the
    // bare SPA shell. This handles both single-target (docs/wuhu-ai/)
    // and multi-target (docs/wuhu-core/WuhuAPI/) layouts.
    if (key.startsWith("docs/")) {
      const cleanKey = key.replace(/\/+$/, ""); // strip trailing slashes
      const metaObj = await env.BUCKET.get(cleanKey + "/metadata.json");
      if (metaObj) {
        const meta = await metaObj.json();
        const moduleName = meta.bundleDisplayName?.toLowerCase();
        if (moduleName) {
          return Response.redirect(
            url.origin + "/" + cleanKey + "/documentation/" + moduleName,
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
      // Try with /index.html appended (for paths like /download without trailing slash).
      // Serving the index body here would work, but the browser's URL bar would stay on
      // the slash-less path, so any relative links inside the page (e.g. `href="foo/"`)
      // would resolve against the parent directory and 404. Redirect to the canonical
      // trailing-slash form instead — same behavior as S3 website hosting, GitHub Pages,
      // etc. Preserve the query string and hash.
      const indexKey = key + "/index.html";
      const indexObject = await env.BUCKET.head(indexKey);
      if (indexObject) {
        const canonical = new URL(url);
        canonical.pathname = url.pathname + "/";
        return Response.redirect(canonical.toString(), 301);
      }

      // DocC SPA fallback: for paths under docs/ that look like navigation
      // routes (no file extension), find the nearest DocC root (the one with
      // metadata.json) and serve its index.html for client-side routing.
      if (key.startsWith("docs/") && !hasFileExtension(key)) {
        const doccRoot = await findDoccRoot(key, env);
        if (doccRoot) {
          const doccIndex = await env.BUCKET.get(doccRoot + "/index.html");
          if (doccIndex) {
            return respond(doccIndex);
          }
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

// Walk up the path to find the nearest directory with a metadata.json
async function findDoccRoot(key, env) {
  const parts = key.split("/");
  // Start from the deepest possible DocC root and walk up
  // e.g. for docs/wuhu-core/WuhuAPI/documentation/wuhuapi
  // try: docs/wuhu-core/WuhuAPI, docs/wuhu-core, docs
  for (let i = parts.length - 1; i >= 2; i--) {
    const candidate = parts.slice(0, i).join("/");
    const meta = await env.BUCKET.head(candidate + "/metadata.json");
    if (meta) {
      return candidate;
    }
  }
  return null;
}

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
    contentTypeFor(object.key) ||
      object.httpMetadata?.contentType ||
      "application/octet-stream",
  );
  return new Response(object.body, { headers });
}

// Override content-type for keys whose stored metadata is unhelpful. The
// alignment pipeline `aws s3 sync`s Swift interfaces and `.patch` files into
// R2 with the default `application/octet-stream`, which makes the browser
// download them instead of rendering inline. Force them to text/plain so the
// dashboard links are actually browsable.
function contentTypeFor(key) {
  if (!key) return null;
  if (key.startsWith("alignment/")) {
    if (key.endsWith(".swift") || key.endsWith(".patch")) {
      return "text/plain; charset=utf-8";
    }
  }
  return null;
}
