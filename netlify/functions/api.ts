// @ts-ignore
import serverless from "serverless-http";
import createServer from "../../dist/server/node-build.mjs"; // ✅ now default export

const app = createServer();
export const handler = serverless(app);
