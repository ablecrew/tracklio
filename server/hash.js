import bcrypt from "bcryptjs";

const run = async () => {
  const hash = await bcrypt.hash("c99marasighan/X", 10);
  console.log(hash);
};

run();