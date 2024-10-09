// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg'), antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 5; // Set the camera position

// Create water surface
const waterGeometry = new THREE.PlaneGeometry(100, 100);
const waterMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff, // Water color
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
});
const waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);
waterSurface.rotation.x = - Math.PI / 2; // Rotate to horizontal
scene.add(waterSurface);

// Create fish geometry (using spheres as simple fish shapes)
const fishCount = 100;
const fishes = new THREE.BufferGeometry();
const fishPositions = new Float32Array(fishCount * 3);
const fishVelocities = new Float32Array(fishCount * 3); // Velocities for bouncing behavior
const fishSizes = new Float32Array(fishCount); // Sizes of the fish
const fishColors = new Float32Array(fishCount * 3); // Colors for fish

for (let i = 0; i < fishCount; i++) {
    fishPositions[i * 3] = (Math.random() - 0.5) * 20; // Random X position
    fishPositions[i * 3 + 1] = Math.random() * 5; // Random Y position
    fishPositions[i * 3 + 2] = (Math.random() - 0.5) * 20; // Random Z position
    
    // Initialize random velocities
    fishVelocities[i * 3] = (Math.random() - 0.5) * 0.05; // Random X velocity
    fishVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05; // Random Y velocity
    fishVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05; // Random Z velocity

    fishSizes[i] = Math.random() * 0.2 + 0.1; // Random size for fish

    // Assign random colors for fish (RGB)
    fishColors[i * 3] = Math.random();     // Red
    fishColors[i * 3 + 1] = Math.random(); // Green
    fishColors[i * 3 + 2] = Math.random(); // Blue
}

fishes.setAttribute('position', new THREE.Float32BufferAttribute(fishPositions, 3));
fishes.setAttribute('velocity', new THREE.Float32BufferAttribute(fishVelocities, 3));
fishes.setAttribute('size', new THREE.Float32BufferAttribute(fishSizes, 1));
fishes.setAttribute('color', new THREE.Float32BufferAttribute(fishColors, 3)); // Add color attribute

const fishMaterial = new THREE.PointsMaterial({
    size: 0.2, // Size of fish
    vertexColors: true, // Use vertex colors for fish
    sizeAttenuation: true
});

const fishSystem = new THREE.Points(fishes, fishMaterial);
scene.add(fishSystem);

// Create rain effect
const rainCount = 2000; // Increased number of raindrops for a denser effect
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = new Float32Array(rainCount * 3); // Velocities for rain

for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 50; // Random X position
    rainPositions[i * 3 + 1] = Math.random() * 50 + 20; // Random Y position (start above the visible area)
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 50; // Random Z position

    rainVelocities[i * 3] = 0; // No horizontal movement for raindrops
    rainVelocities[i * 3 + 1] = -Math.random() * 0.1 - 0.1; // Rain falls downwards
    rainVelocities[i * 3 + 2] = 0; // No Z movement for raindrops
}

rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainPositions, 3));
const rainMaterial = new THREE.PointsMaterial({ color: 0x0000ff, size: 0.05, sizeAttenuation: true });
const rainSystem = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rainSystem);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move fish and implement bouncing behavior
    const fishPositions = fishSystem.geometry.attributes.position.array;
    const fishVelocities = fishSystem.geometry.attributes.velocity.array;
    const fishSizes = fishSystem.geometry.attributes.size.array; // Access fish sizes

    // Calculate screen boundaries
    const boundaryX = window.innerWidth / 100;  // Width boundary for X
    const boundaryY = window.innerHeight / 100; // Height boundary for Y

    for (let i = 0; i < fishCount; i++) {
        // Update fish positions based on velocity
        fishPositions[i * 3] += fishVelocities[i * 3]; // X
        fishPositions[i * 3 + 1] += fishVelocities[i * 3 + 1]; // Y
        fishPositions[i * 3 + 2] += fishVelocities[i * 3 + 2]; // Z

        // Bounce off the walls
        if (fishPositions[i * 3] < -boundaryX || fishPositions[i * 3] > boundaryX) {
            fishVelocities[i * 3] *= -1; // Reverse X velocity
        }
        // Allow fish to go to the bottom (0) and bounce back
        if (fishPositions[i * 3 + 1] < 0 || fishPositions[i * 3 + 1] > boundaryY) {
            fishVelocities[i * 3 + 1] *= -1; // Reverse Y velocity
        }
        if (fishPositions[i * 3 + 2] < -boundaryX || fishPositions[i * 3 + 2] > boundaryX) {
            fishVelocities[i * 3 + 2] *= -1; // Reverse Z velocity
        }

        // Scale fish based on distance to camera
        const distanceToCamera = camera.position.z - fishPositions[i * 3 + 1]; // Y-axis distance
        const scale = Math.max(0.1, Math.min(1.0, 1 - (distanceToCamera / 10))); // Scale based on distance
        fishSizes[i] = scale * 0.2; // Set the size based on distance
    }

    fishSystem.geometry.attributes.position.needsUpdate = true; // Update position attribute
    fishSystem.geometry.attributes.velocity.needsUpdate = true; // Update the velocity attribute
    fishSystem.geometry.attributes.size.needsUpdate = true; // Update the size attribute

    // Move rain down
    const rainPositions = rainSystem.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3 + 1] += rainVelocities[i * 3 + 1]; // Move down
        if (rainPositions[i * 3 + 1] < 0) {
            rainPositions[i * 3 + 1] = Math.random() * 50 + 20; // Reset to the top
        }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true; // Update rain position

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

animate();
