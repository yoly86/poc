// Ensure console logs for debugging
console.log('Loading Guitar Mastery JavaScript...');

// Skill Tree definition (unchanged for brevity)
const skillTree = {
    'Chords': {
        levels: [
            { level: 1, subSkills: [
                { name: 'C Chord', video: 'https://www.youtube.com/watch?v=jJxRjWtwmEE' },
                { name: 'G Chord', video: 'https://www.youtube.com/watch?v=5rXAI79H4eQ' },
                { name: 'D Chord', video: 'https://www.youtube.com/watch?v=5rXAI79H4eQ' }
            ]},
            { level: 2, subSkills: [
                { name: 'A Chord', video: 'https://www.youtube.com/watch?v=5rXAI79H4eQ' },
                { name: 'E Chord', video: 'https://www.youtube.com/watch?v=ZBlQhuxs24w' }
            ]},
            // Extend to 70 as needed
        ],
        maxLevel: 70
    },
    'Strumming': { levels: [{ level: 1, subSkills: [{ name: 'Basic Downstrokes', video: 'https://www.youtube.com/watch?v=example-strum1' }]}], maxLevel: 70 },
    'Fingerpicking': { levels: [{ level: 1, subSkills: [{ name: 'Thumb-Index Pattern', video: 'https://www.youtube.com/watch?v=example-fp1' }]}], maxLevel: 70 },
    'Scales': { levels: [{ level: 1, subSkills: [{ name: 'C Major Scale', video: 'https://www.youtube.com/watch?v=ne6tB2KiZuk' }]}], maxLevel: 70 },
    'Improv': { levels: [{ level: 1, subSkills: [{ name: 'Pentatonic Basics', video: 'https://www.youtube.com/watch?v=example-improv1' }]}], maxLevel: 70 },
    'Rhythm': { levels: [{ level: 1, subSkills: [{ name: 'Quarter Notes', video: 'https://www.youtube.com/watch?v=example-rhythm1' }]}], maxLevel: 70 }
};

// Initialize userSkills with safeguards
let userSkills = JSON.parse(localStorage.getItem('guitarProgress')) || {
    labels: Object.keys(skillTree),
    data: [0, 0, 0, 0, 0, 0], // Default to 0 for all skills
    subSkillProgress: Object.fromEntries(Object.keys(skillTree).map(skill => [skill, { 1: 0 }])),
    badges: [],
    focusAreas: Object.keys(skillTree),
    xp: 0,
    practiceTime: 0, // In seconds
    randomChallenges: [] // Track completed random challenges
};

console.log('User Skills:', userSkills);

// Save progress to localStorage
function saveProgress() {
    try {
        localStorage.setItem('guitarProgress', JSON.stringify(userSkills));
        console.log('Progress saved successfully');
    } catch (error) {
        console.error('Error saving progress:', error);
        alert('Error saving progress—check local storage settings or clear cache.');
    }
}

// Update skill stage function
function updateSkillStage(level) {
    if (level >= 50) return "Virtuoso";
    if (level >= 30) return "Advanced";
    if (level >= 15) return "Intermediate";
    return "Beginner";
}

// Award badge and update UI
function awardBadge(skill, level) {
    if (level === 15 && !userSkills.badges.includes(`${skill} Novice`)) userSkills.badges.push(`${skill} Novice`);
    else if (level === 30 && !userSkills.badges.includes(`${skill} Master`)) userSkills.badges.push(`${skill} Master`);
    else if (level === 50 && !userSkills.badges.includes(`${skill} Virtuoso`)) userSkills.badges.push(`${skill} Virtuoso`);
    saveProgress();
    updateOverallLevel();
    updateXP();
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    alert(`Badge Earned: ${userSkills.badges[userSkills.badges.length - 1]}!`);
}

// Calculate overall level
function calculateOverallLevel() {
    const totalLevels = userSkills.data.reduce((sum, level) => sum + level, 0);
    const avgLevel = totalLevels / userSkills.data.length;
    return Math.round(avgLevel);
}

