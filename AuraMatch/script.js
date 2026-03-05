document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Set initial theme based on local storage or default dark
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon(currentTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'ph ph-sun';
        } else {
            themeIcon.className = 'ph ph-moon';
        }
    }

    // Mock Data for Profiles
    const profiles = [
        {
            id: 1,
            name: 'Jessica',
            age: 24,
            distance: '1 mile away',
            image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600&h=800',
            tags: ['Coffee', 'Photography', 'Dogs'],
            icebreaker: "Notice you like photography! Canon or Sony?"
        },
        {
            id: 2,
            name: 'Michael',
            age: 27,
            distance: '5 miles away',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600&h=800',
            tags: ['Gym', 'Travel', 'Foodie'],
            icebreaker: "What's the best place you've traveled to recently?"
        },
        {
            id: 3,
            name: 'Sophia',
            age: 23,
            distance: '2 miles away',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600&h=800',
            tags: ['Art', 'Movies', 'Wine'],
            icebreaker: "What's your favorite movie of all time?"
        },
        {
            id: 4,
            name: 'David',
            age: 28,
            distance: '10 miles away',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=800',
            tags: ['Tech', 'Hiking', 'Music'],
            icebreaker: "Hiking sounds fun! Any good trails near here?"
        }
    ];

    const cardStack = document.getElementById('card-stack');
    
    // Render Cards in reverse order so first is on top
    function renderCards() {
        cardStack.innerHTML = '';
        profiles.forEach((profile, index) => {
            const card = document.createElement('div');
            card.className = 'profile-card';
            // Simple visual stacking
            // card.style.zIndex = profiles.length - index;
            // card.style.transform = `scale(${1 - (index * 0.05)}) translateY(${index * 10}px)`;
            
            card.setAttribute('data-id', profile.id);
            card.setAttribute('data-name', profile.name);
            card.setAttribute('data-image', profile.image);
            card.setAttribute('data-icebreaker', profile.icebreaker);
            
            card.innerHTML = `
                <img src="${profile.image}" alt="${profile.name}" class="card-image" draggable="false">
                <div class="card-overlay overlay-like">LIKE</div>
                <div class="card-overlay overlay-nope">NOPE</div>
                <div class="card-info">
                    <h3>${profile.name}, ${profile.age} <i class="ph-fill ph-check-circle verified"></i></h3>
                    <p><i class="ph ph-map-pin"></i> ${profile.distance}</p>
                    <div class="card-tags">
                        ${profile.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            
            // Prepend so the first item in array is appended last (on top of DOM)
            cardStack.prepend(card);
            
            // Initialize Swipe functionality for each card
            initSwipeCard(card, index);
        });
        updateStackVisuals();
    }

    function updateStackVisuals() {
        const remainingCards = Array.from(cardStack.querySelectorAll('.profile-card:not(.swiped)'))
                                 .reverse(); // So index 0 is top
        
        remainingCards.forEach((card, i) => {
            card.style.zIndex = remainingCards.length - i;
            if(i > 0) {
                 card.style.transform = `scale(${1 - (i * 0.04)}) translateY(${i * 12}px)`;
                 card.style.opacity = 1 - (i * 0.2);
            } else {
                 card.style.transform = 'scale(1) translateY(0px) rotate(0deg)';
                 card.style.opacity = 1;
            }
        });
        
        if(remainingCards.length === 0) {
            cardStack.innerHTML = `
                <div style="text-align:center; padding-top:100px; color:var(--text-muted);">
                    <h3><i class="ph ph-magnifying-glass" style="font-size:3rem; margin-bottom:15px; display:block;"></i>No more profiles nearby.</h3>
                    <p>Check back later or expand your distance!</p>
                </div>
            `;
        }
    }

    // Swipe UI Logic
    function initSwipeCard(card, index) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isDragging = false;
        
        const overlayLike = card.querySelector('.overlay-like');
        const overlayNope = card.querySelector('.overlay-nope');

        function onPointerDown(e) {
            // Only allow interaction if it's the top card
            const topCard = Array.from(cardStack.querySelectorAll('.profile-card:not(.swiped)')).pop();
            if(card !== topCard) return;

            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            startY = e.clientY || e.touches[0].clientY;
            card.style.transition = 'none';
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            
            e.preventDefault(); // Prevent scrolling while swiping
            
            const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            
            currentX = x - startX;
            currentY = y - startY;

            // Rotation is proportional to amount moved
            const rotate = currentX * 0.05;

            card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;

            // Opacity of overlays
            if (currentX > 0) {
                overlayLike.style.opacity = Math.min(currentX / 100, 1);
                overlayNope.style.opacity = 0;
            } else {
                overlayNope.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
                overlayLike.style.opacity = 0;
            }
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;

            const swipeThreshold = 100;

            card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';

            if (currentX > swipeThreshold) {
                // Swiped Right
                handleObjectSwipe(card, 'right');
            } else if (currentX < -swipeThreshold) {
                // Swiped Left
                handleObjectSwipe(card, 'left');
            } else {
                // Snap Back
                card.style.transform = 'translate(0px, 0px) rotate(0deg)';
                overlayLike.style.opacity = 0;
                overlayNope.style.opacity = 0;
            }
            
            currentX = 0;
            currentY = 0;
        }

        // Mouse Events
        card.addEventListener('mousedown', onPointerDown);
        document.addEventListener('mousemove', onPointerMove, { passive: false });
        document.addEventListener('mouseup', onPointerUp);

        // Touch Events
        card.addEventListener('touchstart', onPointerDown, { passive: true });
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
    }

    // Handles the actual swipe outcome
    function handleObjectSwipe(card, direction) {
        card.classList.add('swiped');
        
        let moveX = direction === 'right' ? window.innerWidth : -window.innerWidth;
        card.style.transform = `translate(${moveX}px, ${currentY || 100}px) rotate(${direction === 'right' ? 30 : -30}deg)`;
        card.style.opacity = 0;

        setTimeout(() => {
            card.style.display = 'none';
            updateStackVisuals();
        }, 300);

        // Simulated Match Logic (Every Right swipe is a match for demo purposes)
        if (direction === 'right') {
            const name = card.getAttribute('data-name');
            const image = card.getAttribute('data-image');
            const icebreaker = card.getAttribute('data-icebreaker');
            
            setTimeout(() => {
                showMatchModal(name, image, icebreaker);
            }, 400); // Wait for swipe out
        }
    }

    // Buttons
    document.getElementById('btn-dislike').addEventListener('click', () => {
        const topCard = Array.from(cardStack.querySelectorAll('.profile-card:not(.swiped)')).pop();
        if(topCard) handleObjectSwipe(topCard, 'left');
    });

    document.getElementById('btn-like').addEventListener('click', () => {
        const topCard = Array.from(cardStack.querySelectorAll('.profile-card:not(.swiped)')).pop();
        if(topCard) handleObjectSwipe(topCard, 'right');
    });

    // Match Modal Logic
    function showMatchModal(name, imageUrl, icebreaker) {
        document.getElementById('match-name').textContent = name;
        document.getElementById('match-avatar').src = imageUrl;
        document.getElementById('match-icebreaker').textContent = `"${icebreaker}"`;
        
        const overlay = document.getElementById('match-overlay');
        overlay.classList.add('active');
        
        // Simple confetti effect
        createConfetti();
    }

    window.closeMatchModal = function() {
        document.getElementById('match-overlay').classList.remove('active');
        // Clear confetti
        const oldCanvas = document.getElementById('confetti');
        if(oldCanvas) oldCanvas.remove();
    }

    // Quick Canvas Confetti Implementation
    function createConfetti() {
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#ff4b72', '#8c52ff', '#00c853', '#ffffff'];

        for (let i = 0; i < 100; i++) {
            pieces.push({
                x: canvas.width / 2,
                y: canvas.height / 2 + 100,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 1) * 20 - 5,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10
            });
        }

        function animate() {
            if(!document.getElementById('confetti')) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            pieces.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.5; // gravity
                p.rot += p.rotSpeed;

                if (p.y < canvas.height) active = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
            });

            if (active) requestAnimationFrame(animate);
        }
        animate();
    }

    // Initial render
    renderCards();
});
