import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import getStarfield from './src/getStarfield.js';
import { drawThreeGeo } from './src/threeGeoJSON.js';

class Globe {
    constructor() {
        this.scene = new THREE.Scene();
        this.container = document.getElementById('globe-container');
        this.canvas = document.getElementById('globe-canvas');
        
        // Define continent colors for both themes
        this.continentColors = {
            dark: {
                'North America': 0x4287f5,  // Bright Blue
                'South America': 0x42f54b,  // Bright Green
                'Europe': 0xf542cb,         // Pink
                'Africa': 0xf5a142,         // Orange
                'Asia': 0xf54242,           // Red
                'Oceania': 0x42f5f5,        // Cyan
                'Antarctica': 0xffffff      // White
            },
            light: {
                'North America': 0x2b5aa3,  // Darker Blue
                'South America': 0x2ba332,  // Darker Green
                'Europe': 0xa32b89,         // Darker Pink
                'Africa': 0xa36b2b,         // Darker Orange
                'Asia': 0xa32b2b,           // Darker Red
                'Oceania': 0x2ba3a3,        // Darker Cyan
                'Antarctica': 0xe0e0e0      // Light Gray
            }
        };
        
        this.currentTheme = 'dark';  // Default theme
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createGlobe();
        this.setupControls();
        
        this.init();
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Listen for theme changes
        this.setupThemeListener();
    }

    async init() {
        try {
            await this.loadCountries();
            this.animate();
        } catch (error) {
            console.error('Error initializing globe:', error);
        }
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
        this.camera.position.z = 250;
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(100, 100, 100);
        this.scene.add(pointLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.minDistance = 150;
        this.controls.maxDistance = 350;
    }

    setupThemeListener() {
        // Watch for changes in the color scheme
        window.matchMedia('(prefers-color-scheme: light)').addListener((e) => {
            this.currentTheme = e.matches ? 'light' : 'dark';
            this.updateTheme();
        });
        
        // Set initial theme
        this.currentTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        this.updateTheme();
    }

    updateTheme() {
        // Update wireframe color
        if (this.globe) {
            const wireframe = this.globe.children.find(child => child instanceof THREE.LineSegments);
            if (wireframe) {
                wireframe.material.color.setHex(this.currentTheme === 'light' ? 0x2A9D8F : 0x4ECDC4);
                wireframe.material.opacity = this.currentTheme === 'light' ? 0.2 : 0.1;
            }
        }
        
        // Update globe material
        if (this.globe) {
            this.globe.material.color.setHex(this.currentTheme === 'light' ? 0xFFFFFF : 0x000000);
            this.globe.material.opacity = this.currentTheme === 'light' ? 0.9 : 0.8;
        }
        
        // Update countries colors
        if (this.globe.children.length > 1) {
            const countriesGroup = this.globe.children[1];
            countriesGroup.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const lat = child.userData.lat || 0;
                    const lon = child.userData.lon || 0;
                    child.material.color.setHex(this.getColorByCoordinate(lat, lon));
                    child.material.opacity = this.currentTheme === 'light' ? 0.9 : 0.8;
                }
            });
        }
        
        // Update ambient light intensity
        this.scene.traverse((child) => {
            if (child instanceof THREE.AmbientLight) {
                child.intensity = this.currentTheme === 'light' ? 0.8 : 0.6;
            }
            if (child instanceof THREE.PointLight) {
                child.intensity = this.currentTheme === 'light' ? 1.2 : 1.0;
            }
        });
    }

    createGlobe() {
        // Create Earth sphere
        const sphereGeometry = new THREE.SphereGeometry(80, 64, 64);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
        });
        this.globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.scene.add(this.globe);

        // Add wireframe
        const wireframe = new THREE.WireframeGeometry(sphereGeometry);
        const line = new THREE.LineSegments(wireframe);
        line.material.color.setHex(0x4ECDC4);
        line.material.transparent = true;
        line.material.opacity = 0.1;
        this.globe.add(line);

        // Add starfield
        const stars = getStarfield({ numStars: 5000, fog: false });
        this.scene.add(stars);
        this.stars = stars;
    }

    async loadCountries() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched country data:', data);
            
            // Create a group for all countries
            const countriesGroup = new THREE.Group();
            
            data.features.forEach(feature => {
                if (feature.geometry) {
                    const countryMesh = drawThreeGeo({
                        json: feature,
                        radius: 80,
                        shape: 'sphere',
                        materialOptions: {
                            color: this.getColorByCoordinate(
                                feature.properties.LABEL_Y || 0,
                                feature.properties.LABEL_X || 0
                            ),
                            transparent: true,
                            opacity: 0.8,
                            side: THREE.DoubleSide,
                            wireframe: false
                        }
                    });
                    
                    if (countryMesh) {
                        if (Array.isArray(countryMesh)) {
                            countryMesh.forEach(mesh => countriesGroup.add(mesh));
                        } else {
                            countriesGroup.add(countryMesh);
                        }
                    }
                }
            });
            this.globe.add(countriesGroup);
        } catch (error) {
            console.error('Error loading countries:', error);
        }
    }

    getColorByCoordinate(lat, lon) {
        // Determine continent based on coordinates
        if (lat >= 60) return this.continentColors[this.currentTheme]['North America']; // Arctic
        if (lat <= -60) return this.continentColors[this.currentTheme]['Antarctica']; // Antarctica
        
        if (lon >= -170 && lon <= -30) { // Americas
            if (lat > 15) return this.continentColors[this.currentTheme]['North America'];
            return this.continentColors[this.currentTheme]['South America'];
        }
        
        if (lon >= -30 && lon <= 60) { // Europe and Africa
            if (lat > 35) return this.continentColors[this.currentTheme]['Europe'];
            return this.continentColors[this.currentTheme]['Africa'];
        }
        
        if (lon > 60 && lon <= 145) { // Asia
            if (lat > -10) return this.continentColors[this.currentTheme]['Asia'];
            return this.continentColors[this.currentTheme]['Oceania'];
        }
        
        if (lon > 145) { // Pacific/Oceania
            if (lat > 0) return this.continentColors[this.currentTheme]['Asia'];
            return this.continentColors[this.currentTheme]['Oceania'];
        }
        
        return this.continentColors[this.currentTheme]['Oceania']; // Default
    }

    onWindowResize() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Rotate the globe
        if (this.globe) {
            this.globe.rotation.y += 0.001;
        }
        
        // Slowly rotate starfield in opposite direction
        if (this.stars) {
            this.stars.rotation.y -= 0.0002;
        }
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the globe
new Globe();
