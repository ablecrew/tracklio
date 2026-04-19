import API from "./api";

export const sendMessage = async (message, context) => {
  const res = await API.post("/chat", {
    message,
    context,
  });

  return res.data.reply;
};