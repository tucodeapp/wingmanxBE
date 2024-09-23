const moment = require("moment");

const organisers = [
  { date: "2023-09-27", name: "Aurimas" },
  { date: "2024-10-04", name: "Gerbert" },
  { date: "2024-10-11", name: "Kristina" },
  { date: "2024-10-18", name: "Faustas" },
  { date: "2024-10-25", name: "Andrius" },
  { date: "2024-11-01", name: "Grafas" },
  { date: "2024-11-08", name: "Julija" },
  { date: "2024-11-15", name: "Lukas" },
  { date: "2024-11-22", name: "Arturas" },
  { date: "2024-11-29", name: "Evaldas" },
  { date: "2024-12-06", name: "Jevgenijus" },
  { date: "2024-12-13", name: "Martynas" },
  { date: "2024-12-20", name: "Simonas" },
  { date: "2024-12-27", name: "Stefaniia" },
  { date: "2025-01-03", name: "Samir" },
  { date: "2025-01-10", name: "Rūta" },
  { date: "2025-01-17", name: "Eglė" },
  { date: "2025-01-24", name: "Emilija" },
  { date: "2025-01-31", name: "Marius" },
  { date: "2025-02-07", name: "Tadas" },
  { date: "2025-02-14", name: "Gintautas" },
  { date: "2025-02-21", name: "Gabriela" },
  { date: "2025-02-28", name: "Nikita" },
  { date: "2025-03-07", name: "Ieva" },
  { date: "2025-03-14", name: "Ignas" },
  { date: "2025-03-21", name: "Lukas IT" },
  { date: "2025-03-28", name: "Augustina" },
  { date: "2025-04-04", name: "Gytis" },
  { date: "2025-04-11", name: "Mykolas" },
  { date: "2025-04-18", name: "Justė" },
  { date: "2025-04-25", name: "Kamilė A." },
  { date: "2025-05-02", name: "Vytautas" },
  { date: "2025-05-09", name: "Kamilė S." },
  { date: "2025-05-16", name: "Artūras Tumėnas" },
  { date: "2025-05-23", name: "Valentinas" },
];

const fetchLunchData = (req, res) => {
  const upcomingLunchOrganiser = organisers.forEach((organiser, index) =>
    console.log(moment().isAfter(organiser.date), index)
  );

  console.log(upcomingLunchOrganiser);
  res.status(200).json({
    success: 1,
    organisers,
  });
};

module.exports = {
  fetchLunchData,
};
