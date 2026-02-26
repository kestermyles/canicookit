import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cooking Basics',
  description:
    'The stuff nobody tells you about cooking — how to season food, when chicken is done, knife basics, and more.',
};

export default function BasicsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Stuff Nobody Tells You
      </h1>
      <p className="text-secondary text-lg mb-12">
        Everyone assumes you just know this stuff. You don&apos;t have to.
        Here&apos;s the foundation that makes everything else easier.
      </p>

      {/* Boiling Water */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Actually Boil Water
        </h2>
        <p className="text-secondary mb-4">
          Yes, there&apos;s a right way. Fill the kettle first and boil it —
          it&apos;s faster than heating cold water in a pan. Pour the boiling
          water into your pan, then put it on high heat. A &ldquo;rolling
          boil&rdquo; means big, aggressive bubbles that don&apos;t stop when
          you stir. A &ldquo;simmer&rdquo; means small, gentle bubbles — turn
          the heat down until you see those.
        </p>
        <p className="text-secondary">
          Always salt your pasta water generously. It should taste like the sea.
          That&apos;s not a figure of speech — it actually should.
        </p>
      </section>

      {/* Seasoning */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Season Food</h2>
        <p className="text-secondary mb-4">
          Most home-cooked food is underseasoned. Salt doesn&apos;t just make
          things salty — it makes flavours louder. Add a little, taste, add
          more. You&apos;re looking for the point where the food tastes like
          itself, but more.
        </p>
        <p className="text-secondary mb-4">
          Season at every stage, not just at the end. Salt your onions when they
          go in the pan. Salt your sauce as it cooks. Taste constantly.
        </p>
        <p className="text-secondary">
          Acid is the other secret weapon. If something tastes flat, try a
          squeeze of lemon or a splash of vinegar before adding more salt. It
          brightens everything.
        </p>
      </section>

      {/* Chicken */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Know When Chicken is Cooked
        </h2>
        <p className="text-secondary mb-4">
          This is the one that actually matters for safety. Chicken needs to
          reach 74&deg;C (165&deg;F) internally. The best way to know? Use a
          meat thermometer — they cost about &pound;8 and take the guesswork out
          completely.
        </p>
        <p className="text-secondary mb-4">
          No thermometer? Cut into the thickest part. The juices should run
          completely clear — no pink at all. The meat should be white all the
          way through. If you see any pink, it goes back in.
        </p>
        <p className="text-secondary">
          Let chicken rest for 5 minutes after cooking. It continues to cook a
          little from residual heat, and the juices redistribute so it&apos;s
          not dry.
        </p>
      </section>

      {/* Reading a Recipe */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          How to Read a Recipe Before You Start
        </h2>
        <p className="text-secondary mb-4">
          Read the whole thing first. The whole thing. Not just the ingredient
          list — the method too. You need to know what&apos;s coming so
          you&apos;re not scrambling mid-cook.
        </p>
        <p className="text-secondary mb-4">
          Check you have everything before you start. There&apos;s nothing worse
          than discovering you need something you don&apos;t have when your
          onions are already burning.
        </p>
        <p className="text-secondary">
          Do your prep first — chop everything, measure everything, put it in
          little bowls if you like. Chefs call this &ldquo;mise en place&rdquo;
          and it&apos;s the single best habit you can build. Once the heat is
          on, things move fast.
        </p>
      </section>

      {/* Heat Levels */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          What Different Heat Levels Look Like
        </h2>
        <div className="space-y-4">
          <div className="bg-light-grey rounded-lg p-4">
            <p className="font-semibold mb-1">Low heat</p>
            <p className="text-secondary">
              The pan is warm. Things cook slowly. Use this for sweating onions
              (making them soft without colour) and gentle simmering. You should
              be able to hold your hand above the pan without discomfort.
            </p>
          </div>
          <div className="bg-light-grey rounded-lg p-4">
            <p className="font-semibold mb-1">Medium heat</p>
            <p className="text-secondary">
              The workhorse setting. Good for most cooking — sauces, stir-fries
              that aren&apos;t too aggressive, cooking through thicker pieces of
              meat. You&apos;ll hear a gentle sizzle.
            </p>
          </div>
          <div className="bg-light-grey rounded-lg p-4">
            <p className="font-semibold mb-1">High heat</p>
            <p className="text-secondary">
              The pan is properly hot. Use this for searing meat (you want
              colour and crust), boiling water, and quick stir-fries. You should
              hear an aggressive sizzle the moment food hits the pan. If it
              doesn&apos;t sizzle, the pan isn&apos;t hot enough.
            </p>
          </div>
        </div>
      </section>

      {/* Knife Basics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Knife Basics</h2>
        <p className="text-secondary mb-4">
          You only need one good knife — a chef&apos;s knife, around 20cm. Keep
          it sharp. A blunt knife is more dangerous than a sharp one because you
          have to push harder, which means less control.
        </p>
        <p className="text-secondary mb-4">
          The claw grip: curl your fingertips under so your knuckles face the
          blade. Your knuckles guide the knife while your fingertips stay safely
          tucked away. It feels weird at first. Do it anyway.
        </p>
        <p className="text-secondary mb-4">
          Let the knife do the work. Rock it forward and down rather than
          pressing straight down. The curve of the blade is designed for this
          motion.
        </p>
        <p className="text-secondary">
          Cut things to a similar size so they cook evenly. It doesn&apos;t need
          to be perfect — &ldquo;roughly chopped&rdquo; means roughly. Just aim
          for the same general size.
        </p>
      </section>
    </div>
  );
}
