import Template from "https://deno.land/x/template@v0.1.0/mod.ts";
import env from "./env.ts";

/* Create a directory and open a key-value store.
   We create the directory with `recursive: true` so that it doesn't
   throw an error if the directory already exists.
   If the database doesn't exist, it will be created. */
await Deno.mkdir(env.KV_PATH, { recursive: true });
const kv = await Deno.openKv(`${env.KV_PATH}/database`);

type GuestbookEntry = {
  message: string;
  timestamp: Date;
};

/**
 * Set some initial values.
 */

await kv.set(["guestbook", "Sam"], {
  message: "Hello, world!",
  timestamp: new Date(),
});
await kv.set(["guestbook", "Molly"], {
  message: "Hello, world!",
  timestamp: new Date(),
});
await kv.set(["guestbook", "Josh"], {
  message: "Hello, world!",
  timestamp: new Date(),
});

async function handler(req: Request): Promise<Response> {
  switch (req.method) {
    case "GET": {
      /**
       * Get all the guestbook entries.
       * This returns an async iterable, so we need to iterate over it.
       */
      const postList = kv.list<GuestbookEntry>({ prefix: ["guestbook"] }, {
        limit: 100,
      });
      const posts = [];
      /**
       * Iterate over the async iterable.
       * This will return a key-value pair for each entry.
       */
      for await (const post of postList) {
        posts.push({
          name: post.key[1],
          message: post.value.message,
          timestamp: post.value.timestamp.getTime(),
        });
      }

      const template = await Deno.readTextFile(
        new URL(import.meta.resolve("./index.html")),
      );
      /**
       * Render the template.
       */
      const markup = new Template({ isEscape: false }).render(template, {
        posts: posts.sort((a, b) => b.timestamp - a.timestamp).map((post) =>
          `<li><strong>${post.name}:</strong> ${post.message}</li>`
        )
          .join("\n"),
        region: env.FLY_REGION,
      });

      return new Response(markup, {
        headers: {
          "content-type": "text/html; charset=UTF-8",
        },
      });
    }
    case "POST": {
      const body = await req.formData();
      const name = body.get("name") as string;
      const message = body.get("message") as string;

      if (!name) return new Response("Name is required", { status: 400 });
      if (!message) return new Response("Message is required", { status: 400 });

      const entry: GuestbookEntry = {
        message: message,
        timestamp: new Date(),
      };

      await kv.set(["guestbook", name], entry);
      /**
       * Redirect back to the root URL.
       */
      return Response.redirect(new URL(req.url).origin);
    }
    default:
      return new Response("Method not allowed", { status: 405 });
  }
}

Deno.serve({ port: env.PORT }, handler);
