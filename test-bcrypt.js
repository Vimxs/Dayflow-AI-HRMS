const bcrypt = require("bcryptjs");
async function test() {
  try {
    await bcrypt.compare("dummy-password", "$2a$10$abcdefghijklmnopqrstuvwxyz123456");
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
