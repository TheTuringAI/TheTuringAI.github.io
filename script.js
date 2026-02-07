const flowerEmojis = ['🌸', '🌺', '🌼', '🌻', '🌷', '🌹', '💐', '🏵️'];
const numberOfFlowers = 200;
let blowDistance = 150; // Distance at which flowers start to blow away
let blowForceMultiplier = 5;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isAnimating = true;

// Store flower positions
const flowerPositions = new Map();
let clearedFlowers = 0;

// Create flowers with even distribution using Poisson disk sampling
function createFlowers() {
    const minDistance = 80; // Minimum distance between flowers
    const attempts = 30; // Attempts to place each flower
    const positions = [];
    
    // Start with a random position
    positions.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
    });
    
    // Generate evenly distributed positions
    while (positions.length < numberOfFlowers) {
        const randomIndex = Math.floor(Math.random() * positions.length);
        const basePos = positions[randomIndex];
        let placed = false;
        
        for (let attempt = 0; attempt < attempts; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = minDistance + Math.random() * minDistance;
            const x = basePos.x + Math.cos(angle) * distance;
            const y = basePos.y + Math.sin(angle) * distance;
            
            // Check if position is valid
            if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
                continue;
            }
            
            // Check distance to all other flowers
            let valid = true;
            for (const pos of positions) {
                const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (dist < minDistance) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                positions.push({ x, y });
                placed = true;
                break;
            }
        }
        
        if (!placed && positions.length < numberOfFlowers) {
            // Fallback: add random position if no valid position found
            positions.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
            });
        }
    }
    
    // Create flower elements
    positions.forEach((pos, i) => {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
        flower.dataset.id = i;
        
        const initialRotation = Math.random() * 360;
        // Use transform only for positioning to avoid conflicts
        flower.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${initialRotation}deg)`;
        
        // Store original position and current offset
        flowerPositions.set(flower, {
            originalX: pos.x,
            originalY: pos.y,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
            rotation: initialRotation,
            cleared: false
        });
        
        document.body.appendChild(flower);
    });
    
    updateCounter();
}

// Create custom cursor
const cursor = document.createElement('div');
cursor.id = 'cursor';
cursor.textContent = '💨';
document.body.appendChild(cursor);

// Track mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// Update flower positions based on mouse proximity (optimized with requestAnimationFrame)
function updateFlowerPositions() {
    if (!isAnimating) return;
    
    const flowers = document.querySelectorAll('.flower');
    const friction = 0.92; // Friction coefficient for sliding effect
    const minVelocity = 0.1; // Minimum velocity threshold (increased to prevent premature stopping)
    
    flowers.forEach(flower => {
        const pos = flowerPositions.get(flower);
        if (!pos) return;
        
        // Calculate current position (original + offset)
        const currentX = pos.originalX + pos.offsetX;
        const currentY = pos.originalY + pos.offsetY;
        
        // Calculate distance from mouse to flower
        const distance = Math.sqrt(
            Math.pow(mouseX - currentX, 2) + 
            Math.pow(mouseY - currentY, 2)
        );
        
        let isBeingPushed = false;
        
        if (distance < blowDistance) {
            isBeingPushed = true;
            
            // Calculate blow direction (away from mouse)
            const angle = Math.atan2(currentY - mouseY, currentX - mouseX);
            
            // Calculate push force (stronger when closer)
            const pushForce = (blowDistance - distance) / blowDistance * 5 * blowForceMultiplier;
            
            // Add some randomness to the blow direction
            const randomAngle = angle + (Math.random() - 0.5) * 0.3;
            
            // Apply force to velocity instead of directly to position
            pos.velocityX += Math.cos(randomAngle) * pushForce;
            pos.velocityY += Math.sin(randomAngle) * pushForce;
            
            // Update rotation
            pos.rotation += pushForce * 2;
            
            // Create particle effect
            if (Math.random() > 0.9) {
                createParticle(currentX, currentY);
            }
            
            // Reset cleared flag if flower is being interacted with again
            if (pos.cleared) {
                pos.cleared = false;
                clearedFlowers--;
                updateCounter();
                updateProgress();
            }
        }
        
        // Only apply friction when not being actively pushed
        if (!isBeingPushed) {
            pos.velocityX *= friction;
            pos.velocityY *= friction;
            
            // Stop very small movements to save resources (only when not being pushed)
            if (Math.abs(pos.velocityX) < minVelocity) pos.velocityX = 0;
            if (Math.abs(pos.velocityY) < minVelocity) pos.velocityY = 0;
        }
        
        // Update position based on velocity
        pos.offsetX += pos.velocityX;
        pos.offsetY += pos.velocityY;
        
        // Apply new position using transform for better performance (original + offset)
        const finalX = pos.originalX + pos.offsetX;
        const finalY = pos.originalY + pos.offsetY;
        flower.style.transform = `translate(${finalX}px, ${finalY}px) rotate(${pos.rotation}deg)`;
        
        // Check if flower is pushed off screen or far enough to be considered cleared
        const isOffScreen = finalX < 0 || finalX > window.innerWidth || 
                           finalY < 0 || finalY > window.innerHeight;
        
        if (isOffScreen && !pos.cleared) {
            pos.cleared = true;
            clearedFlowers++;
            updateCounter();
            updateProgress();
        }
    });
    
    // Update No button if it exists
    if (noButtonPos && noButtonPos.element) {
        const friction = 0.92;
        const minVelocity = 0.1;
        
        const currentX = noButtonPos.originalX + noButtonPos.offsetX;
        const currentY = noButtonPos.originalY + noButtonPos.offsetY;
        
        const distance = Math.sqrt(
            Math.pow(mouseX - currentX, 2) + 
            Math.pow(mouseY - currentY, 2)
        );
        
        let isBeingPushed = false;
        
        if (distance < blowDistance) {
            isBeingPushed = true;
            
            const angle = Math.atan2(currentY - mouseY, currentX - mouseX);
            const pushForce = (blowDistance - distance) / blowDistance * 10 * blowForceMultiplier;
            const randomAngle = angle + (Math.random() - 0.5) * 0.3;
            
            noButtonPos.velocityX += Math.cos(randomAngle) * pushForce;
            noButtonPos.velocityY += Math.sin(randomAngle) * pushForce;
            noButtonPos.rotation += pushForce * 2;
            
            if (Math.random() > 0.9) {
                createParticle(currentX, currentY);
            }
        }
        
        if (!isBeingPushed) {
            noButtonPos.velocityX *= friction;
            noButtonPos.velocityY *= friction;
            
            if (Math.abs(noButtonPos.velocityX) < minVelocity) noButtonPos.velocityX = 0;
            if (Math.abs(noButtonPos.velocityY) < minVelocity) noButtonPos.velocityY = 0;
        }
        
        noButtonPos.offsetX += noButtonPos.velocityX;
        noButtonPos.offsetY += noButtonPos.velocityY;
        
        const finalX = noButtonPos.originalX + noButtonPos.offsetX;
        const finalY = noButtonPos.originalY + noButtonPos.offsetY;
        noButtonPos.element.style.transform = `translate(${noButtonPos.offsetX}px, ${noButtonPos.offsetY}px) rotate(${noButtonPos.rotation}deg)`;
    }
    
    requestAnimationFrame(updateFlowerPositions);
}

// Create particle effect
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = ['✨', '💫', '⭐'][Math.floor(Math.random() * 3)];
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1000);
}

// Create floating hearts occasionally
function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = Math.random() > 0.5 ? '❤️' : '💕';
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.bottom = '-50px';
    heart.style.animationDuration = (3 + Math.random() * 4) + 's';
    
    document.getElementById('hearts-container').appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 8000);
}

// Check if message is mostly visible
function checkMessageVisibility() {
    const messageElement = document.getElementById('message');
    const messageRect = messageElement.getBoundingClientRect();
    
    let flowersInMessageArea = 0;
    const flowers = document.querySelectorAll('.flower');
    
    flowers.forEach(flower => {
        const rect = flower.getBoundingClientRect();
        const flowerX = rect.left + rect.width / 2;
        const flowerY = rect.top + rect.height / 2;
        
        // Check if flower is within message area
        if (flowerX > messageRect.left && flowerX < messageRect.right &&
            flowerY > messageRect.top && flowerY < messageRect.bottom) {
            flowersInMessageArea++;
        }
    });
    
    // If less than 10% of flowers are in message area, trigger celebration
    if (flowersInMessageArea < numberOfFlowers * 0.1) {
        // Create celebration effect
        for (let i = 0; i < 30; i++) {
            setTimeout(() => createHeart(), i * 100);
        }
    }
}

// Monitor for cleared message area
let celebrationTriggered = false;
setInterval(() => {
    if (!celebrationTriggered) {
        checkMessageVisibility();
    }
}, 2000);

// Create hearts periodically
setInterval(() => {
    if (Math.random() > 0.7) {
        createHeart();
    }
}, 500);

// Update counter display
function updateCounter() {
    const counter = document.getElementById('counter');
    if (counter) {
        counter.textContent = `Flowers cleared: ${clearedFlowers} / ${numberOfFlowers}`;
    }
}

// Update progress bar
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        const percentage = (clearedFlowers / numberOfFlowers) * 100;
        progressFill.style.width = percentage + '%';
        
        // Trigger celebration when 80% cleared
        if (percentage >= 80 && !celebrationTriggered) {
            celebrationTriggered = true;
            triggerCelebration();
        }
    }
}

// Track No button position
let noButtonPos = null;

// Trigger celebration with confetti
function triggerCelebration() {
    // Create lots of hearts
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createHeart(), i * 50);
    }
    
    // Create confetti
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'particle';
            confetti.textContent = ['🎉', '🎊', '💖', '💕', '❤️'][Math.floor(Math.random() * 5)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-50px';
            confetti.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
            confetti.style.setProperty('--ty', window.innerHeight + 100 + 'px');
            confetti.style.animation = 'particleFloat 5s ease-out forwards';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }, i * 20);
    }
    
    // Show answer buttons after a delay
    setTimeout(() => {
        showAnswerButtons();
    }, 2000);
}

// Show Yes/No buttons
function showAnswerButtons() {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'answer-buttons';
    buttonsContainer.style.display = 'flex';
    
    const yesBtn = document.createElement('button');
    yesBtn.id = 'yes-btn';
    yesBtn.className = 'answer-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.top = '80%';
    yesBtn.left = '40%';
    yesBtn.onclick = () => {
        handleYesClick();
    };
    
    const noBtn = document.createElement('button');
    noBtn.id = 'no-btn';
    noBtn.className = 'answer-btn';
    noBtn.textContent = 'No';
    
    buttonsContainer.appendChild(yesBtn);
    buttonsContainer.appendChild(noBtn);
    document.body.appendChild(buttonsContainer);
    
    // Initialize No button position after it's rendered
    setTimeout(() => {
        const rect = noBtn.getBoundingClientRect();
        noButtonPos = {
            originalX: rect.left + 2*rect.width / 3,
            originalY: rect.top + 8*rect.height / 10,
            offsetX: 0,
            offsetY: 0,
            velocityX: 0,
            velocityY: 0,
            rotation: 0,
            element: noBtn
        };
    }, 100);
}

// Handle Yes button click
function handleYesClick() {
    // Create massive heart explosion
    for (let i = 0; i < 100; i++) {
        setTimeout(() => createHeart(), i * 20);
    }
    
    // Hide buttons
    const buttons = document.getElementById('answer-buttons');
    if (buttons) {
        buttons.remove();
    }
    
    // Show thank you message
    const thankYou = document.createElement('div');
    thankYou.style.cssText = `
        position: fixed;
        top: 75%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 50px;
        color: #ff1493;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        animation: fadeIn 1s ease-in-out forwards;
    `;
    thankYou.textContent = '🎉 Yay moi aussi je t\'aime 💖';
    document.body.appendChild(thankYou);
}

// Create progress UI
function createProgressUI() {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'progress-container';
    progressDiv.innerHTML = `
        <div id="counter">Flowers cleared: 0 / ${numberOfFlowers}</div>
        <div id="progress-bar">
            <div id="progress-fill"></div>
        </div>
    `;
    document.body.appendChild(progressDiv);
}

// Initialize
createProgressUI();
createFlowers();
updateFlowerPositions(); // Start animation loop

// Add touch support for mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
}, { passive: false });


