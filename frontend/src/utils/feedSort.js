const timeToMinutes = (time) => {
  if (!time) return Number.MAX_SAFE_INTEGER;

  const lower = time.toLowerCase();

  if (lower.includes("just now")) return 0;

  const value = parseInt(lower);

  if (lower.includes("minute")) return value;
  if (lower.includes("hour")) return value * 60;
  if (lower.includes("day")) return value * 60 * 24;

  return Number.MAX_SAFE_INTEGER;
};

export const sortByLatest = (posts) => {
  return [...posts].sort(
    (a, b) => timeToMinutes(a.user?.time) - timeToMinutes(b.user?.time)
  );
};

export const sortByLikes = (posts) => {
  return [...posts].sort((a, b) => b.likes - a.likes);
};


