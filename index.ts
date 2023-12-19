import crypto from "crypto";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { Readable } from "stream";

import { execSync } from "child_process";

import asyncPool from "tiny-async-pool";

// const DYNAMIC_RULES_URL = "https://raw.githubusercontent.com/DIGITALCRIMINALS/dynamic-rules/main/onlyfans.json";

let AUTH_ID, USER_AGENT, SESS, XBC;

const API_URL = "https://onlyfans.com/api2/v2";

function getHeaders(link: string) {
  const path = "/api2/v2" + link;
  const unixtime = Math.floor(Date.now() / 1000);
  const message = [dynamic_rules["static_param"], unixtime, path, AUTH_ID].join(
    "\n"
  );
  const hash_object = crypto.createHash("sha1").update(message, "binary");
  const checksum =
    dynamic_rules.checksum_indexes
      .map((number) => sha_1_b[number])
      .reduce((acc, curr) => acc + curr, 0) +
    dynamic_rules["checksum_constant"];

  return {
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate",
    "User-Agent": USER_AGENT,
    "x-bc": XBC,
    "user-id": AUTH_ID,
    Cookie: "auh_id=" + AUTH_ID + "; sess=" + SESS,
    sign: dynamic_rules["format"]
      .replace("{}", sha_1_sign),
    time: unixtime,
  };
}

async function getActiveSubscriptions(): Promise<
  { id: number; username: string }[]
> {
  const params = new URLSearchParams({
    limit: "50",
    order: "publish_date_asc",
    type: "active",
  }).toString();

  const url = `/subscriptions/subscribes?${params}`;

  const res = await fetch(API_URL + url, { headers: getHeaders(url) }).then(
    (r) => r.json()
  );
  return res;
}

async function getAllPosts(userid: string) {
  const {
    counters: { postsCount },
  } = await fetchPosts(userid, {
    limit: "1",
    order: "publish_date_desc",
    format: "infinite",
    counters: "1",
  });
  const pageSize = 50;

  const arr = Array.from(
    { length: Math.ceil(postsCount / pageSize) },
    (e, i) => i * pageSize
  );

  const posts = [];

  for await (const value of asyncPool(10, arr, (v) =>
    fetchPosts(userid, {
      limit: pageSize.toString(),
      offset: v,
      order: "publish_date_desc",
      skip_users: "all",
      counters: "0",
    })
  )) {
    posts.push(...value);
  }

  return posts;
}

function downloadMedia(media) {
  return new Promise(async (resolve, reject) => {
    try {
      statSync(`./downloads/${media.authorId}/${media.id}.done`);
      // console.log(media.id, "exists. Skipping.");
      return resolve(media.id);
    } catch (e) {}

    if (media.full) {
      // console.log("downloading media", media.id);
      const res = await fetch(media.full);
      const stream = Readable.fromWeb(res.body).pipe(
        createWriteStream(
          `./downloads/${media.authorId}/${media.id}.${
            media.type == "photo"
              ? "jpg"
              : media.type == "audio"
              ? "mp3"
              : "mp4"
          }`
        )
      );
      stream.on("finish", () => {
        writeFileSync(`./downloads/${media.authorId}/${media.id}.done`, "");
        resolve(media.id);
      });
    } else {
      // console.log("downloading drm media", media.id);
      const policy = media.files.drm.signature.dash["CloudFront-Policy"];

      const xmlText = await fetch(media.files.drm.manifest.dash, {
        headers: {
          "User-Agent": USER_AGENT,
          Cookie: `CloudFront-Policy=${policy};`,
        },
      }).then((r) => r.text());

      const psshText = xmlText.match(
        /edef8ba9-79d6-4ace-a3c8-27dcd51d21ed.*?<cenc:pssh>(.*?)<\/cenc:pssh>/s
      )?.[1];

      const pssh = Buffer.from(psshText, "base64");
      const session = new Session({ privateKey, identifierBlob }, pssh);

      const response = await fetch(API_URL + url, {
        method: "POST",
        body: session.createLicenseRequest(),
        headers: getHeaders(url),
      });
      // console.log("getting decryption key", response.status);
      const keys = session.parseLicense(
        Buffer.from(await response.arrayBuffer())
      );

      const cmd = `ffmpeg -cenc_decryption_key ${keys[1].key} -headers -i ${media.files.drm.manifest.dash} -codec copy ./downloads/${media.authorId}/${media.id}.mp4`;

      // console.log(cmd);

      execSync(cmd);
      writeFileSync(`./downloads/${media.authorId}/${media.id}.done`, "");
      return resolve(media.id);
    }
  });
}

async function fetchPosts(
  userid: string,
  params?: {
    limit?: string;
    offset?: string;
    order?: "publish_date_desc";
    format?: "infinite";
    counters?: string;
    skip_users?: "all";
  }
) {
  const url = `/users/${userid}/posts?${new URLSearchParams(
    params
  ).toString()}`;

  const res = await fetch(API_URL + url, { headers: getHeaders(url) }).then(
    (r) => r.json()
  );

  return res;
}

import ProgressBar from "progress";

async function main() {
  if (!existsSync("./auth.json")) {
    writeFileSync(
      "./auth.json",
      JSON.stringify(
        { AUTH_ID: "", USER_AGENT: "", SESS: "", XBC: "" },
        null,
        2
      )
    );
    console.log(
      "Please enter your auth information in auth.json located next to the ofdldrm executable then try again."
    );
    process.exit();
  } else {
    const auth = JSON.parse(readFileSync("./auth.json").toString());
    if (
      auth.AUTH_ID?.length == 0 ||
      auth.USER_AGENT?.length == 0 ||
      auth.SESS?.length == 0 ||
      auth.XBC?.length == 0
    ) {
      console.log("Some auth information are missing.");
      console.log(
        "Please enter your auth information in auth.json located next to the ofdldrm executable then try again"
      );
      process.exit();
    } else {
      console.log("Auth information found.");
      AUTH_ID = auth.AUTH_ID;
      USER_AGENT = auth.USER_AGENT;
      SESS = auth.SESS;
      XBC = auth.XBC;
    }
  }

  console.log("Fetching active subscriptions...");
  const subscribtions = await getActiveSubscriptions();

  if (subscribtions.error) {
    console.log("There was an error fetching your active subscriptions.");
    console.log("Server returned error :", subscribtions.error.message);
    console.log(
      "This might be because of wrong auth information. Please check auth.json file and try again."
    );
    process.exit();
  }

  console.log(
    `${subscribtions.length} ${
      subscribtions.length > 1 ? "subscriptions" : "subscription"
    } found`
  );

  for (let subscribtion of subscribtions) {
    console.log(`Processing ${subscribtion.username} (${subscribtion.id})`);

    if (!existsSync(`./downloads/${subscribtion.id}`)) {
      mkdirSync(`./downloads/${subscribtion.id}`, { recursive: true });
    }

    const posts = await getAllPosts(subscribtion.id);

    writeFileSync(
      `./downloads/${subscribtion.id}/posts.json`,
      JSON.stringify(posts, null, 2)
    );

    const media = posts
      .map((p) =>
        p.media.map((m) => ({ ...m, postId: p.id, authorId: p.author.id }))
      )
      .flat();

    const mediaBar = new ProgressBar(
      "downloading medias [:bar] :current/:total :percent",
      { total: media.length, width: 40 }
    );

    // console.log(posts.length, "posts", media.length, "media");

    for await (const value of asyncPool(10, media, downloadMedia)) {
      mediaBar.tick();
    }
  }
}

main();
