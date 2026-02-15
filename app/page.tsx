export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <h1 className="font-display text-5xl md:text-7xl font-bold text-center mb-4">
        <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
          MyVansh.AI
        </span>
      </h1>
      <p className="font-body text-text-600 text-lg md:text-xl text-center max-w-xl mb-8">
        Every Family Has a Story Worth Keeping.
      </p>
      <a
        href="/login"
        className="px-8 py-3 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-semibold text-lg shadow-md hover:shadow-lg transition-shadow"
      >
        Get Started
      </a>
    </main>
  );
}
