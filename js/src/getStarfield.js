import * as THREE from 'three';

export default function getStarfield({ numStars = 5000, fog = false } = {}) {
    const vertices = [];
    const sizes = [];
    const colors = [];

    // Define star colors
    const starColors = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0xaaaaff), // Bluish
        new THREE.Color(0xffffaa), // Yellowish
    ];

    for (let i = 0; i < numStars; i++) {
        // Create stars in a spherical distribution
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const distance = 300 + Math.random() * 700; // Distribute between 300 and 1000 units

        const x = distance * Math.sin(phi) * Math.cos(theta);
        const y = distance * Math.sin(phi) * Math.sin(theta);
        const z = distance * Math.cos(phi);

        vertices.push(x, y, z);

        // Random star size between 0.5 and 2
        sizes.push(0.5 + Math.random() * 1.5);

        // Random star color
        const color = starColors[Math.floor(Math.random() * starColors.length)];
        colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        fog: fog
    });

    return new THREE.Points(geometry, material);
}
