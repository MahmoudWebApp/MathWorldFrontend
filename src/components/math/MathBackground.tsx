'use client';
import {motion,useReducedMotion} from 'framer-motion';
export function MathBackground() {
  const reduced=useReducedMotion();
  return (
    <div className="math-global-background" aria-hidden="true">
      <div className="math-global-grid" />
      <svg
        className="math-global-curve math-global-curve-a"
        viewBox="0 0 800 320"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M-20 268 C 150 250, 210 30, 395 118 S 620 315, 830 44" />
        <path className="math-global-curve-secondary" d="M-20 205 C 140 65, 270 345, 460 162 S 690 42, 830 205" />
      </svg>
      <motion.span className="math-global-symbol math-global-symbol-1" animate={reduced?undefined:{y:[0,12,0],rotate:[0,5,0]}} transition={{duration:13,repeat:Infinity,ease:'easeInOut'}}>π</motion.span>
      <motion.span className="math-global-symbol math-global-symbol-2" animate={reduced?undefined:{y:[0,-12,0],rotate:[0,-5,0]}} transition={{duration:14,repeat:Infinity,ease:'easeInOut'}}>Σ</motion.span>
      <motion.span className="math-global-symbol math-global-symbol-3" animate={reduced?undefined:{y:[0,12,0],rotate:[0,5,0]}} transition={{duration:15,repeat:Infinity,ease:'easeInOut'}}>x²</motion.span>
      <motion.span className="math-global-symbol math-global-symbol-4" animate={reduced?undefined:{y:[0,-12,0],rotate:[0,-5,0]}} transition={{duration:16,repeat:Infinity,ease:'easeInOut'}}>∞</motion.span>
      <motion.span className="math-global-symbol math-global-symbol-5" animate={reduced?undefined:{y:[0,12,0],rotate:[0,5,0]}} transition={{duration:17,repeat:Infinity,ease:'easeInOut'}}>∫</motion.span>
      <motion.span className="math-global-symbol math-global-symbol-6" animate={reduced?undefined:{y:[0,-12,0],rotate:[0,-5,0]}} transition={{duration:18,repeat:Infinity,ease:'easeInOut'}}>√x</motion.span>
    <motion.span className="math-global-symbol" style={{top:'22%',left:'14%',fontSize:'2.4rem'}} animate={reduced?undefined:{y:[0,-15,0],rotate:[0,10,0]}} transition={{duration:18,repeat:Infinity,ease:'easeInOut'}}>△</motion.span>
      <motion.span className="math-global-symbol" style={{bottom:'19%',right:'13%',fontSize:'1.6rem'}} animate={reduced?undefined:{y:[0,14,0],rotate:[0,-8,0]}} transition={{duration:20,repeat:Infinity,ease:'easeInOut'}}>◇</motion.span>
    </div>
  );
}
