const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const DOMAIN_URI_PREFIX = process.env.NEXT_PUBLIC_DYNAMIC_LINK_DOMAIN;
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

if (!API_KEY || !DOMAIN_URI_PREFIX || !WEB_URL) {
  throw new Error("Thiếu cấu hình biến môi trường Dynamic Link!");
}

export async function createCampaignDynamicLink(campaignId: string) {
  const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const DOMAIN_URI_PREFIX = process.env.NEXT_PUBLIC_DYNAMIC_LINK_DOMAIN;
  const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;

  if (!API_KEY || !DOMAIN_URI_PREFIX || !WEB_URL) {
    throw new Error("Thiếu cấu hình biến môi trường Dynamic Link!");
  }

  const body = {
    dynamicLinkInfo: {
      domainUriPrefix: DOMAIN_URI_PREFIX,
      link: `${WEB_URL}/campaign/${campaignId}`,
      androidInfo: {
        androidPackageName: "com.company.help_connect",
      },
      iosInfo: {
        iosBundleId: "com.example.helpConnect",
      },
    },
    suffix: { option: "SHORT" },
  };

  const res = await fetch(
    `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    console.error("Lỗi tạo dynamic link:", await res.text());
    throw new Error("Không tạo được dynamic link");
  }

  const data = await res.json();
  return data.shortLink;
}


export async function createAppShareLink() {
  const body = {
    dynamicLinkInfo: {
      domainUriPrefix: DOMAIN_URI_PREFIX,
      link: WEB_URL,
      androidInfo: {
        androidPackageName: "com.company.help_connect",
      },
      iosInfo: {
        iosBundleId: "com.example.helpConnect",
        iosAppStoreId: "1234567890", // Thay bằng App Store ID thật nếu có
      },
    },
    suffix: { option: "SHORT" },
  };

  const res = await fetch(
    `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    console.error("Lỗi tạo app share link:", await res.text());
    throw new Error("Không tạo được app share link");
  }

  const data = await res.json();
  return data.shortLink;
}
