import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Reviews } from "@/components/landing/reviews";
import { FAQ } from "@/components/landing/faq";
import { About } from "@/components/landing/about";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">
        <Hero />
        <Features />
        <Reviews />
        <FAQ />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
