const CANONICAL_HOST = 'creativeactivities.org';

// www.creativeactivities.org answers with a permanent redirect to the same
// path and query on the apex. Nothing is logged or stored.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    url.port = '';
    return Response.redirect(url.toString(), 301);
  },
};
