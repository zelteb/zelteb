import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.zelteb.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://www.zelteb.com/discover", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://www.zelteb.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://www.zelteb.com/faq", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://www.zelteb.com/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://www.zelteb.com/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://www.zelteb.com/priv", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}