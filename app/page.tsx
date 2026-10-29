import Image from "next/image";

// Placeholder until the real home page is built in T02.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <Image
        src="/brand/whma-logo.png"
        alt="Wild Horse & Mustang Association"
        width={160}
        height={166}
        priority
      />
      <h1 className="text-3xl">WHMA Horse Registry</h1>
      <p className="font-sans text-sm tracking-widest uppercase">
        Under construction
      </p>
    </main>
  );
}
