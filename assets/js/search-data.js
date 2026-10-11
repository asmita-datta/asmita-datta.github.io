// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Research projects and software contributions.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "news-attended-the-aqtivate-workshop-on-exascale-computing-and-scalable-algorithms-at-kth-royal-institute-of-technology-stockholm-sweden-nov-dec-2023",
          title: 'Attended the AQTIVATE workshop on Exascale Computing and Scalable Algorithms at KTH Royal...',
          description: "",
          section: "News",},{id: "news-attended-the-bifold-aqtivate-workshop-on-machine-learning-for-science-and-engineering-at-tu-berlin-germany",
          title: 'Attended the BIFOLD–AQTIVATE Workshop on Machine Learning for science and engineering at TU...',
          description: "",
          section: "News",},{id: "news-attended-the-aqtivate-workshop-on-quantum-computing-and-tensor-networks-at-the-university-of-padova-italy",
          title: 'Attended the AQTIVATE workshop on Quantum Computing and Tensor Networks at the University...',
          description: "",
          section: "News",},{id: "news-attended-the-international-doctoral-summer-school-on-scientific-writing-and-entrepreneurship-at-vilnius-university-lithuania-supported-by-the-unipd-arqus-fellowship",
          title: 'Attended the International Doctoral Summer School on Scientific Writing and Entrepreneurship at Vilnius...',
          description: "",
          section: "News",},{id: "news-attended-the-foundations-of-quantum-computing-fqc2024-workshop-at-royal-holloway-university-of-london-uk",
          title: 'Attended the Foundations of Quantum Computing (FQC2024) workshop at Royal Holloway, University of...',
          description: "",
          section: "News",},{id: "news-attended-lattice-practices-2024-at-the-cyprus-institute-nicosia-cyprus",
          title: 'Attended Lattice Practices 2024 at The Cyprus Institute, Nicosia, Cyprus.',
          description: "",
          section: "News",},{id: "news-started-a-secondment-at-cineca-bologna-italy-may-july-2025",
          title: 'Started a secondment at CINECA, Bologna, Italy (May–July 2025).',
          description: "",
          section: "News",},{id: "news-our-team-s-software-ranked-second-overall-in-the-quantinuum-quantum-circuit-tensor-network-simulation-challenge-results-where-i-benchmarked-the-quantum-chemistry-suite-of-circuits-using-tensor-networks",
          title: 'Our team’s software ranked second overall in the Quantinuum quantum circuit tensor network...',
          description: "",
          section: "News",},{id: "news-presented-the-poster-simulation-of-shor-s-prime-factorization-algorithm-on-quantum-matcha-tea-at-entangle-this-vi-100-years-of-quantum-ift-uam-csic-madrid-spain",
          title: 'Presented the poster “Simulation of Shor’s prime factorization algorithm on Quantum Matcha TEA”...',
          description: "",
          section: "News",},{id: "news-gave-a-contributed-talk-benchmarking-shor-s-algorithm-on-a-tensor-network-based-quantum-emulator-at-a-panorama-of-tensor-networks-jagiellonian-university-kraków-poland",
          title: 'Gave a contributed talk, “Benchmarking Shor’s algorithm on a tensor network-based quantum emulator”,...',
          description: "",
          section: "News",},{id: "news-started-a-secondment-at-desy-zeuthen-germany",
          title: 'Started a secondment at DESY, Zeuthen, Germany.',
          description: "",
          section: "News",},{id: "news-new-aqtivate-fellow-blog-post-the-art-of-compression-from-cartography-to-quantum-simulations",
          title: 'New AQTIVATE Fellow Blog post: The art of compression: From cartography to quantum...',
          description: "",
          section: "News",},{id: "news-launched-this-new-website-sparkles-smile",
          title: 'Launched this new website! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "news-gave-a-contributed-talk-benchmarking-tensor-network-simulations-of-shor-s-algorithm-with-coherent-error-propagation-at-the-aqtivate-conference-larnaca-cyprus",
          title: 'Gave a contributed talk, “Benchmarking tensor network simulations of Shor’s algorithm with coherent...',
          description: "",
          section: "News",},{id: "projects-benchmarking-shor-39-s-algorithm-with-tensor-networks",
          title: 'Benchmarking Shor&amp;#39;s algorithm with tensor networks',
          description: "MPS simulations of the full gate-level Shor circuit under coherent errors.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-quantum-tea",
          title: 'Quantum TEA',
          description: "qtealeaves — tensor network library of the Quantum TEA ecosystem.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-quantum-matcha-tea",
          title: 'Quantum Matcha TEA',
          description: "qmatchatea — tensor-network-based quantum circuit emulator.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
