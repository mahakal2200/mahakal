
import PolicyPage from "@/components/PolicyPage";

export default function ShippingPolicy() {
  return (
    <PolicyPage
      title="Shipping & Delivery Policy"
      intro="Mahakal A To Z provides wholesale clothing shipping across India through courier and transportation services, subject to service availability."
      sections={[
        {
          heading: "1. Delivery Locations",
          paragraphs: [
            "We accept wholesale delivery enquiries from across India. Delivery availability and transport options will be confirmed based on the buyer's PIN code and order size."
          ]
        },
        {
          heading: "2. Shipping Charges",
          bullets: [
            "Courier and transportation charges are payable by the buyer.",
            "Shipping charges will be communicated before the buyer makes payment.",
            "Charges may vary according to parcel weight, dimensions, destination and transport provider.",
            "Any additional applicable charges will be communicated before order confirmation wherever reasonably possible."
          ]
        },
        {
          heading: "3. Order Processing",
          paragraphs: [
            "Orders are processed after the agreed payment is received and verified. Processing and dispatch timelines depend on product availability, order quantity and packing requirements.",
            "The expected dispatch timeline will be communicated during order confirmation."
          ]
        },
        {
          heading: "4. Delivery Time",
          paragraphs: [
            "Delivery estimates depend on destination, courier or transport provider and other operational circumstances. An estimated delivery date is not a guaranteed delivery date unless expressly confirmed."
          ]
        },
        {
          heading: "5. Tracking and Delivery",
          paragraphs: [
            "Tracking or transport receipt details will be shared where available. Buyers should provide a complete and accurate delivery address and reachable mobile number."
          ]
        },
        {
          heading: "6. Delays and Transit Issues",
          paragraphs: [
            "If a shipment is delayed, lost or damaged in transit, please contact us with the order number and available shipment details. We will reasonably assist with verification and coordination with the transport provider.",
            "This policy does not exclude any responsibility or remedy required under applicable law."
          ]
        },
        {
          heading: "7. Unpacking and Parcel Verification",
          paragraphs: [
            "Buyers are requested to record a continuous unpacking video showing the sealed parcel, shipping label, unique verification code and all received items. This evidence helps us investigate wrong, missing, damaged or defective product claims.",
            "Please report any issue promptly after delivery and retain the packaging until the matter is resolved."
          ]
        }
      ]}
    />
  );
}
