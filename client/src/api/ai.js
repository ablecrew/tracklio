import API from "./api";

export const analyzeAI = async (tasks, transactions) => {
  const res = await API.post("/ai/analyze", {
    tasks,
    transactions,
  });

  return res.data;
};