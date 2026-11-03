import { useState, useEffect, useRef, useCallback } from 'react';

interface Planet {
  name: string;
  radius: number; // visual radius in px
  orbitRadius: number; // orbit distance from sun in px
  color: string;
  size: string; // real diameter
  distance: string; // distance from sun
  orbitalPeriod: string; // orbital period
  speed: number; // angular speed multiplier
  angle: number; // current angle
  description: string;
}

const PLANETS_DATA: Omit<Planet, 'angle'>[] = [
  {
    name: 'Mercury',
    radius: 4,
    orbitRadius: 60,
    color: '#b5b5b5',
    size: '4,879 km',
    distance: '57.9 million km',
    orbitalPeriod: '88 days',
    speed: 4.15,
    description: 'The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.',
  },
  {
    name: 'Venus',
    radius: 7,
    orbitRadius: 90,
    color: '#e8cda0',
    size: '12,104 km',
    distance: '108.2 million km',
    orbitalPeriod: '225 days',
    speed: 1.62,
    description: 'Often called Earth\'s twin due to similar size. It has a thick toxic atmosphere and is the hottest planet.',
  },
  {
    name: 'Earth',
    radius: 7,
    orbitRadius: 125,
    color: '#4da6ff',
    size: '12,756 km',
    distance: '149.6 million km',
    orbitalPeriod: '365.25 days',
    speed: 1.0,
    description: 'Our home planet. The only known planet with liquid water on its surface and supporting life.',
  },
  {
    name: 'Mars',
    radius: 5,
    orbitRadius: 160,
    color: '#e05a3a',
    size: '6,792 km',
    distance: '227.9 million km',
    orbitalPeriod: '687 days',
    speed: 0.53,
    description: 'The Red Planet, known for its iron oxide surface. It has the largest volcano in the solar system, Olympus Mons.',
  },
  {
    name: 'Jupiter',
    radius: 16,
    orbitRadius: 210,
    color: '#c88b3a',
    size: '142,984 km',
    distance: '778.6 million km',
    orbitalPeriod: '11.86 years',
    speed: 0.084,
    description: 'The largest planet in our solar system. A gas giant with a famous Great Red Spot storm.',
  },
  {
    name: 'Saturn',
    radius: 14,
    orbitRadius: 265,
    color: '#e8d590',
    size: '120,536 km',
    distance: '1.43 billion km',
    orbitalPeriod: '29.46 years',
    speed: 0.034,
    description: 'Famous for its stunning ring system made of ice and rock. It is the least dense planet.',
  },
  {
    name: 'Uranus',
    radius: 10,
    orbitRadius: 320,
    color: '#7de8e8',
    size: '51,118 km',
    distance: '2.87 billion km',
    orbitalPeriod: '84.01 years',
    speed: 0.012,
    description: 'An ice giant that rotates on its side. It has a blue-green color due to methane in its atmosphere.',
  },
  {
    name: 'Neptune',
    radius: 10,
    orbitRadius: 370,
    color: '#3f54e8',
    size: '49,528 km',
    distance: '4.50 billion km',
    orbitalPeriod: '164.8 years',
    speed: 0.006,
    description: 'The farthest planet from the Sun. It has the strongest winds in the solar system, up to 2,100 km/h.',
  },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const planetsRef = useRef<Planet[]>(
    PLANETS_DATA.map((p, i) => ({ ...p, angle: (i * Math.PI) / 4 }))
  );
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const isPlayingRef = useRef(true);
  const speedRef = useRef(1);
  const lastTimeRef = useRef(0);
  const selectedPlanetRef = useRef<Planet | null>(null);
  const hoveredPlanetRef = useRef<string | null>(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    selectedPlanetRef.current = selectedPlanet;
  }, [selectedPlanet]);

  useEffect(() => {
    hoveredPlanetRef.current = hoveredPlanet;
  }, [hoveredPlanet]);

  const drawStar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
  }, []);

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate delta time
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars background
    const starSeed = 42;
    for (let i = 0; i < 200; i++) {
      const sx = ((starSeed * (i + 1) * 7919) % width);
      const sy = ((starSeed * (i + 1) * 6271) % height);
      const starSize = ((i * 3571) % 3) * 0.5 + 0.5;
      const twinkle = Math.sin(timestamp * 0.001 + i) * 0.3 + 0.7;
      drawStar(ctx, sx, sy, starSize, twinkle);
    }

    // Draw orbit paths
    planetsRef.current.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    sunGradient.addColorStop(0, '#fff7a0');
    sunGradient.addColorStop(0.3, '#ffdd44');
    sunGradient.addColorStop(0.7, '#ff8800');
    sunGradient.addColorStop(1, '#ff440044');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 25, centerX, centerY, 55);
    glowGradient.addColorStop(0, 'rgba(255, 200, 50, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Update and draw planets
    planetsRef.current.forEach((planet) => {
      // Update angle if playing
      if (isPlayingRef.current) {
        planet.angle += planet.speed * speedRef.current * deltaTime * 0.5;
      }

      const x = centerX + Math.cos(planet.angle) * planet.orbitRadius;
      const y = centerY + Math.sin(planet.angle) * planet.orbitRadius;

      // Draw planet shadow/glow
      const planetGlow = ctx.createRadialGradient(x, y, planet.radius * 0.5, x, y, planet.radius * 2);
      planetGlow.addColorStop(0, planet.color + '44');
      planetGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, planet.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = planetGlow;
      ctx.fill();

      // Draw planet
      ctx.beginPath();
      ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();

      // Saturn rings
      if (planet.name === 'Saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, planet.radius * 1.8, planet.radius * 0.4, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8d590aa';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Highlight selected planet
      if (selectedPlanetRef.current && selectedPlanetRef.current.name === planet.name) {
        ctx.beginPath();
        ctx.arc(x, y, planet.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Hover highlight
      if (hoveredPlanetRef.current === planet.name) {
        ctx.beginPath();
        ctx.arc(x, y, planet.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Planet name label
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, x, y - planet.radius - 6);
    });

    animationRef.current = requestAnimationFrame(draw);
  }, [drawStar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let clicked: Planet | null = null;

    planetsRef.current.forEach((planet) => {
      const px = centerX + Math.cos(planet.angle) * planet.orbitRadius;
      const py = centerY + Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= planet.radius + 8) {
        clicked = planet;
      }
    });

    setSelectedPlanet(clicked);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let hovered: string | null = null;

    planetsRef.current.forEach((planet) => {
      const px = centerX + Math.cos(planet.angle) * planet.orbitRadius;
      const py = centerY + Math.sin(planet.angle) * planet.orbitRadius;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= planet.radius + 8) {
        hovered = planet.name;
      }
    });

    setHoveredPlanet(hovered);
    if (canvas) {
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    }
  };

  const speeds = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="w-full h-screen bg-[#0a0a1a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☀️</span>
          <h1 className="text-xl font-bold text-white">Solar System Explorer</h1>
        </div>
        <p className="text-sm text-gray-400 hidden md:block">Click on any planet to learn more</p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
          />
        </div>

        {/* Info Panel */}
        {selectedPlanet && (
          <div className="absolute right-4 top-4 w-80 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-5 text-white shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full shadow-lg"
                  style={{ backgroundColor: selectedPlanet.color, boxShadow: `0 0 12px ${selectedPlanet.color}66` }}
                />
                <h2 className="text-xl font-bold">{selectedPlanet.name}</h2>
              </div>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{selectedPlanet.description}</p>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400 text-sm">Diameter</span>
                <span className="font-semibold text-sm">{selectedPlanet.size}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400 text-sm">Distance from Sun</span>
                <span className="font-semibold text-sm">{selectedPlanet.distance}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400 text-sm">Orbital Period</span>
                <span className="font-semibold text-sm">{selectedPlanet.orbitalPeriod}</span>
              </div>
            </div>
          </div>
        )}

        {/* Planet Quick Select */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {PLANETS_DATA.map((planet) => (
            <button
              key={planet.name}
              onClick={() => {
                const p = planetsRef.current.find((pp) => pp.name === planet.name);
                if (p) setSelectedPlanet(p);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 hover:border-white/30 transition-all text-white text-xs backdrop-blur-sm"
              title={planet.name}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              <span className="hidden lg:inline">{planet.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-4 px-6 py-3 bg-black/40 border-t border-white/10 z-10">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
        >
          {isPlaying ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span className="text-sm">Pause</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              <span className="text-sm">Play</span>
            </>
          )}
        </button>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Speed:</span>
          <div className="flex gap-1">
            {speeds.map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  speedMultiplier === speed
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
