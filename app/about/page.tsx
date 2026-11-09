import { Badge } from "../components/ui/badge";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

// Nothing on this page is interactive, so it's rendered on the server and
// ships no page-specific JavaScript.
export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-ground grid-pattern relative"
    >

      <main className="container mx-auto px-6 md:px-8 lg:px-12 mb-12 max-w-[1920px]">
        <div className="grid lg:grid-cols-12 gap-2 lg:gap-4 pt-4 lg:items-start">
          {/* Left side - Image and Skills */}
          <div className="lg:col-span-6 lg:col-start-2 space-y-6">
            {/* Image */}
            <div className="flex justify-center">
              <div
                className="relative z-10 bg-transparent p-0 inline-block"
              >
                <div
                  className="relative border transition-all duration-300"
                  style={{
                    borderColor: "var(--line)",
                  }}
                >
                  {/* Plain next/image, not FadeInImage -- the illustration is
                      the first thing on the page and the 700ms opacity ramp
                      read as a load-in animation. */}
                  <Image
                    src="https://media.jakobbackhouse.com/Img_and_Vid/WebsitePortfolio.webp"
                    alt="Illustration by Jakob Backhouse of an artist drawing on a tablet at a desk by a window, surrounded by plants, books and an easel"
                    width={720}
                    height={540}
                    priority
                    className="block max-w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Skills section moved under the image */}
            <div className="flex justify-center">
              <div
                className="border bg-ground p-6 md:p-8 relative z-10 w-full max-w-[720px] transition-all duration-300"
              >
                <div
                  className="flex items-center gap-2 mb-3 border-b pb-2"
                  style={{ borderBottomColor: "var(--line)" }}
                >
                  <h2 className="font-display font-medium text-lg text-accent">
                    Core Skills
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Digital Illustration",
                    "Storyboarding",
                    "UI Design",
                    "Instructional Design",
                    "3D Environment Design",
                    "After Effects Vector Animation or Toon Boom Frame by Frame Animation",
                  ].map((skill, index) => (
                    <div
                      key={skill}
                      className="border bg-ground p-2 transition-all duration-300"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <span className="font-satoshi text-sm text-dark dark:text-light block text-center">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Bio and Experience */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="border bg-ground p-6 md:p-8 relative z-10 transition-all duration-300"
            >
              <h1
                className="font-display text-3xl text-accent mb-4 
                    border-b pb-2"
                style={{ borderBottomColor: "var(--line)" }}
              >
                Kia ora!
              </h1>
              <div className="space-y-3 font-satoshi">
                <p className="text-sm leading-relaxed text-dark/70 dark:text-light/70">
                  My name is Jakob, I am a Wellington-based designer and animator
                  based in Mount Victoria.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:JakobBackhouse@gmail.com"
                    className="inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-ground
                        transition-all text-sm border"
                    style={{ borderColor: "var(--line)" }}
                  >
                    JakobBackhouse@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div
              className="border bg-ground p-6 md:p-8 relative z-10 transition-all duration-300"
            >
              <div
                className="flex items-center gap-2 mb-3 border-b pb-2"
                style={{ borderBottomColor: "var(--line)" }}
              >
                <h2 className="font-display font-medium text-lg text-accent">
                  Experience
                </h2>
              </div>
              <div className="space-y-3 font-satoshi">
                {/* Finished role: plain ground, hairline border. The two that
                    run to "Now" below carry the accent wash so the current work
                    is obvious at a glance. Text colours are untouched
                    throughout -- the wash does all the work. */}
                <div
                  className="border bg-ground p-2 transition-all duration-300"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-ink text-ground px-2 py-0.5 border whitespace-nowrap shrink-0">
                      2021-2023
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      Learning and Motion Designer
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      AXIOM Training
                    </span>
                  </div>
                </div>
                <div
                  className="border p-2 transition-all duration-300"
                  style={{
                    borderColor: "var(--accent)",
                    backgroundColor: "var(--accent-wash)",
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-ink text-ground px-2 py-0.5 border whitespace-nowrap shrink-0">
                      2023-Now
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      UX Designer and Website Developer
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      MySafetyTV/Sharpdrive
                    </span>
                  </div>
                </div>
                <a
                  href="https://locales.co.nz/index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border p-2 transition-all duration-300 hover:brightness-110"
                  style={{
                    borderColor: "var(--accent)",
                    backgroundColor: "var(--accent-wash)",
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-ink text-ground px-2 py-0.5 border whitespace-nowrap shrink-0">
                      2025-Now
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      Junior Designer / Technical Lead
                    </span>
                    {/* The only row that goes anywhere, so it gets the only
                        link affordance: a dotted underline that firms up on
                        hover, plus the usual out-of-site arrow. */}
                    <span className="text-secondary dark:text-secondary-light inline-flex items-center gap-1 whitespace-nowrap underline decoration-dotted underline-offset-4 group-hover:decoration-solid">
                      Locales
                      <ArrowUpRight
                        className="h-3 w-3 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
