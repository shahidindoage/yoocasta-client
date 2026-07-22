export default function AboutUs() {
  return (
    <div className="w-full bg-white py-16 min-h-screen relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#3835A4]/[0.03] filter blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#C6007E]/[0.02] filter blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-none mb-4">
            About Us
          </h2>
          <p className="text-sm text-neutral-400 font-medium max-w-xl mx-auto">
            Your Own Online CASTing Agency
          </p>
        </div>

        <div className="space-y-6 text-sm text-neutral-600 leading-relaxed font-medium">
          <p>
            <span className="font-black text-[#3835A4]">Yoocasta</span>, Your Own Online CASTing Agency, is a modern style talent agency! A Talent platform that connects you, the talented, beautiful, inspiring and aspiring individuals that you are, with Casting Directors, Producers, Directors, Photographers or other industry professionals.
          </p>

          <p>
            Yoocasta aims to help the media professionals get what they deserve in every aspect. We aim to provide the best castings &amp; job opportunities to all our talents with a good monitory reward that they deserve.
          </p>

          <p>
            With an ever-increasing database of talents and the job opportunities in the Region, we aim to place our talents (Experienced or Freshers) in commercial work in India, UAE and MENA every year and make it easy to enter the industry of Acting, modelling, Events or other entertainment related work.
          </p>

          <p>
            New to acting / modeling or your field of interest? Nothing to worry, we provide ample of opportunities for you to get kick start with the Journey.
          </p>

          <p>
            Yoocasta is your own online platform, which gives you, the talent, all the control! You decide what you put on your profile and which impression you want to leave on a casting professional. You choose which opportunities to pursue and which to decline, and most importantly, you get the payment you deserve on the <span className="font-bold text-[#C6007E]">NEXT WORKING DAY</span>.
          </p>

          <p>
            Fresher or Experienced, Yoocasta provides you the opportunities to learn and work! Self-grooming, learning at every moment every day, is a key to success. There are No shortcuts and you need to start from somewhere. And here we are for you to start with. All there is left to do is, sign up and put that passion to work!
          </p>
        </div>
      </div>
    </div>
  );
}
