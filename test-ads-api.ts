import { GoogleAdsApi } from "google-ads-api";

async function test() {
  const client = new GoogleAdsApi({
    client_id: "test",
    client_secret: "test",
    developer_token: "test",
  });
  console.log("Client created");
  // @ts-ignore
  if (typeof client.Customer !== "function") {
    console.error("Method Customer not found on client");
  } else {
    console.log("Method Customer found");
  }
}

test().catch(console.error);
