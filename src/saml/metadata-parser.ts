import { DOMParser, type Element } from "@xmldom/xmldom";

const SAML_MD_NS = "urn:oasis:names:tc:SAML:2.0:metadata";
const XML_DSIG_NS = "http://www.w3.org/2000/09/xmldsig#";

const HTTP_REDIRECT = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";
const HTTP_POST = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";

export type ParsedIdpMetadata = {
  entityId: string;
  ssoUrl: string;
  certificate: string;
  nameIdFormat: string | null;
};

export class MetadataParseError extends Error {}

export function parseIdpMetadata(xml: string): ParsedIdpMetadata {
  const errors: string[] = [];
  const parser = new DOMParser({
    onError: (level, message) => {
      if (level === "error" || level === "fatalError") {
        errors.push(`${level}: ${message}`);
      }
    },
  });

  let doc;
  try {
    doc = parser.parseFromString(xml, "text/xml");
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new MetadataParseError(`xml parse failed: ${detail}`);
  }
  if (errors.length > 0) {
    throw new MetadataParseError(`xml parse failed: ${errors.join("; ")}`);
  }
  const root = doc.documentElement;
  if (!root || root.localName !== "EntityDescriptor") {
    throw new MetadataParseError("root element must be <EntityDescriptor>");
  }

  const entityId = root.getAttribute("entityID");
  if (!entityId) {
    throw new MetadataParseError("EntityDescriptor missing entityID attribute");
  }

  const idpDescriptor = firstByTag(root, SAML_MD_NS, "IDPSSODescriptor");
  if (!idpDescriptor) {
    throw new MetadataParseError("<IDPSSODescriptor> not found");
  }

  const ssoUrl = pickSsoUrl(idpDescriptor);
  if (!ssoUrl) {
    throw new MetadataParseError(
      "<SingleSignOnService> with HTTP-Redirect or HTTP-POST binding not found",
    );
  }

  const certificate = pickSigningCertificate(idpDescriptor);
  if (!certificate) {
    throw new MetadataParseError("<X509Certificate> for signing not found in <KeyDescriptor>");
  }

  const nameIdFormatEl = firstByTag(idpDescriptor, SAML_MD_NS, "NameIDFormat");
  const nameIdFormat = nameIdFormatEl?.textContent?.trim() || null;

  return { entityId, ssoUrl, certificate, nameIdFormat };
}

function firstByTag(parent: Element, ns: string, localName: string): Element | null {
  const list = parent.getElementsByTagNameNS(ns, localName);
  return list.length > 0 ? (list.item(0) as Element | null) : null;
}

function pickSsoUrl(idpDescriptor: Element): string | null {
  const services = idpDescriptor.getElementsByTagNameNS(SAML_MD_NS, "SingleSignOnService");
  let postFallback: string | null = null;
  for (let i = 0; i < services.length; i++) {
    const svc = services.item(i);
    if (!svc) continue;
    const binding = svc.getAttribute("Binding");
    const location = svc.getAttribute("Location");
    if (!binding || !location) continue;
    if (binding === HTTP_REDIRECT) {
      return location;
    }
    if (binding === HTTP_POST && !postFallback) {
      postFallback = location;
    }
  }
  return postFallback;
}

function pickSigningCertificate(idpDescriptor: Element): string | null {
  const keyDescriptors = idpDescriptor.getElementsByTagNameNS(SAML_MD_NS, "KeyDescriptor");
  for (let i = 0; i < keyDescriptors.length; i++) {
    const kd = keyDescriptors.item(i);
    if (!kd) continue;
    const useAttr = kd.getAttribute("use");
    if (useAttr && useAttr !== "signing") continue;
    const x509 = firstByTag(kd, XML_DSIG_NS, "X509Certificate");
    const cert = x509?.textContent?.replace(/\s+/g, "");
    if (cert) return cert;
  }
  return null;
}
