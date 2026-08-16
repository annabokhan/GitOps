import Link from "next/link";
import { PrimaryLinkButton } from "@/components/PrimaryButton";

// Design doc §5.1: single above-the-fold CTA, no scroll-jacking marketing.
export default function LandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-16 pt-8">
      <h1 className="text-3xl font-bold leading-tight text-bark sm:text-4xl">
        A backyard your kids can actually settle into.
      </h1>

      <p className="mt-4 text-lg font-medium italic text-leaf-dark">
        &ldquo;Built by a mom who needed this too.&rdquo;
      </p>

      <p className="mt-4 text-base leading-relaxed text-bark-soft">
        I&rsquo;m a mom of two very different boys — one who needs big movement and space to
        regulate, one who&rsquo;s cautious and needs time to warm up to anything new. For years we
        couldn&rsquo;t find a place that worked for both of them safely, so my husband and I built
        one ourselves, in our own backyard. This app is the fast, affordable version of what took
        us years — a personalized plan for your kid, in whatever space you have.
      </p>

      <Link href="/about" className="mt-2 inline-block text-sm font-semibold text-leaf-dark underline underline-offset-4">
        Read our full story →
      </Link>

      <div className="mt-8">
        <PrimaryLinkButton href="/intake" fullWidth className="text-lg">
          Get my free plan →
        </PrimaryLinkButton>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-bark-soft">
        <li>🌱 Free</li>
        <li>⏱️ 5 minutes</li>
        <li>🔓 No signup</li>
      </ul>

      <div className="mt-12 rounded-2xl border border-line bg-cream p-5">
        <p className="text-sm text-bark-soft">
          Not sure what your kid needs? Just tell us about them in your own words — no forms, no
          checklists. We&rsquo;ll turn it into a plan.
        </p>
      </div>
    </div>
  );
}
