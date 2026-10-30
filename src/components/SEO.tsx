import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  schema?: Record<string, any>;
}

const DEFAULT_TITLE = "AIM Academy Jabalpur – Best Coaching for UPSC, MPPSC, SI & SSC CGL";
const DEFAULT_DESC =
  "AIM Academy Jabalpur is India's leading coaching platform for UPSC, MPPSC, Sub-Inspector, Police, Vyapam and SSC exams. Proven mentorship with 500+ civil service selections.";
const BASE_URL = "https://aimacademix.in";
const DEFAULT_IMAGE = `${BASE_URL}/images/logo_main.png`;

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESC,
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  schema,
}) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | AIM Academy Jabalpur` : DEFAULT_TITLE;
  const canonicalUrl = canonical ? (canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`) : `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // 1. Title
    document.title = fullTitle;

    // Helper to set/create meta tag
    const setMeta = (attrName: "name" | "property", attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);

    // 3. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);

    // 4. OpenGraph Tags
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", image.startsWith("http") ? image : `${BASE_URL}${image}`);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "AIM Academy Jabalpur");

    // 5. Twitter Card Tags
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image.startsWith("http") ? image : `${BASE_URL}${image}`);

    // 6. Optional Dynamic Schema.org JSON-LD for this page
    const scriptId = "page-dynamic-schema";
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = scriptId;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [fullTitle, description, keywords, canonicalUrl, image, type, schema]);

  return null;
};

export default SEO;
