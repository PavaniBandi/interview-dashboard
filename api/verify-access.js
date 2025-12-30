export default async (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS and HEAD requests
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "POST") {
      const { code } = req.body;

      // Verify against secret code stored in environment variable
      const SECRET_CODE = process.env.ACCESS_CODE;

      if (!SECRET_CODE) {
        return res.status(500).json({
          valid: false,
          error: "Server access code is not configured (set ACCESS_CODE)",
        });
      }

      if (!code) {
        return res
          .status(400)
          .json({ valid: false, error: "Code is required" });
      }

      const isValid = code === SECRET_CODE;

      if (isValid) {
        res.json({ valid: true, message: "Access granted" });
      } else {
        // Don't reveal if code exists or not - just say it's invalid
        res.status(401).json({ valid: false, error: "Invalid code" });
      }
    } else {
      res.setHeader("Allow", "POST, HEAD, OPTIONS");
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in verify-access:", error.message);
    res.status(500).json({ valid: false, error: error.message });
  }
};
