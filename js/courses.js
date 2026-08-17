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

const COURSES = [
  {
    id: "daa",
    name: "Design and Analysis of Algorithms",
    shortName: "Design & Analysis of Algorithms",
    code: "ECS 5101 / MCA20-303",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=731"
  },
  {
    id: "fcs",
    name: "Foundations of Computer Systems",
    shortName: "Foundations of Computer Systems",
    code: "ECS 5102",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=732"
  },
  {
    id: "twss",
    name: "Technical Writing and Soft Skill",
    shortName: "Technical Writing & Soft Skill",
    code: "EHS 5104",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=734"
  },
  {
    id: "ps",
    name: "Probability and Statistics",
    shortName: "Probability & Statistics",
    code: "EMC 5103",
    type: "regular",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=733"
  },
  {
    id: "cda",
    name: "Computational Data Analysis",
    shortName: "Computational Data Analysis",
    code: "EAI 6101 / ECS 6102",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836"
  },
  {
    id: "pr",
    name: "Pattern Recognition",
    shortName: "Pattern Recognition",
    code: "EAI 6102 / ECS 6303 / ESD 6102 / EAS 6102 / MCA20-E305F",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836"
  },
  {
    id: "aml",
    name: "Advanced Machine Learning",
    shortName: "Advanced Machine Learning",
    code: "EAI 6103 / EAS 6103",
    type: "elective",
    moodleUrl: "https://cetpgex.iitp.ac.in/moodle/course/view.php?id=836"
  }
];

const SCHEDULE = [
  { day:"Monday", time:"6:00 PM – 8:00 PM", course:"ps", lab:false, showLabTag:true },

  { day:"Tuesday", time:"5:00 PM – 6:30 PM", course:"twss", lab:false },
  { day:"Tuesday", time:"7:30 PM – 9:00 PM", course:"aml", lab:false },

  { day:"Wednesday", time:"5:00 PM – 6:30 PM", course:"twss", lab:false },
  { day:"Wednesday", time:"7:00 PM – 8:30 PM", course:"ps", lab:true },

  { day:"Thursday", time:"7:00 PM – 8:30 PM", course:"ps", lab:true },

  { day:"Saturday", time:"8:00 AM – 9:30 AM", course:"daa", lab:false },
  { day:"Saturday", time:"9:30 AM – 11:00 AM", course:"elective-slot", lab:false },
  { day:"Saturday", time:"11:30 AM – 1:00 PM", course:"cda", lab:false },
  { day:"Saturday", time:"7:30 PM – 9:30 PM", course:"fcs", lab:false, showLabTag: true },

  { day:"Sunday", time:"8:00 AM – 9:30 AM", course:"daa", lab:false },
  { day:"Sunday", time:"9:30 AM – 11:00 AM", course:"pr", lab:false },
  { day:"Sunday", time:"11:00 AM – 1:00 PM", course:"daa", lab:false, showLabTag:true },
  { day:"Sunday", time:"2:00 PM – 5:00 PM", course:"fcs", lab:false },
  { day:"Sunday", time:"5:00 PM – 6:30 PM", course:"pr", lab:true }
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIMES = [
  "8:00 AM – 9:30 AM",
  "9:30 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "11:30 AM – 1:00 PM",
  "2:00 PM – 5:00 PM",
  "5:00 PM – 6:30 PM",
  "6:00 PM – 8:00 PM",
  "7:00 PM – 8:30 PM",
  "7:30 PM – 9:00 PM",
  "7:30 PM – 9:30 PM"
];