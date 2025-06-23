export const DIFFICULTY_OPTIONS = [
  {
    key: 'facil',
    label: 'Fácil',
    score: {
      correct: 10,
      incorrect: 0
    }
  },
  {
    key: 'normal',
    label: 'Normal',
    score: {
      correct: 10,
      incorrect: -5
    }
  },
  {
    key: 'dificil',
    label: 'Difícil',
    score: {
      correct: 10,
      incorrect: -10
    }
  }
];

// Dificultad actual seleccionada (por defecto: fácil)
export let selectedDifficulty = DIFFICULTY_OPTIONS[1];

// Función para cambiar la dificultad seleccionada
export function setDifficulty(optionKey) {
  const found = DIFFICULTY_OPTIONS.find(opt => opt.key === optionKey);
  if (found) selectedDifficulty = found;
}


export const AVAILABLE_PACKS = [
  { key: 'emojis', label: 'Emojis 😀' },
  { key: 'animals', label: 'Animales 🐶' },
  { key: 'hardware', label: 'Hardware 🖥️' },
  { key: 'pokemon', label: 'Pokémon ⚡' }
];
export let selectedPack = 'emojis';

export function setSelectedPack(key) {
  selectedPack = key;
}

export let isMusicMuted = false;

export function toggleMusicMuted() {
  isMusicMuted = !isMusicMuted;
}
