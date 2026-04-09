const regex = /[\\/]node_modules[\\/](react-ga4|google-analytics|gtag\.js|web-vitals)[\\/]/;

const testCases = [
    { path: "node_modules/react-ga4/index.js", expected: true },
    { path: "node_modules/web-vitals/dist/index.js", expected: true },
    { path: "src/utils/analytics.ts", expected: false },
    { path: "src/utils/analyticsClient.ts", expected: false },
    { path: "/home/user/project/node_modules/react-ga4/package.json", expected: true },
    { path: "node_modules/@radix-ui/themes/index.js", expected: false },
];

console.log("Testing vendor-events regex:");
testCases.forEach(({ path, expected }) => {
    const result = regex.test(path);
    console.log(`[${result === expected ? "PASS" : "FAIL"}] ${path} -> ${result}`);
});
