// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const languageButtons = document.querySelectorAll('.lang-btn');
    let currentLanguage = 'en';

    // Try to load the makholic logo from common filenames; fall back gracefully
    const logoCandidates = [
        'assets/makholic-logo.png',
        'assets/makholic-logo.jpg',
        'assets/makholic-logo.jpeg',
        'assets/makholic-logo.webp',
        'assets/makholic_logo.png',
        'assets/makholic_logo.jpg',
        'assets/makholic_logo.webp'
    ];

    function trySetImage(element, candidates) {
        if (!element) return;
        let index = 0;
        function attempt() {
            if (index >= candidates.length) {
                // hide image element if nothing loads
                element.style.display = 'none';
                return;
            }
            const testImg = new Image();
            const src = candidates[index++];
            testImg.onload = function() {
                element.src = src;
                element.style.display = '';
            };
            testImg.onerror = attempt;
            testImg.src = src;
        }
        attempt();
    }

    trySetImage(document.querySelector('.brand-logo'), logoCandidates);
    trySetImage(document.querySelector('.hero-logo'), logoCandidates);

    // --- Instagram Feed 로딩 기능 ---
    async function loadInstagramFeed() {
        const grid = document.getElementById('instagram-grid');
        if (!grid) return;

        // 로딩 상태 표시
        grid.innerHTML = '<div class="ig-loading">Instagram 게시물을 불러오는 중...</div>';

        const config = window.INSTAGRAM_CONFIG || {};
        const token = config.token;
        const userId = config.userId || 'mak_holic';

        try {
            let posts = [];

            if (token && userId) {
                // 실제 Instagram API 호출
                const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
                const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&access_token=${token}&limit=6`;
                const res = await fetch(url);
                const data = await res.json();
                
                if (data && data.data && data.data.length > 0) {
                    posts = data.data;
                } else {
                    throw new Error('API에서 데이터를 가져올 수 없습니다');
                }
            } else {
                // 폴백 데이터 사용 (데모용)
                posts = config.fallbackPosts || [];
            }

            // 로딩 상태 제거
            grid.innerHTML = '';

            if (posts.length === 0) {
                grid.innerHTML = '<div class="ig-empty">게시물을 찾을 수 없습니다.</div>';
                return;
            }

            // 게시물 카드 생성
            posts.slice(0, 6).forEach((post, index) => {
                const card = document.createElement('a');
                card.href = post.permalink;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'ig-card fade-in';
                card.style.animationDelay = `${index * 0.1}s`;

                // 이미지 URL 결정
                const imageUrl = post.media_type === 'VIDEO' 
                    ? (post.thumbnail_url || post.media_url) 
                    : post.media_url;

                // 캡션 정리 (해시태그 제거 및 길이 제한)
                let caption = post.caption || '';
                caption = caption.replace(/#\w+/g, '').trim();
                if (caption.length > 60) {
                    caption = caption.substring(0, 60) + '...';
                }

                // 날짜 포맷팅
                const date = new Date(post.timestamp);
                const formattedDate = date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                card.innerHTML = `
                    <div class="ig-image-container">
                        <img alt="makholic Instagram post" src="${imageUrl}" loading="lazy"/>
                        <div class="ig-overlay">
                            <div class="ig-overlay-text">Instagram에서 보기</div>
                        </div>
                    </div>
                    <div class="ig-meta">
                        <div class="ig-caption">${caption}</div>
                        <div class="ig-date">${formattedDate} · @${userId}</div>
                    </div>
                `;

                grid.appendChild(card);
            });

            // 애니메이션 관찰자 설정
            const cards = grid.querySelectorAll('.ig-card');
            cards.forEach(card => {
                observer.observe(card);
            });

        } catch (error) {
            console.warn('Instagram feed 로딩 실패:', error);
            grid.innerHTML = `
                <div class="ig-error">
                    <p>Instagram 게시물을 불러올 수 없습니다.</p>
                    <a href="https://www.instagram.com/mak_holic/" target="_blank" rel="noopener" class="cta-button outline">
                        Instagram에서 직접 보기
                    </a>
                </div>
            `;
        }
    }
    
    // 페이지 로드 시 Instagram 피드 로딩
    loadInstagramFeed();

    // Language switching function
    function switchLanguage(lang) {
        currentLanguage = lang;
        
        // Update active button
        languageButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Update all translatable elements
        const translatableElements = document.querySelectorAll('[data-en], [data-ja], [data-ko]');
        translatableElements.forEach(element => {
            const translation = element.getAttribute(`data-${lang}`);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update page title
        const titles = {
            'en': 'makholic – Discover the world of Makgeolli',
            'ja': 'makholic – マッコリの世界を発見しよう',
            'ko': 'makholic – 막걸리의 세계를 발견하세요'
        };
        document.title = titles[lang] || titles['en'];
    }

    // Add click event listeners to language buttons
    languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
            
            // Add animation effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Smooth scrolling for CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            const cultureSection = document.querySelector('.culture-section');
            if (cultureSection) {
                cultureSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to cards and observe them
    const cards = document.querySelectorAll('.culture-card, .food-card, .tourism-card, .modern-card');
    cards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // Add hover effects to cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroImage = document.querySelector('.hero-logo');
        
        if (hero && heroImage) {
            const rate = scrolled * -0.5;
            heroImage.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add typing effect to hero title
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Initialize typing effect on page load
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 500);
    }

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Add keyboard navigation for language switching
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    switchLanguage('en');
                    break;
                case '2':
                    e.preventDefault();
                    switchLanguage('ja');
                    break;
                case '3':
                    e.preventDefault();
                    switchLanguage('ko');
                    break;
            }
        }
    });

    // Add tooltip for keyboard shortcuts
    const tooltipTexts = {
        'en': 'Press Ctrl+1/2/3 to switch languages',
        'ja': 'Ctrl+1/2/3で言語を切り替え',
        'ko': 'Ctrl+1/2/3로 언어 전환'
    };

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(17,17,17,0.9);
        color: #f7f4e8;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    document.body.appendChild(tooltip);

    // Show tooltip on hover over language buttons
    languageButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            tooltip.textContent = tooltipTexts[currentLanguage];
            tooltip.style.opacity = '1';
        });
        
        btn.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
    });

    // Add confetti effect on CTA button click
    function createConfetti() {
        const colors = ['#111111', '#444444', '#888888', '#bbbbbb'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: confetti-fall 3s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }

    // Add confetti CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add confetti to CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', createConfetti);
    }

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: #111111;
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });

    console.log('🍶 makholic website loaded successfully!');
    console.log('💡 Tip: Use Ctrl+1/2/3 to switch between languages');
});
