export default (projects) => {
  return projects.filter(
    (project) =>
      project.homepage &&
      !project.homepage.includes("localhost") &&
      !project.name.includes("-issue") &&
      !project.name.includes("repro")
  );
};
