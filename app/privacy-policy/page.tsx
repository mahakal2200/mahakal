
import PolicyPage from "@/components/PolicyPage";

export default function PrivacyPolicy() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro="Mahakal A To Z respects your privacy. This policy explains how information is handled when you visit our website or contact us regarding wholesale clothing."
      sections={[
        {
          heading: "1. Information We Collect",
          bullets: [
            "Name, mobile number, shop name and city provided through enquiry forms or WhatsApp.",
            "Product requirements, quantities and order-related communication.",
            "Delivery address and transaction information where required to process confirmed orders.",
            "Basic technical information such as browser, device and website usage data, where collected by enabled tools."
          ]
        },
        {
          heading: "2. How We Use Information",
          bullets: [
            "Respond to wholesale enquiries and provide quotations.",
            "Confirm product availability, quantities, shipping charges and orders.",
            "Arrange dispatch, delivery and customer support.",
            "Prevent fraud, maintain business records and comply with applicable laws."
          ]
        },
        {
          heading: "3. WhatsApp Communication",
          paragraphs: [
            "When you contact us through WhatsApp, your communication is also subject to WhatsApp's own privacy terms and policies. Information you choose to send will be used to respond to your enquiry or provide requested services."
          ]
        },
        {
          heading: "4. Sharing of Information",
          paragraphs: [
            "We may share necessary information with courier or transport providers, payment service providers, technology service providers and authorities where required for order fulfilment or legal compliance. We do not represent that customer information is sold to third parties."
          ]
        },
        {
          heading: "5. Data Security and Retention",
          paragraphs: [
            "We take reasonable measures to protect business and customer information. Information is retained for as long as reasonably necessary for the purposes described in this policy, including order records, legal obligations and dispute resolution."
          ]
        },
        {
          heading: "6. Your Rights and Contact",
          paragraphs: [
            "You may contact us to request access, correction or deletion of personal information, subject to applicable law and lawful record-retention requirements. Requests will be handled in accordance with applicable data-protection law."
          ]
        },
        {
          heading: "7. Policy Updates",
          paragraphs: [
            "This policy may be updated when our services, data practices or legal requirements change. The latest version will be published on this page."
          ]
        }
      ]}
    />
  );
}
