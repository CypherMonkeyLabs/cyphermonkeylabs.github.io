/** Solar layout used by the 2D fallback and by scale tests. */

export const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export function solar(labs, cats) {
  const out = [];
  let ring = 0;
  const sorted = [...cats].sort((a, b) => a.order - b.order);
  for (const cat of sorted) {
    const group = labs
      .filter((lab) => lab.category === cat.id)
      .sort((a, b) => a.order - b.order);
    for (let i = 0; i < group.length; i += 4, ring += 1) {
      const slice = group.slice(i, i + 4);
      const r = 10 + ring * 5.5;
      slice.forEach((lab, k) => {
        const a0 = (2 * Math.PI * k) / slice.length + ring * GOLDEN;
        out.push({
          id: lab.id,
          ring,
          r,
          a0,
          tilt: (ring % 2 ? 1 : -1) * 4 * (Math.PI / 180),
          x: Math.cos(a0) * r,
          y: Math.sin(a0) * r,
        });
      });
    }
  }
  return out;
}

export function minSeparation(placed, radiusOf) {
  let min = Infinity;
  for (let i = 0; i < placed.length; i += 1) {
    for (let j = i + 1; j < placed.length; j += 1) {
      const dx = placed[i].x - placed[j].x;
      const dy = placed[i].y - placed[j].y;
      const dist = Math.hypot(dx, dy);
      const need = 2.5 * Math.max(radiusOf(placed[i]), radiusOf(placed[j]));
      min = Math.min(min, dist / need);
    }
  }
  return min;
}

export function makeFixture(count) {
  const cats = [
    { id: "contact-center", order: 1 },
    { id: "unified-comms", order: 2 },
    { id: "protocols", order: 3 },
    { id: "ai", order: 4 },
    { id: "tools", order: 5 },
  ];
  const labs = [];
  for (let i = 0; i < count; i += 1) {
    labs.push({
      id: `lab-${i}`,
      category: cats[i % cats.length].id,
      order: i,
      scene: { size: 0.8 + (i % 5) * 0.15 },
    });
  }
  return { labs, cats };
}
