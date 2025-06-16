"use client";

import React, { useRef, useEffect } from 'react';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const chickenImageRef = useRef<HTMLImageElement | null>(null);
  const cornImageRef = useRef<HTMLImageElement | null>(null);

  const chicken = {
    x: 50,
    y: 150,
    width: 58,
    height: 58,
    velocityY: 0,
    gravity: 1.2,
    jumpPower: -20,
    isJumping: false,
  };

  let obstacles: { x: number; width: number; height: number }[] = [];
  let speed = 6;
  let frame = 0;
  let gameOver = false;

  const resetGame = () => {
    chicken.y = 150;
    chicken.velocityY = 0;
    chicken.isJumping = false;
    gameOver = false;
    scoreRef.current = 0;
    obstacles = [];
    frame = 0;
    frameCountRef.current = 0;
    speed = 6;
    startGame();
  };

  const handleJump = () => {
    if (!gameOver && !chicken.isJumping) {
      chicken.velocityY = chicken.jumpPower;
      chicken.isJumping = true;
    } else if (gameOver) {
      resetGame();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fef9c3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#22c55e';
    const groundHeight = 10;
    const groundY = canvas.height - groundHeight;
    ctx.fillRect(0, groundY, canvas.width, groundHeight);

    chicken.velocityY += chicken.gravity;
    chicken.y += chicken.velocityY;

    const maxY = groundY - chicken.height;
    if (chicken.y >= maxY) {
      chicken.y = maxY;
      chicken.velocityY = 0;
      chicken.isJumping = false;
    }

    const chickenImg = chickenImageRef.current;
    if (chickenImg && chickenImg.complete) {
      ctx.drawImage(chickenImg, chicken.x, chicken.y, chicken.width, chicken.height);
    } else {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(chicken.x, chicken.y, chicken.width, chicken.height);
    }

    if (frame % 100 === 0) {
      const minHeight = 50;
      const maxHeight = 80;
      const randomHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

      obstacles.push({
        x: canvas.width,
        width: 90,
        height: randomHeight,
      });
    }

    obstacles = obstacles.filter((obs) => obs.x + obs.width > 0);
    for (const obs of obstacles) {
      obs.x -= speed;

      const cornImg = cornImageRef.current;
      if (cornImg && cornImg.complete) {
        ctx.drawImage(cornImg, obs.x, groundY - obs.height, obs.width, obs.height);
      } else {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(
          obs.x + obs.width / 2,
          groundY - obs.height / 2,
          obs.width / 2,
          obs.height / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      if (
        chicken.x < obs.x + obs.width &&
        chicken.x + chicken.width > obs.x &&
        chicken.y + chicken.height > groundY - obs.height
      ) {
        gameOver = true;
      }
    }

    scoreRef.current++;
    ctx.fillStyle = '#1f2937';
    ctx.font = '24px Monoton, monospace';
      ctx.textAlign = 'center';
    const scoreText = `Score: ${scoreRef.current}`;
    const textWidth = ctx.measureText(scoreText).width;
    ctx.fillText(scoreText, (canvas.width - textWidth) / 2, 60);

    const maxSpeed = 12;
    const minSpeed = 6;
    const scoreCap = 1000;
    const scoreProgress = Math.min(scoreRef.current, scoreCap) / scoreCap;
    speed = minSpeed + (maxSpeed - minSpeed) * scoreProgress;

    if (gameOver) {
      ctx.fillStyle = '#dc2626';
      ctx.font = '34px Monoton, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over - Click or Space to restart', canvas.width / 2, canvas.height / 2);
    } else {
      frame++;
      frameCountRef.current++;
      requestRef.current = requestAnimationFrame(() => draw(ctx, canvas));
    }
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      requestRef.current = requestAnimationFrame(() => draw(ctx, canvas));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const chickenImg = new Image();
    chickenImg.src = '/sprites/chicken.png';
    chickenImg.onload = () => {
      chickenImageRef.current = chickenImg;

      const cornImg = new Image();
      cornImg.src = '/sprites/corn.png';
      cornImg.onload = () => {
        cornImageRef.current = cornImg;
        startGame();
      };
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleJump();
    };

    window.addEventListener('keydown', handleKey);
    canvas?.addEventListener('click', handleJump);

    return () => {
      window.removeEventListener('keydown', handleKey);
      canvas?.removeEventListener('click', handleJump);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }}
    />
  );
};

export default GameCanvas;
