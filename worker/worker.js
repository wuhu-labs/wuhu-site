export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = url.pathname.slice(1); // strip leading /

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
        const headers = new Headers();
        indexObject.writeHttpMetadata(headers);
        headers.set("etag", indexObject.httpEtag);
        headers.set(
          "content-type",
          indexObject.httpMetadata?.contentType || "application/octet-stream",
        );
        return new Response(indexObject.body, { headers });
      }

      // Serve 404 page if it exists
      const notFound = await env.BUCKET.get("404.html");
      if (notFound) {
        const headers = new Headers();
        notFound.writeHttpMetadata(headers);
        headers.set("content-type", "text/html");
        return new Response(notFound.body, { status: 404, headers });
      }
      return new Response("Not Found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set(
      "content-type",
      object.httpMetadata?.contentType || "application/octet-stream",
    );
    return new Response(object.body, { headers });
  },
};
