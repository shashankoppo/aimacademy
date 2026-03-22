import { motion } from "framer-motion";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  labelColor?: "gold" | "ember" | "blue";
}

const labelStyles = {
  gold:  "badge-gold",
  ember: "badge-ember",
  blue:  "bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full",
};

const SectionHeading = ({ label, title, description, align = "center", labelColor = "gold" }: SectionHeadingProps) => {
  const isCenter = align === "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className={`mb-12 md:mb-16 ${isCenter ? "text-center" : "text-left"}`}
    >
      {label && (
        <div className={`inline-flex items-center gap-2 mb-5 ${isCenter ? "justify-center" : ""}`}>
          <span className={labelStyles[labelColor]}>
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block mr-1.5 animate-pulse" />
            {label}
          </span>
        </div>
      )}
      <h2 className={`heading-display text-3xl md:text-5xl lg:text-6xl text-navy mb-5 leading-[1.1] ${isCenter ? "max-w-4xl mx-auto" : "max-w-2xl"}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-slate-500 font-body text-lg md:text-xl leading-relaxed ${isCenter ? "max-w-3xl mx-auto" : "max-w-xl"}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default SectionHeading;
