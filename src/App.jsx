import { useEffect, useState } from "react";
import "./App.css";

const Wall_height = window.innerHeight;
const Wall_width = window.innerWidth;
const Bird_height = Math.max(Wall_height * 0.05, 35);
const Bird_width = Bird_height * 1.3;
const Gravity = Math.max(Wall_height * 0.008, 6);
const Obj_width = Math.max(Wall_width * 0.05, 50);
const Obj_speed = Math.max(Wall_width * 0.003, 5);
const Obj_gap = Math.max(Wall_height * 0.25, 120);

const App = () => {
  const [isStart, setIsStart] = useState(false);
  const [birdPos, setBirdPos] = useState(Wall_height / 2);
  const [objHeight, setObjHeight] = useState(0);
  const [objPos, setObjPos] = useState(Wall_width);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("bestScore")) || 0
  );
  const [isBestScoreAnimating, setIsBestScoreAnimating] = useState(false);
  const [hasShownBestScore, setHasShownBestScore] = useState(false);

  // Bird Movement
  useEffect(() => {
    let interval = null;
    if (isStart && birdPos < Wall_height - Bird_height) {
      interval = setInterval(() => {
        setBirdPos((prev) => prev + Gravity);
      }, 24);
    } else if (!isStart && birdPos >= Wall_height - Bird_height) {
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem("bestScore", score);
      }
      setBirdPos(Wall_height / 2);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStart, birdPos, score, bestScore]);

  // Obstacle Movement
  useEffect(() => {
    let interval = null;
    if (isStart && objPos >= -Obj_width) {
      interval = setInterval(() => {
        setObjPos((prev) => prev - Obj_speed);
      }, 24);
    } else {
      setObjPos(Wall_width);
      setObjHeight(Math.floor(Math.random() * (Wall_height - Obj_gap)));
      if (isStart) {
        setScore((prev) => {
          const newScore = prev + 1;
          if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem("bestScore", newScore);
            if (!hasShownBestScore) {
              setIsBestScoreAnimating(true);
              setHasShownBestScore(true);
              setTimeout(() => setIsBestScoreAnimating(false), 2000);
            }
          }
          return newScore;
        });
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStart, objPos, bestScore, hasShownBestScore]);

  // Collision Detection
  useEffect(() => {
    const birdRight = 100 + Bird_width;
    const birdLeft = 100;

    const pipeLeft = objPos;
    const pipeRight = objPos + Obj_width;

    const topPipeBottom = objHeight;
    const bottomPipeTop = objHeight + Obj_gap;

    const isInPipeHorizontalRange = birdRight > pipeLeft && birdLeft < pipeRight;
    const isOutsideGap =
      birdPos < topPipeBottom || birdPos + Bird_height > bottomPipeTop;

    if (isInPipeHorizontalRange && isOutsideGap) {
      setIsStart(false);
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem("bestScore", score);
      }
    }
  }, [isStart, birdPos, objHeight, objPos, score, bestScore]);

  // Start Button Click
  const handleStartClick = (e) => {
    e.stopPropagation();
    if (!isStart) {
      setScore(0);
      setBirdPos(Wall_height / 2);
      setObjPos(Wall_width);
      setIsStart(true);
      setHasShownBestScore(false); 
    }
  };

  // Handle Gameplay Click
  const handleGameClick = () => {
    if (isStart) {
      setBirdPos((prev) => Math.max(prev - 50, 0)); // Bird moves up during gameplay
    }
  };

  // Spacebar Movement
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && isStart) {
        setBirdPos((prev) => Math.max(prev - 50, 0)); // Bird moves up on Space
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [isStart]);

  // Quit Game Button Click
  const handleQuitClick = () => {
    setIsStart(false);
    setBirdPos(Wall_height / 2);
    setObjPos(Wall_width);
    setScore(0);
  };

  // Reset Best Score
  const handleResetBestScore = () => {
    setBestScore(0);
    localStorage.setItem("bestScore", 0);
  };

  return (
    <div className="home" onClick={handleGameClick}>
      
      {isBestScoreAnimating && (
        <div className="best-score-animation">
          BEST SCORE!
        </div>
      )}

      {isStart && (
        <button className="quit-button" onClick={handleQuitClick}>
          Quit
        </button>
      )}

      {!isStart && (
        <div className="scoreboard">
          <p>Best Score: {bestScore}</p>
          <p>Current Score: {score}</p>
          <div className="startboard" onClick={handleStartClick}>
            Click To Start
          </div>
          <button className="reset-button" onClick={handleResetBestScore}>
            Reset Best Score
          </button>
        </div>
      )}

      <div className="score-show">Score: {score}</div>
      <div className="background">
        <div
          className="obj"
          style={{
            height: `${objHeight}px`,
            width: `${Obj_width}px`,
            left: `${objPos}px`,
            top: "0",
            transform: "rotate(180deg)",
          }}
        ></div>
        <div
          className="bird"
          style={{
            height: `${Bird_height}px`,
            width: `${Bird_width}px`,
            top: `${birdPos}px`,
            left: "100px",
          }}
        ></div>
        <div
          className="obj"
          style={{
            height: `${Wall_height - Obj_gap - objHeight}px`,
            width: `${Obj_width}px`,
            left: `${objPos}px`,
            bottom: "0",
            transform: "rotate(0deg)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default App;
