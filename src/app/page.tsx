import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { StudioHero } from "@/components/studio/StudioHero";
import { Specialists } from "@/components/site/Specialists";
import { Journey } from "@/components/site/Journey";
import { Integrations } from "@/components/site/Integrations";
import { Impact } from "@/components/site/Impact";
import { Trust } from "@/components/site/Trust";

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <StudioHero />
        <Specialists />
        <Journey />
        <Integrations />
        <Impact />
        <Trust />
      </main>
      <Footer />
    </div>
  );
}
