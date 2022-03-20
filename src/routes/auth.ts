import express from "express";
import passport from "passport";
import { protectedRoute } from "../middleware/auth";

const router = express.Router();

router.use(protectedRoute);

// auth with google+
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/test", (req, res) => {
  console.log("Requser", req.user);

  res.json({ message: "yash test" });
});

router.get("/profile", (req, res) => {
  console.log("Requser", req.user);
  if (req.user) res.send(req.user);
  else {
    res.send({ email: "none" });
  }
});

//logout
router.get("/logout", (req, res) => {
  req.logout();
  res.clearCookie("keyboard cat");
  res.redirect("/login");
});

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: any, res: any) => {
    // res.send(req.user);
    // res.redirect('/dashboard/app');
    // console.log(req.user, "---------");
    if (req.user.mentor) res.redirect("/mentor/dashboard");
    else if (req.user.admin && req.user.redirectToAdmin)
      res.redirect("/admin/course");
    else res.redirect("/dashboard/app");
  }
);

export default router;
