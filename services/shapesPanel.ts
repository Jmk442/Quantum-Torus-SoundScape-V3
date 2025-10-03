// FIX: This file was a placeholder. Provided content to resolve errors.
export interface ShapeInfo {
    id: string;
    name: string;
    type: '2D' | '3D';
}

export const shapes: ShapeInfo[] = [
    { id: 'triangle_3', name: 'Triangle', type: '2D' },
    { id: 'square_4', name: 'Square', type: '2D' },
    { id: 'pentagon_5', name: 'Pentagon', type: '2D' },
    { id: 'hexagon_6', name: 'Hexagon', type: '2D' },
    { id: 'heptagon_7', name: 'Heptagon', type: '2D' },
    { id: 'octagon_8', name: 'Octagon', type: '2D' },
    { id: 'decagon_10', name: 'Decagon', type: '2D' },
    { id: 'dodecagon_12', name: 'Dodecagon', type: '2D' },
    { id: 'tetrahedron', name: 'Tetrahedron', type: '3D' },
    { id: 'cube', name: 'Cube', type: '3D' },
    { id: 'octahedron', name: 'Octahedron', type: '3D' },
    { id: 'dodecahedron', name: 'Dodecahedron', type: '3D' },
    { id: 'icosahedron', name: 'Icosahedron', type: '3D' },
];
