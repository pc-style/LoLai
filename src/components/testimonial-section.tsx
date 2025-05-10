"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";

type Testimonial = {
  quote: string;
  author: string;
  rank?: string;
};

export function TestimonialSection() {
  const testimonials: Testimonial[] = [
    {
      quote: "This AI coach helped me understand matchups more and my win rate peaked this season!",
      author: "SoloQMaster",
      rank: "Diamond II"
    },
    {
      quote: "The build recommendations and counter picks are spot on. Climbed from Silver to Platinum in 2 weeks.",
      author: "RiftWalker",
      rank: "Platinum IV"
    },
    {
      quote: "I love how it analyzes my gameplay and gives specific tips to improve. Game-changer for new players.",
      author: "JungleGap",
      rank: "Gold III"
    },
    {
      quote: "Being able to ask questions about any champion matchup has completely changed how I prepare for games.",
      author: "MidOrFeed",
      rank: "Master"
    },
    {
      quote: "The macro tips took my gameplay to the next level. Thanks for making this amazing tool!",
      author: "TopDiff",
      rank: "Diamond IV"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const nextTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6000);

    return () => clearInterval(interval);
  }, [nextTestimonial]);

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          What Our <span className="text-primary">Users</span> Say
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of players who have improved their gameplay with our AI coach
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4" ref={testimonialsRef}>
        <div className="relative bg-card rounded-xl overflow-hidden border border-border/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          
          <div className="p-8 md:p-12">
            <div className="flex justify-center mb-8">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            
            <blockquote className="text-xl md:text-2xl text-center font-medium mb-6 relative">
              <span className="text-6xl absolute -top-2 -left-2 text-primary opacity-20">&ldquo;</span>
              {testimonials[activeIndex].quote}
              <span className="text-6xl absolute -bottom-10 -right-2 text-primary opacity-20">&rdquo;</span>
            </blockquote>
            
            <div className="text-center">
              <p className="font-semibold text-lg">{testimonials[activeIndex].author}</p>
              {testimonials[activeIndex].rank && (
                <p className="text-primary text-sm">{testimonials[activeIndex].rank}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === activeIndex ? "bg-primary w-6" : "bg-border"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8 gap-4">
          <Button size="icon" variant="outline" onClick={prevTestimonial} aria-label="Previous testimonial">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
          <Button size="icon" variant="outline" onClick={nextTestimonial} aria-label="Next testimonial">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
} 