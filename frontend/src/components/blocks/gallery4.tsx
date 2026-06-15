"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export interface Gallery4Item {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface Gallery4Props {
  title?: string;
  description?: string;
  items?: Gallery4Item[];
}

const DESCUBRASUL_ITEMS: Gallery4Item[] = [
  {
    id: "cantina-nonna-rosa",
    title: "Cantina Nonna Rosa — Criciúma",
    description:
      "Autêntica cozinha italiana do Sul catarinense, com massas artesanais e receitas tradicionais passadas de geração em geração. Um dos restaurantes mais queridos da região.",
    href: "/negocios/criciuma/restaurantes/cantina-nonna-rosa",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80&fit=crop",
  },
  {
    id: "studio-bella-vita",
    title: "Studio Bella Vita — Tubarão",
    description:
      "Salão de beleza completo com especialistas em coloração, tratamentos capilares e estética facial. Referência em beleza no Sul de Santa Catarina há mais de 10 anos.",
    href: "/negocios/tubarao/beleza/studio-bella-vita",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&q=80&fit=crop",
  },
  {
    id: "auto-center-prime",
    title: "Auto Center Prime — Içara",
    description:
      "Serviços automotivos completos: mecânica geral, alinhamento, balanceamento e revisão preventiva. Atendimento rápido e transparente com garantia nos serviços.",
    href: "/negocios/icara/automotivo/auto-center-prime",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1080&q=80&fit=crop",
  },
  {
    id: "praia-morro-fumaça",
    title: "Praia do Morro da Fumaça",
    description:
      "Uma das praias mais belas do Sul de Santa Catarina, com águas calmas e paisagem deslumbrante. Perfeita para famílias e amantes do surf.",
    href: "/cidades/morro-da-fumaca",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80&fit=crop",
  },
  {
    id: "farmacia-saude-mais",
    title: "Farmácia Saúde+ — Araranguá",
    description:
      "Farmácia completa com manipulação, dermocosméticos e atendimento farmacêutico personalizado. Entrega em domicílio para toda a região de Araranguá.",
    href: "/negocios/ararangua/saude/farmacia-saude-mais",
    image:
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1080&q=80&fit=crop",
  },
];

const Gallery4 = ({
  title = "Negócios em destaque",
  description = "Conheça as empresas e lugares mais amados pelos moradores do Sul de Santa Catarina. Qualidade local, atendimento próximo.",
  items = DESCUBRASUL_ITEMS,
}: Gallery4Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => { carouselApi.off("select", updateSelection); };
  }, [carouselApi]);

  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 flex items-end justify-between md:mb-14 lg:mb-16">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-ink md:text-3xl lg:text-4xl tracking-tight">
              {title}
            </h2>
            <p className="max-w-lg text-sm text-ink/50">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="disabled:pointer-events-auto rounded-full border border-ink/10 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => carouselApi?.scrollNext()}
              disabled={!canScrollNext}
              className="disabled:pointer-events-auto rounded-full border border-ink/10 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": { dragFree: true },
            },
          }}
        >
          <CarouselContent className="ml-0 2xl:ml-[max(2rem,calc(50vw-700px))] 2xl:mr-[max(0rem,calc(50vw-700px))]">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[320px] pl-[20px] lg:max-w-[400px]"
              >
                <a href={item.href} className="group rounded-2xl block">
                  <div className="group relative h-full min-h-[27rem] max-w-full overflow-hidden rounded-2xl md:aspect-[5/4] lg:aspect-[16/9]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay gradient usando cor primary */}
                    <div className="absolute inset-0 h-full bg-gradient-to-b from-transparent via-primary/40 to-primary/85" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-white md:p-8">
                      <div className="mb-2 pt-4 text-xl font-bold md:mb-3 leading-snug">
                        {item.title}
                      </div>
                      <div className="mb-8 line-clamp-2 text-sm text-white/80 md:mb-12 lg:mb-9">
                        {item.description}
                      </div>
                      <div className="flex items-center text-sm font-semibold text-secondary">
                        Ver mais{" "}
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index
                  ? "bg-primary w-6"
                  : "bg-primary/20 w-2"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { Gallery4 };
