<!DOCTYPE html>
<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Software Engineer Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#0dccf2",
                        "primary-dark": "#0ab8da",
                        "background-light": "#f5f8f8",
                        "background-dark": "#102023",
                        "surface-dark": "#16282c",
                        "surface-darker": "#0b1719",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"],
                        "body": ["Inter", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
                    boxShadow: {
                        "glow": "0 0 15px -3px rgba(13, 204, 242, 0.3)",
                        "glow-lg": "0 0 25px -5px rgba(13, 204, 242, 0.4)",
                    }
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .glass-card {
            background: rgba(22, 40, 44, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .timeline-line {
            box-shadow: 0 0 8px rgba(13, 204, 242, 0.6);
        }
        .cp-grid-bg {
            background-image: radial-gradient(circle at 1px 1px, rgba(13, 204, 242, 0.1) 1px, transparent 0);
            background-size: 20px 20px;
        }
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #102023; 
        }
        ::-webkit-scrollbar-thumb {
            background: #224249; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #315f68; 
        }
    </style>
</head>
<body class="bg-background-dark text-white overflow-x-hidden antialiased">
<main class="pt-8 pb-12 flex flex-col items-center w-full">
<div class="max-w-[1100px] w-full px-6 flex flex-col gap-16">
<section class="flex flex-col-reverse md:flex-row items-center gap-10 py-10 md:py-16 relative" id="about">
<div class="absolute top-0 right-0 hidden md:flex gap-4">
<a aria-label="LinkedIn" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">work</span>
</a>
<a aria-label="GitHub" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">terminal</span>
</a>
<a aria-label="Codeforces" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">bar_chart</span>
</a>
</div>
<div class="flex-1 flex flex-col gap-6 text-center md:text-left pt-12 md:pt-0">
<div class="flex flex-col gap-3">
<div class="flex items-center gap-3 justify-center md:justify-start mb-2">
<div class="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
<span class="material-symbols-outlined text-2xl">code</span>
</div>
<h2 class="text-white text-2xl font-bold tracking-tight">AlexDev</h2>
</div>
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 self-center md:self-start w-fit">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
</span>
<span class="text-primary text-xs font-bold uppercase tracking-wide">Open to Work</span>
</div>
<h1 class="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                        Software Engineer &amp; <br/>
<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-200">Competitive Programmer</span>
</h1>
<p class="text-gray-400 text-base md:text-lg max-w-[600px] mx-auto md:mx-0 leading-relaxed">
                        Passionate about algorithms, distributed systems, and building scalable web applications. Currently ranked top 1% on LeetCode and solving complex engineering challenges.
                    </p>
</div>
<div class="flex md:hidden gap-4 justify-center mb-2">
<a aria-label="LinkedIn" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">work</span>
</a>
<a aria-label="GitHub" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">terminal</span>
</a>
<a aria-label="Codeforces" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">bar_chart</span>
</a>
</div>
<div class="flex flex-wrap justify-center md:justify-start gap-4">
<button class="h-12 px-6 bg-primary hover:bg-primary-dark text-[#102023] rounded-lg font-bold text-base transition-all shadow-glow hover:translate-y-[-2px]">
                        View Work
                    </button>
<button class="h-12 px-6 bg-transparent border border-gray-600 hover:border-primary text-gray-300 hover:text-white rounded-lg font-bold text-base transition-all hover:bg-primary/5">
                        Download CV
                    </button>
</div>
</div>
<div class="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
<div class="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl"></div>
<div class="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30 shadow-2xl">
<img alt="Professional headshot of a software engineer in a dark t-shirt" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZD3SsPS8TPex5dWWOGiEOWE7bZy3Z8HOd03HtuSbZ30rbwy83i4hO54sy1Oha6u3kv3ue24mXa7RD8OlAdDRLJZOX6di8My_tO6u6ZOi8Oik0giaEK2Ua2k39_8NHxi8u-PUaz_1P73463aUw-PvoOwzLjPmbmBmU14aPb5pzDZYQSfKpm7FT3S21asyHqVjgKy4sHCcNu9VW-X6qbiNlvt9yfOUQfDk3YdOvl5JDfBSyt9o49hIeN_U1WTil7shykejdwCfI8g"/>
</div>
</div>
</section>
<section class="w-full" id="achievements">
<div class="flex items-center gap-3 mb-8">
<span class="material-symbols-outlined text-primary text-4xl">emoji_events</span>
<h2 class="text-3xl font-bold text-white">Competitive Programming</h2>
</div>
<div class="rounded-2xl border border-[#224249] bg-[#16282c]/30 backdrop-blur-sm overflow-hidden">
<div class="p-6 md:p-8 border-b border-[#224249]">
<h3 class="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
<span class="material-symbols-outlined text-primary">terminal</span>
                        Online Judge Ratings
                    </h3>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
<div class="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all hover:bg-[#16282c]/80 group relative overflow-hidden">
<div class="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
<div class="flex items-center justify-between z-10">
<span class="text-xs font-mono text-gray-400 uppercase tracking-wider">Codeforces</span>
<img alt="Codeforces" class="h-5 opacity-70 group-hover:opacity-100 transition-opacity invert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCky8OtJkrXo7pJK3KB9IMNUblnMK9_MzZifIdZH59X5_Edg_GmlWGTZKanpKrv4ZAczH7Y3mZHLcy0zhL6TytD3Vo1RKpmDmnPSQbIFS8glzIR-4D4nhigFKKRGwWFAfB7ROTcOfNqKcsPrcHAAEUv_Dqa1ofMlUovbYFr-isNZ1Au6ArsOQbSzCor8h-qm4_elz_RvFjl1wAP3QMgOHMHAbq1LKuDFVdjwMVLrORLgWEd-Y8hT3hSRxW8NoLnd6czBmzBkgMjlg"/>
</div>
<div class="mt-2 z-10">
<p class="text-2xl font-bold text-white">1950</p>
<p class="text-sm text-purple-400 font-medium">Candidate Master</p>
</div>
<div class="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
<div class="bg-purple-500 h-full w-[85%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
</div>
</div>
<div class="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all hover:bg-[#16282c]/80 group relative overflow-hidden">
<div class="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-colors"></div>
<div class="flex items-center justify-between z-10">
<span class="text-xs font-mono text-gray-400 uppercase tracking-wider">LeetCode</span>
<span class="material-symbols-outlined text-yellow-500">code_blocks</span>
</div>
<div class="mt-2 z-10">
<p class="text-2xl font-bold text-white">2,450</p>
<p class="text-sm text-yellow-400 font-medium">Guardian</p>
</div>
<div class="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
<div class="bg-yellow-500 h-full w-[95%] shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
</div>
</div>
<div class="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all hover:bg-[#16282c]/80 group relative overflow-hidden">
<div class="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors"></div>
<div class="flex items-center justify-between z-10">
<span class="text-xs font-mono text-gray-400 uppercase tracking-wider">CodeChef</span>
<span class="material-symbols-outlined text-orange-500">restaurant_menu</span>
</div>
<div class="mt-2 z-10">
<p class="text-2xl font-bold text-white">2045</p>
<p class="text-sm text-orange-400 font-medium">5 Star</p>
</div>
<div class="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
<div class="bg-orange-500 h-full w-[70%] shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
</div>
</div>
<div class="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-primary/40 transition-all hover:bg-[#16282c]/80 group relative overflow-hidden">
<div class="absolute -right-4 -top-4 w-16 h-16 bg-blue-400/5 rounded-full blur-xl group-hover:bg-blue-400/10 transition-colors"></div>
<div class="flex items-center justify-between z-10">
<span class="text-xs font-mono text-gray-400 uppercase tracking-wider">AtCoder</span>
<span class="material-symbols-outlined text-blue-400">deployed_code</span>
</div>
<div class="mt-2 z-10">
<p class="text-2xl font-bold text-white">1240</p>
<p class="text-sm text-blue-300 font-medium">Cyan</p>
</div>
<div class="w-full bg-gray-700 h-1 rounded-full mt-3 overflow-hidden">
<div class="bg-blue-400 h-full w-[60%] shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
</div>
</div>
<div class="glass-card p-4 rounded-xl flex flex-col justify-center items-center gap-1 hover:border-primary/60 border-primary/20 transition-all hover:bg-primary/5 group relative overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
<span class="material-symbols-outlined text-3xl text-primary mb-1">checklist</span>
<p class="text-3xl font-black text-white tracking-tight">3,500+</p>
<p class="text-xs text-primary font-bold uppercase tracking-wider">Problems Solved</p>
<p class="text-[10px] text-gray-500 mt-2">Across all platforms</p>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2">
<div class="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#224249]">
<h3 class="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
<span class="material-symbols-outlined text-primary">groups</span>
                        Team Contests
                    </h3>
<div class="flex flex-col gap-4">
<div class="flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg transition-colors border border-transparent hover:border-[#224249]">
<div class="size-10 rounded-md bg-[#0b1719] border border-[#224249] flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined">public</span>
</div>
<div>
<h4 class="text-white font-semibold">ICPC Asia West Continent Finals</h4>
<p class="text-sm text-gray-400">Finalist Team (Rank 45)</p>
</div>
</div>
<div class="flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg transition-colors border border-transparent hover:border-[#224249]">
<div class="size-10 rounded-md bg-[#0b1719] border border-[#224249] flex items-center justify-center text-yellow-400 shrink-0">
<span class="material-symbols-outlined">flag</span>
</div>
<div>
<h4 class="text-white font-semibold">ICPC Regional Contest</h4>
<p class="text-sm text-gray-400">Position: 12th (Silver Medalist)</p>
</div>
</div>
<div class="flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg transition-colors border border-transparent hover:border-[#224249]">
<div class="size-10 rounded-md bg-[#0b1719] border border-[#224249] flex items-center justify-center text-blue-400 shrink-0">
<span class="material-symbols-outlined">leaderboard</span>
</div>
<div>
<h4 class="text-white font-semibold">ICPC Preliminary</h4>
<p class="text-sm text-gray-400">Ranked 5th Nationwide</p>
</div>
</div>
<div class="flex items-start gap-4 p-3 hover:bg-[#16282c] rounded-lg transition-colors border border-transparent hover:border-[#224249]">
<div class="size-10 rounded-md bg-[#0b1719] border border-[#224249] flex items-center justify-center text-green-400 shrink-0">
<span class="material-symbols-outlined">trophy</span>
</div>
<div>
<h4 class="text-white font-semibold">Inter-University Contest</h4>
<p class="text-sm text-gray-400">Champion Team</p>
</div>
</div>
</div>
</div>
<div class="p-6 md:p-8 cp-grid-bg relative">
<h3 class="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2 relative z-10">
<span class="material-symbols-outlined text-primary">military_tech</span>
                        Individual Achievements
                    </h3>
<div class="space-y-4 relative z-10">
<div class="glass-card p-4 rounded-xl border-l-4 border-l-blue-500 flex justify-between items-center group">
<div>
<h4 class="font-bold text-white group-hover:text-blue-400 transition-colors">Google Code Jam</h4>
<p class="text-xs text-gray-400 mt-1">Global Round 2 Qualifier</p>
</div>
<div class="text-right">
<span class="text-2xl font-black text-gray-600 group-hover:text-blue-500/50 transition-colors">Top 5%</span>
</div>
</div>
<div class="glass-card p-4 rounded-xl border-l-4 border-l-indigo-500 flex justify-between items-center group">
<div>
<h4 class="font-bold text-white group-hover:text-indigo-400 transition-colors">Meta Hacker Cup</h4>
<p class="text-xs text-gray-400 mt-1">Round 2 Participant</p>
</div>
<div class="text-right">
<span class="text-2xl font-black text-gray-600 group-hover:text-indigo-500/50 transition-colors">25pts</span>
</div>
</div>
<div class="glass-card p-4 rounded-xl border-l-4 border-l-primary flex justify-between items-center group">
<div>
<h4 class="font-bold text-white group-hover:text-primary transition-colors">Samsung R&amp;D Contest</h4>
<p class="text-xs text-gray-400 mt-1">Advanced Category</p>
</div>
<div class="text-right">
<span class="text-2xl font-black text-gray-600 group-hover:text-primary/50 transition-colors">#8</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<section class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16" id="experience">
<div class="lg:col-span-7 flex flex-col">
<h3 class="text-2xl font-bold text-white mb-8 flex items-center gap-3">
<span class="material-symbols-outlined text-primary">history_edu</span>
                    Career Timeline
                </h3>
<div class="grid grid-cols-[40px_1fr] gap-x-4">
<div class="flex flex-col items-center">
<div class="size-10 rounded-full bg-[#16282c] border border-primary text-primary flex items-center justify-center z-10 shadow-glow">
<span class="material-symbols-outlined text-xl">work</span>
</div>
<div class="w-[2px] bg-gradient-to-b from-primary to-[#224249] grow timeline-line"></div>
</div>
<div class="pb-10 pt-2">
<div class="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
<h4 class="text-xl font-bold text-white">Senior Software Engineer</h4>
<span class="text-primary text-sm font-mono bg-primary/10 px-2 py-1 rounded">2022 - Present</span>
</div>
<p class="text-gray-300 font-medium mb-2">TechCorp Inc.</p>
<p class="text-gray-400 text-sm leading-relaxed">
                            Leading the backend infrastructure team. Optimized database queries reducing latency by 40%. Architected a microservices-based notification system handling 1M+ requests daily.
                        </p>
</div>
<div class="flex flex-col items-center">
<div class="size-10 rounded-full bg-[#16282c] border border-[#315f68] text-gray-400 flex items-center justify-center z-10 group-hover:border-primary group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-xl">code</span>
</div>
<div class="w-[2px] bg-[#224249] grow"></div>
</div>
<div class="pb-10 pt-2">
<div class="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
<h4 class="text-xl font-bold text-white">Software Engineer</h4>
<span class="text-gray-500 text-sm font-mono">2020 - 2022</span>
</div>
<p class="text-gray-300 font-medium mb-2">StartupInc</p>
<p class="text-gray-400 text-sm leading-relaxed">
                            Developed full-stack features using React and Node.js. Implemented CI/CD pipelines reducing deployment time by 50%. Collaborated with product teams to launch 3 major features.
                        </p>
</div>
<div class="flex flex-col items-center">
<div class="size-10 rounded-full bg-[#16282c] border border-[#315f68] text-gray-400 flex items-center justify-center z-10">
<span class="material-symbols-outlined text-xl">school</span>
</div>
</div>
<div class="pt-2">
<div class="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
<h4 class="text-xl font-bold text-white">BS Computer Science</h4>
<span class="text-gray-500 text-sm font-mono">2016 - 2020</span>
</div>
<p class="text-gray-300 font-medium mb-2">University of Technology</p>
<p class="text-gray-400 text-sm leading-relaxed">
                            Graduated with Honors. President of the Algorithms Club. Finalist in the National Coding Championship 2019.
                        </p>
</div>
</div>
</div>
<div class="lg:col-span-5 flex flex-col gap-8">
<h3 class="text-2xl font-bold text-white mb-0 flex items-center gap-3">
<span class="material-symbols-outlined text-primary">build</span>
                    Technical Expertise
                </h3>
<div class="bg-[#16282c]/50 border border-[#224249] rounded-xl p-6">
<h4 class="text-sm uppercase tracking-wider text-gray-400 font-bold mb-4">Languages</h4>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">C++</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Python</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-300/10 text-yellow-200 border border-yellow-300/20">JavaScript (ES6+)</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-400/10 text-blue-300 border border-blue-400/20">TypeScript</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Java</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">Go</span>
</div>
</div>
<div class="bg-[#16282c]/50 border border-[#224249] rounded-xl p-6">
<h4 class="text-sm uppercase tracking-wider text-gray-400 font-bold mb-4">Frameworks &amp; Libraries</h4>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">React</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-white/5 text-gray-200 border border-gray-600">Next.js</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">Node.js</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20">Express</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">Tailwind CSS</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">GraphQL</span>
</div>
</div>
<div class="bg-[#16282c]/50 border border-[#224249] rounded-xl p-6">
<h4 class="text-sm uppercase tracking-wider text-gray-400 font-bold mb-4">Tools &amp; Platforms</h4>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600/10 text-blue-400 border border-blue-600/20">Docker</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-300/10 text-blue-200 border border-blue-300/20">Kubernetes</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-orange-600/10 text-orange-400 border border-orange-600/20">AWS</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-white/5 text-gray-200 border border-gray-600">Git</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">PostgreSQL</span>
<span class="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600/10 text-green-400 border border-green-600/20">MongoDB</span>
</div>
</div>
</div>
</section>
<section class="flex flex-col gap-8" id="projects">
<div class="flex items-center justify-between">
<h3 class="text-3xl font-bold text-white flex items-center gap-3">
<span class="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
                    Featured Projects
                </h3>
<a class="text-primary hover:text-white transition-colors text-sm font-bold flex items-center gap-1" href="#">
                    View GitHub <span class="material-symbols-outlined text-lg">arrow_forward</span>
</a>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="View Code">
<span class="material-symbols-outlined text-lg">code</span>
</a>
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="Live Demo">
<span class="material-symbols-outlined text-lg">open_in_new</span>
</a>
</div>
<div class="mb-4">
<h4 class="text-xl font-bold text-white group-hover:text-primary transition-colors">Algorithmic Trading Bot</h4>
<p class="text-xs text-gray-500 font-mono mt-1">High-Frequency Trading System</p>
</div>
<p class="text-gray-300 text-sm mb-6 leading-relaxed">
                        A low-latency trading bot written in C++ capable of executing arbitrage strategies across multiple exchanges.
                    </p>
<ul class="space-y-2 mb-6">
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Reduced latency to sub-millisecond execution using WebSocket streams.</span>
</li>
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Backtested on 5TB of historical market data.</span>
</li>
</ul>
<div class="flex flex-wrap gap-2 mt-auto">
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">C++</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Python</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Redis</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Docker</span>
</div>
</div>
<div class="group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="View Code">
<span class="material-symbols-outlined text-lg">code</span>
</a>
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="Live Demo">
<span class="material-symbols-outlined text-lg">open_in_new</span>
</a>
</div>
<div class="mb-4">
<h4 class="text-xl font-bold text-white group-hover:text-primary transition-colors">Distributed Task Scheduler</h4>
<p class="text-xs text-gray-500 font-mono mt-1">System Design &amp; Cloud Infrastructure</p>
</div>
<p class="text-gray-300 text-sm mb-6 leading-relaxed">
                        A scalable task scheduling service inspired by Celery, designed to handle millions of asynchronous background jobs.
                    </p>
<ul class="space-y-2 mb-6">
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Implemented a custom Raft consensus algorithm for leader election.</span>
</li>
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Achieved 99.99% availability with automatic failover.</span>
</li>
</ul>
<div class="flex flex-wrap gap-2 mt-auto">
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Go</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">gRPC</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Kubernetes</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Postgres</span>
</div>
</div>
<div class="group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="View Code">
<span class="material-symbols-outlined text-lg">code</span>
</a>
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="Live Demo">
<span class="material-symbols-outlined text-lg">open_in_new</span>
</a>
</div>
<div class="mb-4">
<h4 class="text-xl font-bold text-white group-hover:text-primary transition-colors">CodeJudge</h4>
<p class="text-xs text-gray-500 font-mono mt-1">Online Judge Platform</p>
</div>
<p class="text-gray-300 text-sm mb-6 leading-relaxed">
                        A secure code execution platform allowing users to submit solutions to algorithmic problems in multiple languages.
                    </p>
<ul class="space-y-2 mb-6">
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Sandboxed execution using Docker containers for security.</span>
</li>
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Real-time leaderboard updates using React and Firebase.</span>
</li>
</ul>
<div class="flex flex-wrap gap-2 mt-auto">
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">React</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Node.js</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Docker</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">AWS Lambda</span>
</div>
</div>
<div class="group relative bg-[#16282c] rounded-xl border border-[#224249] p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="View Code">
<span class="material-symbols-outlined text-lg">code</span>
</a>
<a class="p-2 bg-background-dark rounded-full hover:text-primary transition-colors" href="#" title="Live Demo">
<span class="material-symbols-outlined text-lg">open_in_new</span>
</a>
</div>
<div class="mb-4">
<h4 class="text-xl font-bold text-white group-hover:text-primary transition-colors">Neural Style Transfer</h4>
<p class="text-xs text-gray-500 font-mono mt-1">Machine Learning &amp; Computer Vision</p>
</div>
<p class="text-gray-300 text-sm mb-6 leading-relaxed">
                        An implementation of artistic style transfer using Convolutional Neural Networks (CNN) with TensorFlow.
                    </p>
<ul class="space-y-2 mb-6">
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Optimized VGG-19 model for faster inference on edge devices.</span>
</li>
<li class="flex items-start gap-2 text-sm text-gray-400">
<span class="material-symbols-outlined text-primary text-base shrink-0 mt-[2px]">check_circle</span>
<span>Built a Flask API to serve the model to a web frontend.</span>
</li>
</ul>
<div class="flex flex-wrap gap-2 mt-auto">
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Python</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">TensorFlow</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Flask</span>
<span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">OpenCV</span>
</div>
</div>
</div>
</section>
</div>
</main>
<footer class="bg-[#0b1719] border-t border-[#224249]" id="contact">
<div class="max-w-[1100px] mx-auto px-6 py-12">
<div class="flex flex-col md:flex-row justify-between items-center gap-8">
<div class="text-center md:text-left">
<h3 class="text-2xl font-bold text-white mb-2">Let's Connect</h3>
<p class="text-gray-400 max-w-md">
                    Open to new opportunities and interesting projects. Feel free to reach out if you'd like to collaborate.
                </p>
</div>
<div class="flex flex-col items-center md:items-end gap-4">
<a class="flex items-center gap-2 text-white hover:text-primary transition-colors text-lg font-medium" href="mailto:hello@alexdev.com">
<span class="material-symbols-outlined">mail</span>
                    hello@alexdev.com
                </a>
<div class="flex gap-4">
<a aria-label="LinkedIn" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">work</span>
</a>
<a aria-label="GitHub" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">terminal</span>
</a>
<a aria-label="Codeforces" class="size-10 rounded-full bg-[#16282c] border border-[#224249] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary transition-all duration-300" href="#">
<span class="material-symbols-outlined text-xl">bar_chart</span>
</a>
</div>
</div>
</div>
<div class="mt-12 pt-8 border-t border-[#224249] flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
<p>© 2023 AlexDev. All rights reserved.</p>
<div class="flex gap-6 mt-4 md:mt-0">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-base">location_on</span>
                    San Francisco, CA
                </span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-base">schedule</span>
                    UTC-7
                </span>
</div>
</div>
</div>
</footer>
</body></html>