// Update overall level display
function updateOverallLevel() {
    const overallLevel = calculateOverallLevel();
    document.getElementById('overallLevel').innerText = overallLevel;
    document.getElementById('streakValue').innerText = streak || 0; // Update streak display
}

// Update XP bar
function updateXP() {
    const xp = userSkills.xp || 0;
    const currentLevel = calculateOverallLevel();
    const nextLevelXP = Math.floor(100 * (currentLevel + 1) ** 1.5);
    document.getElementById('xpValue').innerText = `${xp}/${nextLevelXP}`;
    document.getElementById('xpProgress').style.width = `${(xp / nextLevelXP) * 100}%` || '0%';
}

// Add XP and handle level-ups
function addXP(amount) {
    userSkills.xp = (userSkills.xp || 0) + amount;
    const currentLevel = calculateOverallLevel();
    const nextLevelXP = Math.floor(100 * (currentLevel + 1) ** 1.5);
    while (userSkills.xp >= nextLevelXP) {
        userSkills.xp -= nextLevelXP;
        updateOverallLevel();
        saveProgress();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        alert(`Level Up! You’re now Overall Level ${currentLevel + 1}!`);
    }
    updateXP();
}

// Generate daily routine
function generateRoutine() {
    console.log('Generating routine...');
    const routineList = document.getElementById('routineList');
    routineList.innerHTML = "";
    // Fallback to all skills if focusAreas is empty or corrupted
    const activeSkills = userSkills.focusAreas.length ? userSkills.focusAreas : userSkills.labels;
    activeSkills.forEach(skill => {
        const index = userSkills.labels.indexOf(skill);
        if (index === -1) return; // Skip if skill not found
        const currentLevel = userSkills.data[index] || 0;
        const levelData = skillTree[skill]?.levels.find(l => l.level === currentLevel + 1) || { subSkills: [] };
        if (levelData.subSkills?.length > 0) {
            const incompleteSubSkills = levelData.subSkills.slice(userSkills.subSkillProgress[skill][currentLevel + 1] || 0);
            if (incompleteSubSkills.length > 0) {
                const subSkill = incompleteSubSkills[0];
                const li = document.createElement('li');
                li.innerHTML = `<strong>${skill}</strong> (Level ${currentLevel + 1}):<br>
                                Task: ${subSkill.name} - 
                                <a href="${subSkill.video}" target="_blank" class="task-link">Learn Here</a>`;
                routineList.appendChild(li);
            }
        } else if (currentLevel < skillTree[skill]?.maxLevel) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${skill}</strong> (Level ${currentLevel + 1}):<br>
                            Task: Review previous skills or seek new lessons`;
            routineList.appendChild(li);
        }
    });
    if (routineList.innerHTML === "") {
        routineList.innerHTML = "<li>No tasks yet—start leveling up your skills!</li>";
    }
    generateSongSuggestions();
    generateChallenges();
    checkSkillGaps();
    updateMasteryDashboard();
}

// Generate song suggestions
function generateSongSuggestions() {
    const songSuggestions = document.getElementById('songSuggestions');
    songSuggestions.innerHTML = "";
    const overallLevel = calculateOverallLevel();
    const songs = {
        1: [
            { name: 'Wonderwall - Oasis', link: 'https://www.youtube.com/watch?v=6hzrDe8iTQE' },
            { name: 'Horse with No Name - America', link: 'https://www.youtube.com/watch?v=sO0rQfMnpkY' }
        ],
        15: [
            { name: 'Sweet Home Alabama - Lynyrd Skynyrd', link: 'https://www.youtube.com/watch?v=gYhCn7H0pQ0' },
            { name: 'Knockin’ on Heaven’s Door - Bob Dylan', link: 'https://www.youtube.com/watch?v=2gB7G0fE1kQ' }
        ],
        30: [
            { name: 'Stairway to Heaven - Led Zeppelin', link: 'https://www.youtube.com/watch?v=3c4g-8i4r5Y' },
            { name: 'Hotel California - Eagles', link: 'https://www.youtube.com/watch?v=6E5m_XtCX3c' }
        ],
        50: [
            { name: 'Eruption - Van Halen', link: 'https://www.youtube.com/watch?v=rn_T7WJwqyM' },
            { name: 'Cliffs of Dover - Eric Johnson', link: 'https://www.youtube.com/watch?v=Od2sA9gNs8I' }
        ]
    };
    let suggestedSongs = [];
    if (overallLevel >= 50) suggestedSongs = songs[50];
    else if (overallLevel >= 30) suggestedSongs = songs[30];
    else if (overallLevel >= 15) suggestedSongs = songs[15];
    else suggestedSongs = songs[1];

    suggestedSongs.forEach(song => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${song.name}</strong> - <a href="${song.link}" target="_blank" class="song-link">Play Here</a>`;
        songSuggestions.appendChild(li);
    });
}

