
import PolicyPage from "@/components/PolicyPage";

export default function ReturnRefundPolicy() {
  return (
    <PolicyPage
      title="Return, Refund & Replacement Policy"
      intro="Mahakal A To Z supplies wholesale clothing. Buyers are encouraged to verify product details before ordering. This policy explains how return, refund and replacement requests are handled, subject to applicable law."
      sections={[
        {
          heading: "1. General Return Policy",
          paragraphs: [
            "Routine returns or refunds for change of mind, buyer preference, incorrect size selection or an order placed in error are not ordinarily accepted for wholesale orders.",
            "This policy does not limit remedies required by applicable law, including remedies for defective, misrepresented, wrong or undelivered goods."
          ]
        },
        {
          heading: "2. Eligible Replacement Requests",
          bullets: [
            "A wrong product has been supplied compared with the confirmed order.",
            "A product has a verifiable manufacturing defect.",
            "A product has been damaged before delivery, subject to verification.",
            "An item is missing from the confirmed shipment, subject to verification."
          ]
        },
        {
          heading: "3. Unpacking Video and Unique Code",
          paragraphs: [
            "For faster verification, buyers should record a continuous, unedited unpacking video before opening the sealed parcel.",
            "The video should clearly show the outer packaging, shipping label, parcel seal, unique verification code and complete contents.",
            "The unique code provided for the order must match the dispatch record associated with the parcel.",
            "Buyers should retain the original packaging, labels and products until the claim is resolved."
          ]
        },
        {
          heading: "4. Reporting a Claim",
          paragraphs: [
            "Please contact us promptly after delivery, preferably within 48 hours, with the order number, a description of the issue, photographs and unpacking video.",
            "The reporting period is intended to help preserve evidence and investigate claims. It will not automatically eliminate any mandatory legal rights or remedies."
          ]
        },
        {
          heading: "5. Verification and Resolution",
          paragraphs: [
            "We will review the order confirmation, dispatch records, unique code, available video and other relevant evidence.",
            "If a replacement claim is approved, we will communicate the replacement arrangements and applicable shipping responsibilities.",
            "Where a refund or another remedy is required by applicable law, the matter will be handled in accordance with that law."
          ]
        },
        {
          heading: "6. Shipping Charges for Claims",
          paragraphs: [
            "For approved claims, the responsibility for return shipping, replacement shipping or other reasonable costs will be communicated based on the circumstances and applicable legal requirements. Buyers will not be charged costs that applicable law requires the business to bear."
          ]
        },
        {
          heading: "7. Contact for Claims",
          paragraphs: [
            "Contact us through our official WhatsApp number and provide your order details. Please do not discard the parcel or product packaging until the investigation is complete."
          ]
        }
      ]}
    />
  );
}
