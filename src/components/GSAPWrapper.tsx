import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface GSAPWrapperProps {
  children: React.ReactNode;
}

// Singleton lenis instance so route changes can call scrollTo(0)
let lenisInstance: Lenis | null = null;

const GSAPWrapper: React.FC<GSAPWrapperProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // ---------- Lenis smooth scroll init (once) ----------
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisInstance = lenis;

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const rafTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafTick);
      lenisInstance = null;
    };
  }, []);

  // ---------- Scroll-to-top on every route change ----------
  useEffect(() => {
    if (lenisInstance) {
      // Instant jump so the new page starts at top
      lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // ---------- GSAP reveal animations ----------
  // ---------- GSAP reveal animations (MutationObserver for Framer Motion compat) ----------
  useGSAP(() => {
    // Keep track of which elements we've already animated
    const animatedElements = new WeakSet();

    const applyGsapToReveals = () => {
      const reveals = gsap.utils.toArray<HTMLElement>('.gsap-reveal');
      
      reveals.forEach((el) => {
        if (!animatedElements.has(el)) {
          animatedElements.add(el);
          gsap.fromTo(
            el,
            { opacity: 0, y: 50, clipPath: 'inset(100% 0% 0% 0%)' },
            {
              opacity: 1,
              y: 0,
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.2,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });

      // Magnet effect for CTA buttons
      const magnets = gsap.utils.toArray<HTMLElement>('.btn-gold, .btn-outline-gold');
      magnets.forEach((btn) => {
        if (!animatedElements.has(btn)) {
          animatedElements.add(btn);
          btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.5, ease: 'power2.out' });
          });
          btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
          });
        }
      });
      
      ScrollTrigger.refresh();
    };

    // Run once immediately
    applyGsapToReveals();

    // Setup observer to watch for React Router / Framer Motion dropping new pages into the DOM
    if (containerRef.current) {
      const observer = new MutationObserver((mutations) => {
        let hasNewNodes = false;
        mutations.forEach((m) => {
          if (m.addedNodes.length > 0) hasNewNodes = true;
        });
        if (hasNewNodes) {
          applyGsapToReveals();
        }
      });

      observer.observe(containerRef.current, { childList: true, subtree: true });

      return () => observer.disconnect();
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="gsap-container">
      {children}
    </div>
  );
};

export default GSAPWrapper;
