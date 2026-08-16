import Link from "next/link";
import EmailCapture from "@/components/EmailCapture";

// Design doc §5.5 / PRD §2: full origin story, research link, "notify me" signup.
export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 pb-16 pt-6 text-base leading-relaxed text-bark-soft">
      <h1 className="text-2xl font-bold text-bark">Built by a mom who needed this too.</h1>

      <p>
        I&rsquo;m a mom of two wonderful boys, Evan and Andy, and they&rsquo;re wired completely
        differently from each other. Andy needs big movement and real time outdoors just to feel
        settled in his body — not as a nice-to-have, but as what lets him handle the day, regulate
        his big emotions, and show up as himself. For years, that need and his safety were at war
        with each other.
      </p>

      <p>
        Evan is the opposite — cautious, careful, slow to try anything new. Food especially. But
        something happens in a garden that doesn&rsquo;t happen at a dinner table: he&rsquo;ll pick
        something himself, turn it over, decide on his own terms to try it.
      </p>

      <p>
        That&rsquo;s not a problem we solved by finding the right place. It&rsquo;s a problem my
        husband and I solved by building one ourselves — reshaping our own backyard, piece by
        piece, around what our kids actually needed.
      </p>

      <p>
        We once took the boys to Hawaii — beaches, mountains, everything a kid could want. And the
        whole trip, Andy kept asking to go back home to our backyard. Not the hotel pool, not the
        ocean. Our backyard.
      </p>

      <p>
        We didn&rsquo;t know any of this when we started — we were just following what worked for
        our own two boys. But research consistently links time in nature to calmer nervous systems
        and better emotional regulation in kids, and shows that hands-on exposure to plants and
        growing food measurably increases kids&rsquo; willingness to try new things.{" "}
        <Link href="/research" className="font-semibold text-leaf-dark underline underline-offset-4">
          See our research page →
        </Link>
      </p>

      <p>
        That&rsquo;s the gap this app exists to close. Every family deserves that same relief — not
        just a space where their child can regulate and grow, but a space where they, too, can
        finally stop watching like a hawk and just enjoy their kid.
      </p>

      <p>
        Longer term, I want to go further than a backyard — I want to build a shared outdoor space
        designed the same way, for families who don&rsquo;t have the space, the energy, or the
        years to do what we did on their own. If that&rsquo;s something you&rsquo;d want to hear
        about when it&rsquo;s real, there&rsquo;s a place below to sign up.
      </p>

      <div className="mt-4 rounded-2xl border border-line bg-cream p-5">
        <EmailCapture
          list="future-shared-space"
          label="Notify me about the future shared outdoor space"
        />
      </div>
    </div>
  );
}
