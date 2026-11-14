const CANONICAL_HOST = 'creativeactivities.org';

// Every old or www host answers with a permanent redirect to the same path and
// query on the canonical host (docs/release/domain-cutover.md, step 3).
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    url.port = '';
    return Response.redirect(url.toString(), 301);
  },
};
