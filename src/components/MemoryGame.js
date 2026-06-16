"use client";

import { useState, useEffect } from "react";
import styles from "./MemoryGame.module.css";

const EMOJI_PAIRS = ["🐶", "🐱", "🐸", "🦊", "🐼", "🦁", "🐨", "🐷"];

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  // Check for win
  useEffect(() => {
    if (cards.length > 0 && matchedIndices.length === cards.length) {
      setIsWon(true);
    }
  }, [matchedIndices, cards.length]);

  const startNewGame = () => {
    // Create pairs, shuffle them
    const shuffledCards = [...EMOJI_PAIRS, ...EMOJI_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMoves(0);
    setIsWon(false);
    setIsChecking(false);
  };

  const handleCardClick = (index) => {
    // Prevent clicking if checking, already flipped, or already matched
    if (
      isChecking ||
      flippedIndices.includes(index) ||
      matchedIndices.includes(index)
    ) {
      return;
    }

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // If two cards are flipped, check for match
    if (newFlippedIndices.length === 2) {
      setIsChecking(true);
      setMoves((prev) => prev + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match found
        setMatchedIndices((prev) => [...prev, firstIndex, secondIndex]);
        setFlippedIndices([]);
        setIsChecking(false);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Memory Match</h3>
      
      <div className={styles.scoreBar}>
        <div className={styles.scorePill}>
          <span>Moves: {moves}</span>
          <span className={styles.scoreDivider}>|</span>
          <span>Matched: {matchedIndices.length / 2} / {EMOJI_PAIRS.length}</span>
        </div>
      </div>

      {isWon && (
        <div className={styles.celebration}>
          <div className={styles.confettiContainer}>
            {/* Render some CSS-animated confetti */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className={styles.confetti} 
                style={{ 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  color: ['#8B5CF6', '#EC4899', '#F59E0B', '#14B8A6'][Math.floor(Math.random() * 4)]
                }}
              >
                🎉
              </div>
            ))}
          </div>
          <div className={styles.celebrationEmojis}>🏆 🌟 🥳</div>
          <h4 className={styles.celebrationTitle}>You Won!</h4>
          <p className={styles.celebrationText}>Great memory! You finished in {moves} moves.</p>
        </div>
      )}

      <div className={styles.grid}>
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index);
          const isMatched = matchedIndices.includes(index);
          
          return (
            <div 
              key={card.id} 
              className={styles.cardWrapper}
              onClick={() => handleCardClick(index)}
              aria-label={`Card ${index}`}
              role="button"
            >
              <div 
                className={`${styles.card} 
                  ${isFlipped || isMatched ? styles.cardFlipped : ''} 
                  ${isMatched ? styles.cardMatched + ' ' + styles.matchBounce : ''}
                  ${isChecking && !isFlipped ? styles.cardDisabled : ''}
                `}
              >
                <div className={styles.cardBack}>❓</div>
                <div className={styles.cardFront}>{card.emoji}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.playAgainWrapper}>
        <button 
          className={styles.playAgainBtn} 
          onClick={startNewGame}
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
