import { samlUrls } from "../config";

const SAML_MD_NS = "urn:oasis:names:tc:SAML:2.0:metadata";
const SAML_PROTOCOL = "urn:oasis:names:tc:SAML:2.0:protocol";
const HTTP_POST_BINDING = "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST";
const NAMEID_EMAIL = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress";

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildSpMetadataXml(): string {
  const entityId = escapeXmlAttr(samlUrls.entityId);
  const acsUrl = escapeXmlAttr(samlUrls.acs);

  return `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor xmlns="${SAML_MD_NS}" entityID="${entityId}">
  <SPSSODescriptor AuthnRequestsSigned="false"
                   WantAssertionsSigned="true"
                   protocolSupportEnumeration="${SAML_PROTOCOL}">
    <NameIDFormat>${NAMEID_EMAIL}</NameIDFormat>
    <AssertionConsumerService Binding="${HTTP_POST_BINDING}"
                              Location="${acsUrl}"
                              index="0"
                              isDefault="true"/>
  </SPSSODescriptor>
</EntityDescriptor>
`;
}
