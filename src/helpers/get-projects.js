import fs from "node:fs";

const fetchPaginatedProjects = async (projects = [], page = 1) => {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=language:Astro&per_page=100&sort=updated&page=${page}`
  );
  const data = await response.json();

  // Filter out null homepages and homepages linking to localhost
  const items = data.items.filter(
    (project) =>
      project.homepage &&
      !project.homepage.includes("localhost") &&
      !project.homepage.includes("github.com/snowpackjs/astro/issues") &&
      !project.name.includes("issue")
  );

  console.log(data.total_count);

  if (page * 100 < data.total_count) {
    page++;
    projects = await fetchPaginatedProjects(projects.concat(items), page);
  }

  return projects;
};

export default async () => {
  const cache = "./public/.cache";

  if (!fs.existsSync(cache)) {
    fs.mkdirSync(cache, { recursive: true });
  }

  // Check if "caching" file exists
  if (fs.existsSync("./public/.cache/local.json")) {
    // Read data from file
    const raw = fs.readFileSync("./public/.cache/local.json");
    return JSON.parse(raw);
  } else {
    // Make API call and write to file
    const projects = await fetchPaginatedProjects();

    // Write projects to "caching" file
    fs.writeFileSync("./public/.cache/local.json", JSON.stringify(projects));

    return projects;
  }
};
