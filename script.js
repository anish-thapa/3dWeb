// Three.js animated background with GLTF Model (Sword)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30); // Adjust camera position for better view

// GLTF Loader for 3D Sword Model
const loader = new THREE.GLTFLoader();
loader.load('models/sword.glb', function (gltf) {
    const sword = gltf.scene;
    sword.scale.set(10, 10, 10);  // Increase size for visibility
    sword.position.set(0, -5, 0); // Position the sword in the center
    scene.add(sword);

    // Initial rotation speed
    let swordRotationSpeed = 0.0001;
    const MAX_SWORD_ROTATION_SPEED = 0.2; // Define maximum speed for sword rotation

    // Animation loop to rotate the sword and move stars
    function animate() {
        requestAnimationFrame(animate);
        
        // Gradually increase sword rotation speed up to the maximum speed
        if (swordRotationSpeed < MAX_SWORD_ROTATION_SPEED) {
            swordRotationSpeed += 0.0001; // Increase speed continuously
        }
        
        // Rotate the sword around its Y-axis
        sword.rotation.y += swordRotationSpeed; 
        
        // Move stars towards the center with controlled speed
        stars.forEach(star => {
            star.position.z += star.speed; // Move star towards the camera
            
            // Gradually increase speed but stop at MAX_STAR_SPEED
            if (star.speed < MAX_STAR_SPEED) {
                star.speed += 0.0001; // Increase speed continuously
            }
            
            // Reset position if the star goes beyond a certain limit
            if (star.position.z > 30) {
                star.position.z = -30; // Reset position when it goes off-screen
            }
        });

        renderer.render(scene, camera);
    }
    animate();
}, undefined, function (error) {
    console.error('An error occurred while loading the model:', error);
});

// Lighting for the scene
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Background Stars
const stars = []; // Array to hold star objects
const MAX_STAR_SPEED = 5.0; // Set your desired max speed here

function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Change stars to gray
    const star = new THREE.Mesh(geometry, material);

    // Randomly position stars in the scene
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    star.position.z = THREE.MathUtils.randFloatSpread(200); // Set initial z position
    star.speed = 0.1; // Initialize speed for each star
    scene.add(star);
    stars.push(star); // Store star in the stars array
}

// Create 200 stars
for (let i = 0; i < 200; i++) {
    addStar();
}

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
