// Default composition matched to the owner's approved lobby screenshot.
// Positions are local to the lobby; shelf contents and caps retain their supporting parents.
export const lobbyLayout = {
  'yellow-manga-poster': [-7.911, 8.086, -0.105],
  'spain-swag-poster': [-4.221, 8.075, -0.105],
  'green-skater-poster': [-2.088, 8.053, -0.105],
  'kazakhstan-swag-poster': [-0.598, 8.064, -0.105],
  'nihao-cats-poster': [1.954, 7.673, -0.105],
  'pink-group-poster': [3.685, 7.416, -0.105],
  'peace-kitten-poster': [5.149, 7.852, -0.105],
  'stairs-scene-poster': [6.839, 8.053, -0.105],
  'shinjuku-poster': [8.871, 8.064, -0.105],
  'band-poster': [-3.048, 6.270, -0.105],
  'lana-poster': [-0.894, 6.832, -0.105],
  'demon-days-poster': [0.701, 7.102, -0.105],
  'orda-poster': [2.177, 6.079, -0.105],
  'leather-portrait-poster': [3.589, 5.345, -0.105],
  'blue-night-poster': [6.712, 6.821, -0.105],
  'red-manga-poster': [10.721, 6.237, -0.105],
  'new-york-poster': [8.533, 4.530, -0.105],
  'los-angeles-poster': [10.433, 3.597, -0.105],
  'igor-poster': [-2.608, 4.087, -0.105],
  'rio-poster': [-2.744, 2.374, -0.105],
  'lock-in-cat-poster': [3.833, 3.415, -0.105],
  'turquoise-lace-poster': [-9.521, 4.609, -0.105],
  'kazakh-ornament-poster': [-9.568, 6.135, -0.105],
  'new-york-metal-plate': [8.949, 6.548, -0.090],
  'round-guitar-sign': [-3.205, 0.760, -0.070],
  'chalk-wall-quote': [2.135, 2.140, -0.153],
  'wall-skateboard': [2.625, 4.292, 0.100],
  'stacked-floor-books': [3.298, 0, 0.785],
  'half-rolled-blond-poster': [-2.824, 0.03, 1.128],
  'right-display-shelf': [9.3, 0, 0.42],
}

export function applyLobbyLayout(root) {
  for (const [name,position] of Object.entries(lobbyLayout)) {
    root.getObjectByName(name)?.position.fromArray(position)
  }
}
