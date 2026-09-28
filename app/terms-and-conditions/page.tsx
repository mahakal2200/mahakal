
import PolicyPage from "@/components/PolicyPage";

export default function TermsAndConditions() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      intro="Welcome to Mahakal A To Z. By accessing our website, submitting an enquiry or placing an order, you agree to the terms described below, subject to applicable law."
      sections={[
        {
          heading: "1. About Our Business",
          paragraphs: [
            "Mahakal A To Z deals in men's wear wholesale and bulk clothing supply. The website allows buyers to explore products and submit enquiries. Product orders are confirmed directly with our team."
          ]
        },
        {
          heading: "2. Product Information",
          paragraphs: [
            "Product descriptions, images, sizes, colours, fabric details and prices are provided to help buyers make informed decisions. Actual availability, specifications and final pricing will be confirmed before payment.",
            "Minor variations in colour may occur due to lighting, photography and display settings. We will make reasonable efforts to ensure product descriptions and representations are accurate."
          ]
        },
        {
          heading: "3. Wholesale Orders",
          bullets: [
            "Minimum order quantities may apply and will be communicated before order confirmation.",
            "Buyers should confirm product, quantity, size, colour, price and shipping charges before payment.",
            "An enquiry or quotation alone does not constitute a confirmed order.",
            "An order is confirmed after the final details are agreed upon and the required payment is received."
          ]
        },
        {
          heading: "4. Payments",
          paragraphs: [
            "All orders are prepaid. Cash on Delivery is not available. The buyer must pay the confirmed product amount and applicable shipping charges before dispatch.",
            "Payment instructions will be provided through official business communication channels. Buyers should verify payment details before transferring funds."
          ]
        },
        {
          heading: "5. Shipping and Delivery",
          paragraphs: [
            "We offer shipping across India, subject to service availability. Courier or transportation charges are payable by the buyer and will be communicated before payment.",
            "Delivery estimates depend on the destination and transport provider. Tracking details will be shared where available."
          ]
        },
        {
          heading: "6. Returns and Replacement",
          paragraphs: [
            "Routine returns for change of mind, preference or incorrect buyer selection are not ordinarily accepted for wholesale orders.",
            "Eligible wrong, defective or damaged product claims will be considered under our Return, Refund & Replacement Policy. Applicable legal rights and remedies are not excluded by these terms."
          ]
        },
        {
          heading: "7. Buyer Verification",
          paragraphs: [
            "Buyers are encouraged to visit the store or request product photos, videos or a video call before placing an order. Buyers should use these options to verify available products and clarify requirements."
          ]
        },
        {
          heading: "8. Intellectual Property",
          paragraphs: [
            "Website content, branding, photographs and original materials belonging to Mahakal A To Z may not be copied, reproduced or used commercially without permission, except as permitted by law."
          ]
        },
        {
          heading: "9. Changes to Terms",
          paragraphs: [
            "We may update these terms to reflect changes in our business or applicable law. The latest version will be published on this page. Order-specific confirmed terms will be handled according to applicable law."
          ]
        },
        {
          heading: "10. Governing Law and Disputes",
          paragraphs: [
            "These terms are governed by applicable laws of India. Disputes may be addressed through our grievance contact and the appropriate legal forums having jurisdiction under applicable law. Nothing in these terms limits statutory consumer rights."
          ]
        }
      ]}
    />
  );
}
