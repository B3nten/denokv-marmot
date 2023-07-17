// create a directory to store the database
await Deno.mkdir("./kv", { recursive: true });
// open the database
const kv = await Deno.openKv("./kv/database");
// set the key ["message"] to "Hello World!"
kv.set(["message"], "Hello World!");

async function handler(req: Request): Promise<Response> {
  // get the value of the key ["message"]
  const message = await kv.get<string>(["message"]);
  // return the value as the response
  return new Response(message.value);
}

// start the server
Deno.serve({ port: 8080 }, handler);
