
import Link from "next/link";

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PolicyPageProps = {
  title: string;
  updatedOn?: string;
  intro: string;
  sections: PolicySection[];
};

export default function PolicyPage({
  title,
  updatedOn = "28 September 2026",
  intro,
  sections,
}: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-black px-4 py-5 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="text-xl font-extrabold">
            MAHAKAL <span className="text-red-500">A TO Z</span>
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-white"
          >
            ← Home
          </Link>
        </div>
      </header>

      <section className="px-4 py-10 sm:py-14">
        <article className="mx-auto max-w-4xl rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-red-700">
            Mahakal A To Z
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {title}
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: {updatedOn}
          </p>

          <p className="mt-6 leading-7 text-gray-600">
            {intro}
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl font-bold">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((paragraph, i) => (
                  <p
                    key={i}
                    className="mt-3 leading-7 text-gray-600"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-600">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="leading-7">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-xl bg-red-50 p-5">
            <h2 className="font-bold text-red-800">
              Questions or assistance?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              Contact Mahakal A To Z for product enquiries,
              order assistance and policy-related questions.
            </p>

            <a
              href="https://wa.me/919219495647"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800"
            >
              Contact on WhatsApp
            </a>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block font-semibold text-red-700 hover:underline"
          >
            ← Back to Homepage
          </Link>
        </article>
      </section>
    </main>
  );
}
