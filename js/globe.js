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
                'North America': 0xFF6B6B,  // Coral Red
                'South America': 0x4ECDC4,  // Turquoise
                'Europe': 0x45B7D1,        // Sky Blue
                'Africa': 0xFFBE0B,        // Golden Yellow
                'Asia': 0x96CEB4,          // Sage Green
                'Oceania': 0xFF9F1C,       // Orange
                'Antarctica': 0xFAFAFA     // White
            },
            light: {
                'North America': 0xE63946,  // Darker Red
                'South America': 0x2A9D8F,  // Darker Turquoise
                'Europe': 0x1D7A99,        // Darker Blue
                'Africa': 0xE6A100,        // Darker Yellow
                'Asia': 0x588B7E,          // Darker Green
                'Oceania': 0xE67E00,       // Darker Orange
                'Antarctica': 0xE0E0E0     // Light Gray
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
        this.camera.position.z = 300;
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
        this.controls.minDistance = 200;
        this.controls.maxDistance = 400;
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
        const sphereGeometry = new THREE.SphereGeometry(100, 64, 64);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8,
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
            const data = await response.json();
            
            // Create a group for all countries
            const countriesGroup = new THREE.Group();
            
            data.features.forEach(feature => {
                if (feature.geometry) {
                    const countryMesh = drawThreeGeo({
                        json: feature,
                        radius: 100,
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
        let continent;
        // Simplified continent determination
        if (lat > 60) continent = 'North America';
        else if (lat < -60) continent = 'Antarctica';
        // Northern Hemisphere
        else if (lat > 0) {
            if (lon < -20) continent = 'North America';
            else if (lon < 65) continent = 'Europe';
            else continent = 'Asia';
        }
        // Southern Hemisphere
        else {
            if (lon < -65) continent = 'South America';
            else if (lon < 50) continent = 'Africa';
            else continent = 'Oceania';
        }
        
        return this.continentColors[this.currentTheme][continent];
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
