'use client'

import React from 'react';
import AnimatedText from '../../utils/AnimatedText';

interface TextWrapperProps {
  text: string;
  delay?: number;
  variant?: 'title' | 'description' | 'fast' | 'instant';
  disablePixels?: boolean;
  keepTogether?: string[]; // Array of phrases that should stay together
}

export default function TextWrapper({ 
  text, 
  delay = 0,
  variant = 'description',
  disablePixels = false,
  keepTogether = []
}: TextWrapperProps) {
  // Split text into words and preserve spaces
  const words = text.split(' ');
  
  // Find phrases that should stay together
  let processedWords = [...words];
  let skipIndices = new Set<number>();
  
  if (keepTogether.length > 0) {
    keepTogether.forEach(phrase => {
      const phraseWords = phrase.split(' ');
      
      // Look for the phrase in our word array
      for (let i = 0; i <= words.length - phraseWords.length; i++) {
        if (skipIndices.has(i)) continue;
        
        const potentialMatch = words.slice(i, i + phraseWords.length).join(' ');
        if (potentialMatch === phrase) {
          // Mark indices to skip
          for (let j = i; j < i + phraseWords.length; j++) {
            skipIndices.add(j);
          }
          
          // Replace with single word in our processed array
          processedWords[i] = phrase;
          for (let j = i + 1; j < i + phraseWords.length; j++) {
            processedWords[j] = '';
          }
        }
      }
    });
  }
  
  // Filter out empty strings
  processedWords = processedWords.filter(word => word !== '');
  
  return (
    <span className="inline">
      {processedWords.map((word, index) => (
        <React.Fragment key={index}>
          <span className="inline-block whitespace-nowrap">
            <AnimatedText
              text={word}
              delay={delay + (index * 20)} // Stagger delay for each word
              variant={variant}
              disablePixels={disablePixels}
            />
          </span>
          {index < processedWords.length - 1 && (
            <span className="inline-block whitespace-normal" style={{ width: '0.25em' }}>{' '}</span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
} 