// Generate challenges
function generateChallenges() {
    const challenges = document.getElementById('challenges');
    challenges.innerHTML = "";
    const overallLevel = calculateOverallLevel();
    const challengeSongs = {
        5: [
            { name: 'Wonderwall Solo - Oasis', link: 'https://www.youtube.com/watch?v=example-solo1', xp: 50 },
            { name: 'Horse with No Name Intro - America', link: 'https://www.youtube.com/watch?v=example-solo2', xp: 50 }
        ],
        20: [
            { name: 'Sweet Home Alabama Lead - Lynyrd Skynyrd', link: 'https://www.youtube.com/watch?v=example-solo3', xp: 100 },
            { name: 'Knockin’ on Heaven’s Door Solo - Bob Dylan', link: 'https://www.youtube.com/watch?v=example-solo4', xp: 100 }
        ],
        40: [
            { name: 'Stairway to Heaven Solo - Led Zeppelin', link: 'https://www.youtube.com/watch?v=example-solo5', xp: 200 },
            { name: 'Hotel California Solo - Eagles', link: 'https://www.youtube.com/watch?v=example-solo6', xp: 200 }
        ]
    };
    let suggestedChallenges = [];
    if (overallLevel >= 40) suggestedChallenges = challengeSongs[40];
    else if (overallLevel >= 20) suggestedChallenges = challengeSongs[20];
    else if (overallLevel >= 5) suggestedChallenges = challengeSongs[5];

    suggestedChallenges.forEach(challenge => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${challenge.name}</strong> - <a href="${challenge.link}" target="_blank" class="challenge-link">Accept Challenge</a> (+${challenge.xp} XP)`;
        li.onclick = () => completeChallenge(challenge.xp);
        challenges.appendChild(li);
    });
}

// Complete a challenge
function completeChallenge(xp) {
    addXP(xp);
    alert(`Challenge completed! +${xp} XP earned!`);
}

// Reset level for a skill
function resetLevel(skill, index) {
    const newLevel = prompt(`Enter new level for ${skill} (0-${skillTree[skill].maxLevel}):`, userSkills.data[index] || 0);
    if (newLevel !== null && !isNaN(newLevel) && newLevel >= 0 && newLevel <= skillTree[skill].maxLevel) {
        userSkills.data[index] = parseInt(newLevel);
        userSkills.subSkillProgress[skill] = {};
        userSkills.subSkillProgress[skill][newLevel + 1] = 0;
        userSkills.badges = userSkills.badges.filter(b => !b.startsWith(skill));
        awardBadge(skill, newLevel);
        document.getElementById(`level-${index}`).innerText = newLevel;
        document.getElementById(`stage-${index}`).innerText = updateSkillStage(newLevel);
        document.getElementById(`subskill-${index}`).innerText = 0;
        document.getElementById(`progress-${index}`).style.width = `${(newLevel / skillTree[skill].maxLevel) * 100}%`;
        document.getElementById(`badges-${index}`).innerHTML = userSkills.badges.filter(b => b.startsWith(skill)).map(b => `<span class="badge">${b}</span>`).join(' ');
        radarChart.data.datasets[0].data = userSkills.data.map(level => level || 0); // Ensure no undefined values
        radarChart.update();
        generateRoutine();
        saveProgress();
        updateOverallLevel();
    }
}

// Initialize radar chart
const ctx = document.getElementById('spiderChart').getContext('2d');
const radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: userSkills.labels,
        datasets: [{
            label: 'Your Mastery',
            data: userSkills.data.map(level => level || 0), // Default to 0 if undefined
            backgroundColor: 'rgba(0, 255, 204, 0.4)',
            borderColor: '#00ffcc',
            borderWidth: 3,
            pointBackgroundColor: '#00ffcc'
        }]
    },
    options: {
        scales: {
            r: { min: 0, max: 70, grid: { color: '#555' }, angleLines: { color: '#aaa' }, pointLabels: { color: '#fff', font: { size: 14, family: 'Roboto', sans-serif } }, ticks: { color: '#fff', backdropColor: 'transparent' } }
        },
        animation: { duration: 1000, easing: 'easeInOutQuad' }
    }
});

// Initialize focus areas
const focusAreasDiv = document.getElementById('focusAreas');
userSkills.labels.forEach(skill => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = userSkills.focusAreas.includes(skill);
    checkbox.onchange = () => {
        userSkills.focusAreas = userSkills.labels.filter((_, i) => document.querySelectorAll('#focusAreas input')[i].checked);
        saveProgress();
        generateRoutine();
    };
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(skill));
    focusAreasDiv.appendChild(label);
});

// Initialize skill buckets
const bucketsContainer = document.getElementById('buckets');
userSkills.labels.forEach((skill, index) => {
    const skillDiv = document.createElement('div');
    skillDiv.classList.add('skill-bucket');
    skillDiv.innerHTML = `<h3>${skill}</h3>
                          <p>Level: <span id="level-${index}">${userSkills.data[index] || 0}</span></p>
                          <p>Stage: <span id="stage-${index}">${updateSkillStage(userSkills.data[index] || 0)}</span></p>
                          <p>Sub-Skills: <span id="subskill-${index}">${userSkills.subSkillProgress[skill][1] || 0}</span>/${skillTree[skill].levels[0]?.subSkills.length || 0}</p>
                          <div class="progress-bar" id="progress-${index}" style="width: ${((userSkills.data[index] || 0) / skillTree[skill].maxLevel) * 100}%"></div>
                          <div id="badges-${index}">${userSkills.badges.filter(b => b.startsWith(skill)).map(b => `<span class="badge">${b}</span>`).join(' ')}</div>
                          <div class="level-reset" onclick="resetLevel('${skill}', ${index})">Reset Level</div>`;
    const button = document.createElement('button');
    button.innerText = "Complete Sub-Skill";
    button.onclick = () => {
        const currentLevel = (userSkills.data[index] || 0) + 1;
        const levelData = skillTree[skill]?.levels.find(l => l.level === currentLevel);
        if (!levelData && userSkills.data[index] >= skillTree[skill].maxLevel) return;

        if (levelData) {
            userSkills.subSkillProgress[skill][currentLevel] = (userSkills.subSkillProgress[skill][currentLevel] || 0) + 1;
            const subSkillCount = levelData.subSkills.length;
            document.getElementById(`subskill-${index}`).innerText = userSkills.subSkillProgress[skill][currentLevel];

            if (userSkills.subSkillProgress[skill][currentLevel] >= subSkillCount) {
                userSkills.data[index] = currentLevel;
                userSkills.subSkillProgress[skill][currentLevel + 1] = 0;
                document.getElementById(`level-${index}`).innerText = currentLevel;
                document.getElementById(`stage-${index}`).innerText = updateSkillStage(currentLevel);
                document.getElementById(`subskill-${index}`).innerText = 0;
                awardBadge(skill, currentLevel);
                addXP(50); // 50 XP per sub-skill
                document.getElementById(`badges-${index}`).innerHTML = userSkills.badges.filter(b => b.startsWith(skill)).map(b => `<span class="badge">${b}</span>`).join(' ');
                button.disabled = true;
                setTimeout(() => {
                    button.disabled = false;
                    const nextLevelData = skillTree[skill]?.levels.find(l => l.level === currentLevel + 1);
                    document.getElementById(`subskill-${index}`).innerText = userSkills.subSkillProgress[skill][currentLevel + 1] || 0;
                    document.getElementById(`progress-${index}`).style.width = `${(currentLevel / skillTree[skill].maxLevel) * 100}%`;
                }, 500);
            }
            document.getElementById(`progress-${index}`).style.width = `${((userSkills.data[index] || 0) + userSkills.subSkillProgress[skill][currentLevel] / subSkillCount) / skillTree[skill].maxLevel * 100}%`;
        } else {
            userSkills.data[index] = currentLevel;
            awardBadge(skill, currentLevel);
            addXP(50); // 50 XP for maxing out a skill
            document.getElementById(`level-${index}`).innerText = currentLevel;
            document.getElementById(`stage-${index}`).innerText = updateSkillStage(currentLevel);
            document.getElementById(`progress-${index}`).style.width = `${(currentLevel / skillTree[skill].maxLevel) * 100}%`;
        }
        generateRoutine();
        radarChart.data.datasets[0].data = userSkills.data.map(level => level || 0);
        radarChart.update();
        saveProgress();
    };
    skillDiv.appendChild(button);
    bucketsContainer.appendChild(skillDiv);
});

// Initial generation and updates
generateRoutine();
updateOverallLevel();
updateXP();

// Practice Timer
let timerInterval;
let startTime = userSkills.practiceTime || 0;

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            startTime++;
            userSkills.practiceTime = startTime;
            saveProgress();
            updateTimer();
        }, 1000);
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    startTime = 0;
    userSkills.practiceTime = 0;
    saveProgress();
    updateTimer();
}

function updateTimer() {
    const minutes = Math.floor(startTime / 60);
    const seconds = startTime % 60;
    document.getElementById('practiceTimer').innerText = `Practice Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

document.getElementById('practiceTimer').onclick = () => {
    if (!timerInterval) startTimer();
    else stopTimer();
    checkStreakOnAction();
};

// Metronome Functionality (Google-style, subtle click)
let metronomeInterval;
function toggleMetronome() {
    const popup = document.getElementById('metronomePopup');
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
}

function startMetronome() {
    const bpm = document.getElementById('bpm').value;
    const interval = 60000 / bpm;
    stopMetronome();
    metronomeInterval = setInterval(() => {
        const audio = new Audio('https://www.myinstants.com/media/sounds/click_1.mp3'); // Updated subtle click sound
        audio.play().catch(error => {
            console.error('Metronome audio error:', error);
            alert('Metronome sound failed to load—check internet connection or run through a local server.');
        });
    }, interval);
    startTimer(); // Start practice timer when metronome starts
}

function stopMetronome() {
    if (metronomeInterval) {
        clearInterval(metronomeInterval);
        metronomeInterval = null;
        stopTimer(); // Stop practice timer when metronome stops
    }
}

// Print Daily Lesson
function printDailyLesson() {
    const routineContent = document.getElementById('routineList').innerHTML;
    const songContent = document.getElementById('songSuggestions').innerHTML;
    const challengeContent = document.getElementById('challenges').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Guitar Mastery Daily Lesson</title>
            <style>
                body { font-family: 'Roboto', 'Orbitron', sans-serif; padding: 20px; background: #1a1a1a; color: #fff; }
                h1, h3 { text-align: center; text-shadow: 0 0 10px #ff0066; font-family: 'Orbitron', sans-serif; }
                ul { list-style: none; padding: 0; }
                li { margin-bottom: 10px; background: #333; padding: 10px; border-radius: 5px; font-size: 16px; }
                a { color: #00ffcc; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Your Daily Guitar Lesson - ${new Date().toLocaleDateString()}</h1>
            <h3>Your Daily Quest</h3>
            <ul>${routineContent}</ul>
            <h3>Suggested Songs</h3>
            <ul>${songContent}</ul>
            <h3>Challenges</h3>
            <ul>${challengeContent}</ul>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Daily Streak
let streak = JSON.parse(localStorage.getItem('streak')) || 0;
function updateStreak() {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('lastPracticeDate');
    if (lastDate === today) return;
    if (!lastDate || new Date(lastDate) < new Date(today)) {
        streak++;
        localStorage.setItem('streak', streak);
        localStorage.setItem('lastPracticeDate', today);
        alert(`Streak updated! You’re on a ${streak}-day streak! +25 XP`);
        addXP(25);
    }
    document.getElementById('streakValue').innerText = streak;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    updateStreak();
    updateTimer();
    checkSkillGaps();
    updateMasteryDashboard();
    // Ensure radar and skills load
    if (!radarChart.data.datasets[0].data.length) {
        radarChart.data.datasets[0].data = userSkills.data.map(level => level || 0);
        radarChart.update();
    }
    if (!document.getElementById('buckets').children.length) {
        userSkills.labels.forEach((_, index) => resetLevel(userSkills.labels[index], index)); // Force reset if empty
    }
});

function checkStreakOnAction() {
    updateStreak();
}

document.getElementById('practiceTimer').onclick = () => {
    if (!timerInterval) startTimer();
    else stopTimer();
    checkStreakOnAction();
};

const originalCompleteSubSkill = button.onclick;
button.onclick = function() {
    originalCompleteSubSkill.apply(this);
    checkStreakOnAction();
};

const originalCompleteChallenge = completeChallenge;
completeChallenge = function(xp) {
    originalCompleteChallenge(xp);
    checkStreakOnAction();
};

function checkSkillGaps() {
    const maxLevel = Math.max(...userSkills.data);
    const skillGapAlert = document.getElementById('skillGapAlert') || document.createElement('div');
    skillGapAlert.id = 'skillGapAlert';
    skillGapAlert.style = 'margin-top: 10px; color: #ff0066; font-size: 16px; text-shadow: 0 0 5px #ff0066;';
    let gapMessage = '';
    userSkills.labels.forEach((skill, index) => {
        if (maxLevel - (userSkills.data[index] || 0) >= 10) {
            gapMessage += `Warning: ${skill} is lagging—focus here! `;
        }
    });
    if (gapMessage) {
        skillGapAlert.innerText = gapMessage.trim();
        document.getElementById('dashboard').appendChild(skillGapAlert);
    } else if (document.getElementById('skillGapAlert')) {
        document.getElementById('skillGapAlert').remove();
    }
}

function updateMasteryDashboard() {
    const masteryStats = document.getElementById('masteryStats');
    masteryStats.innerHTML = '';
    userSkills.labels.forEach((skill, index) => {
        const level = userSkills.data[index] || 0;
        const masteryPercent = (level / skillTree[skill].maxLevel) * 100;
        const timeSpent = Math.floor((userSkills.practiceTime || 0) / (userSkills.labels.length * 60)); // Approx minutes per skill
        const xpEarned = Math.floor((level * 50) / userSkills.labels.length); // Approx XP per skill
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <h4>${skill}</h4>
            <p>Level: ${level} (${updateSkillStage(level)})</p>
            <p>Mastery: ${masteryPercent.toFixed(1)}%</p>
            <p>Time Spent: ${timeSpent} min</p>
            <p>XP Earned: ${xpEarned}</p>
        `;
        masteryStats.appendChild(statCard);
    });
}

function generateRandomChallenge() {
    const overallLevel = calculateOverallLevel();
    const challenges = {
        1: { name: 'Play a 30-second C Major Scale', xp: 75 },
        15: { name: 'Improvise a 1-minute blues solo in A Minor', xp: 100 },
        30: { name: 'Perform a full verse of Stairway to Heaven', xp: 150 },
        50: { name: 'Play Eruption’s intro flawlessly', xp: 250 }
    };
    let challenge = challenges[Math.max(1, Math.min(50, overallLevel))];
    const today = new Date().toLocaleDateString();
    if (!userSkills.randomChallenges || !userSkills.randomChallenges.includes(today)) {
        alert(`Random Daily Challenge: ${challenge.name} (+${challenge.xp} XP)`);
        addXP(challenge.xp);
        userSkills.randomChallenges = userSkills.randomChallenges || [];
        userSkills.randomChallenges.push(today);
        saveProgress();
    } else {
        alert('You’ve already completed today’s random challenge!');
    }
}
