import { defineConfig, type Plugin } from "vite";
import { pageTokens } from "./src/listRender.ts";

// Fills index.html and list.html with content from src/content.ts at build
// time, so the list view is plain static HTML.
function injectContent(): Plugin {
  return {
    name: "inject-content",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        for (const [token, value] of Object.entries(pageTokens())) html = html.split(token).join(value);
        return html;
      },
    },
  };
}

export default defineConfig({
  plugins: [injectContent()],
  build: {
    rollupOptions: { input: { main: "index.html", list: "list.html" } },
  },
});
