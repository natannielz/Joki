import { SEED_STORIES, SPRINT } from './data.js';

const KEY = 'sprint-board:v2';

export function loadStories() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // storage blocked or corrupt: fall back to the seed
  }
  return SEED_STORIES;
}

export function saveStories(stories) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stories));
  } catch (e) {
    // private mode or full storage: the board still works for this visit
  }
}

function nextId(stories) {
  const max = stories.reduce((m, s) => Math.max(m, Number(s.id.split('-')[1]) || 0), 0);
  return `TE-${max + 1}`;
}

function withStatus(story, status) {
  if (story.status === status) return story;
  const next = { ...story, status };
  if (status === 'done') next.doneDay = story.doneDay ?? SPRINT.today;
  else delete next.doneDay;
  return next;
}

export function reducer(stories, action) {
  switch (action.type) {
    case 'move':
      return stories.map((s) => (s.id === action.id ? withStatus(s, action.status) : s));
    case 'save': {
      const { story } = action;
      if (!story.id) return [...stories, withStatus({ ...story, id: nextId(stories), status: 'todo' }, story.status)];
      return stories.map((s) => (s.id === story.id ? withStatus({ ...s, ...story, status: s.status }, story.status) : s));
    }
    case 'delete':
      return stories.filter((s) => s.id !== action.id);
    case 'reset':
      return SEED_STORIES;
    default:
      return stories;
  }
}

// Remaining points at the end of each sprint day, up to today
export function burndown(stories) {
  const total = stories.reduce((sum, s) => sum + s.points, 0);
  const actual = [];
  for (let day = 0; day <= SPRINT.today; day++) {
    const done = stories
      .filter((s) => s.status === 'done' && (s.doneDay ?? SPRINT.today) <= day)
      .reduce((sum, s) => sum + s.points, 0);
    actual.push(total - done);
  }
  const ideal = Array.from({ length: SPRINT.days + 1 }, (_, d) => total - (total * d) / SPRINT.days);
  return { total, actual, ideal };
}
