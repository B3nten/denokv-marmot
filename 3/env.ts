const APP_NAME = Deno.env.get("FLY_APP_NAME");
const PRIVATE_IP = Deno.env.get("FLY_PRIVATE_IP");
const ALLOC_ID = Deno.env.get("FLY_ALLOC_ID");
const PORT = 8080;
const KV_PATH = ALLOC_ID ? `/root/kv/${ALLOC_ID}` : `./kv`;
const CONFIG_PATH = ALLOC_ID ? `/root` : `./`;
const FLY_REGION = Deno.env.get("FLY_REGION");

export default {
  APP_NAME,
  PRIVATE_IP,
  ALLOC_ID,
  PORT,
  KV_PATH,
  CONFIG_PATH,
  FLY_REGION,
};
