const IMPORTANT_LINKS = [
  { label: "Academic Calendar", icon: "📅", url: "https://cetpgex.iitp.ac.in/images/pdf/Academic%20Calendar/AC%20PG%20Autumn%2026.pdf" },
  { label: "Time Table", icon: "🕐", url: "https://cetpgex.iitp.ac.in/index.php/academics/time-table" },
  { label: "Course Details", icon: "📖", url: "https://cetpgex.iitp.ac.in/index.php/academics/course-details" },
  { label: "Exam Schedule", icon: "📝", url: "https://cetpgex.iitp.ac.in/index.php/academics/examination-schedule" },
  { label: "Moodle Portal", icon: "🌐", url: "https://cetpgex.iitp.ac.in/moodle/" },
  { label: "Holiday List", icon: "🏝", url: "https://cetpgex.iitp.ac.in/index.php/academics/institute-holidays-for-the-year-2025" },
  { label: "Service Charges", icon: "💰", url: "https://cetpgex.iitp.ac.in/index.php/academics/academic-service-charges" },
  { label: "Support", icon: "🙋", url: "https://cetpgex.iitp.ac.in/index.php/moodle-support" }
];

const HOLIDAYS = [
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-04", name: "Holi" },
  { date: "2026-03-21", name: "Idu'l Fitr" },
  { date: "2026-03-31", name: "Mahavir Jayanti" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-05-01", name: "Buddha Purnima" },
  { date: "2026-05-27", name: "Idu'l Zuha (Bakrid)" },
  { date: "2026-06-26", name: "Muharram" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-26", name: "Prophet Mohammad's Birthday (Id-E-Milad)" },
  { date: "2026-10-02", name: "Mahatma Gandhi's Birthday" },
  { date: "2026-10-19", name: "Dussehra (Mahasthami)" },
  { date: "2026-10-20", name: "Dussehra (Mahanavmi) / Vijay Dashmi" },
  { date: "2026-11-08", name: "Diwali (Deepavali)" },
  { date: "2026-11-16", name: "Pratihar Saptami / Surya Saptami (Chhath Puja)" },
  { date: "2026-11-24", name: "Guru Nanak's Birthday" },
  { date: "2026-12-25", name: "Christmas Day" }
];

const PROGRAMS = [
  {
    id: "mtech-ai-dse",
    name: "M.Tech in AI & DSE",
    shortName: "M.Tech AI & DSE",
    electives: ["cda", "pr", "aml"]
  },
  {
    id: "mtech-cse",
    name: "M.Tech in Computer Science and Engineering",
    shortName: "M.Tech CSE",
    electives: ["acs", "cda", "cps"]
  },
  {
    id: "mtech-cc",
    name: "M.Tech in Cloud Computing",
    shortName: "M.Tech CC",
    electives: ["adf", "pcc", "acc"]
  },
  {
    id: "mtech-bb",
    name: "M.Tech in Blockchain Technology and Big Data",
    shortName: "M.Tech Blockchain & Big Data",
    electives: ["wdb", "bca", "de"]
  },
  {
    id: "ms-csda",
    name: "M.S. in Computer Science and Data Analytics",
    shortName: "M.S. CS & Data Analytics",
    electives: ["abt", "pr", "cps"]
  },
  {
    id: "ms-aics",
    name: "M.S. in Artificial Intelligence and Cyber Security",
    shortName: "M.S. AI & Cyber Security",
    electives: ["cf", "pr", "aml"]
  }
];

const COURSES = [
  // Regular
  {
    id: "daa",
    name: "Design and Analysis of Algorithms",
    shortName: "Design & Analysis of Algorithms",
    code: "ECS 5101 / MCA20-303",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=731",
    professor: "Dr. Rahul Mishra"
  },
  {
    id: "fcs",
    name: "Foundations of Computer Systems",
    shortName: "Foundations of Computer Systems",
    code: "ECS 5102",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=732",
    professor: "Mr. Sundar Doraiswami"
  },
  {
    id: "twss",
    name: "Technical Writing and Soft Skill",
    shortName: "Technical Writing & Soft Skill",
    code: "EHS 5104",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=734",
    professor: "Dr. Sweta Sinha"
  },
  {
    id: "ps",
    name: "Probability and Statistics",
    shortName: "Probability & Statistics",
    code: "EMC 5103",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=733",
    professor: "Dr. Anuj Singh"
  },
  // Electives
  {
    id: "cda",
    name: "Computational Data Analysis",
    shortName: "Computational Data Analysis",
    code: "EAI 6101 / ECS 6102",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Dr. Sudhir Kumar"
  },
  {
    id: "pr",
    name: "Pattern Recognition",
    shortName: "Pattern Recognition",
    code: "EAI 6102 / ECS 6303 / ESD 6102 / EAS 6102 / MCA20-E305F",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Dr. Rajib Kumar Jha"
  },
  {
    id: "aml",
    name: "Advanced Machine Learning",
    shortName: "Advanced Machine Learning",
    code: "EAI 6103 / EAS 6103 / EIC 6103",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Dr. Vivek Tiwari"
  },
  {
    id: "acs",
    name: "Advanced Cyber Security",
    shortName: "Advanced Cyber Security",
    code: "ECS 6101 / ECS 5103",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Dr. Ashish Karan"
  },
  {
    id: "cps",
    name: "Cyber Physical Systems",
    shortName: "Cyber Physical Systems",
    code: "ECS 6103 / ESD 6103",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Dr. Ayan Mondal"
  },
  {
    id: "adf",
    name: "Application development framework",
    shortName: "App Dev Framework",
    code: "ECC 6101",
    type: "elective",
    moodleUrl: "",
    professor: "TBD"
  },
  {
    id: "pcc",
    name: "Python for Cloud Computing",
    shortName: "Python for Cloud Computing",
    code: "ECC 6102",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Dr. Vivek Kumar Aggarwal"
  },
  {
    id: "acc",
    name: "Advanced Cloud Computing",
    shortName: "Adv. Cloud Computing",
    code: "ECC 6103 / EAI 6304 / EAS 6304 / ESD 6304 / MCA20-E304C",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836",
    professor: "Prof. Rajiv Misra"
  },
  {
    id: "wdb",
    name: "Web Development for Blockchain Applications",
    shortName: "Web Dev for Blockchain",
    code: "EBB 6101",
    type: "elective",
    moodleUrl: "",
    professor: "TBD"
  },
  {
    id: "bca",
    name: "Blockchain Components and Architecture",
    shortName: "Blockchain Architecture",
    code: "EBB 6102",
    type: "elective",
    moodleUrl: "",
    professor: "TBD"
  },
  {
    id: "de",
    name: "Data Engineering",
    shortName: "Data Engineering",
    code: "EBB 6103",
    type: "elective",
    moodleUrl: "",
    professor: "TBD"
  },
  {
    id: "abt",
    name: "Advanced Blockchain Technology",
    shortName: "Adv. Blockchain Tech",
    code: "ESD 6101",
    type: "elective",
    moodleUrl: "",
    professor: "TBD"
  },
  {
    id: "cf",
    name: "Computer Forensics",
    shortName: "Computer Forensics",
    code: "EIC 6101",
    type: "elective",
    moodleUrl: "",
    professor: "TBD"
  }
];

const SCHEDULE = [
  // Regular
  { day:"Monday", time:"6:00 PM – 8:00 PM", course:"ps", lab:false, showLabTag:true },
  { day:"Tuesday", time:"5:00 PM – 6:30 PM", course:"twss", lab:false },
  { day:"Wednesday", time:"5:00 PM – 6:30 PM", course:"twss", lab:false },
  { day:"Wednesday", time:"7:00 PM – 8:30 PM", course:"ps", lab:true },
  { day:"Thursday", time:"7:00 PM – 8:30 PM", course:"ps", lab:true },
  { day:"Saturday", time:"8:00 AM – 9:30 AM", course:"daa", lab:false },
  { day:"Saturday", time:"7:30 PM – 9:30 PM", course:"fcs", lab:false, showLabTag: true },
  { day:"Sunday", time:"8:00 AM – 9:30 AM", course:"daa", lab:false },
  { day:"Sunday", time:"11:00 AM – 1:00 PM", course:"daa", lab:false, showLabTag:true },
  { day:"Sunday", time:"2:00 PM – 5:00 PM", course:"fcs", lab:false },

  // Electives
  { day:"Monday", time:"8:00 PM – 9:30 PM", course:"acs", lab:false },
  { day:"Tuesday", time:"6:30 PM – 8:00 PM", course:"aml", lab:false },
  { day:"Tuesday", time:"8:00 PM – 9:30 PM", course:"acs", lab:false },
  { day:"Saturday", time:"9:30 AM – 11:00 AM", course:"cda", lab:false },
  { day:"Saturday", time:"9:30 AM – 11:00 AM", course:"aml", lab:false },
  { day:"Saturday", time:"9:30 AM – 11:00 AM", course:"pcc", lab:false },
  { day:"Saturday", time:"10:00 AM – 11:30 AM", course:"cps", lab:false },
  { day:"Saturday", time:"11:30 AM – 1:00 PM", course:"cda", lab:false },
  { day:"Saturday", time:"11:30 AM – 1:00 PM", course:"pcc", lab:false },
  { day:"Saturday", time:"12:00 PM – 2:00 PM", course:"acs", lab:false },
  { day:"Saturday", time:"2:30 PM – 4:00 PM", course:"cps", lab:false },
  { day:"Saturday", time:"5:30 PM – 7:00 PM", course:"acc", lab:false },
  { day:"Sunday", time:"9:30 AM – 11:00 AM", course:"pr", lab:false },
  { day:"Sunday", time:"5:00 PM – 6:30 PM", course:"pr", lab:true },
  { day:"Sunday", time:"5:30 PM – 7:00 PM", course:"acc", lab:false }
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIMES = [
  "8:00 AM – 9:30 AM",
  "9:30 AM – 11:00 AM",
  "10:00 AM – 11:30 AM",
  "11:00 AM – 1:00 PM",
  "11:30 AM – 1:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 5:00 PM",
  "2:30 PM – 4:00 PM",
  "5:00 PM – 6:30 PM",
  "5:30 PM – 7:00 PM",
  "6:00 PM – 8:00 PM",
  "6:30 PM – 8:00 PM",
  "7:00 PM – 8:30 PM",
  "7:30 PM – 9:00 PM",
  "7:30 PM – 9:30 PM",
  "8:00 PM – 9:30 PM"
];
