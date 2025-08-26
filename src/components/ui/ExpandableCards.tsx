"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../hooks/use-outside-click";

interface Card {
  description: string;
  title: string;
  src: string;
  ctaText: string;
  ctaLink: string;
  content: () => React.ReactNode;
}

const pokemonCards: Card[] = [
  {
    description: "The Mouse Pokémon - Electric type",
    title: "Pikachu",
    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    ctaText: "Learn More",
    ctaLink: "#",
    content: () => (
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">Pikachu - The Beloved Electric Mouse</h3>
        <p className="text-gray-300 mb-4">
          Pikachu is one of the most friendly and beloved Pokémon. This Electric-type Pokémon is known for its cheerful personality and loyalty to its trainer. With its red cheeks that store electricity, Pikachu can generate powerful electric attacks.
        </p>
        <div className="space-y-2">
          <div><strong>Type:</strong> Electric</div>
          <div><strong>Height:</strong> 0.4 m</div>
          <div><strong>Weight:</strong> 6.0 kg</div>
          <div><strong>Abilities:</strong> Static, Lightning Rod</div>
        </div>
      </div>
    ),
  },
  {
    description: "The Seed Pokémon - Grass/Poison type",
    title: "Bulbasaur",
    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    ctaText: "Discover",
    ctaLink: "#",
    content: () => (
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">Bulbasaur - The Gentle Starter</h3>
        <p className="text-gray-300 mb-4">
          Bulbasaur is known for its calm and gentle nature, making it an excellent starter Pokémon. This Grass/Poison type has a bulb on its back that stores energy from the sun, allowing it to go days without eating.
        </p>
        <div className="space-y-2">
          <div><strong>Type:</strong> Grass/Poison</div>
          <div><strong>Height:</strong> 0.7 m</div>
          <div><strong>Weight:</strong> 6.9 kg</div>
          <div><strong>Abilities:</strong> Overgrow, Chlorophyll</div>
        </div>
      </div>
    ),
  },
  {
    description: "The Flame Pokémon - Fire type",
    title: "Charmander",
    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    ctaText: "Explore",
    ctaLink: "#",
    content: () => (
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">Charmander - The Loyal Fire Lizard</h3>
        <p className="text-gray-300 mb-4">
          Charmander is a friendly Fire-type Pokémon with a flame on its tail that indicates its health and emotions. Despite its fiery nature, Charmander is incredibly loyal and forms strong bonds with trainers who treat it well.
        </p>
        <div className="space-y-2">
          <div><strong>Type:</strong> Fire</div>
          <div><strong>Height:</strong> 0.6 m</div>
          <div><strong>Weight:</strong> 8.5 kg</div>
          <div><strong>Abilities:</strong> Blaze, Solar Power</div>
        </div>
      </div>
    ),
  },
  {
    description: "The Tiny Turtle Pokémon - Water type",
    title: "Squirtle",
    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    ctaText: "Meet Squirtle",
    ctaLink: "#",
    content: () => (
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">Squirtle - The Playful Water Turtle</h3>
        <p className="text-gray-300 mb-4">
          Squirtle is a cheerful and playful Water-type Pokémon. Its shell hardens after birth and becomes more resilient with age. Squirtle is known for its friendly demeanor and love for water games.
        </p>
        <div className="space-y-2">
          <div><strong>Type:</strong> Water</div>
          <div><strong>Height:</strong> 0.5 m</div>
          <div><strong>Weight:</strong> 9.0 kg</div>
          <div><strong>Abilities:</strong> Torrent, Rain Dish</div>
        </div>
      </div>
    ),
  },
  {
    description: "The Puppy Pokémon - Normal type",
    title: "Growlithe",
    src: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png",
    ctaText: "Pet Growlithe",
    ctaLink: "#",
    content: () => (
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">Growlithe - The Loyal Puppy Pokémon</h3>
        <p className="text-gray-300 mb-4">
          Growlithe is incredibly friendly and loyal, much like a real puppy. This Fire-type Pokémon is brave and will protect its trainer at all costs. It has a keen sense of smell and never forgets a scent.
        </p>
        <div className="space-y-2">
          <div><strong>Type:</strong> Fire</div>
          <div><strong>Height:</strong> 0.7 m</div>
          <div><strong>Weight:</strong> 19.0 kg</div>
          <div><strong>Abilities:</strong> Intimidate, Flash Fire</div>
        </div>
      </div>
    ),
  },
];

export function ExpandableCards() {
  const [active, setActive] = useState<Card | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6 z-10"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  width={500}
                  height={300}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center bg-gray-100"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400"
                  >
                    {active.content()}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ul className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-4">
        {pokemonCards.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={card.title}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 flex-col w-full">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <img
                  width={200}
                  height={200}
                  src={card.src}
                  alt={card.title}
                  className="h-60 w-full rounded-lg object-cover object-center bg-gray-100"
                />
              </motion.div>
              <div className="flex justify-center items-center flex-col">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-base"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};