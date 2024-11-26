import * as THREE from 'three';

export function drawThreeGeo(options) {
    const { json, radius = 200, materialOptions = {} } = options;

    if (!json || !json.geometry) return null;

    const defaultMaterialOptions = {
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        wireframe: false
    };

    const material = new THREE.MeshPhongMaterial({
        ...defaultMaterialOptions,
        ...materialOptions
    });

    const meshes = [];

    switch (json.geometry.type) {
        case 'Polygon':
            const polygonMesh = createPolygonMesh(json.geometry.coordinates[0], radius, material);
            if (polygonMesh) meshes.push(polygonMesh);
            break;
        case 'MultiPolygon':
            json.geometry.coordinates.forEach(polygon => {
                const mesh = createPolygonMesh(polygon[0], radius, material);
                if (mesh) meshes.push(mesh);
            });
            break;
    }

    return meshes.length === 1 ? meshes[0] : meshes;
}

function createPolygonMesh(coordinates, radius, material) {
    if (!coordinates || coordinates.length < 3) return null;

    const vertices = [];
    const indices = [];
    const uvs = [];

    coordinates.forEach((coord, index) => {
        const [lon, lat] = coord;
        const point = latLonToPoint(lat, lon, radius);
        vertices.push(point.x, point.y, point.z);
        
        // Simple UV mapping
        const u = (lon + 180) / 360;
        const v = (lat + 90) / 180;
        uvs.push(u, v);

        // Create triangles (except for the last two vertices)
        if (index > 1) {
            indices.push(0, index - 1, index);
        }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
}

function latLonToPoint(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (180 + lon) * Math.PI / 180;

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}
