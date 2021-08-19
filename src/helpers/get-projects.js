import fs from "node:fs";

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
    const response = await fetch(
      "https://api.github.com/search/repositories?q=language:Astro&per_page=100"
    );
    const data = await response.json();

    // Filter out null homepages and homepages linking to localhost
    const projects = data.items.filter(
      (project) =>
        project.homepage &&
        !project.homepage.includes("localhost") &&
        !project.homepage.includes("github.com/snowpack/astro/issues") &&
        !project.name.includes("issue")
    );

    // Write projects to "caching" file
    fs.writeFileSync("./public/.cache/local.json", JSON.stringify(projects));

    return projects;
  }
};
