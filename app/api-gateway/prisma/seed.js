require("dotenv").config();
const prisma = require("../src/lib/prisma");

const seedMonitors = [
  { url: "https://jsonplaceholder.typicode.com/posts/1", method: "GET", intervalSeconds: 30 },
  { url: "https://httpbin.org/post", method: "POST", intervalSeconds: 60 },
  { url: "https://httpbin.org/status/500", method: "GET", intervalSeconds: 30 },
  { url: "https://httpbin.org/delay/3", method: "GET", intervalSeconds: 60 },
  { url: "https://catfact.ninja/fact", method: "GET", intervalSeconds: 60 },
  { url: "https://httpbin.org/status/200", method: "GET", intervalSeconds: 30 },
];

async function main() {
  for (const m of seedMonitors) {
    await prisma.monitor.create({ data: m });
  }
  console.log("Seeded", seedMonitors.length, "monitors");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());