"use client"

import { useScrollInView } from '../../hooks/useScrollInView'

interface AnimatedPDFProps {
  pdfUrl: string;
  title: string;
}

const AnimatedPDF = ({ pdfUrl, title }: AnimatedPDFProps) => {
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const pdfUrlWithParams = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-500 ease-out mb-8 pdf-section
        ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      data-type="pdf-container" // Add this attribute to identify PDF containers
    >
      <div className="relative bg-[#F9F9F9] dark:bg-[#222222] retro-box [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <iframe
          src={pdfUrlWithParams}
          className="w-full sticky top-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ 
            height: 'calc(100vh - 150px)',
            overflow: 'auto'
          }}
          title={`${title} presentation`}
          frameBorder="0"
        />
      </div>
    </div>
  );
};

export default AnimatedPDF; 