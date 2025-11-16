"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
function calculateSize(node, nodeParts) {
    var totalSize = 0;
    if (node.uid && nodeParts[node.uid]) {
        var part = nodeParts[node.uid];
        // Prioritize brotli, then gzip, then rendered length
        totalSize += part.brotliLength || part.gzipLength || part.renderedLength;
    }
    if (node.children) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            totalSize += calculateSize(child, nodeParts);
        }
    }
    return totalSize;
}
function analyzeBundles(stats) {
    var bundleSizes = [];
    for (var _i = 0, _a = stats.tree.children || []; _i < _a.length; _i++) {
        var topLevelChunk = _a[_i];
        var chunkName = topLevelChunk.name;
        var totalChunkSize = 0;
        var childrenSizes = [];
        if (topLevelChunk.children) {
            for (var _b = 0, _c = topLevelChunk.children; _b < _c.length; _b++) {
                var child = _c[_b];
                var childSize = calculateSize(child, stats.nodeParts);
                childrenSizes.push({ name: child.name, size: childSize });
                totalChunkSize += childSize;
            }
        }
        else if (topLevelChunk.uid) {
            // Handle cases where a top-level chunk might be a single module
            var part = stats.nodeParts[topLevelChunk.uid];
            totalChunkSize += part.brotliLength || part.gzipLength || part.renderedLength;
        }
        // Sort children by size for better readability
        childrenSizes.sort(function (a, b) { return b.size - a.size; });
        bundleSizes.push({ name: chunkName, size: totalChunkSize, children: childrenSizes });
    }
    // Sort bundles by size
    bundleSizes.sort(function (a, b) { return b.size - a.size; });
    console.log("--- Bundle Analysis (Brotli/Gzip/Rendered Size) ---");
    for (var _d = 0, bundleSizes_1 = bundleSizes; _d < bundleSizes_1.length; _d++) {
        var bundle = bundleSizes_1[_d];
        console.log("\nBundle: ".concat(bundle.name, " (Total Size: ").concat((bundle.size / 1024).toFixed(2), " KB)"));
        if (bundle.children.length > 0) {
            console.log("  Largest Modules:");
            // Display top 5 largest modules within each bundle
            bundle.children.slice(0, 5).forEach(function (child) {
                console.log("    - ".concat(child.name, ": ").concat((child.size / 1024).toFixed(2), " KB"));
            });
            if (bundle.children.length > 5) {
                console.log("    ... and ".concat(bundle.children.length - 5, " more modules."));
            }
        }
    }
    // Find the largest modules overall (not just within their direct parent chunk)
    var allModules = [];
    for (var uid in stats.nodeParts) {
        var part = stats.nodeParts[uid];
        // Find the corresponding node name from nodeMetas
        var meta = stats.nodeMetas[uid];
        if (meta) {
            allModules.push({ name: meta.id, size: part.brotliLength || part.gzipLength || part.renderedLength });
        }
    }
    allModules.sort(function (a, b) { return b.size - a.size; });
    console.log("\n--- Top 10 Largest Modules Overall ---");
    allModules.slice(0, 10).forEach(function (module) {
        console.log("- ".concat(module.name, ": ").concat((module.size / 1024).toFixed(2), " KB"));
    });
}
// Read the stats.json file
fs.readFile('stats.json', 'utf8', function (err, data) {
    if (err) {
        console.error('Error reading stats.json:', err);
        return;
    }
    try {
        var stats = JSON.parse(data);
        analyzeBundles(stats);
    }
    catch (parseError) {
        console.error('Error parsing stats.json:', parseError);
    }
});
