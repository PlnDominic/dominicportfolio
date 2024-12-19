import * as THREE from 'three';
import { gsap } from 'gsap';

class Sphere {
    constructor() {
        this.container = document.getElementById('sphere-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Create sphere
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4ECDC4,
            emissive: 0x4ECDC4,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8,
            wireframe: true
        });
        this.sphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.sphere);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4ECDC4, 2);
        pointLight.position.set(2, 2, 2);
        this.scene.add(pointLight);

        // Position camera
        this.camera.position.z = 3;

        // Animation
        this.animate();
        this.setupAnimation();

        // Handle resize
        window.addEventListener('resize', this.onResize.bind(this));
    }

    setupAnimation() {
        // Rotate sphere
        gsap.to(this.sphere.rotation, {
            y: Math.PI * 2,
            duration: 8,
            repeat: -1,
            ease: "none"
        });

        // Pulse effect
        gsap.to(this.sphere.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Initialize sphere
new Sphere();
