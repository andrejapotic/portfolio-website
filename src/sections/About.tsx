'use client'
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import bookImage1 from "@/assets/images/book-cover.png"
import bookImage2 from "@/assets/images/book-cover2.png"
import bookImage3 from "@/assets/images/book-cover3.png"
import bookImage4 from "@/assets/images/book-cover4.png"
import bookImage5 from "@/assets/images/book-cover5.png"
import Image from "next/image";
import JavascriptIcon from "@/assets/icons/square-js.svg"
import HTMLIcon from "@/assets/icons/html5.svg"
import CssIcon from "@/assets/icons/css3.svg"
import ReactIcon from "@/assets/icons/react.svg"
import ChromeIcon from "@/assets/icons/chrome.svg"
import GithubIcon from "@/assets/icons/github.svg"
import mapImage from "@/assets/images/map.png"
import smileMemoji from "@/assets/images/memoji-smile.png"
import { CardHeader } from "@/components/CardHeader";
import { ToolboxItems } from "@/components/ToolboxItems";
import { motion } from 'framer-motion'
import { useRef, useState } from "react";


const toolboxItems = [
  {
    title: 'JavaScript',
    iconType: JavascriptIcon,
  },
  {
    title: 'HTML5', //.NET
    iconType: HTMLIcon,
  },
  {
    title: 'CSS3', //Postgres
    iconType: CssIcon,
  },
  {
    title: 'React',
    iconType: ReactIcon,
  },
  {
    title: 'Chrome', //Docker
    iconType: ChromeIcon,
  },
  {
    title: 'GitHub',
    iconType: GithubIcon,
  },
]

const hobbies = [
  {
    title: 'Gaming',
    emoji: '🕹️',
    left: '5%',
    top: '5%',
  },
  {
    title: 'Guitar',
    emoji: '🎸',
    left: '50%',
    top: '5%',
  },
  {
    title: 'Fitness',
    emoji: '🏋️‍♂️',
    left: '10%',
    top: '35%',
  },
  {
    title: 'Reading',
    emoji: '📚',
    left: '35%',
    top: '40%',
  },
  {
    title: 'Board Games',
    emoji: '🎲',
    left: '70%',
    top: '45%',
  },
  {
    title: 'Astronomy',
    emoji: '🪐',
    left: '5%',
    top: '65%',
  },
  {
    title: 'Avoiding spiders',
    emoji: '🕷️',
    left: '45%',
    top: '70%',
  },
]

const bookImages = [bookImage1, bookImage2, bookImage3, bookImage4, bookImage5];

export const AboutSection = () => {
  const constraintRef = useRef(null);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const touchStartRef = useRef(0);

  const handlePrevBook = () => {
    setCurrentBookIndex((prev) => (prev === 0 ? bookImages.length - 1 : prev - 1));
  };

  const handleNextBook = () => {
    setCurrentBookIndex((prev) => (prev === bookImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (diff > 50) {
      handleNextBook();
    } else if (diff < -50) {
      handlePrevBook();
    }
  };

  return (
    <section id="about" className="py-20 lg:py-28 scroll-mt-24">
      <div className="container">
        <SectionHeader eyebrow="About me" title="A Glimpse Into My World" description="Learn more about who I am, what I do, and what inspires me." />
        <div className="mt-20 flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8 md:grid md:grid-cols-5 lg:grid-cols-3">
            <Card className="h-[320px] md:col-span-2 lg:col-span-1">
              <CardHeader title="My Reads" description="Explore the books shaping my perspectives." />

              <div className="w-40 mx-auto mt-2 md:mt-0 relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <Image src={bookImages[currentBookIndex]} alt="Book cover" />
                
                <button
                  onClick={handlePrevBook}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Previous book"
                >
                  ‹
                </button>
                
                <button
                  onClick={handleNextBook}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Next book"
                >
                  ›
                </button>

                <div className="flex justify-center gap-1 mt-3">
                  {bookImages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentBookIndex ? 'w-6 bg-gray-700' : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
            <Card className="h-[320px] md:col-span-3 lg:col-span-2">
              <CardHeader title="My Toolbox" description="Explore the technologies and tools I use to create exceptional digital experiences."
                className="" />

              <ToolboxItems items={toolboxItems} className="" itemsWrapperClassName="animate-move-left [animation-duration:30s]" />
              <ToolboxItems items={toolboxItems} className="mt-6" itemsWrapperClassName="animate-move-right [animation-duration:26s]" />
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:grid-cols-3">
            <Card className="h-[320px] p-0 flex flex-col md:col-span-3 lg:col-span-2">
              <CardHeader title="Beyond the Code" description="Explore my interests and hobbies beyond the digital realm."
                className="px-6 py-6" />

              <div className="relative flex-1" ref={constraintRef}>
                {hobbies.map(hobby => (
                  <motion.div key={hobby.title} className="inline-flex absolute items-center gap-2 px-6 bg-gradient-to-r from-emerald-300 to-sky-400 rounded-full py-1.5"
                    style={{
                      left: hobby.left,
                      top: hobby.top,
                    }}
                    drag 
                    dragConstraints={constraintRef}>
                    <span className="font-medium text-gray-950">{hobby.title}</span>
                    <span>{hobby.emoji}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
            <Card className="h-[320px] p-0 relative md:col-span-2 lg:col-span-1">
              <Image src={mapImage} alt="map" className="h-full w-full object-cover object-left-top" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-full 
            after:content-[''] after:absolute after:inset-0 after:outline after:outline-2 after:-outline-offset-2 after:rounded-full after:outline-gray-950/30">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300 to-sky-400 -z-20 animate-ping [animation-duration:2s]"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300 to-sky-400 -z-10"></div>
                <Image src={smileMemoji} alt="smiling memoji" className="size-20" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
};
