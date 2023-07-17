import env from "./env.ts";

function stringToHash(input: string): number {
  let hash = 0 >>> 0; // Initialize as unsigned 32-bit integer
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash >>>= 0; // Convert to unsigned 32-bit integer
  }
  return hash;
}

export async function resolvePeers(): Promise<string> {
  const dns = `vms.${env.APP_NAME}.internal`;
  const [[dnsEntries]] = await Deno.resolveDns(dns, "TXT");
  const peers = dnsEntries
    .split(",")
    .map((s) => s.split(" ")[0])
    .filter((f) => Deno.env.get("FLY_ALLOC_ID") !== f)
    .map((p) => `nats://${p}.vm.${env.APP_NAME}.internal:4222`)
    .join(",");
  console.log("Resolved...", dns, dnsEntries, peers);
  return peers;
}

export async function startMarmot() {
  const marmot_config = `
	  seq_map_path="${env.KV_PATH}/marmot-sm.cbor"
	  db_path="${env.KV_PATH}/database.db"
	  polling_interval=100
	  node_id=${stringToHash(env.ALLOC_ID || ("" + new Date().getDate()))}
	  
	  [replication_log]
	  shards=1
	  max_entries=512
	  compress=true
	  `;

  await Deno.writeTextFile(
    `${env.CONFIG_PATH}/marmot-config.toml`,
    marmot_config,
  );

  let marmotProc: Deno.ChildProcess | null = null;
  const run = async () => {
    if (marmotProc) {
      return;
    }

    const peers = await resolvePeers();
    if (!peers) {
      console.info("No peer nodes...");
      return;
    }

    const args: string[] = [
      "-config",
      `${env.CONFIG_PATH}/marmot-config.toml`,
      "-cluster-addr",
      `[${env.PRIVATE_IP}]:4222`,
    ];

    if (peers) {
      args.push(`-cluster-peers`, peers);
    }

    console.log("Launching Marmot with", args);
    const marmot = new Deno.Command(
      "./marmot",
      {
        args: args,
        cwd: "/root",
      },
    );

    marmotProc = marmot.spawn();
    const status = await marmotProc.status;
    console.log("Marmot exited with", status);
    marmotProc = null;
  };

  run();
  setInterval(run, 5000);
}
