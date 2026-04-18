// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/assets/*",
    "/*.js",
    "/*.css",
    "/*.png",
    "/*.jpg",
    "/*.svg",
    "/*.ico",
    "/*.json",
    "/*.woff2",
    "/*.mp3"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/home/jbelew/projects/nms_optimizer-web/.wrangler/tmp/pages-PBMYHT/functionsWorker-0.10256980238730529.mjs";
import { isRoutingRuleMatch } from "/home/jbelew/projects/nms_optimizer-web/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/home/jbelew/projects/nms_optimizer-web/.wrangler/tmp/pages-PBMYHT/functionsWorker-0.10256980238730529.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=dxmok3klhto.js.map
