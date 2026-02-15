import Link from 'next/link';

/* ── Blob Logo Component ── */
function BlobLogo({ size = 'hero' }: { size?: 'hero' | 'sm' | 'xs' }) {
  const sizeClass = size === 'hero' ? 'blob-hero' : size === 'sm' ? 'blob-sm' : 'blob-xs';
  return (
    <div className={`blob-container ${sizeClass}`}>
      <div className="blob-outer" />
      <div className="blob-mid" />
      <div className="blob-inner" />
      <div className="blob-core" />
    </div>
  );
}

/* ── Wordmark Component ── */
function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold ${className}`}>
      <span className="brand-aura">Aura</span>
      <span className="gradient-text font-extrabold">Mi</span>
      <span className="gradient-text font-medium">.AI</span>
    </span>
  );
}

const features = [
  {
    title: 'Visual Family Tree',
    description:
      'Build an interactive family tree across generations. Pan, zoom, filter by location or living status.',
    emoji: '\uD83C\uDF33',
  },
  {
    title: 'AI Family Historian',
    description:
      'Ask questions naturally and get instant answers from your family knowledge base, powered by AI.',
    emoji: '\uD83E\uDD16',
  },
  {
    title: 'Photo & Document Vault',
    description:
      'Upload old photos, certificates, and letters. Tag family members and make everything searchable.',
    emoji: '\uD83D\uDDC2\uFE0F',
  },
  {
    title: 'Story Preservation',
    description:
      'Capture oral histories, migration tales, and family legends before they\'re forgotten forever.',
    emoji: '\uD83D\uDCD6',
  },
  {
    title: 'Voice-First on iPhone',
    description:
      'Speak your family stories hands-free. Perfect for elders who prefer talking over typing.',
    emoji: '\uD83C\uDF99\uFE0F',
  },
  {
    title: 'Link Family Branches',
    description:
      'Invite relatives to create their own household. Family trees auto-link at shared ancestors.',
    emoji: '\uD83D\uDD17',
  },
];

const householdFeatures = [
  { emoji: '\uD83C\uDFE0', title: '1 Household Owner', description: 'Full control over your family data' },
  { emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66', title: '+4 Members Included', description: 'Invite your immediate family' },
  { emoji: '\uD83C\uDF33', title: 'Unlimited Family Chart', description: 'As many ancestors as you want' },
  { emoji: '\uD83D\uDD17', title: 'Connect Households', description: 'Link branches across families' },
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
    title: 'Build Your Tree & Add Memories',
    description:
      'Tell the AI about your family — grandparents, stories, events, photos. It organizes everything into a searchable knowledge base.',
  },
  {
    step: '03',
    title: 'Ask the AI Anything',
    description:
      'Ask questions, explore your tree, and invite other family branches to connect. Your history grows with every conversation.',
  },
];

const stats = [
  { value: '87%', label: 'of families have no written record of their grandparents\' stories' },
  { value: '3 Gen', label: 'is all it takes for family history to be completely forgotten' },
  { value: '\u221E', label: 'stories waiting to be preserved by families like yours' },
];

const pricingFeatures = {
  free: [
    '1 household with up to 5 members',
    'Unlimited family tree entries',
    'AI-powered chat & search',
    'Photo & document storage',
    'Family stories & oral histories',
    'Cross-household linking',
    'Timeline & event tracking',
  ],
  heritage: [
    'Everything in Free',
    'Priority AI processing',
    'Advanced export (PDF family book)',
    'Voice transcription (Whisper)',
    'Multi-language support',
    'Dedicated support',
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      {/* ───────── NAVIGATION ───────── */}
      <nav className="glass fixed top-0 left-0 right-0 z-[1000] h-16">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BlobLogo size="sm" />
            <Wordmark className="text-[1.35rem]" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-body text-text-600">
            <a href="#features" className="hover:text-text-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-text-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-text-900 transition-colors">Pricing</a>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white text-sm font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5"
          >
            Login / Sign Up
          </Link>
        </div>
      </nav>

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[rgba(0,245,255,0.07)] blur-[100px] animate-glow-drift-1" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[rgba(0,245,255,0.05)] blur-[100px] animate-glow-drift-2" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-[rgba(191,255,0,0.05)] blur-[100px] animate-glow-drift-3" />
        </div>

        <div className="relative max-w-[800px] mx-auto px-6 text-center">
          {/* Blob logo */}
          <div className="flex justify-center mb-8 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <BlobLogo size="hero" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <span className="w-2 h-2 rounded-full bg-pink animate-pulse" />
            <span className="text-xs font-mono text-text-700">The essence of your essence &middot; preserved with AI</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2.8rem,6.5vw,4.8rem)] font-extrabold leading-[1.1] tracking-display mb-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.35s' }}>
            Every family carries<br />
            an aura worth{' '}
            <em className="gradient-text italic">preserving</em>
          </h1>

          {/* Subtext */}
          <p className="font-body text-text-600 text-lg leading-relaxed mb-10 max-w-[550px] mx-auto opacity-0 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Sign up on web, iPhone, or iPad. Build your family tree, preserve stories and photos,
            and ask AI anything about your origin &mdash; all in one shared family space.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: '0.65s' }}>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold text-lg shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5"
            >
              Start Your Family Tree
            </Link>
            <a
              href="#demo"
              className="px-8 py-3.5 rounded-full border border-[rgba(0,245,255,0.15)] bg-card text-text-700 font-body font-medium text-lg hover:border-[rgba(0,245,255,0.3)] transition-colors"
            >
              See It in Action
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 mt-10 opacity-0 animate-fade-up" style={{ animationDelay: '0.85s' }}>
            <div className="flex -space-x-2.5">
              {['#00F5FF', '#7B61FF', '#BFFF00', '#B388FF'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-bg"
                  style={{ background: color, opacity: 0.7 }}
                />
              ))}
            </div>
            <span className="text-sm font-body text-text-500">2,400+ families preserving their aura</span>
          </div>
        </div>
      </section>

      {/* ───────── HOUSEHOLD MODEL STRIP ───────── */}
      <section className="py-16 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {householdFeatures.map((item) => (
              <div key={item.title} className="p-5 rounded-card bg-card border border-[rgba(0,245,255,0.08)]">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,245,255,0.08)] flex items-center justify-center text-xl mb-3">
                  {item.emoji}
                </div>
                <h3 className="font-display text-base font-bold text-text-900 mb-1">{item.title}</h3>
                <p className="font-body text-text-500 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-text-400 text-xs font-body mt-6">
            Designed for Baby Boomers, Gen X, and Millennials to enter data &mdash; Gen Alpha consumes it.
          </p>
        </div>
      </section>

      {/* ───────── DEMO ───────── */}
      <section id="demo" className="py-20 md:py-28 bg-bg">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card overflow-hidden shadow-lg">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[rgba(0,245,255,0.08)]">
              <div className="w-3 h-3 rounded-full bg-pink/40" />
              <div className="w-3 h-3 rounded-full bg-gold/40" />
              <div className="w-3 h-3 rounded-full bg-pink/40" />
              <span className="ml-2 text-xs font-mono text-text-400">AuraMi.AI &mdash; The Kumar Family</span>
            </div>
            {/* Chat demo */}
            <div className="p-6 space-y-4">
              <div className="flex justify-end">
                <div className="bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.1)] rounded-2xl rounded-br-md px-4 py-2.5 max-w-xs">
                  <p className="text-sm font-body text-text-800">Who was my great grandmother on Dad&apos;s side?</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-bg-alt border border-[rgba(0,245,255,0.06)] rounded-2xl rounded-bl-md px-4 py-2.5 max-w-sm">
                  <p className="text-sm font-body text-text-700">
                    Your great grandmother was <strong className="text-text-900">Savitri Devi</strong>, born August 22, 1940 in Varanasi.
                    She was known for her incredible cooking and raised 4 children during a time of great change in India.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.1)] rounded-2xl rounded-br-md px-4 py-2.5 max-w-xs">
                  <p className="text-sm font-body text-text-800">Show me her photos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── WHY (THE PROBLEM) ───────── */}
      <section className="py-20 md:py-28 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">The Problem</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-section text-text-900 mb-4">
              Memories fade. Stories get <em className="gradient-text italic">lost</em>.
            </h2>
            <p className="font-body text-text-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Every family has a rich tapestry of stories, sacrifices, and journeys. But without a system to
              capture them, they vanish within three generations. Your grandchildren deserve to know where they came from.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center p-6">
                <div className="font-display text-5xl font-extrabold gradient-text mb-3">{stat.value}</div>
                <p className="font-body text-text-500 text-sm leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section id="features" className="py-20 md:py-28 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Features</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-section text-text-900 mb-4">
              Everything Your Family Needs
            </h2>
            <p className="font-body text-text-500 text-lg max-w-xl mx-auto">
              A complete platform for preserving, discovering, and sharing your family heritage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-card bg-card border border-[rgba(0,245,255,0.08)] hover:border-[rgba(0,245,255,0.2)] shadow-sm hover:shadow-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,245,255,0.08)] flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.emoji}
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
      <section id="how-it-works" className="py-20 md:py-28 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">How It Works</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-section text-text-900 mb-4">
              Three Simple Steps
            </h2>
            <p className="font-body text-text-500 text-lg max-w-xl mx-auto">
              Get started in minutes. No complicated setup or data entry forms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-display font-extrabold gradient-text opacity-30 mb-4">
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

      {/* ───────── TESTIMONIAL ───────── */}
      <section className="py-20 md:py-28 bg-bg">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="font-display text-[4.5rem] leading-none gradient-text mb-6">&ldquo;</div>
          <p className="font-body text-text-700 text-lg md:text-xl leading-relaxed italic mb-8">
            My mother told me stories about our family leaving Lahore during Partition. I always meant to write
            them down. With AuraMi.AI, I finally did &mdash; and now my kids can ask the AI about their
            great-grandmother&apos;s journey whenever they want.
          </p>
          <div>
            <p className="font-body font-semibold text-text-900 text-sm">Anita S.</p>
            <p className="font-body text-text-400 text-xs">San Francisco, CA</p>
          </div>
        </div>
      </section>

      {/* ───────── PRICING ───────── */}
      <section id="pricing" className="py-20 md:py-28 bg-bg-alt">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Pricing</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-section text-text-900 mb-4">
              Start Preserving Your Legacy
            </h2>
            <p className="font-body text-text-500 text-lg max-w-xl mx-auto">
              One simple plan for your entire household. No per-seat charges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free plan */}
            <div className="rounded-card border border-[rgba(0,245,255,0.15)] bg-card overflow-hidden relative">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.15)] text-pink text-xs font-mono">Most Popular</span>
              </div>
              <div className="p-8">
                <h3 className="font-display text-xl font-bold text-text-900 mb-1">Free Forever</h3>
                <p className="text-text-500 font-body text-sm mb-6">Everything you need to start</p>
                <div className="mb-8">
                  <span className="font-display text-5xl font-extrabold text-text-900">$0</span>
                  <span className="text-text-500 font-body text-sm ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.free.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="gradient-text flex-shrink-0 mt-0.5">&check;</span>
                      <span className="font-body text-text-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block w-full text-center px-6 py-3.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Heritage plan */}
            <div className="rounded-card border border-[rgba(0,245,255,0.08)] bg-card overflow-hidden">
              <div className="p-8">
                <h3 className="font-display text-xl font-bold text-text-900 mb-1">Heritage Plan</h3>
                <p className="text-text-500 font-body text-sm mb-6">For serious family historians</p>
                <div className="mb-8">
                  <span className="font-display text-5xl font-extrabold text-text-900">$9</span>
                  <span className="text-text-500 font-body text-sm ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.heritage.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="gradient-text flex-shrink-0 mt-0.5">&check;</span>
                      <span className="font-body text-text-600 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="block w-full text-center px-6 py-3.5 rounded-full border border-[rgba(0,245,255,0.15)] text-text-500 font-body font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="py-20 md:py-28 bg-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(0,245,255,0.04)] blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold tracking-section mb-6">
            Don&apos;t let your family&apos;s aura{' '}
            <br className="hidden md:block" />
            become a <em className="gradient-text italic">whisper</em>
          </h2>
          <p className="font-body text-text-500 text-lg mb-10 max-w-xl mx-auto">
            The best time to preserve your family&apos;s aura was 20 years ago. The second best time is today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/login"
              className="px-10 py-4 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold text-lg shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5"
            >
              Start Your Family Tree
            </Link>
            <button
              disabled
              className="px-10 py-4 rounded-full border border-[rgba(0,245,255,0.15)] text-text-500 font-body font-medium text-lg cursor-not-allowed"
            >
              Download for iPhone
            </button>
          </div>
          <p className="text-text-400 text-xs font-body">
            No credit card required &middot; Free forever plan available
          </p>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="bg-bg-dark py-12 border-t border-[rgba(232,244,255,0.06)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <BlobLogo size="sm" />
                <Wordmark className="text-lg" />
              </div>
              <p className="font-body text-sm text-text-500 leading-relaxed">
                Preserving family heritage with the power of AI. Your aura &mdash; your essence &mdash; kept alive for every generation to come.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-10">
              <div>
                <h4 className="font-body font-semibold text-text-700 text-sm mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="font-body text-text-500 text-sm hover:text-text-900 transition-colors">Features</a></li>
                  <li><a href="#pricing" className="font-body text-text-500 text-sm hover:text-text-900 transition-colors">Pricing</a></li>
                  <li><a href="#demo" className="font-body text-text-500 text-sm hover:text-text-900 transition-colors">Demo</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-body font-semibold text-text-700 text-sm mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#how-it-works" className="font-body text-text-500 text-sm hover:text-text-900 transition-colors">How It Works</a></li>
                  <li><span className="font-body text-text-400 text-sm">Blog (Coming Soon)</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-body font-semibold text-text-700 text-sm mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><span className="font-body text-text-400 text-sm">About (Coming Soon)</span></li>
                  <li><span className="font-body text-text-400 text-sm">Contact (Coming Soon)</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-[rgba(232,244,255,0.06)] text-center">
            <p className="font-body text-xs text-text-400">
              &copy; {new Date().getFullYear()} AuraMi.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
