import Link from 'next/link';

const features = [
  {
    title: 'Chat with Your History',
    description:
      'Ask questions naturally — "Who was grandpa\'s father?" — and get instant answers from your family knowledge base.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    title: 'Build Your Family Tree',
    description:
      'Add ancestors, relationships, and life details through simple conversation. The AI organizes it all for you.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: 'Preserve Photos & Documents',
    description:
      'Upload old photos, certificates, and letters. Tag family members and let the AI make them searchable.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
    ),
  },
  {
    title: 'Record Family Stories',
    description:
      'Capture oral histories, migration tales, and family legends. Share them across generations before they\'re forgotten.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: 'Connect Family Branches',
    description:
      'Invite relatives to create their own household accounts. Family trees auto-link at shared ancestors.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
  {
    title: 'AI-Powered Search',
    description:
      'Semantic search understands meaning, not just keywords. Find connections across people, events, and stories instantly.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Your Household',
    description:
      'Sign up and name your family household. You become the Owner with space for 4 more family members.',
  },
  {
    step: '02',
    title: 'Start a Conversation',
    description:
      'Tell the AI about your family — grandparents, stories, events, photos. It organizes everything into a searchable knowledge base.',
  },
  {
    step: '03',
    title: 'Discover & Share',
    description:
      'Ask questions, explore your tree, and invite other family branches to connect. Your history grows with every conversation.',
  },
];

const testimonials = [
  {
    quote:
      'I finally recorded all of my mother\'s stories about growing up in Punjab before Partition. My grandchildren can now ask the AI about their great-grandmother and get real answers.',
    name: 'Anita S.',
    role: 'Family Historian',
  },
  {
    quote:
      'We had boxes of old photos with no labels. Now everything is tagged, searchable, and connected to our family tree. It took an afternoon instead of months.',
    name: 'Raj M.',
    role: 'Father of Three',
  },
  {
    quote:
      'My cousins in India created their own household and linked it to ours. Now we can search across both family branches — it\'s like having one big connected tree.',
    name: 'Priya K.',
    role: 'Second Generation',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* ───────── NAVIGATION ───────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-text-300/15">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold">
            <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
              MyVansh.AI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-body text-text-600">
            <a href="#features" className="hover:text-text-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-text-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-body font-medium text-text-700 hover:text-text-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white text-sm font-body font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-pink/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-coral font-body font-semibold text-sm tracking-wide uppercase mb-4">
              AI-Powered Family History
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Every Family Has a{' '}
              <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
                Story Worth Keeping
              </span>
            </h1>
            <p className="font-body text-text-600 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Chat naturally with an AI that knows your family. Add ancestors, record stories,
              upload photos, and explore generations of history — all through conversation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
              >
                Start Your Family Story
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 rounded-full border border-text-300/40 text-text-700 font-body font-medium text-lg hover:bg-white transition-colors"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Chat preview mockup */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-text-300/15 overflow-hidden">
              <div className="px-5 py-3 bg-bg-alt/50 border-b border-text-300/15 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-coral/40" />
                <div className="w-3 h-3 rounded-full bg-gold/40" />
                <div className="w-3 h-3 rounded-full bg-teal/40" />
                <span className="ml-2 text-xs font-body text-text-400">MyVansh.AI Chat</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-pink/10 via-coral/10 to-gold/10 rounded-2xl rounded-br-md px-4 py-2.5 max-w-xs">
                    <p className="text-sm font-body text-text-800">Who was my great grandmother on Dad&apos;s side?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-bg rounded-2xl rounded-bl-md px-4 py-2.5 max-w-sm">
                    <p className="text-sm font-body text-text-700">
                      Your great grandmother was <strong>Savitri Devi</strong>, born August 22, 1940 in Varanasi.
                      She was known for her incredible cooking and raised 4 children during a time of great change in India.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-pink/10 via-coral/10 to-gold/10 rounded-2xl rounded-br-md px-4 py-2.5 max-w-xs">
                    <p className="text-sm font-body text-text-800">Show me her photos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-coral font-body font-semibold text-sm tracking-wide uppercase mb-3">
              Features
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-900 mb-4">
              Everything Your Family Needs
            </h2>
            <p className="font-body text-text-500 text-lg max-w-xl mx-auto">
              A complete platform for preserving, discovering, and sharing your family heritage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-text-300/15 hover:border-coral/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink/15 via-coral/15 to-gold/15 flex items-center justify-center text-coral mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-text-900 mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-text-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-coral font-body font-semibold text-sm tracking-wide uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-900 mb-4">
              Three Simple Steps
            </h2>
            <p className="font-body text-text-500 text-lg max-w-xl mx-auto">
              Get started in minutes. No complicated setup or data entry forms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-display font-bold bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent opacity-30 mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-bold text-text-900 mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-text-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIALS ───────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-coral font-body font-semibold text-sm tracking-wide uppercase mb-3">
              Testimonials
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-900 mb-4">
              Families Love MyVansh.AI
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-bg border border-text-300/10"
              >
                <svg className="w-8 h-8 text-coral/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="font-body text-text-700 leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div>
                  <p className="font-body font-semibold text-text-900 text-sm">{t.name}</p>
                  <p className="font-body text-text-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PRICING ───────── */}
      <section id="pricing" className="py-20 md:py-28 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-coral font-body font-semibold text-sm tracking-wide uppercase mb-3">
              Pricing
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-900 mb-4">
              Start Preserving Your Legacy
            </h2>
            <p className="font-body text-text-500 text-lg max-w-xl mx-auto">
              One simple plan for your entire household. No per-seat charges.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-text-300/15 overflow-hidden">
              <div className="bg-gradient-to-r from-pink via-coral to-gold p-6 text-center">
                <h3 className="font-display text-2xl font-bold text-white mb-1">Family Plan</h3>
                <p className="text-white/80 font-body text-sm">Everything you need for your family</p>
              </div>
              <div className="p-8">
                <div className="text-center mb-8">
                  <span className="font-display text-5xl font-bold text-text-900">Free</span>
                  <p className="font-body text-text-500 text-sm mt-1">during early access</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    '1 household with up to 5 members',
                    'Unlimited family tree entries',
                    'AI-powered chat & search',
                    'Photo & document storage',
                    'Family stories & oral histories',
                    'Cross-household linking',
                    'Timeline & event tracking',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="font-body text-text-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block w-full text-center px-6 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold shadow-sm hover:shadow-md transition-shadow"
                >
                  Get Early Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Your Family&apos;s Story{' '}
            <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
              Starts Here
            </span>
          </h2>
          <p className="font-body text-text-500 text-lg mb-10 max-w-xl mx-auto">
            Don&apos;t let another generation pass without capturing the stories, faces, and moments that
            make your family unique.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            Start Your Family Story
          </Link>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="bg-bg-dark text-text-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-display text-xl font-bold bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
                MyVansh.AI
              </span>
              <p className="font-body text-sm text-text-400 mt-1">
                Every Family Has a Story Worth Keeping.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm font-body">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="font-body text-xs text-text-400">
              &copy; {new Date().getFullYear()} MyVansh.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
